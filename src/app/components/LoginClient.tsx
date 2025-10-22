'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import Image from 'next/image';
import SelectTypeModal from './SelectTypeModal';
import ArtistSignUpModal from './ArtistSignUpModal';
import GuestSignUpModal from './GuestSignUpModal';
import FindPasswordModal from './FindPasswordModal';
import { loginUser } from '@/lib/api/auth';

export default function LoginClient() {
  const router = useRouter();
  const [modalState, setModalState] = useState<'none' | 'selectType' | 'artistSignUp' | 'guestSignUp' | 'findPassword'>('none');
  const [isDesktop, setIsDesktop] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TransitionProvider의 배경색을 투명하게 만들어 이미지가 보이게 함
    const transitionElement = document.querySelector('[data-is-present]') as HTMLElement;
    if (transitionElement) {
      transitionElement.style.backgroundColor = 'transparent';
    }
    
    // 컴포넌트가 언마운트될 때 원래 배경색으로 복원
    return () => {
      if (transitionElement) {
        transitionElement.style.backgroundColor = ''; // 기본값으로 되돌림
      }
    };
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const { user, profile, error } = await loginUser(email, password);
      
      if (error) {
        setLoginError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        return;
      }
      
      if (user && profile) {
        router.push('/home');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    if (isDesktop) {
      setModalState('selectType');
    } else {
      router.push('/select-type');
    }
  };

  const handleFindPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDesktop) {
      e.preventDefault();
      openModal('findPassword');
    }
    // 모바일에서는 a 태그의 기본 동작(href로 이동)을 따릅니다.
  };

  const openModal = (modalName: 'selectType' | 'artistSignUp' | 'guestSignUp' | 'findPassword') => {
    setModalState(modalName);
  };

  const closeModal = () => {
    setModalState('none');
  };
  
  const isModalOpen = modalState !== 'none';

  return (
    <>
      <div className={`fixed inset-0 -z-10 transition-all duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
        <Image
          alt="Login background"
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop&v=1"
          priority
          fill
          style={{
            objectFit: "cover",
          }}
        />
      </div>
      <style jsx global>{`
        .input-field {
          width: 100%; height: 3rem; background: #ffffff; border-radius: 0.5rem; color: #3d2b1f;
          padding-left: 1rem; font-size: 0.95rem; font-weight: 400; border: 1px solid #e5e7eb; transition: all 0.3s;
          box-shadow: 0 1px 2px 0 rgba(16, 24, 40, 0.04);
        }
        .input-field:focus { outline: none; border-color: #c19a6b; box-shadow: 0 0 0 3px rgba(193, 154, 107, 0.18); }
        .input-field::placeholder { color: #a99985; opacity: 1; }
        .primary-button {
          width: 100%; height: 3rem; background: #c19a6b; color: #ffffff; font-size: 1rem;
          font-weight: 700; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s; box-shadow: 0 1px 2px 0 rgba(16,24,40,0.04); letter-spacing: 0.015em;
        }
        .primary-button:hover { opacity: .9; transform: scale(1.02); box-shadow: 0 4px 12px -2px rgba(193,154,107,.5); }
        .primary-button:active { transform: scale(.98); }
        .secondary-button {
          width: 100%; height: 3rem; background: transparent; color: #c19a6b; border: 1px solid #c19a6b;
          font-size: 1rem; font-weight: 700; border-radius: .5rem; display:flex; align-items:center; justify-content:center;
          transition: all .3s; box-shadow: 0 1px 2px rgba(16,24,40,.04); letter-spacing: .015em;
        }
        .secondary-button:hover { background: rgba(255,255,255,.2); transform: scale(1.02); }
        .social-login-horizontal { display: flex; justify-content: center; align-items: center; gap: 1.5rem; }
        .social-icon-wrapper { position: relative; text-align: center; }
        .social-icon-btn {
          width: 56px; height: 56px; border-radius: 50%; display: flex; justify-content: center; align-items: center;
          cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .social-icon-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .social-icon-btn svg { width: 28px; height: 28px; }
        .wallspace-logo-container {
          position: relative;
          display: inline-block;
          text-align: center;
        }
        .logo-text {
          position: relative;
          z-index: 2;
          font-size: 3rem;
          font-weight: bold;
          color: white;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
        }
      `}</style>
      <div className={`relative flex flex-col h-screen justify-center px-6 md:px-8 py-8 transition-all duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
        <div className="text-center mb-8">
          <div className="wallspace-logo-container">
            <h1 className="logo-text">
              WallSpace
            </h1>
          </div>
          <p className="text-base text-white/90 mt-2">당신의 작품으로 벽을 채우세요</p>
        </div>

        <div
          className="relative p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-auto border border-white/60 ring-1 ring-black/5"
          style={{ background: 'rgba(255,255,255,0.90)' }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: '#3d2b1f' }}>로그인</h2>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {loginError}
              </div>
            )}
            <div>
              <label className="sr-only" htmlFor="login-email">Email / ID</label>
              <input 
                className="input-field" 
                id="login-email" 
                name="email"
                placeholder="이메일" 
                type="email" 
                autoComplete="username" 
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="login-password">Password</label>
              <input 
                className="input-field" 
                id="login-password" 
                name="password"
                placeholder="비밀번호" 
                type="password" 
                autoComplete="current-password" 
                required
                disabled={isLoading}
              />
            </div>
            <div className="text-right py-1">
              <a className="text-[12px] sm:text-[13px] hover:underline" style={{ color: '#7a5c52' }} href="/find-password" onClick={handleFindPasswordClick}>비밀번호를 잊으셨나요?</a>
            </div>
            <div className="space-y-3">
              <button 
                className="primary-button" 
                type="submit" 
                disabled={isLoading}
              >
                <span>{isLoading ? '로그인 중...' : '로그인'}</span>
              </button>
              <button 
                className="secondary-button" 
                type="button" 
                onClick={handleSignup}
                disabled={isLoading}
              >
                회원가입
              </button>
            </div>
          </form>
          <div className="mt-8 flex items-center">
            <div className="flex-grow" style={{ borderTop: '1px solid #d1d5db' }} />
            <span className="flex-shrink mx-4 text-[11px] sm:text-xs" style={{ color: '#7a5c52' }}>간편 로그인</span>
            <div className="flex-grow" style={{ borderTop: '1px solid #d1d5db' }} />
          </div>
          <div className="mt-6 sm:mt-8 social-login-horizontal">
            <div className="social-icon-wrapper">
              <button className="social-icon-btn" style={{ backgroundColor: '#03c75a' }} aria-label="네이버로 로그인">
                <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M15.9 12.825L9.15 3H3v18h6.15V11.175L15.9 21H21V3h-5.1v9.825z" /></svg>
              </button>
            </div>
            <div className="social-icon-wrapper">
              <button className="social-icon-btn" style={{ backgroundColor: '#FEE500' }} aria-label="카카오로 로그인">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#181600"><path d="M12 2C6.477 2 2 5.82 2 10.5C2 13.533 3.808 16.202 6.48 17.539L6 22l4.33-2.598C10.896 19.46 11.442 19.5 12 19.5c5.523 0 10-3.82 10-9S17.523 2 12 2z" /></svg>
              </button>
            </div>
            <div className="social-icon-wrapper">
              <button className="social-icon-btn" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} aria-label="구글로 로그인">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <SelectTypeModal 
        isOpen={modalState === 'selectType'} 
        onClose={closeModal}
        onSelectArtist={() => openModal('artistSignUp')}
        onSelectGuest={() => openModal('guestSignUp')}
      />
      <ArtistSignUpModal 
        isOpen={modalState === 'artistSignUp'} 
        onClose={closeModal}
        onSwitchToGuest={() => openModal('guestSignUp')}
      />
      <GuestSignUpModal 
        isOpen={modalState === 'guestSignUp'} 
        onClose={closeModal}
        onSwitchToArtist={() => openModal('artistSignUp')}
      />
      <FindPasswordModal
        isOpen={modalState === 'findPassword'}
        onClose={closeModal}
      />
    </>
  );
}
