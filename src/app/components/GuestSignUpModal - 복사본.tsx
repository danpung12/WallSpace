'use client';

import React, { useState, useEffect } from 'react';

interface GuestSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToArtist: () => void; // '아티스트로 전환'을 위한 콜백
}

const GuestSignUpModal: React.FC<GuestSignUpModalProps> = ({ isOpen, onClose, onSwitchToArtist }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

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
  
  const InputField = ({ id, label, type = 'text', placeholder, icon, ...props }: any) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium pb-2 text-gray-600">{label}</label>
      <div className="relative flex items-center bg-gray-100 rounded-xl border-2 border-transparent focus-within:border-[#A89587] focus-within:bg-white transition-all duration-300">
        <span className="material-symbols-outlined absolute left-4 text-gray-500 pointer-events-none">{icon}</span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none"
          {...props}
        />
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg md:max-w-xl max-h-[90vh] p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 bg-white text-gray-800 flex flex-col transform transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">손님으로 가입</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-grow overflow-y-auto space-y-6 scrollbar-hide">
            <InputField id="user-id" label="아이디" placeholder="아이디를 입력하세요" icon="person" />
            <InputField id="password" label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" icon="lock" />
            <InputField id="confirm-password" label="비밀번호 확인" type="password" placeholder="비밀번호를 다시 입력하세요" icon="lock" />
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
              <p className="text-sm font-medium pb-2 text-gray-600">성별</p>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-700 h-14 cursor-pointer has-[:checked]:bg-[#fdf5ed] has-[:checked]:border-[#A89587] has-[:checked]:text-[#A89587] has-[:checked]:font-semibold transition-all">
                  <input type="radio" name="gender" value="male" className="sr-only" defaultChecked />
                  <span className="material-symbols-outlined mr-2">male</span> 남성
                </label>
                <label className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-700 h-14 cursor-pointer has-[:checked]:bg-[#fdf5ed] has-[:checked]:border-[#A89587] has-[:checked]:text-[#A89587] has-[:checked]:font-semibold transition-all">
                  <input type="radio" name="gender" value="female" className="sr-only" />
                  <span className="material-symbols-outlined mr-2">female</span> 여성
                </label>
              </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 mt-8 space-y-4">
            <button className="w-full rounded-xl h-14 text-lg bg-[#3E352F] text-white font-bold hover:bg-opacity-90 transition-colors">
              가입하기
            </button>
             <button 
                onClick={onSwitchToArtist}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-800 hover:underline"
            >
                예술가/사장님으로 가입하시나요?
            </button>
        </div>
      </div>
    </div>
  );
};

export default GuestSignUpModal;
