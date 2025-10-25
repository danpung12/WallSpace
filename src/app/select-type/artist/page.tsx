'use client';
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { registerUser, checkEmailExists, validateEmail } from '@/lib/api/auth';

export default function ArtistOwnerSignUpPage() {
  const router = useRouter();
  const [snsLink, setSnsLink] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
    phone: ''
  });
  const [gender, setGender] = useState('male');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const cssVars = {
    "--primary-color": "#D2B48C",
    "--primary-light": "#F5F1EC",
    "--primary-dark": "#2C2C2C",
    "--secondary-color": "#F5F1EC",
    "--background-color": "#F5F1EC",
    "--card-background-color": "#FFFFFF",
    "--text-primary": "#2C2C2C",
    "--text-secondary": "#887563",
    "--border-color": "#E5E0DC",
    "--accent-color": "#C9A67B",
    "--shadow-color": "rgba(210, 180, 140, 0.1)",
    "--shadow-color-light": "rgba(210, 180, 140, 0.08)",
    "--shadow-color-medium": "rgba(210, 180, 140, 0.12)",
    "--glow-color": "rgba(210, 180, 140, 0.25)",
    "--input-bg-color": "#F5F1EC",
  } as React.CSSProperties;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

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
    
    if (name === 'email') {
      setEmailChecked(false);
    }
  };

  const handleCheckEmail = async () => {
    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      return;
    }

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!emailChecked) {
      setError('이메일 중복 확인을 완료해주세요.');
      setIsLoading(false);
      return;
    }

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
          nickname: formData.nickname || '무명', // 닉네임이 없으면 "무명"
          user_type: 'artist',
          phone: formData.phone.trim() || undefined,
          website: snsLink.trim() || undefined
        }
      );

      if (error) {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      if (user) {
        alert('회원가입이 완료되었습니다!\n\n📧 이메일로 발송된 인증 링크를 클릭하여\n계정을 활성화해주세요.');
        router.push('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

      <style>{`
        .ms-artist-signup {
          font-family: "Material Symbols Outlined";
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          display: inline-block;
          text-transform: none;
          letter-spacing: normal;
          white-space: nowrap;
          font-feature-settings: "liga";
          -webkit-font-feature-settings: "liga";
          font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
        }
        .soft-shadow {
          box-shadow: 0 4px 16px 0 var(--shadow-color-light);
        }
        .input-container:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px var(--glow-color);
        }
      `}</style>

      <div style={cssVars} className="bg-[var(--background-color)] min-h-screen font-['Pretendard']">
        <div className="max-w-md mx-auto">
          <div className="bg-[var(--card-background-color)] min-h-screen flex flex-col">
            {/* Header */}
            <header className="relative flex items-center justify-center p-4 border-b border-[var(--border-color)]">
              <button
                type="button"
                aria-label="Go back"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-dark)] p-2 rounded-full hover:bg-[var(--primary-light)] transition-colors"
                onClick={handleBack}
              >
                <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                </svg>
              </button>
              <h1 className="text-lg font-bold text-[var(--primary-dark)]">예술가/사장님 회원가입</h1>
            </header>

            {/* Main Content: Form */}
            <form onSubmit={handleSignUp} className="flex-grow">
              <main className="p-6 space-y-6 pb-28">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Email with Duplicate Check */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">이메일</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                      <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">email</span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      {emailChecked && (
                        <span className="ms-artist-signup absolute right-4 text-green-500">check_circle</span>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={handleCheckEmail}
                      disabled={checkingEmail || emailChecked || !formData.email}
                      className="flex-shrink-0 rounded-xl h-14 px-5 bg-[var(--accent-color)] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailChecked ? '확인완료' : checkingEmail ? '확인중...' : '중복확인'}
                    </button>
                  </div>
                  {emailChecked && (
                    <p className="text-xs text-green-600 mt-2">✓ 사용 가능한 이메일입니다.</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">이름</label>
                  <div className="relative flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                    <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">person</span>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="이름을 입력하세요"
                      className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Nickname */}
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">닉네임 (선택)</label>
                  <div className="relative flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                    <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">badge</span>
                    <input
                      id="nickname"
                      name="nickname"
                      type="text"
                      placeholder="닉네임을 입력하세요 (입력하지 않으면 '무명')"
                      className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                      value={formData.nickname}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">비밀번호</label>
                  <div className="relative flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                    <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">lock</span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">비밀번호 확인</label>
                  <div className="relative flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                    <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">lock</span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">전화번호</label>
                  <div className="relative flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                    <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">phone</span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="전화번호를 입력하세요"
                      className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <p className="text-sm font-medium pb-2 text-[var(--text-primary)]">성별</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center justify-center rounded-xl border-2 border-[var(--primary-light)] bg-white px-4 h-14 has-[:checked]:bg-[var(--primary-color)] has-[:checked]:text-white has-[:checked]:border-[var(--primary-color)] has-[:checked]:font-bold cursor-pointer text-sm font-medium transition-all duration-200">
                      <input defaultChecked className="sr-only" name="gender" type="radio" value="male" onChange={(e) => setGender(e.target.value)} />
                      <span className="ms-artist-signup mr-2 text-[20px]">male</span>
                      <span>남성</span>
                    </label>
                    <label className="flex items-center justify-center rounded-xl border-2 border-[var(--primary-light)] bg-white px-4 h-14 has-[:checked]:bg-[var(--primary-color)] has-[:checked]:text-white has-[:checked]:border-[var(--primary-color)] has-[:checked]:font-bold cursor-pointer text-sm font-medium transition-all duration-200">
                      <input className="sr-only" name="gender" type="radio" value="female" onChange={(e) => setGender(e.target.value)} />
                      <span className="ms-artist-signup mr-2 text-[20px]">female</span>
                      <span>여성</span>
                    </label>
                  </div>
                </div>

                {/* SNS Link */}
                <div>
                  <label htmlFor="sns-link" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">SNS 계정 (선택)</label>
                  <div className="relative flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                    <span
                      className={`ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${getSnsIconName(snsLink) === 'link' ? 'text-[var(--text-secondary)]' : 'text-[var(--primary-color)]'}`}
                    >
                      {getSnsIconName(snsLink)}
                    </span>
                    <input
                      id="sns-link"
                      type="text"
                      value={snsLink}
                      onChange={(e) => setSnsLink(e.target.value)}
                      placeholder="SNS 계정 링크를 입력하세요"
                      className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl h-14 px-5 bg-[var(--primary-color)] text-white text-base font-bold transition-all duration-300 soft-shadow hover:shadow-[0_6px_20px_0_var(--shadow-color-medium)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '가입 중...' : '가입하기'}
                  </button>
                </div>
              </main>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
