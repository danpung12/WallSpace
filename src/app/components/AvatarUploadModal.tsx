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
    let objectUrl: string | null = null;
    if (selectedFile) {
      objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }

    // cleanup 함수: 컴포넌트가 unmount되거나 파일이 바뀔 때 이전 object URL 해제
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

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
          <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-200 shadow-inner">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Avatar preview"
                className="object-cover w-full h-full"
              />
            )}
          </div>

          {/* 파일 선택 버튼 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 text-sm font-semibold text-[#3D2C1D] bg-white border border-[#EAE5DE] rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
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
              className="w-full py-2.5 font-semibold text-[#8C7853] bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={!selectedFile}
              className="w-full py-2.5 font-bold text-white bg-[#D2B48C] rounded-lg hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
