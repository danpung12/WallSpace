"use client";

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/data/profile';
import { motion, AnimatePresence } from 'framer-motion';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSave: (updatedProfile: UserProfile) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

export default function EditProfileModal({ open, onClose, userProfile: initialProfile, onSave, error, setError }: EditProfileModalProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialProfile);
  
  useEffect(() => {
    setUserProfile(initialProfile);
  }, [initialProfile, open]);

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
  
  const readOnlyInputStyle: React.CSSProperties = {
    border: '1px solid #E7DDC8',
    background: '#F5EFE4',
    color: '#8C7853',
    cursor: 'not-allowed',
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              id="app-container"
              className="relative flex flex-col bg-[#FDFBF8] text-[#3D2C1D] rounded-2xl shadow-xl max-w-md w-full m-4 max-h-[90vh] overflow-y-auto"
              style={{
                fontFamily: "'Pretendard', sans-serif",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(!userProfile) ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-[#FDFBF8]/80 z-[1001] rounded-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D2B48C]"></div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <header
                    className="sticky top-0 z-10"
                    style={{ background: '#FDFBF8CC', backdropFilter: 'blur(4px)' }}
                  >
                    <div className="flex items-center justify-between p-4">
                      <button style={{ color: '#3D2C1D' }} onClick={onClose}>
                        <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                          <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                        </svg>
                      </button>
                      <h1 className="text-xl font-bold" style={{ color: '#3D2C1D' }}>내 정보 수정</h1>
                      <div className="w-6" />
                    </div>
                  </header>

                  {/* Main */}
                  <main className="flex-1 px-4 py-4 space-y-6">
                    {/* 프로필 이미지 Section Removed */}

                    {/* 폼 */}
                    <form className="max-w-md px-3 mx-auto space-y-4" onSubmit={handleSubmit}>
                      <section className="py-4 space-y-4 shadow-sm px-7 rounded-xl" style={{ background: '#fff' }}>
                        {/* 닉네임 */}
                        <div>
                          <label className="block mb-2 text-sm font-medium" htmlFor="nickname" style={{ color: '#A08C6E' }}>
                            필명
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <svg className="w-5 h-5" fill="none" stroke="#A08C6E" viewBox="0 0 24 24">
                                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              </svg>
                            </span>
                            <input
                              className="w-full py-2 pl-10 pr-3 text-sm rounded-lg placeholder:text-sm"
                              style={{
                                border: '1px solid #F0EAD6',
                                background: '#FAF6F0',
                                outline: 'none',
                                color: '#3D2C1D',
                              }}
                              id="nickname"
                              type="text"
                              value={userProfile?.nickname || ''}
                              onChange={handleChange}
                              placeholder="닉네임을 입력해주세요"
                            />
                          </div>
                        </div>

                        {/* 이름 (읽기 전용) */}
                        <div>
                          <label className="flex mb-2 text-sm font-medium items-center gap-2" htmlFor="name" style={{ color: '#A08C6E' }}>
                            이름
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <svg className="w-5 h-5" fill="none" stroke="#A08C6E" viewBox="0 0 24 24">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              </svg>
                            </span>
                            <input
                              className="w-full py-2 pl-10 pr-3 text-sm rounded-lg placeholder:text-sm cursor-not-allowed select-none"
                              style={readOnlyInputStyle}
                              id="name"
                              type="text"
                              value={userProfile?.name || ''}
                              onChange={handleChange}
                              placeholder="성함을 입력해주세요"
                              disabled
                              readOnly
                              aria-disabled="true"
                              tabIndex={-1}
                              title="이름은 변경할 수 없습니다."
                            />
                          </div>
                        </div>

                        {/* 이메일 */}
                        <div>
                          <label className="block mb-2 text-sm font-medium" htmlFor="email" style={{ color: '#A08C6E' }}>
                            이메일 주소
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <svg className="w-5 h-5" fill="none" stroke="#A08C6E" viewBox="0 0 24 24">
                                <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              </svg>
                            </span>
                            <input
                              className="w-full py-2 pl-10 pr-3 text-sm rounded-lg placeholder:text-sm"
                              style={{
                                border: '1px solid #F0EAD6',
                                background: '#FAF6F0',
                                outline: 'none',
                                color: '#3D2C1D',
                              }}
                              id="email"
                              type="email"
                              value={userProfile?.email || ''}
                              onChange={handleChange}
                              placeholder="이메일 주소를 입력해주세요"
                            />
                          </div>
                        </div>

                        {/* 전화번호 (읽기 전용) */}
                        <div>
                          <label className="flex mb-2 text-sm font-medium items-center gap-2" htmlFor="phone" style={{ color: '#A08C6E' }}>
                            전화번호
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <svg className="w-5 h-5" fill="none" stroke="#A08C6E" viewBox="0 0 24 24">
                                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              </svg>
                            </span>
                            <input
                              className="w-full py-2 pl-10 pr-3 text-sm rounded-lg placeholder:text-sm cursor-not-allowed select-none"
                              style={readOnlyInputStyle}
                              id="phone"
                              type="tel"
                              value={userProfile?.phone || ''}
                              onChange={handleChange}
                              placeholder="전화번호를 입력해주세요"
                              disabled
                              readOnly
                              aria-disabled="true"
                              tabIndex={-1}
                              title="전화번호는 변경할 수 없습니다."
                            />
                          </div>
                        </div>
                      </section>

                      {/* 버튼 */}
                      <div className="px-2 pt-2 space-y-3">
                        <button
                          type="submit"
                          className="flex items-center justify-center w-full gap-2 font-semibold"
                          style={{
                            background: '#D2B48C',
                            color: '#fff',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            fontWeight: 600,
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                          </svg>
                          <span>저장하기</span>
                        </button>
                        <button
                          type="button"
                          className="flex items-center justify-center w-full gap-2 font-semibold text-center"
                          style={{
                            background: '#EAE3D9',
                            color: '#8C7853',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            fontWeight: 600,
                          }}
                          onClick={onClose}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                          </svg>
                          <span>취소</span>
                        </button>
                      </div>
                    </form>
                  </main>
                </>
              )}
            </motion.div>
            
            {(!userProfile) && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#FDFBF8]/80 z-[1000] rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D2B48C]"></div>
              </div>
            )}
            {error && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/50 z-[1000] backdrop-blur-sm rounded-2xl"
                onClick={() => setError(null)}
              >
                <div 
                  className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-sm w-full text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-red-500 mb-4">오류 발생</h3>
                  <p className="text-[#3D2C1D] mb-6">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    확인
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
