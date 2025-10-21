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
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 mt-8 space-y-4">
            <button className="w-full rounded-xl h-14 text-base bg-[#D2B48C] text-white font-bold hover:shadow-[0_6px_20px_0_rgba(210,180,140,0.12)] hover:-translate-y-1 transition-all duration-300">
              가입하기
            </button>
             <button 
                onClick={onSwitchToArtist}
                className="w-full text-center text-sm text-[#887563] hover:text-[#D2B48C] hover:underline transition-colors"
            >
                예술가/사장님으로 가입하시나요?
            </button>
        </div>
      </div>
    </div>
  );
};

export default GuestSignUpModal;
