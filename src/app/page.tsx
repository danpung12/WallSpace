'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WallSpaceAuthPage() {
  const [form, setForm] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  // --- 아이디 확인 상태 ---
  const [signupId, setSignupId] = useState('');
  const [idStatus, setIdStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [idMessage, setIdMessage] = useState('');

  const handleCheckId = async () => {
    const id = signupId.trim();
    setIdMessage('');
    if (!id) {
      setIdStatus('taken');
      setIdMessage('아이디를 입력해주세요.');
      return;
    }
    setIdStatus('checking');

    // TODO: 실제 API로 교체
    // const res = await fetch(`/api/check-id?value=${encodeURIComponent(id)}`);
    // const { available } = await res.json();
    // setIdStatus(available ? 'available' : 'taken');
    // setIdMessage(available ? '사용 가능한 아이디입니다!' : '이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.');

    // Demo: 길이 5자 이상이면 사용 가능
    setTimeout(() => {
      const available = id.length > 4;
      setIdStatus(available ? 'available' : 'taken');
      setIdMessage(available ? '사용 가능한 아이디입니다!' : '이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.');
    }, 500);
  };

  // --- 비밀번호, 전화번호, 생년월일 상태/검증 ---
  const [password, setPassword] = useState('');
  const [passwordOk, setPasswordOk] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState(''); // YYYY-MM-DD

  const isLengthValid = password.length >= 8;
  const isAlphaNumValid = /[A-Za-z]/.test(password) && /\d/.test(password);
  const isPwMatch = password.length > 0 && password === passwordOk;

  // 한국 휴대폰(하이픈 허용) 간단 검증: 10~11자리 숫자
  const normalizedPhone = phone.replace(/\D/g, '');
  const isPhoneFormatValid = normalizedPhone.length >= 10 && normalizedPhone.length <= 11;

  // 전화번호 인증 시뮬레이션
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'verified' | 'invalid'>('idle');
  const [phoneMsg, setPhoneMsg] = useState('');

  const handleVerifyPhone = async () => {
    setPhoneMsg('');
    if (!isPhoneFormatValid) {
      setPhoneStatus('invalid');
      setPhoneMsg('전화번호 형식을 확인해주세요.');
      return;
    }
    setPhoneStatus('checking');

    // TODO: 실제 인증 API 연동
    setTimeout(() => {
      setPhoneStatus('verified');
      setPhoneMsg('전화번호 인증이 완료되었습니다.');
    }, 600);
  };

  // 생년월일 유효성(간단): YYYY-MM-DD 이면서 실제 날짜
  const isDobValid = (() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return false;
    // 입력값 그대로 비교(월/일 유지)로 진짜 같은 날짜인지 확인
    const [y, m, day] = dob.split('-').map(Number);
    return d.getUTCFullYear() === y && (d.getUTCMonth() + 1) === m && d.getUTCDate() === day;
  })();

  const isIdTaken = idStatus === 'taken';

  // 제출 가능 여부(필요시 조건 조정)
  const canSubmit =
    !isIdTaken &&
    isLengthValid &&
    isAlphaNumValid &&
    isPwMatch &&
    phoneStatus === 'verified' &&
    isDobValid;

  return (
    <div>
      {/* Google Fonts, Custom CSS */}
      <style jsx global>{`
        :root {
          --background-color: #FDFBF8;
          --primary-color: #C19A6B;
          --text-primary: #3D2B1F;
          --text-secondary: #7A5C52;
          --input-bg: #FFFFFF;
          --input-placeholder: #A99985;
          --white: #FFFFFF;
          --naver-green: #03C75A;
          --google-blue: #4285F4;
          --success-color: #28a745;
          --error-color: #dc3545;
        }
        body, html {
          font-family: 'Pretendard', sans-serif;
          background-color: var(--background-color);
          background-image: url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          min-height: max(884px, 100dvh);
        }
        .input-field {
          width: 100%;
          height: 3rem;
          background: var(--input-bg);
          border-radius: 0.5rem;
          color: var(--text-primary);
          padding-left: 1rem;
          font-size: 0.95rem;
          font-weight: 400;
          border: 1px solid #e5e7eb;
          transition: all 0.3s;
          box-shadow: 0 1px 2px 0 rgba(16,24,40,0.04);
        }
        .input-field:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(193, 154, 107, 0.18);
        }
        .input-field::placeholder {
          color: var(--input-placeholder);
          opacity: 1;
        }
        .primary-button {
          width: 100%;
          height: 3rem;
          background: var(--primary-color);
          color: var(--white);
          font-size: 1rem;
          font-weight: 700;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 1px 2px 0 rgba(16,24,40,0.04);
          letter-spacing: 0.015em;
        }
        .primary-button:hover {
          background: var(--primary-color);
          opacity: 0.90;
          transform: scale(1.02);
          box-shadow: 0 4px 12px -2px rgba(193, 154, 107, 0.5);
        }
        .primary-button:active {
          transform: scale(0.98);
        }
        .secondary-button {
          color: var(--primary-color);
          font-size: 0.89rem;
          font-weight: 500;
          text-decoration: underline;
        }
        .social-button {
          width: 100%;
          height: 3rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: var(--white);
          font-size: 1rem;
          font-weight: 700;
          box-shadow: 0 1px 2px 0 rgba(16,24,40,0.04);
        }
        .social-button:hover { transform: scale(1.02); }
        .social-button:active { transform: scale(0.98); }
        .naver-button { background: var(--naver-green); }
        .google-button { background: var(--google-blue); }
        .social-icon {
          width: 20px;
          height: 20px;
          margin-right: 12px;
        }
        /* 아이디 확인 전용 스타일 */
        .check-id-wrap { position: relative; }
        .check-id-button {
          position: absolute;
          right: 0.25rem;
          top: 0.25rem;
          height: 2.5rem;
          padding: 0 0.9rem;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          color: #4b5563;
          transition: background 0.2s ease;
        }
        .check-id-button:hover { background: #d1d5db; }
        .validation-message {
          font-size: 0.76rem;
          margin-top: 0.25rem;
        }
        .validation-message.success { color: var(--success-color); }
        .validation-message.error { color: var(--error-color); }
        /* 비밀번호 조건 표시 */
        .password-requirement {
          display: flex;
          align-items: center;
          font-size: 0.76rem;
          color: var(--text-secondary);
          transition: color 0.3s ease;
        }
        .password-requirement svg {
          width: 14px;
          height: 14px;
          margin-right: 4px;
          fill: currentColor;
        }
        .password-requirement.valid { color: var(--success-color); }
        /* 전화번호 인증 버튼 */
        .verify-phone-button {
          width: 100%;
          height: 3rem;
          border: 1px solid var(--primary-color);
          color: var(--primary-color);
          background: transparent;
          font-size: 1rem;
          font-weight: 700;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 1px 2px 0 rgba(16,24,40,0.04);
          letter-spacing: 0.015em;
        }
        .verify-phone-button:hover {
          background: var(--primary-color);
          color: var(--white);
          transform: scale(1.02);
        }
        .verify-phone-button:active { transform: scale(0.98); }
      `}</style>

      <div className="relative min-h-screen">
        {/* Blur Overlay */}
        <div
          className="absolute inset-0 bg-black/10"
          style={{ backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
        />
        <div className="relative flex flex-col min-h-screen justify-center px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[var(--white)] tracking-tight">WallSpace</h1>
            <p className="text-base text-white/90 mt-2">당신의 작품으로 벽을 채우세요</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
            <div className="flex mb-6">
              <button
                className={`flex-1 pb-2 border-b-2 font-semibold text-sm
                  ${form === 'login'
                    ? 'border-[var(--primary-color)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-secondary)]'
                  }`}
                onClick={() => setForm('login')}
                type="button"
              >로그인</button>
              <button
                className={`flex-1 pb-2 border-b-2 font-semibold text-sm
                  ${form === 'signup'
                    ? 'border-[var(--primary-color)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-secondary)]'
                  }`}
                onClick={() => setForm('signup')}
                type="button"
              >회원가입</button>
            </div>

            {/* 로그인 */}
            {form === 'login' && (
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="sr-only" htmlFor="login-email">Email</label>
                    <input className="input-field" id="login-email" placeholder="아이디" type="email" autoComplete="username" />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor="login-password">Password</label>
                    <input className="input-field" id="login-password" placeholder="비밀번호" type="password" autoComplete="current-password" />
                  </div>
                  <div className="text-right">
                    <a className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" href="#">
                      비밀번호를 잊으셨나요?
                    </a>
                  </div>
                  <div>
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => router.push('/home')}
                    >
                      <span>로그인</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-xs text-[var(--text-secondary)]">간편 로그인</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="mt-6 space-y-4">
                  <button className="social-button naver-button" type="button">
                <img
                  alt="Naver logo"
                  className="social-icon"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9ptjK8I4NQFf3U0hwQkTFAMrLQfQAOJfME3-OVOEDc-3MkhrXyvMQTcXoZt7bbZW7cXGlF2s6SsN3THcMxB8cvpoVz4xTdTLrRbXeJ9BSi-46ywd19xuZFGUSResV5ECS0nziFdsrPWMxSjtr5TVPhrDdOXrK44VEoqwGvjxHyE-nkUAI_DQQGK4RhK0TaHnIbUhzuGsSkCqqEa__Nb7t8BIciJvvzHfPAhdX7PgdZ4Jf98apCyFevIokMSCf44wh3rYXKjECJbVx"
                />
                <span className="text-sm">네이버로 로그인</span>
              </button>
                  <button className="social-button google-button" type="button">
                    <img
                      alt="Google logo"
                      className="social-icon"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSlUKHVMMkv7wtqFXy5hetjFiHu-WjKQygB3_QGAkQQ_4H49-1NrSbtbDIFoylXzbfsAAiC4l1TN_fBhKBEyukYCF8DL4UMAJ3cpr3n47sRs9HMoGLFEic144MpP7qg4CYObZAZ3jznERvI1iFvtFJSQ_bQ3miEpSMXjy-gXeYBQ3N3nThKVxxmLt-IlrDizUBokGIw_it0LPUgIpSF8Ic5iFHf4ROPclwonXV4hXMcr6zLfIZoQy82BG2eOmUXmBBFse9S10"
                    />
                    <span className="text-sm">구글로 로그인</span>
                  </button>
                </div>
              </div>
            )}

            {/* 회원가입 */}
            {form === 'signup' && (
              <div>
                <div className="space-y-4">
                  {/* 이름 */}
                  <div>
                    <label className="sr-only" htmlFor="signup-name">Name</label>
                    <input className="input-field" id="signup-name" placeholder="이름" type="text" autoComplete="name" />
                  </div>

                  {/* 아이디 + 중복확인 */}
                  <div>
                    <label className="sr-only" htmlFor="signup-id">아이디</label>
                    <div className="check-id-wrap">
                      <input
                        className="input-field pr-28"
                        id="signup-id"
                        placeholder="아이디
            "
                        type="text"
                        value={signupId}
                        onChange={(e) => {
                          setSignupId(e.target.value);
                          setIdStatus('idle');
                          setIdMessage('');
                        }}
                        autoComplete="username"
                      />
                      <button
                        className="check-id-button"
                        type="button"
                        onClick={handleCheckId}
                        disabled={idStatus === 'checking'}
                        aria-live="polite"
                      >
                        {idStatus === 'checking' ? '확인 중...' : '중복 확인'}
                      </button>
                    </div>

                    {/* 👉 추가된 영역: 아이디 규칙 한 줄 (간격 mt-2) */}


                    {idMessage && (
                      <p
                        className={`validation-message ${
                          idStatus === 'available' ? 'success' : idStatus === 'taken' ? 'error' : ''
                        }`}
                        id="id-validation-message"
                      >
                        {idMessage}
                      </p>
                    )}
                  </div>

                  {/* 비밀번호 */}
                  <div>
                    <label className="sr-only" htmlFor="signup-password">Password</label>
                    <input
                      className="input-field"
                      id="signup-password"
                      placeholder="비밀번호"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-describedby="pw-req-length pw-req-alnum"
                    />
                    <div className="mt-2 space-y-1">
                      <div
                        className={`password-requirement ${isLengthValid ? 'valid' : ''}`}
                        id="pw-req-length"
                      >
                        <svg viewBox="0 0 20 20">
                          <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                        </svg>
                        <span>최소 8자 이상, 영문자와 숫자 조합</span>
                      </div>
                      <div
                        className={`password-requirement ${isAlphaNumValid ? 'valid' : ''}`}
                        id="pw-req-alnum"
                      >
                        <span></span>
                      </div>
                    </div>
                  </div>

                  {/* 비밀번호 확인 */}
                  <div>
                    <label className="sr-only" htmlFor="signup-passwordok">PasswordOk</label>
                    <input
                      className="input-field"
                      id="signup-passwordok"
                      placeholder="비밀번호 확인"
                      type="password"
                      autoComplete="new-password"
                      value={passwordOk}
                      onChange={(e) => setPasswordOk(e.target.value)}
                    />
                    {passwordOk.length > 0 && !isPwMatch && (
                      <p className="validation-message error">비밀번호가 일치하지 않습니다.</p>
                    )}
                  </div>

                  {/* 전화번호 + 인증 */}
                  <div>
                    <div className="pt-2">
                      <button
                        className="verify-phone-button"
                        type="button"
                        onClick={handleVerifyPhone}
                        disabled={phoneStatus === 'checking'}
                      >
                        {phoneStatus === 'checking' ? '인증 중...' : '전화번호 인증'}
                      </button>
                    </div>
                    {phoneMsg && (
                      <p
                        className={`validation-message ${
                          phoneStatus === 'verified' ? 'success' : phoneStatus === 'invalid' ? 'error' : ''
                        }`}
                      >
                        {phoneMsg}
                      </p>
                    )}
                  </div>

                  {/* 생년월일 */}

                  {/* 제출 */}
                  <div>
                    <button
                      className={`primary-button ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
                      type="button"
                      disabled={!canSubmit}
                      title={!canSubmit ? '아이디/비밀번호/전화번호/생년월일을 확인해주세요.' : undefined}
                    >
                      <span>회원가입</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            {form === 'login' ? (
              <p className="text-sm text-white/90">
                계정이 아직 없으신가요?{' '}
                <button
                  className="secondary-button !text-white font-semibold !text-sm"
                  onClick={() => setForm('signup')}
                  type="button"
                >
                  회원가입
                </button>
              </p>
            ) : (
              <p className="text-sm text-white/90">
                이미 계정이 있으신가요?{' '}
                <button
                  className="secondary-button !text-white font-semibold !text-sm"
                  onClick={() => setForm('login')}
                  type="button"
                >
                  로그인
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
