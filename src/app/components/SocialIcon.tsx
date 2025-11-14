"use client";

import React from 'react';

interface SocialIconProps {
  provider: string;
  className?: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ provider, className = 'w-6 h-6' }) => {
  const icons: { [key: string]: React.ReactNode } = {
    kakao: (
      <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFCD00" d="M16 4c-6.627 0-12 4.477-12 10 0 3.536 2.29 6.632 5.683 8.397L8 28l4.88-3.253A13.88, 13.88, 0, 0, 0, 16, 25c6.627,0,12-4.477,12-10S22.627,4,16,4Z"/>
      </svg>
    ),
    naver: (
      <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#03C75A" d="M4 4h24v24H4z"/>
        <path fill="#fff" d="M11.6,12.5v7h-3v-7h3Zm5.5,0,3.3,7h-3.1l-1.9-4.2-1.9,4.2h-3.1l3.3-7h3.4Z"/>
      </svg>
    ),
    google: (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
      </svg>
    ),
  };

  return icons[provider.toLowerCase()] || null;
};

export default SocialIcon;

