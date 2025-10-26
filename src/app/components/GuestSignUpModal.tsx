'use client';

import React, { useState, useEffect, useRef } from 'react';
import { registerUser, checkEmailExists, validateEmail } from '@/lib/api/auth';

interface GuestSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToArtist: () => void; // '아티스트로 전환'을 위한 콜백
}

// InputField 컴포넌트를 외부로 이동하여 리렌더링 시 재생성 방지
const InputField = ({ id, label, type = 'text', placeholder, icon, ...props }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium pb-2 text-[#2C2C2C]">{label}</label>
    <div className="relative flex items-center bg-white rounded-xl border-2 border-[#E5E0DC] focus-within:border-[#D2B48C] focus-within:shadow-[0_0_0_3px_rgba(210,180,140,0.25)] transition-all duration-300">
      <span className="material-symbols-outlined absolute left-4 text-[#887563] pointer-events-none">{icon}</span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[#2C2C2C] placeholder:text-[#887563] focus:outline-none"
        {...props}
      />
    </div>
  </div>
);

const GuestSignUpModal: React.FC<GuestSignUpModalProps> = ({ isOpen, onClose, onSwitchToArtist }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    dob: '',
    gender: 'male'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const dobRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // 모달이 닫힐 때 모든 입력 필드 초기화
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        dob: '',
        gender: 'male'
      });
      setError(null);
      setEmailChecked(false);
      setCheckingEmail(false);
      
      const timer = setTimeout(() => setShouldRender(false), 300); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 이메일이 변경되면 확인 상태 초기화
    if (name === 'email') {
      setEmailChecked(false);
    }
  };

  const openDatePicker = () => {
    if (dobRef.current) {
      dobRef.current.showPicker?.();
    }
  };

  const handleCheckEmail = async () => {
    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 확인
    if (!validateEmail(formData.email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setCheckingEmail(true);
    setError(null);

    const { exists, available, error } = await checkEmailExists(formData.email);
    
    if (error) {
      setError('이메일 확인 중 오류가 발생했습니다.');
    } else if (exists) {
      setError('이미 사용 중인 이메일입니다.');
      setEmailChecked(false);
    } else if (available) {
      setEmailChecked(true);
      setError(null);
    }
    
    setCheckingEmail(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 이메일 중복 확인 체크
    if (!emailChecked) {
      setError('이메일 중복 확인을 완료해주세요.');
      setIsLoading(false);
      return;
    }

    // 이름 확인
    if (!formData.name || formData.name.trim().length === 0) {
      setError('이름을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    try {
      const { user, profile, error } = await registerUser(
        formData.email,
        formData.password,
        {
          full_name: formData.name.trim(),
          nickname: formData.name.trim(), // 손님은 이름을 닉네임으로도 사용
          user_type: 'guest',
          dob: formData.dob || undefined,
          gender: formData.gender || undefined
        }
      );

      if (error) {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      if (user) {
        // 성공 시 완료 메시지
        alert('회원가입이 완료되었습니다! 🎉\n\n로그인하여 서비스를 이용해주세요.');
        onClose();
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg md:max-w-xl max-h-[90vh] p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-[#D2B48C]/20 bg-[#F5F1EC] flex flex-col transform transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]">손님으로 가입</h1>
          <button onClick={onClose} className="text-[#887563] hover:text-[#2C2C2C] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form id="guest-signup-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-6 scrollbar-hide">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {/* 이름 */}
            <InputField 
              id="name" 
              name="name"
              label="이름" 
              placeholder="이름을 입력하세요" 
              icon="person"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />

            {/* 이메일 중복 확인 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium pb-2 text-[#2C2C2C]">이메일</label>
              <div className="flex gap-3">
                <div className="relative flex-grow flex items-center bg-white rounded-xl border-2 border-[#E5E0DC] focus-within:border-[#D2B48C] focus-within:shadow-[0_0_0_3px_rgba(210,180,140,0.25)] transition-all duration-300">
                  <span className="material-symbols-outlined absolute left-4 text-[#887563] pointer-events-none">person</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    className="w-full h-14 pl-14 pr-4 bg-transparent text-[#2C2C2C] placeholder:text-[#887563] focus:outline-none"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  {emailChecked && (
                    <span className="material-symbols-outlined absolute right-4 text-green-500">check_circle</span>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={handleCheckEmail}
                  disabled={checkingEmail || emailChecked || !formData.email}
                  className="flex-shrink-0 rounded-xl h-14 px-5 bg-[#C9A67B] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailChecked ? '확인완료' : checkingEmail ? '확인중...' : '중복확인'}
                </button>
              </div>
              {emailChecked && (
                <p className="text-xs text-green-600 mt-2">✓ 사용 가능한 이메일입니다.</p>
              )}
            </div>
            
            {/* 비밀번호 */}
            <InputField 
              id="password" 
              name="password"
              label="비밀번호" 
              type="password" 
              placeholder="비밀번호를 입력하세요" 
              icon="lock"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            
            {/* 비밀번호 확인 */}
            <InputField 
              id="confirmPassword" 
              name="confirmPassword"
              label="비밀번호 확인" 
              type="password" 
              placeholder="비밀번호를 다시 입력하세요" 
              icon="lock"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            
            {/* 생년월일 */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium pb-2 text-[#2C2C2C]">생년월일</label>
              <div className="relative flex items-center bg-white rounded-xl border-2 border-[#E5E0DC] focus-within:border-[#D2B48C] focus-within:shadow-[0_0_0_3px_rgba(210,180,140,0.25)] transition-all duration-300">
                <span 
                  onClick={openDatePicker}
                  className="material-symbols-outlined absolute left-4 text-[#887563] cursor-pointer"
                >
                  calendar_month
                </span>
                <input
                  ref={dobRef}
                  id="dob"
                  name="dob"
                  type="date"
                  placeholder="YYYY-MM-DD"
                  className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[#2C2C2C] placeholder:text-[#887563] focus:outline-none"
                  value={formData.dob}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {/* Gender Selection */}
            <div>
              <p className="text-sm font-medium pb-2 text-[#2C2C2C]">성별</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center rounded-xl border-2 border-[#E5E0DC] bg-white px-4 h-14 has-[:checked]:bg-[#D2B48C] has-[:checked]:text-white has-[:checked]:border-[#D2B48C] has-[:checked]:font-bold cursor-pointer text-sm font-medium transition-all duration-200">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="male" 
                    className="sr-only" 
                    checked={formData.gender === 'male'}
                    onChange={handleInputChange}
                  />
                  <span className="material-symbols-outlined mr-2 text-[20px]">male</span> 남성
                </label>
                <label className="flex items-center justify-center rounded-xl border-2 border-[#E5E0DC] bg-white px-4 h-14 has-[:checked]:bg-[#D2B48C] has-[:checked]:text-white has-[:checked]:border-[#D2B48C] has-[:checked]:font-bold cursor-pointer text-sm font-medium transition-all duration-200">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="female" 
                    className="sr-only"
                    checked={formData.gender === 'female'}
                    onChange={handleInputChange}
                  />
                  <span className="material-symbols-outlined mr-2 text-[20px]">female</span> 여성
                </label>
              </div>
            </div>
        </form>
        
        {/* 가입하기 버튼 - PC에서 고정 */}
        <div className="flex-shrink-0 pt-6">
          <button 
            type="submit"
            form="guest-signup-form"
            disabled={isLoading}
            className="w-full rounded-xl h-14 text-base bg-[#D2B48C] text-white font-bold hover:shadow-[0_6px_20px_0_rgba(210,180,140,0.12)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '가입 중...' : '가입하기'}
          </button>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 mt-4 space-y-4">
             <button 
                type="button"
                onClick={onSwitchToArtist}
                className="w-full text-center text-sm text-[#887563] hover:text-[#D2B48C] hover:underline transition-colors"
                disabled={isLoading}
            >
                예술가/사장님으로 가입하시나요?
            </button>
        </div>
      </div>
    </div>
  );
};

export default GuestSignUpModal;
