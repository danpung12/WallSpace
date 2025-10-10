'use client';
import React, { useRef, useState } from "react";
import { useRouter } from 'next/navigation';

export default function ArtistOwnerSignUpPage() {
  const router = useRouter();
  const [snsLink, setSnsLink] = useState('');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  type DateInputWithPicker = HTMLInputElement & { showPicker?: () => void };

  const dobRef = useRef<HTMLInputElement>(null);
  const openDatePicker = () => {
    const el = dobRef.current as DateInputWithPicker | null;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else { el.focus(); el.click?.(); }
  };

  // 뒤로가기 (히스토리 없으면 홈으로)
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // SNS 링크에 따라 아이콘 이름 반환
  const getSnsIconName = (url: string) => {
    if (url.includes('instagram.com')) return 'photo_camera';
    if (url.includes('facebook.com')) return 'groups';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'tag';
    if (url.includes('tiktok.com')) return 'videocam';
    return 'link';
  };

  // 1번(Guest)과 동일 팔레트/변수
  const cssVars = {
    "--primary-color": "#c5a987",
    "--secondary-color": "#f9f6f3",
    "--background-color": "#fdfaf7",
    "--text-primary": "#181411",
    "--text-secondary": "#a8998c",
    "--border-color": "#e5e0dc",
    "--accent-color": "#d1bfae",
    "--shadow-color": "rgba(197, 169, 135, 0.1)",
    "--input-bg-color": "#f4f0ec",
    "--button-bg-color": "#f4f0ec",
    "--button-border-color": "#e0d9d3",
  } as React.CSSProperties;

  const bgPattern = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f4f2f0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
  } as React.CSSProperties;

  const handleRequestCode = () => {
    setError(null);
    setMessage(null);
    if (phoneNumber.length < 10) {
      setError("전화번호는 최소 10자리 이상이어야 합니다.");
      return;
    }
    setIsRequestingCode(true);
    setIsCodeSent(true);
    setMessage("인증 코드가 발송되었습니다.");
    setTimeout(() => {
      setIsRequestingCode(false);
    }, 2000);
  };

  const handleVerifyCode = () => {
    setError(null);
    setMessage(null);
    if (verificationCode.length !== 6) {
      setError("인증 번호는 6자리입니다.");
      return;
    }
    setIsVerifying(true);
    setIsVerified(true);
    setMessage("인증이 완료되었습니다.");
    setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
  };

  return (
    <>
      {/* 폰트 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

      {/* 페이지 전용 스타일 (아이콘 + 인풋 글로우) */}
      <style>{`
        .ms-artist-signup {
          font-family: "Material Symbols Outlined";
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          display: inline-block;
          letter-spacing: normal;
          white-space: nowrap;
          direction: ltr;
          font-feature-settings: "liga";
          -webkit-font-feature-settings: "liga";
          -webkit-font-smoothing: antialiased;
          font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
          transition: opacity .3s, transform .3s, color .3s;
        }
        .soft-shadow { box-shadow: 0 2px 6px 0 rgba(197,169,135,0.1); }
        .input-container { transition: all .3s ease; }
        .input-container:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(197,169,135,0.25);
          background: #fff;
        }
      `}</style>

      <div style={cssVars} className="bg-[var(--background-color)] min-h-screen">
        <div className="relative flex min-h-screen flex-col justify-between" style={bgPattern}>
          {/* Header */}
          <header className="flex items-center p-6 sticky top-0 z-10 bg-[var(--background-color)]/85 backdrop-blur">
            <button
              type="button"
              aria-label="Go back"
              className="text-[var(--text-primary)]"
              onClick={handleBack}
            >
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
              </svg>
            </button>
            <h1 className="flex-1 text-center text-xl font-bold pr-6">예술가/사장님 회원가입</h1>
          </header>

          {/* Form (1번 디자인 적용: p-6/space-y-6/고정버튼 대비 pb) */}
          <main className="flex-grow">
            <div className="p-6 space-y-6 pb-[calc(96px+env(safe-area-inset-bottom))]">
              {/* User ID */}
              <div>
                <label htmlFor="user-id" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">아이디</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                    <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">person</span>
                    <input
                      id="user-id" type="text" placeholder="아이디를 입력하세요."
                      className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                    />
                  </div>
                  <button type="button" className="flex-shrink-0 rounded-xl h-14 px-5 bg-[var(--accent-color)] text-white text-sm font-bold hover:bg-opacity-90 transition-colors soft-shadow">
                    중복확인
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">비밀번호</label>
                <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                  <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">lock</span>
                  <input
                    id="password" type="password" placeholder="비밀번호를 입력하세요."
                    className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">비밀번호 확인</label>
                <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                  <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">lock</span>
                  <input
                    id="confirm-password" type="password" placeholder="비밀번호를 다시 입력하세요."
                    className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">생년월일</label>
                <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                  <span onClick={openDatePicker} className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] cursor-pointer">calendar_month</span>
                  <input
                    ref={dobRef} id="dob" type="date" placeholder="YYYY-MM-DD"
                    className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Gender (원래 구조 유지 + 높이만 1번과 동일 h-14) */}
              <div>
                <p className="text-base font-medium pb-3 text-[var(--text-primary)]">성별</p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center justify-center rounded-xl border border-[var(--button-border-color)] bg-[var(--button-bg-color)] px-4 h-14 text-[var(--text-primary)] has-[:checked]:border-2 has-[:checked]:border-[var(--primary-color)] has-[:checked]:bg-[#fdf5ed] has-[:checked]:text-[var(--primary-color)] cursor-pointer flex-1 text-sm font-medium transition-all duration-200 has-[:checked]:soft-shadow">
                    <input defaultChecked className="sr-only" name="gender" type="radio" value="male" />
                    <span className="ms-artist-signup mr-2">male</span>
                    <span>남성</span>
                  </label>
                  <label className="flex items-center justify-center rounded-xl border border-[var(--button-border-color)] bg-[var(--button-bg-color)] px-4 h-14 text-[var(--text-primary)] has-[:checked]:border-2 has-[:checked]:border-[var(--primary-color)] has-[:checked]:bg-[#fdf5ed] has-[:checked]:text-[var(--primary-color)] cursor-pointer flex-1 text-sm font-medium transition-all duration-200 has-[:checked]:soft-shadow">
                    <input className="sr-only" name="gender" type="radio" value="female" />
                    <span className="ms-artist-signup mr-2">female</span>
                    <span>여성</span>
                  </label>
                </div>
              </div>

              {/* Mobile Phone Verification */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">핸드폰 인증 (PASS)</label>
                {message && !isVerified && <p className="text-sm text-[var(--primary-color)] mb-2">{message}</p>}
                {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                    <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">phone_android</span>
                    <input
                      id="phone" type="tel" placeholder="휴대폰 번호를 입력하세요."
                      className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isCodeSent || isVerified || isRequestingCode}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestCode}
                    disabled={isRequestingCode || isCodeSent || isVerified || phoneNumber.length < 10} // 최소 길이 제한
                    className="flex-shrink-0 rounded-xl h-14 px-5 bg-[var(--accent-color)] text-white text-sm font-bold hover:bg-opacity-90 transition-colors soft-shadow"
                  >
                    {isRequestingCode ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : isCodeSent ? (
                      "재요청"
                    ) : (
                      "인증 요청"
                    )}
                  </button>
                </div>

                {isCodeSent && !isVerified && (
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                      <span className="ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">lock_open</span>
                      <input
                        id="verification-code" type="text" placeholder="인증 번호를 입력하세요."
                        className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={isVerifying || isVerified}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={isVerifying || isVerified || verificationCode.length !== 6} // 6자리 코드 예상
                      className="flex-shrink-0 rounded-xl h-14 px-5 bg-[var(--accent-color)] text-white text-sm font-bold hover:bg-opacity-90 transition-colors soft-shadow"
                    >
                      {isVerifying ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        "인증 확인"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* SNS Account Link (아이콘 컬러 동적 유지) */}
              <div>
                <label htmlFor="sns-link" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">SNS 계정 링크</label>
                <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                  <span
                    key={getSnsIconName(snsLink)}
                    className={`ms-artist-signup absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${getSnsIconName(snsLink) === 'link' ? 'text-[var(--text-secondary)]' : 'text-[var(--primary-color)]'}`}
                  >
                    {getSnsIconName(snsLink)}
                  </span>
                  <input
                    id="sns-link" type="text" value={snsLink} onChange={(e) => setSnsLink(e.target.value)}
                    placeholder="SNS 계정 링크를 입력하세요."
                    className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Footer: 1번 디자인과 동일한 고정 버튼 */}
          <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-color)] bg-[var(--background-color)]/85 backdrop-blur">
            <div className="max-w-md mx-auto px-6 py-3">
              <button
                type="button"
                className="w-full rounded-xl h-14 px-5 bg-[var(--primary-color)] text-white text-base font-bold hover:bg-opacity-90 transition-colors soft-shadow"
              >
                가입하기
              </button>
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
