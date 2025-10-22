'use client';

import React, { useState } from 'react';
import { registerUser } from '@/lib/api/auth';

interface ArtistSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToGuest: () => void; // '손님으로 전환'을 위한 콜백
}

const ArtistSignUpModal: React.FC<ArtistSignUpModalProps> = ({ isOpen, onClose, onSwitchToGuest }) => {
  const [snsLink, setSnsLink] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
    phone: '',
    website: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }
  
  const getSnsIconName = (url: string) => {
    if (url.includes('instagram.com')) return 'photo_camera';
    if (url.includes('facebook.com')) return 'groups';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'tag';
    if (url.includes('tiktok.com')) return 'videocam';
    return 'link';
  };

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
          user_type: 'artist',
          phone: formData.phone || undefined,
          website: formData.website || undefined
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
      className="fixed inset-0 flex justify-center items-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg md:max-w-xl max-h-[90vh] p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-[#D2B48C]/20 bg-[#F5F1EC] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]">예술가/사장님 가입</h1>
          <button onClick={onClose} className="text-[#887563] hover:text-[#2C2C2C] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-6 custom-scrollbar-thin">
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
              id="website" 
              name="website"
              label="웹사이트 (선택)" 
              type="url"
              placeholder="웹사이트를 입력하세요" 
              icon="language"
              value={formData.website}
              onChange={handleInputChange}
              disabled={isLoading}
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
            
            {/* Phone Verification */}
            <div>
                <label className="block text-sm font-medium pb-2 text-[#2C2C2C]">핸드폰 인증</label>
                <div className="flex gap-3">
                    <div className="relative flex-grow flex items-center bg-white rounded-xl border-2 border-[#E5E0DC] focus-within:border-[#D2B48C] focus-within:shadow-[0_0_0_3px_rgba(210,180,140,0.25)] transition-all duration-300">
                        <span className="material-symbols-outlined absolute left-4 text-[#887563] pointer-events-none">phone_android</span>
                        <input type="tel" placeholder="휴대폰 번호" className="w-full h-14 pl-14 pr-4 bg-transparent text-[#2C2C2C] placeholder:text-[#887563] focus:outline-none" />
                    </div>
                    <button className="flex-shrink-0 rounded-xl h-14 px-5 bg-[#C9A67B] text-white text-sm font-bold hover:opacity-90 transition-opacity">
                        인증 요청
                    </button>
                </div>
            </div>

            {/* SNS Link */}
             <div>
                <label htmlFor="sns-link" className="block text-sm font-medium pb-2 text-[#2C2C2C]">SNS 계정 (선택)</label>
                <div className="relative flex items-center bg-white rounded-xl border-2 border-[#E5E0DC] focus-within:border-[#D2B48C] focus-within:shadow-[0_0_0_3px_rgba(210,180,140,0.25)] transition-all duration-300">
                  <span className={`material-symbols-outlined absolute left-4 pointer-events-none ${getSnsIconName(snsLink) === 'link' ? 'text-[#887563]' : 'text-[#D2B48C]'}`}>{getSnsIconName(snsLink)}</span>
                  <input
                    id="sns-link" type="text" value={snsLink} onChange={(e) => setSnsLink(e.target.value)}
                    placeholder="SNS 계정 링크를 입력하세요"
                    className="w-full h-14 pl-14 pr-4 bg-transparent text-[#2C2C2C] placeholder:text-[#887563] focus:outline-none"
                  />
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
                onClick={onSwitchToGuest}
                className="w-full text-center text-sm text-[#887563] hover:text-[#D2B48C] hover:underline transition-colors"
                disabled={isLoading}
            >
                손님으로 가입하시나요?
            </button>
        </div>
      </div>
    </div>
  );
};

export default ArtistSignUpModal;
