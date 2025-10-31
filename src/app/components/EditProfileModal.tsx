"use client";

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/data/profile';
import { motion, AnimatePresence } from 'framer-motion';
import { useBottomNav } from '@/app/context/BottomNavContext';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  userMode?: 'artist' | 'manager';
  onSave: (updatedProfile: UserProfile) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

export default function EditProfileModal({ open, onClose, userProfile: initialProfile, userMode, onSave, error, setError }: EditProfileModalProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialProfile);
  const { setIsNavVisible } = useBottomNav();
  
  useEffect(() => {
    setUserProfile(initialProfile);
  }, [initialProfile, open]);

  // 모달이 열리면 하단바 숨기기, 닫히면 다시 보이기
  useEffect(() => {
    setIsNavVisible(!open);
  }, [open, setIsNavVisible]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userProfile) {
      onSave(userProfile);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <Head>
            <title>내 정보 수정</title>
            <link
              href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap"
              rel="stylesheet"
            />
          </Head>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
              style={{
                fontFamily: "'Pretendard', sans-serif",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(!userProfile) ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-50 rounded-3xl">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#D2B48C] border-t-transparent"></div>
                      <p className="text-sm text-[#887563] dark:text-gray-400 font-medium">로딩 중...</p>
                    </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="relative bg-[#D2B48C] px-6 py-4">
                    <button 
                      onClick={onClose}
                      className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">내 정보 수정</h2>
                        <p className="text-white/80 text-xs">프로필 정보를 업데이트하세요</p>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* 필명 - 작가 모드일 때만 표시 */}
                    {userMode !== 'manager' && (
                      <div className="space-y-2">
                        <label htmlFor="nickname" className="flex items-center gap-2 text-sm font-semibold text-[#3D2C1D] dark:text-gray-200">
                          <svg className="w-4 h-4 text-[#D2B48C]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          필명
                        </label>
                        <div className="relative group">
                          <input
                            id="nickname"
                            type="text"
                            value={userProfile?.nickname || ''}
                            onChange={handleChange}
                            placeholder="필명을 입력하세요"
                            className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-[#2C2C2C] dark:text-gray-100 placeholder:text-gray-400 focus:border-[#D2B48C] focus:ring-4 focus:ring-[#D2B48C]/10 outline-none transition-all duration-200"
                          />
                        </div>
                      </div>
                    )}

                    {/* 이름 (읽기 전용) */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-[#3D2C1D] dark:text-gray-200">
                        <svg className="w-4 h-4 text-[#D2B48C]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        이름
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          type="text"
                          value={userProfile?.name || ''}
                          disabled
                          readOnly
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 이메일 */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-[#3D2C1D] dark:text-gray-200">
                        <svg className="w-4 h-4 text-[#D2B48C]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        이메일
                      </label>
                      <div className="relative group">
                        <input
                          id="email"
                          type="email"
                          value={userProfile?.email || ''}
                          onChange={handleChange}
                          placeholder="이메일을 입력하세요"
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-[#2C2C2C] dark:text-gray-100 placeholder:text-gray-400 focus:border-[#D2B48C] focus:ring-4 focus:ring-[#D2B48C]/10 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* 전화번호 (읽기 전용) */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-[#3D2C1D] dark:text-gray-200">
                        <svg className="w-4 h-4 text-[#D2B48C]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        전화번호
                      </label>
                      <div className="relative">
                        <input
                          id="phone"
                          type="tel"
                          value={userProfile?.phone || ''}
                          disabled
                          readOnly
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3.5 bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        저장하기
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
            
            {/* Error Modal */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex items-center justify-center p-4 z-[60]"
                onClick={() => setError(null)}
              >
                <div 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-center text-[#2C2C2C] dark:text-gray-100 mb-2">오류 발생</h3>
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    확인
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
