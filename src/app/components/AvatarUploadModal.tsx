// src/app/components/AvatarUploadModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";

interface AvatarUploadModalProps {
  open: boolean;
  currentAvatarUrl: string;
  onClose: () => void;
  onSave: (file: File) => void;
}

export default function AvatarUploadModal({
  open,
  currentAvatarUrl,
  onClose,
  onSave,
}: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 모달이 열릴 때 현재 아바타를 미리보기로 설정
    if (open) {
      setPreviewUrl(currentAvatarUrl);
      setSelectedFile(null); // 파일 선택 초기화
    }
  }, [open, currentAvatarUrl]);

  // 파일이 변경될 때마다 미리보기 URL 생성
  useEffect(() => {
    if (selectedFile) {
      // FileReader를 사용하여 파일을 Data URL로 변환
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(currentAvatarUrl);
    }
  }, [selectedFile, currentAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveClick = () => {
    if (selectedFile) {
      onSave(selectedFile);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm p-6 bg-[#FDFBF8] rounded-2xl shadow-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center text-[#3D2C1D] mb-4">
          프로필 사진 변경
        </h2>

        <div className="flex flex-col items-center space-y-4">
          {/* 이미지 미리보기 */}
          <div 
            className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-200 shadow-inner group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Avatar preview"
                className="object-cover w-full h-full"
              />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
          </div>

          {/* 파일 선택 버튼 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 text-sm font-semibold text-[#4a3f3a] bg-[#f5f3f1] rounded-lg shadow-sm hover:bg-[#dcd6d1] transition-colors"
          >
            이미지 선택
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* 저장 및 취소 버튼 */}
          <div className="w-full grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-lg bg-white text-[#A18F79] border border-[#EAE5DE] font-bold hover:bg-[#F5F3F0] transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={!selectedFile}
              className="w-full h-12 rounded-lg bg-[#c19a6b] text-white font-bold hover:opacity-90 transition-opacity disabled:bg-[#D4C8B8] disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
