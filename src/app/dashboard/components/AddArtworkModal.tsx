'use client';

import React, { useState, useEffect, FormEvent, useRef } from 'react';

// This type should ideally be in a shared types file
type Artwork = {
  id: number;
  title: string;
  dimensions: string;
  imageUrl: string;
};

interface AddArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (artwork: Omit<Artwork, 'imageUrl' | 'id'> & { id?: number; file: File | null }) => void;
  artworkToEdit: Artwork | null;
  onDelete?: (id: number) => void;
}

const AddArtworkModal: React.FC<AddArtworkModalProps> = ({ isOpen, onClose, onSave, artworkToEdit, onDelete }) => {

  const [shouldRender, setShouldRender] = useState(isOpen);
  
  // Form state
  const [title, setTitle] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [description, setDescription] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditMode = !!artworkToEdit;

  // Form validation
  const isFormValid = 
    title.trim() !== '' &&
    height.trim() !== '' && parseFloat(height) > 0 &&
    width.trim() !== '' && parseFloat(width) > 0 &&
    description.trim() !== '' &&
    (previewUrl !== null);


  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      if (isEditMode && artworkToEdit) {
        setTitle(artworkToEdit.title);
        const [h, w] = artworkToEdit.dimensions.replace(/cm/g, '').split('x').map(s => s.trim());
        setHeight(h || '');
        setWidth(w || '');
        setDescription(''); // Assuming description is not part of mock, reset it
        setPreviewUrl(artworkToEdit.imageUrl);
        setSelectedFile(null);

      } else {
        // Reset form for "Add" mode
        setTitle('');
        setHeight('');
        setWidth('');
        setDescription('');
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);

      }, 300); // Match this to the transition duration

      return () => clearTimeout(timer);
    }
  }, [isOpen, artworkToEdit, isEditMode]);
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) return;
    
    const dimensions = `${height}cm x ${width}cm`;
    const saveData: Omit<Artwork, 'imageUrl' | 'id'> & { id?: number; file: File | null } = {
        title,
        dimensions,
        file: selectedFile,
    };
    if (artworkToEdit) {
        saveData.id = artworkToEdit.id;
    }
    
    onSave(saveData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && artworkToEdit) {
      onDelete(artworkToEdit.id);
      onClose();
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const newPreviewUrl = URL.createObjectURL(file);

      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(newPreviewUrl);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    if (isEditMode && artworkToEdit) {
        setPreviewUrl(artworkToEdit.imageUrl);
    } else {
        setPreviewUrl(null);

    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div

      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 bg-white text-gray-800 flex flex-col transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex-shrink-0 flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isEditMode ? '작품 수정' : '작품 추가'}
          </h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto px-2 space-y-6 custom-scrollbar">
          <form className="space-y-6" id="add-artwork-form" onSubmit={handleSubmit}>
            <div>
              <label className="input-label" htmlFor="artwork-name-modal">작품명</label>
              <input id="artwork-name-modal" type="text" className="input-field" placeholder="예: 호수 위의 노을" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className="input-label">작품 사진</label>
              <div>
                {previewUrl ? (
                  <div className="relative p-4 border border-gray-300 rounded-md">
                    <div className="flex items-center gap-4">
                      <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                      <div className="text-sm overflow-hidden">
                        <p className="font-semibold text-gray-800 truncate">{selectedFile?.name || '기존 이미지'}</p>
                        {selectedFile && <p className="text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                      aria-label="Remove file"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg aria-hidden="true" className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 0 0-4 4v20m32-12v8m0 0v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-4m32-4-3.172-3.172a4 4 0 0 0-5.656 0L28 28m0 0 4 4m-12-4-9.172-9.172a4 4 0 0 1 5.656 0L28 28m0 0 4 4m0-12h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <div className="flex text-sm text-gray-600 justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>파일 업로드</span>
                        </button>
                        <p>또는 파일을 여기로 끌어다 놓기</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} onChange={handleFileChange} id="file-upload-modal" name="file-upload-modal" type="file" className="sr-only" accept="image/png, image/jpeg, image/gif" />
              </div>
            </div>

            <div>
              <label className="input-label">사이즈</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500" htmlFor="height-modal">세로</label>
                  <div className="relative mt-1">
                    <input id="height-modal" type="number" step="0.01" className="input-field pr-12" placeholder="0" min="0" value={height} onChange={(e) => setHeight(e.target.value)} />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 sm:text-sm">cm</span></div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500" htmlFor="width-modal">가로</label>
                  <div className="relative mt-1">
                    <input id="width-modal" type="number" step="0.01" className="input-field pr-12" placeholder="0" min="0" value={width} onChange={(e) => setWidth(e.target.value)} />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 sm:text-sm">cm</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0"><span className="material-symbols-outlined text-yellow-500">info</span></div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">참고</h3>
                  <div className="mt-2 text-sm text-yellow-700"><p>액자나 케이스가 포함된다면 그 크기까지 포함해 가능한 한 정확한 가로·세로 치수를 입력해 주세요.</p></div>
                </div>
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="description-modal">작품 설명</label>
              <textarea id="description-modal" rows={5} className="input-field" placeholder="갤러리에 전시되는 것처럼 작품을 소개해 주세요…" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </form>
        </div>
        
        <div className="flex-shrink-0 mt-8">
            <div className="flex items-center justify-end gap-4">
              {artworkToEdit && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 rounded-xl h-12 text-base bg-gray-200 text-gray-700 font-bold transition-colors hover:bg-gray-300"
                >
                  삭제하기
                </button>
              )}
              <button
                type="submit"
                form="add-artwork-form"
                disabled={!isFormValid}
                className="px-8 rounded-xl h-12 text-base bg-[#3E352F] text-white font-bold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed enabled:hover:bg-opacity-90"
              >
                {isEditMode ? '수정 완료' : '작품 저장'}
              </button>
            </div>
        </div>
      </div>
      <style jsx>{`
        .input-field {
          width: 100%; border-radius: 0.5rem; border: 1px solid #d1d5db;
          padding: 0.625rem 0.75rem; outline: none; background: #fff;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .input-field:focus {
          border-color: #A89587; box-shadow: 0 0 0 3px rgb(168 149 135 / 30%);
        }
        .input-label {
          display: block; font-size: 0.875rem; font-weight: 600;
          color: #3d2c1d; margin-bottom: 0.5rem;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background-color: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #aaa; }
      `}</style>
    </div>
  );
};

export default AddArtworkModal;
