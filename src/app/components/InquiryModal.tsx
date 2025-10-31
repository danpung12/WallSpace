"use client";

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBottomNav } from '@/app/context/BottomNavContext';

type InquiryModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: { subject: string; content: string }) => void;
};

const SUBJECT_OPTIONS = [
  { value: 'payment_error', label: '결제 오류', icon: '💳' },
  { value: 'reservation_error', label: '예약 오류', icon: '📅' },
  { value: 'general', label: '일반 문의', icon: '💬' },
  { value: 'other', label: '기타', icon: '📝' },
];

export default function InquiryModal({ open, onClose, onSubmit }: InquiryModalProps) {
  const [subject, setSubject] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setIsNavVisible } = useBottomNav();
  
  // 모달이 열리면 하단바 숨기기, 닫히면 다시 보이기
  useEffect(() => {
    setIsNavVisible(!open);
  }, [open, setIsNavVisible]);

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (open) {
      setSubject('');
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 파일은 5MB 이하만 업로드 가능합니다.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setImageFile(file);
    setError(null);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!subject) {
      setError('문의 주제를 선택해주세요.');
      return;
    }

    if (!content.trim()) {
      setError('문의 내용을 입력해주세요.');
      return;
    }

    if (content.length > 2000) {
      setError('문의 내용은 2000자 이하로 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 이미지를 base64로 변환
      let imageBase64: string | undefined;
      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      // API 호출
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          content: content.trim(),
          image: imageBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '문의 전송에 실패했습니다.');
      }

      // 성공
      setSuccess(true);
      
      // 부모 컴포넌트의 onSubmit 콜백 실행 (선택사항)
      if (onSubmit) {
        onSubmit({ subject, content });
      }

      // 2초 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      setError(err.message || '문의 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <Head>
            <title>문의하기</title>
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
              {success ? (
                // 성공 화면
                <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                  >
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">문의가 접수되었습니다</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    빠른 시일 내에 답변 드리겠습니다.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="relative bg-[#D2B48C] px-6 py-4">
                    <button 
                      onClick={onClose}
                      className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">문의하기</h2>
                        <p className="text-white/80 text-xs">무엇을 도와드릴까요?</p>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* 문의 주제 */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="flex items-center gap-2 text-sm font-semibold text-[#3D2C1D] dark:text-gray-200">
                        <svg className="w-4 h-4 text-[#D2B48C]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        문의 주제
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <select
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-[#2C2C2C] dark:text-gray-100 focus:border-[#D2B48C] focus:ring-4 focus:ring-[#D2B48C]/10 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                        >
                          <option value="">문의 주제를 선택해주세요</option>
                          {SUBJECT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-[#887563] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 문의 내용 */}
                    <div className="space-y-2">
                      <label htmlFor="content" className="flex items-center gap-2 text-sm font-semibold text-[#3D2C1D] dark:text-gray-200">
                        <svg className="w-4 h-4 text-[#D2B48C]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        문의 내용
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <textarea
                          id="content"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="문의 내용을 입력해주세요."
                          rows={8}
                          maxLength={2000}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-[#2C2C2C] dark:text-gray-100 placeholder:text-gray-400 focus:border-[#D2B48C] focus:ring-4 focus:ring-[#D2B48C]/10 outline-none transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {content.length} / 2000
                        </div>
                      </div>
                    </div>

                    {/* 이미지 첨부 */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-[#3D2C1D] dark:text-gray-200">
                        <svg className="w-4 h-4 text-[#D2B48C]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        이미지 첨부 (선택사항)
                      </label>
                      
                      {imagePreview ? (
                        <div className="relative p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700">
                          <div className="flex items-center gap-4">
                            <img 
                              src={imagePreview} 
                              alt="미리보기" 
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="text-sm overflow-hidden flex-1">
                              <p className="font-semibold text-[#2C2C2C] dark:text-gray-100 truncate">
                                {imageFile?.name || '이미지 파일'}
                              </p>
                              {imageFile && (
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                  {(imageFile.size / 1024).toFixed(2)} KB
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isSubmitting}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="이미지 제거"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-24 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-[#D2B48C] hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                          <div className="flex flex-col items-center justify-center py-2">
                            <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">클릭</span> 또는 드래그
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (최대 5MB)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isSubmitting}
                          />
                        </label>
                      )}
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2"
                      >
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                      </motion.div>
                    )}

                    {/* 버튼 */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3.5 bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>전송 중...</span>
                          </>
                        ) : (
                          <span>문의하기</span>
                        )}
                      </button>
                    </div>

                    {/* 안내 문구 */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <svg className="w-4 h-4 text-[#887563] dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <p className="text-xs text-[#887563] dark:text-gray-400">
                        계정의 이메일로 답신됩니다.
                      </p>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

