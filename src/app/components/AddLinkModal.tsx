"use client";

import React from 'react';
import SocialIcon from './SocialIcon';

interface AddLinkModalProps {
  open: boolean;
  onClose: () => void;
  onLink: (provider: 'kakao' | 'naver' | 'google') => void;
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({ open, onClose, onLink }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 lg:p-8">
        <h2 className="text-xl lg:text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">소셜 계정 연동</h2>
        <div className="space-y-4">
          <button
            onClick={() => onLink('kakao')}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#FEE500] text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <SocialIcon provider="kakao" className="w-5 h-5 mr-2" />
            <span>카카오로 계속하기</span>
          </button>
          <button
            onClick={() => onLink('naver')}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#03C75A] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <SocialIcon provider="naver" className="w-5 h-5 mr-2" />
            <span>네이버로 계속하기</span>
          </button>
          <button
            onClick={() => onLink('google')}
            className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <SocialIcon provider="google" className="w-5 h-5 mr-2" />
            <span>구글로 계속하기</span>
          </button>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLinkModal;

