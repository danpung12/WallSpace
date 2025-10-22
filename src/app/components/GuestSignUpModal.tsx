'use client';

import React, { useState, useEffect } from 'react';
import { registerUser } from '@/lib/api/auth';

interface GuestSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToArtist: () => void; // '아티스트로 전환'을 위한 콜백
}

const GuestSignUpModal: React.FC<GuestSignUpModalProps> = ({ isOpen, onClose, onSwitchToArtist }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
          full_name: formData.name,
          nickname: formData.nickname,
          user_type: 'guest',
          phone: formData.phone || undefined
        }
      );

      if (error) {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      if (user) {
        // 성공 시 모달 닫기
        onClose();
        // 페이지 새로고침 또는 리다이렉트
        window.location.reload();
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
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
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-6 scrollbar-hide">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <InputField 
              id="email" 
              name="email"
              label="이메일" 
              type="email"
              placeholder="이메일을 입력하세요" 
              icon="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
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
            <InputField 
              id="nickname" 
              name="nickname"
              label="닉네임" 
              placeholder="닉네임을 입력하세요" 
              icon="badge"
              value={formData.nickname}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
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
            <InputField 
              id="phone" 
              name="phone"
              label="전화번호" 
              type="tel"
              placeholder="전화번호를 입력하세요" 
              icon="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <InputField 
              id="dob" 
              label="생년월일" 
              type="text" 
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.type = 'date'}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => { if (!e.target.value) e.target.type = 'text'; }}
              placeholder="YYYY-MM-DD" 
              icon="calendar_month" 
            />
            
            {/* Gender Selection */}
            <div>
              <p className="text-sm font-medium pb-2 text-[#2C2C2C]">성별</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center rounded-xl border-2 border-[#E5E0DC] bg-white px-4 h-14 has-[:checked]:bg-[#E5D7C6] has-[:checked]:text-[#2C2C2C] has-[:checked]:border-[#D2B48C] has-[:checked]:font-bold cursor-pointer text-sm font-medium transition-all duration-200">
                  <input type="radio" name="gender" value="male" className="sr-only" defaultChecked />
                  <span className="material-symbols-outlined mr-2 text-[20px]">male</span> 남성
                </label>
                <label className="flex items-center justify-center rounded-xl border-2 border-[#E5E0DC] bg-white px-4 h-14 has-[:checked]:bg-[#E5D7C6] has-[:checked]:text-[#2C2C2C] has-[:checked]:border-[#D2B48C] has-[:checked]:font-bold cursor-pointer text-sm font-medium transition-all duration-200">
                  <input type="radio" name="gender" value="female" className="sr-only" />
                  <span className="material-symbols-outlined mr-2 text-[20px]">female</span> 여성
                </label>
              </div>
            </div>
        </form>
        
        {/* Footer */}
        <div className="flex-shrink-0 mt-8 space-y-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl h-14 text-base bg-[#D2B48C] text-white font-bold hover:shadow-[0_6px_20px_0_rgba(210,180,140,0.12)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
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
