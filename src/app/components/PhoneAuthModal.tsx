'use client';

import React, { useState, useEffect } from 'react';
import { sendOTP, verifyOTP, validatePhoneNumber, formatPhoneNumber } from '@/lib/api/phoneAuth';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string, userId: string) => void;
  title?: string;
  description?: string;
}

const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "전화번호 인증",
  description = "본인 확인을 위해 전화번호를 인증해주세요."
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // OTP 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!shouldRender) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    
    // 자동 하이픈 추가
    if (value.length > 3 && value.length <= 7) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    
    setPhone(value);
    setError(null);
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phone)) {
      setError('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { success, error: sendError } = await sendOTP(phone);
    
    if (success) {
      setStep('otp');
      setCountdown(180); // 3분
      setError(null);
    } else {
      setError('인증번호 발송에 실패했습니다. 다시 시도해주세요.');
      console.error('Send OTP error:', sendError);
    }
    
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('6자리 인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { success, user, error: verifyError } = await verifyOTP(phone, otp);
    
    if (success && user) {
      console.log('✅ Phone verification success:', user.id);
      onSuccess(formatPhoneNumber(phone), user.id);
      handleClose();
    } else {
      setError('인증번호가 올바르지 않습니다.');
      console.error('Verify OTP error:', verifyError);
    }
    
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setOtp('');
    setCountdown(180);
    await handleSendOTP();
  };

  const handleClose = () => {
    setPhone('');
    setOtp('');
    setStep('phone');
    setError(null);
    setCountdown(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-[#D2B48C]/20 bg-[#F5F1EC] flex flex-col transform transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#2C2C2C]">{title}</h2>
          <button onClick={handleClose} className="text-[#887563] hover:text-[#2C2C2C] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-[#887563] mb-6">{description}</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {/* Phone Input Step */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium pb-2 text-[#2C2C2C]">
                전화번호
              </label>
              <div className="relative flex items-center bg-white rounded-xl border-2 border-[#E5E0DC] focus-within:border-[#D2B48C] focus-within:shadow-[0_0_0_3px_rgba(210,180,140,0.25)] transition-all duration-300">
                <span className="material-symbols-outlined absolute left-4 text-[#887563] pointer-events-none">phone</span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[#2C2C2C] placeholder:text-[#887563] focus:outline-none"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-[#887563] mt-2">
                하이픈(-)을 포함하거나 제외하고 입력해주세요.
              </p>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={isLoading || !phone}
              className="w-full rounded-xl h-14 text-base bg-[#D2B48C] text-white font-bold hover:shadow-[0_6px_20px_0_rgba(210,180,140,0.12)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? '발송 중...' : '인증번호 받기'}
            </button>
          </div>
        )}

        {/* OTP Input Step */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="otp" className="block text-sm font-medium text-[#2C2C2C]">
                  인증번호
                </label>
                {countdown > 0 && (
                  <span className="text-sm font-bold text-[#D2B48C]">
                    {formatTime(countdown)}
                  </span>
                )}
              </div>
              <div className="relative flex items-center bg-white rounded-xl border-2 border-[#E5E0DC] focus-within:border-[#D2B48C] focus-within:shadow-[0_0_0_3px_rgba(210,180,140,0.25)] transition-all duration-300">
                <span className="material-symbols-outlined absolute left-4 text-[#887563] pointer-events-none">lock</span>
                <input
                  id="otp"
                  type="text"
                  placeholder="6자리 인증번호"
                  className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[#2C2C2C] placeholder:text-[#887563] focus:outline-none tracking-widest text-center"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 6) {
                      setOtp(value);
                      setError(null);
                    }
                  }}
                  maxLength={6}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <p className="text-xs text-[#887563] mt-2">
                {phone}로 발송된 6자리 인증번호를 입력해주세요.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full rounded-xl h-14 text-base bg-[#D2B48C] text-white font-bold hover:shadow-[0_6px_20px_0_rgba(210,180,140,0.12)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? '인증 중...' : '인증 완료'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('phone')}
                  disabled={isLoading}
                  className="flex-1 rounded-xl h-12 text-sm bg-white text-[#887563] font-medium border-2 border-[#E5E0DC] hover:border-[#D2B48C] transition-all duration-200 disabled:opacity-50"
                >
                  번호 변경
                </button>
                <button
                  onClick={handleResendOTP}
                  disabled={isLoading || countdown > 0}
                  className="flex-1 rounded-xl h-12 text-sm bg-white text-[#887563] font-medium border-2 border-[#E5E0DC] hover:border-[#D2B48C] transition-all duration-200 disabled:opacity-50"
                >
                  재전송 {countdown > 0 ? `(${formatTime(countdown)})` : ''}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneAuthModal;

