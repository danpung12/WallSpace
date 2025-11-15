"use client";

import React from 'react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 m-4 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">회원 탈퇴</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;

