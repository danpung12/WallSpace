'use client';

import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useBottomNav } from '@/app/context/BottomNavContext';

declare global {
  interface Window {
    daum: any;
  }
}

export default function AddStorePrototypePage() {
    const { setIsNavVisible } = useBottomNav();

    useEffect(() => {
        setIsNavVisible(false);
        return () => {
            setIsNavVisible(true);
        };
    }, [setIsNavVisible]);

    const [activeScreen, setActiveScreen] = useState('screen-start');
    const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    storeName: '',
        storeCategory: 'cafe',
    address: '',
    addressDetail: '',
        phone: '',
        snsUrls: [''],
        options: {
            parking: false,
            pets: false,
            twentyFourHours: false,
        },
    description: '',
        tags: [] as string[],
        tagInput: '',
        imageFiles: [] as File[],
        imagePreviews: [] as string[],
        spaces: [] as {
            id: number;
            name: string;
            width: string;
            height: string;
            imageFile: File | null,
            imagePreview: string
        }[],
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const spaceFileInputRef = useRef<HTMLInputElement>(null);

    // State for space editor modal
    const [isSpaceEditorOpen, setSpaceEditorOpen] = useState(false);
    const [currentSpace, setCurrentSpace] = useState<{
        id: number;
        name: string;
        width: string;
        height: string;
        imageFile: File | null,
        imagePreview: string
    } | null>(null);

    const showScreen = (screenId: string, progressValue: number) => {
        setActiveScreen(screenId);
        setProgress(progressValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            options: { ...prev.options, [name]: checked }
        }));
    };

    const handleSnsChange = (index: number, value: string) => {
        const newSnsUrls = [...formData.snsUrls];
        newSnsUrls[index] = value;
        setFormData(prev => ({ ...prev, snsUrls: newSnsUrls }));
    };

    const addSnsField = () => {
        setFormData(prev => ({ ...prev, snsUrls: [...prev.snsUrls, ''] }));
    };

    const removeSnsField = (index: number) => {
        if (formData.snsUrls.length <= 1) return;
        const newSnsUrls = formData.snsUrls.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, snsUrls: newSnsUrls }));
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = formData.tagInput.trim().replace(/^#/, '');
            if (newTag && !formData.tags.includes(newTag)) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag],
                    tagInput: ''
                }));
            }
        }
    };

    const removeTag = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, index) => index !== indexToRemove)
        }));
    };

    const suggestedTags = ['개방적인', '따뜻한', '미니멀한', '모던한', '앤틱한', '자연친화적', '힙한'];

    const addSuggestedTag = (tag: string) => {
        if (!formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
        }
    };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
            const totalFiles = formData.imageFiles.length + newFiles.length;

            if (totalFiles > 4) {
                alert('사진은 최대 4장까지 업로드할 수 있습니다.');
                return;
            }
            
            const newImageFiles = [...formData.imageFiles, ...newFiles];
            const newImagePreviews = newImageFiles.map(file => URL.createObjectURL(file));

            // Clean up old previews before setting new ones
            formData.imagePreviews.forEach(url => URL.revokeObjectURL(url));

            setFormData(prev => ({
                ...prev,
                imageFiles: newImageFiles,
                imagePreviews: newImagePreviews
            }));
        }
    };

    const removeImage = (indexToRemove: number) => {
        const newImageFiles = formData.imageFiles.filter((_, index) => index !== indexToRemove);
        
        // Clean up all old previews
        formData.imagePreviews.forEach(url => URL.revokeObjectURL(url));
        
        const newImagePreviews = newImageFiles.map(file => URL.createObjectURL(file));

        setFormData(prev => ({
            ...prev,
            imageFiles: newImageFiles,
            imagePreviews: newImagePreviews
        }));
    };

    // Effect for cleaning up URLs on unmount
    React.useEffect(() => {
        return () => {
            formData.imagePreviews.forEach(fileUrl => URL.revokeObjectURL(fileUrl));
        };
    }, [formData.imagePreviews]);

    const handleAddressSearch = () => {
        if (window.daum && window.daum.Postcode) {
          new window.daum.Postcode({
            oncomplete: function(data: any) {
              setFormData(prev => ({ ...prev, address: data.roadAddress }));
            }
          }).open();
        }
    };

    // --- Space Management Handlers ---
    const openSpaceEditor = (space: { id: number; name: string; width: string; height: string; imageFile: File | null, imagePreview: string } | null = null) => {
        if (space) {
            setCurrentSpace({ ...space });
        } else {
            setCurrentSpace({
                id: Date.now(),
                name: '',
                width: '',
                height: '',
                imageFile: null,
                imagePreview: ''
            });
        }
        setSpaceEditorOpen(true);
    };

    const closeSpaceEditor = () => {
        setSpaceEditorOpen(false);
        setCurrentSpace(null);
    };

    const handleSpaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentSpace) return;
        const { name, value } = e.target;
        setCurrentSpace(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSpaceFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentSpace) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);

            // Clean up old preview if it exists
            if (currentSpace.imagePreview) {
                URL.revokeObjectURL(currentSpace.imagePreview);
            }

            setCurrentSpace(prev => prev ? { ...prev, imageFile: file, imagePreview: previewUrl } : null);
        }
    };
    
    const saveSpace = () => {
        if (!currentSpace || !currentSpace.name || !currentSpace.width || !currentSpace.height) {
            alert('공간 이름과 가로, 세로 크기를 모두 입력해주세요.');
            return;
        }

        setFormData(prev => {
            const existingIndex = prev.spaces.findIndex(s => s.id === currentSpace.id);
            let newSpaces;
            if (existingIndex > -1) {
                newSpaces = [...prev.spaces];
                newSpaces[existingIndex] = currentSpace;
            } else {
                newSpaces = [...prev.spaces, currentSpace];
            }
            return { ...prev, spaces: newSpaces };
        });

        closeSpaceEditor();
    };

    const deleteSpace = (spaceId: number) => {
        // Find the space to be deleted to revoke its URL
        const spaceToDelete = formData.spaces.find(s => s.id === spaceId);
        if (spaceToDelete && spaceToDelete.imagePreview) {
            URL.revokeObjectURL(spaceToDelete.imagePreview);
        }

        setFormData(prev => ({
            ...prev,
            spaces: prev.spaces.filter(s => s.id !== spaceId)
        }));
    };

  return (
    <>
      <Head>
                <title>가게 등록</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </Head>
      <Script
                src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
                strategy="afterInteractive"
            />
      <style jsx global>{`
                @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
                
                :root {
                    --primary-color: #3E352F; /* Dark Brown */
                    --accent-color: #A89587; /* Beige */
                    --background-color: #F5F1EC; /* Light Beige */
                    --surface-color: #FFFFFF;
                    --border-color: #EAE5DE;
                    --subtle-text-color: #6B5E54;
                    --text-color: #3D2C1D;
                    --border-radius: 12px;
                    --error-color: #e74c3c;
                }

                .prototype-body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
                    background-color: var(--background-color);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }

                .mobile-container {
                    width: 100%;
                    max-width: 420px;
                    height: 100vh;
                    max-height: 850px;
                    background-color: var(--surface-color);
                    border-radius: 20px;
                    box-shadow: 0 4px 30px rgba(0,0,0,0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .screen {
                    display: none;
                    flex-direction: column;
                    padding: 20px;
                    box-sizing: border-box;
                    height: 100%;
                    overflow-y: auto;
                    padding-bottom: 120px; /* Space for the fixed button container */
                }

                .screen.active {
                    display: flex;
                }

                .screen h2 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    line-height: 1.4;
                    margin-bottom: 24px;
                    color: var(--text-color);
                }
                
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    color: var(--text-color);
                    flex-shrink: 0;
                }
                .header .back-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    margin-right: 15px;
                    color: var(--text-color);
                    padding: 4px; /* clickable area */
                    display: flex;
                    align-items: center;
                }
                .header .back-btn svg {
                  width: 22px;
                  height: 22px;
                }
                .header .title {
                    flex-grow: 1;
                    text-align: center;
                    margin-right: 40px; /* Balance for back button */
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background-color: var(--border-color);
                    border-radius: 4px;
                    margin-bottom: 24px;
                    overflow: hidden;
                }
                .progress-bar .progress {
                    width: ${progress}%;
                    height: 100%;
                    background-color: var(--accent-color);
                    transition: width 0.3s ease;
                }

                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-color);}
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    box-sizing: border-box;
                    font-size: 1rem;
                    background-color: var(--surface-color);
                    color: var(--text-color);
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                 .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 3px rgba(168, 149, 135, 0.3);
                }
                .form-group textarea { resize: vertical; min-height: 100px; }
                
                .btn {
                    width: 100%;
                    padding: 15px;
                    border: none;
                    border-radius: var(--border-radius);
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background-color 0.2s, transform 0.1s;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                 .btn:active {
                    transform: scale(0.98);
                }
                .btn-primary { background-color: var(--primary-color); color: white; }
                .btn-primary:hover { background-color: #2c2622; }
                .btn-secondary { background-color: var(--border-color); color: var(--text-color); }
                .btn-secondary:hover { background-color: #dcd6ce; }
                
                .btn-container {
                    display: flex;
                    gap: 10px;
                    padding: 20px;
                    background: linear-gradient(to top, var(--surface-color) 80%, transparent);
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    box-sizing: border-box;
                }
                
                #screen-start {
                    padding-bottom: 120px; /* Override for button space */
                }
                #screen-start .screen-content-wrapper {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    justify-content: flex-start;
                    padding-top: 25vh;
                    align-items: center;
                    text-align: center;
                }
                #screen-start .start-icon {
                    width: 60px;
                    height: 60px;
                    margin-bottom: 24px;
                }
                #screen-start h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: var(--text-color);
                }
                #screen-start p {
                    color: var(--subtle-text-color);
                    line-height: 1.6;
                }
                
                .input-wrapper {
                    position: relative;
                    width: 100%;
                }
                .input-wrapper input {
                    padding-right: 105px; /* Space for the button */
                    box-sizing: border-box;
                }
                .input-wrapper .inner-btn {
                    position: absolute;
                    right: 6px;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 8px 12px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    background-color: var(--accent-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .input-wrapper .inner-btn:hover {
                    background-color: #948275;
                }
                
                .sns-input-group .button-wrapper {
                    display: flex;
                    gap: 8px;
                    margin-left: 10px;
                    flex-shrink: 0;
                }
                .btn-sns {
                    padding: 0;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1.2rem;
                    transition: background-color 0.2s, transform 0.1s;
                    line-height: 1;
                    width: 34px;
                    height: 34px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .btn-add-sns {
                    background-color: var(--accent-color);
                    color: white;
                }
                .btn-remove-sns {
                    background-color: var(--border-color);
                    color: var(--subtle-text-color);
                }

                .tag-item {
                    background-color: var(--accent-color);
                    color: white;
                }
                
                .photo-item {
                    border: 2px dashed var(--border-color);
                    color: var(--border-color);
                }
                .remove-photo-btn {
                    background: rgba(0,0,0,0.4);
                }

                .options-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 10px;
                }
                .option-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px;
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                    background-color: var(--surface-color);
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--text-color);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .option-item:hover {
                    border-color: var(--accent-color);
                }
                .option-item input[type="checkbox"] {
                    display: none;
                }
                .option-item:has(input:checked) {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                    color: white;
                    font-weight: 700;
                }
                .option-item::before {
                    content: '✔︎';
                    margin-right: 6px;
                    font-size: 0.9rem;
                    color: transparent;
                    transition: color 0.2s ease;
                }
                .option-item:has(input:checked)::before {
                    color: white;
                }

                .sns-input-group {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .sns-input-group input {
                    flex-grow: 1;
                }

                .photo-uploader {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                    margin-top: 10px;
                }
                .photo-item, .photo-preview {
                    width: 100%;
                    padding-top: 100%; /* 1:1 Aspect Ratio */
                    position: relative;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    cursor: pointer;
                }
                .photo-item {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    line-height: 1.3;
                    border: 2px dashed var(--border-color);
                    color: var(--accent-color);
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .photo-preview img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .remove-photo-btn {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: rgba(0,0,0,0.5);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 14px;
                    line-height: 20px;
                    text-align: center;
                    cursor: pointer;
                }

                .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 10px;
                }
                .tag-item {
                    display: flex;
                    align-items: center;
                    background-color: var(--accent-color);
                    color: white;
                    padding: 6px 10px;
                    border-radius: 16px;
                    font-size: 0.9rem;
                }
                .remove-tag-btn {
                    background: none;
                    border: none;
                    color: white;
                    margin-left: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0;
                    line-height: 1;
                }

                .suggested-tags-container {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                    overflow-x: auto;
                    padding-bottom: 8px; /* For scrollbar space */
                }
                .suggested-tag-btn {
                    background-color: var(--border-color);
                    color: var(--subtle-text-color);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 16px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex-shrink: 0; /* Prevent buttons from shrinking */
                }
                .suggested-tag-btn:hover {
                    background-color: #dcd6ce;
                    color: var(--text-color);
                }

                .space-list {
                    margin-top: 20px;
                    margin-bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .space-card {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 12px;
                    background-color: #F9F7F5;
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                }
                .space-card-img {
                    width: 70px;
                    height: 70px;
                    border-radius: 8px;
                    object-fit: cover;
                    background-color: var(--border-color);
                }
                .space-card-details {
                    flex-grow: 1;
                }
                .space-card-name {
                    font-weight: 600;
                    color: var(--text-color);
                }
                .space-card-size {
                    font-size: 0.9rem;
                    color: var(--subtle-text-color);
                }
                .space-card-actions {
                    display: flex;
                    gap: 8px;
                }
                 .space-card-actions button {
                    background: none;
                    border: 1px solid var(--border-color);
                    color: var(--text-color);
                    padding: 5px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: background-color 0.2s;
                }
                 .space-card-actions button:hover {
                    background-color: var(--border-color);
                 }

                .size-input-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .size-input-group input {
                    text-align: center;
                }
                .size-input-group span {
                    font-weight: 600;
                    color: var(--subtle-text-color);
                }


                /* Space Editor Modal Styles */
                .space-editor-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 100;
                }
                .space-editor-modal {
                    background-color: var(--surface-color);
                    padding: 24px;
                    border-radius: var(--border-radius);
                    width: 90%;
                    max-width: 380px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
                .space-editor-modal h3 {
                    margin-top: 0;
                    font-size: 1.5rem;
                    color: var(--text-color);
                }
                .space-photo-uploader {
                    width: 100%;
                    height: 150px;
                    border-radius: 8px;
                    border: 2px dashed var(--border-color);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #F9F7F5;
                    cursor: pointer;
                    overflow: hidden;
                    margin-bottom: 20px;
                }
                .space-photo-uploader img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }


                .menu-item-card {
                    display: flex;
                    align-items: center;
                    background-color: #f9f7f5;
                    padding: 15px;
                    border-radius: var(--border-radius);
                    margin-bottom: 10px;
                    border: 1px solid var(--border-color);
                }
                .menu-item-card .icon { font-size: 1.5rem; margin-right: 15px; }
                .menu-item-card .details { flex-grow: 1; }
                .menu-item-card .name { font-weight: 600; color: var(--text-color); }
                .menu-item-card .price { color: var(--subtle-text-color); font-size: 0.9rem; }
                .menu-item-card .actions button {
                    background: none;
                    border: 1px solid var(--border-color);
                    color: var(--text-color);
                    padding: 5px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                }

                .confirm-section {
                    margin-bottom: 20px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .confirm-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #f9f7f5;
                    padding: 12px 15px;
                    font-weight: 600;
                    border-bottom: 1px solid var(--border-color);
                }
                .edit-btn {
                    color: var(--accent-color);
                    font-size: 0.9rem;
                    cursor: pointer;
                    font-weight: 500;
                }
                .confirm-content {
                    padding: 15px;
                    font-size: 0.95rem;
                    line-height: 1.7;
                    background-color: #f9f7f5;
                }
                .confirm-content p { margin: 0 0 5px; }
                .confirm-content p:last-child { margin-bottom: 0; }
                .confirm-content strong { color: var(--text-color); }

                .pc-sidebar {
                    display: none;
                }

                /* PC Layout Styles */
                @media (min-width: 1024px) {
                    .prototype-body {
                        padding: 5vh 2rem;
                        align-items: center;
                    }
                    .mobile-container {
                        display: grid;
                        grid-template-columns: 280px 1fr;
                        max-width: 1024px;
                        width: 100%;
                        height: 85vh;
                        max-height: 850px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    }
                    .pc-sidebar {
                        display: flex;
                        flex-direction: column;
                        background-color: #F9F7F5;
                        padding: 32px 24px;
                        border-right: 1px solid var(--border-color);
                    }
                    .pc-sidebar h1 {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: var(--text-color);
                        margin-bottom: 32px;
                    }
                    .pc-step {
                        padding: 12px 16px;
                        border-radius: 10px;
                        font-weight: 600;
                        color: var(--subtle-text-color);
                        cursor: pointer;
                        transition: all 0.2s ease;
                        border: 2px solid transparent;
                        margin-bottom: 8px;
                    }
                    .pc-step:hover {
                        background-color: #F0EBE4;
                    }
                    .pc-step.active {
                        color: var(--text-color);
                        background-color: var(--surface-color);
                        border-color: var(--accent-color);
                    }
                    .pc-step.completed {
                        color: var(--primary-color);
                    }
                     .pc-step.completed::before {
                        content: '✔︎ ';
                        font-weight: 700;
                    }

                    .main-content {
                        height: 100%;
                        overflow: hidden;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                    }
                    .screen {
                        padding: 0;
                        padding-bottom: 0;
                        overflow: hidden;
                    }
                    .screen.active {
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                    }
                    .screen-content-wrapper {
                        flex-grow: 1;
                        overflow-y: auto;
                        padding: 40px;
                        display: flex;
                        flex-direction: column;
                    }
                    .screen-content-wrapper > * {
                        width: 100%;
                        max-width: 600px;
                    }
                     .screen h2, #screen-start h1 {
                        font-size: 2.25rem;
                        margin-bottom: 40px;
                    }
                     .screen .header, .screen .progress-bar {
                        display: none; /* Hide mobile header and progress bar on PC */
                    }
                    #screen-start .screen-content-wrapper {
                        justify-content: center;
                        padding-top: 0;
                    }
                    #screen-start h1 { 
                        font-size: 2.5rem; 
                    }
                    #screen-start .btn-container {
                        justify-content: center;
                    }
                    #screen-start .btn {
                        max-width: 300px;
                    }
                    .btn-container {
                        position: static;
                        background: var(--surface-color);
                        border-top: 1px solid var(--border-color);
                        padding: 20px 40px;
                        height: 85px;
                        flex-shrink: 0;
                    }
                    .space-editor-overlay {
                        position: fixed;
                    }

                    /* Make form elements wider on PC */
                    .form-group {
                        max-width: 600px;
                        margin-bottom: 28px;
                    }
                    .options-grid {
                        grid-template-columns: repeat(3, 1fr);
                        max-width: 600px;
                    }
                    .photo-uploader {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        max-width: 600px;
                    }
                    .space-list {
                        max-width: 600px;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                    }
                    .space-card-actions {
                        flex-direction: column;
                        gap: 4px;
                    }
                    .space-card-actions button {
                        width: 100%;
                    }
                    
                    .screen-content-wrapper::-webkit-scrollbar {
                        width: 8px;
                    }
                    .screen-content-wrapper::-webkit-scrollbar-track {
                        background-color: transparent; 
                    }
                    .screen-content-wrapper::-webkit-scrollbar-thumb {
                        background-color: var(--border-color);
                        border-radius: 4px;
                    }
                    .screen-content-wrapper::-webkit-scrollbar-thumb:hover {
                        background-color: var(--accent-color);
                    }
                }


            `}</style>

            <div className="prototype-body">
                <div className="mobile-container">
                    <div className="pc-sidebar">
                        <h1>가게 등록</h1>
                        <div
                            className={`pc-step ${activeScreen.includes('step1') ? 'active' : ''} ${progress >= 50 ? 'completed' : ''}`}
                            onClick={() => showScreen('screen-step1', 25)}
                        >
                            1. 필수 정보
                        </div>
                        <div
                            className={`pc-step ${activeScreen.includes('step2') ? 'active' : ''} ${progress >= 75 ? 'completed' : ''}`}
                            onClick={() => showScreen('screen-step2', 50)}
                        >
                            2. 상세 정보
                        </div>
                        <div
                            className={`pc-step ${activeScreen.includes('step3') ? 'active' : ''} ${progress >= 100 ? 'completed' : ''}`}
                            onClick={() => showScreen('screen-step3', 75)}
                        >
                            3. 가게 소개
                        </div>
                        <div
                            className={`pc-step ${activeScreen.includes('step4') ? 'active' : ''} ${activeScreen === 'screen-confirm' ? 'completed' : ''}`}
                            onClick={() => showScreen('screen-step4', 100)}
                        >
                            4. 공간 등록
                        </div>
                         <div
                            className={`pc-step ${activeScreen.includes('confirm') ? 'active' : ''}`}
                            onClick={() => showScreen('screen-confirm', 100)}
                        >
                            최종 확인
                        </div>
                    </div>
                    <div className="main-content">
                        <div id="screen-start" className={`screen ${activeScreen === 'screen-start' ? 'active' : ''}`}>
                            <div className="screen-content-wrapper">
                                <img className="start-icon" src="https://em-content.zobj.net/source/apple/391/party-popper_1f389.png" alt="Party Popper Icon" />
                                <h1>가게 등록, 시작해볼까요?</h1>
                                <p>몇 가지 정보만 입력하면<br/>사장님의 가게를 더 많은 고객에게<br/>알릴 수 있습니다!</p>
                            </div>
                            <div className="btn-container">
                                <button className="btn btn-primary" onClick={() => showScreen('screen-step1', 25)}>가게 등록 시작하기</button>
                            </div>
                        </div>

                        <div id="screen-step1" className={`screen ${activeScreen === 'screen-step1' ? 'active' : ''}`}>
                            <div className="screen-content-wrapper">
                                <div className="header">
                                    <button className="back-btn" onClick={() => showScreen('screen-start', 0)}>
                                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17 20L7 12L17 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>
                                    <span className="title">가게 등록 (1/4)</span>
                                </div>
                                <div className="progress-bar"><div className="progress"></div></div>
                                <h2>가게의 필수 정보를<br/>입력해주세요.</h2>
                                <div className="form-group">
                                    <label htmlFor="storeName">업체명</label>
                                    <input type="text" id="storeName" name="storeName" placeholder="예) 델리카페 용인점" value={formData.storeName} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="storeCategory">업종</label>
                                    <select id="storeCategory" name="storeCategory" value={formData.storeCategory} onChange={handleChange}>
                                <option value="cafe">카페</option>
                                <option value="gallery">갤러리</option>
                                <option value="restaurant">레스토랑</option>
                                <option value="lounge">라운지</option>
                                <option value="complex">복합문화공간</option>
                                <option value="other">기타</option>
                            </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">가게 주소</label>
                                    <div className="input-wrapper">
                                        <input type="text" id="address" name="address" placeholder="주소를 검색해주세요" value={formData.address} readOnly />
                                        <button type="button" className="inner-btn" onClick={handleAddressSearch}>주소 검색</button>
                                    </div>
                                    <input type="text" id="addressDetail" name="addressDetail" placeholder="상세주소 입력 (예: 2층 201호)" value={formData.addressDetail} onChange={handleChange} style={{marginTop: '10px'}}/>
                                </div>
                            </div>
                            <div className="btn-container"><button className="btn btn-primary" onClick={() => showScreen('screen-step2', 50)}>다음</button></div>
                        </div>

                        <div id="screen-step2" className={`screen ${activeScreen === 'screen-step2' ? 'active' : ''}`}>
                             <div className="screen-content-wrapper">
                                <div className="header">
                                  <button className="back-btn" onClick={() => showScreen('screen-step1', 25)}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M17 20L7 12L17 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                  <span className="title">가게 등록 (2/4)</span>
                                </div>
                                <div className="progress-bar"><div className="progress"></div></div>
                                <h2>고객에게 보여줄<br/>상세 정보를 알려주세요.</h2>
                                <div className="form-group"><label htmlFor="phone">연락처</label><input type="tel" id="phone" name="phone" placeholder="- 없이 숫자만 입력" value={formData.phone} onChange={handleChange} /></div>
                                <div className="form-group">
                                    <label>가게 옵션 (중복 선택 가능)</label>
                                    <div className="options-grid">
                                        <label className="option-item"><input type="checkbox" name="parking" checked={formData.options.parking} onChange={handleOptionChange}/> 주차 가능</label>
                                        <label className="option-item"><input type="checkbox" name="pets" checked={formData.options.pets} onChange={handleOptionChange}/> 반려동물</label>
                                        <label className="option-item"><input type="checkbox" name="twentyFourHours" checked={formData.options.twentyFourHours} onChange={handleOptionChange}/> 24시간</label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>SNS 주소 (선택)</label>
                                    {formData.snsUrls.map((url, index) => (
                                        <div key={index} className="sns-input-group">
                                            <input
                                                type="url"
                                                placeholder="https://instagram.com/..."
                                                value={url}
                                                onChange={(e) => handleSnsChange(index, e.target.value)}
                                            />
                                            <div className="button-wrapper">
                                                {formData.snsUrls.length > 1 ? (
                                                    <button type="button" onClick={() => removeSnsField(index)} className="btn-sns btn-remove-sns">-</button>
                                                ) : null}
                                                {index === formData.snsUrls.length - 1 && (
                                                    <button type="button" onClick={addSnsField} className="btn-sns btn-add-sns">+</button>
                                                )}
                                            </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                            <div className="btn-container"><button className="btn btn-secondary" onClick={() => showScreen('screen-step1', 25)}>이전</button><button className="btn btn-primary" onClick={() => showScreen('screen-step3', 75)}>다음</button></div>
                        </div>
                        
                        <div id="screen-step3" className={`screen ${activeScreen === 'screen-step3' ? 'active' : ''}`}>
                            <div className="screen-content-wrapper">
                                <div className="header">
                                  <button className="back-btn" onClick={() => showScreen('screen-step2', 50)}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M17 20L7 12L17 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                  <span className="title">가게 등록 (3/4)</span>
                                </div>
                                <div className="progress-bar"><div className="progress"></div></div>
                                <h2>가게를 멋지게<br/>소개해주세요.</h2>
                                <div className="form-group">
                                    <label>가게 사진 (최대 4장)</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        multiple
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <div className="photo-uploader">
                                        {formData.imagePreviews.map((src, index) => (
                                            <div key={index} className="photo-preview">
                                                <img src={src} alt={`preview ${index}`} />
                                                <button onClick={() => removeImage(index)} className="remove-photo-btn">×</button>
                                            </div>
                                        ))}
                                        {formData.imageFiles.length < 4 && (
                                            <div className="photo-item" onClick={() => fileInputRef.current?.click()}>
                                                {formData.imageFiles.length === 0 ? <>📸<br/>대표 사진</> : '+'}
                            </div>
                        )}
                                    </div>
                                </div>
                                <div className="form-group"><label htmlFor="description">가게 설명</label><textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="우리 가게만의 특징과 분위기를 자유롭게 적어주세요."></textarea></div>
                                <div className="form-group">
                                    <label htmlFor="tagInput">분위기 키워드</label>
                                     <div className="suggested-tags-container scrollbar-hide">
                                        {suggestedTags.map((tag) => (
                                            <button key={tag} type="button" className="suggested-tag-btn" onClick={() => addSuggestedTag(tag)}>
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        id="tagInput"
                                        name="tagInput"
                                        value={formData.tagInput}
                                        onChange={handleChange}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="키워드 입력 후 Enter"
                                    />
                                    <div className="tags-container">
                                        {formData.tags.map((tag, index) => (
                                            <div key={index} className="tag-item">
                                                #{tag}
                                                <button onClick={() => removeTag(index)} className="remove-tag-btn">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="btn-container"><button className="btn btn-secondary" onClick={() => showScreen('screen-step2', 50)}>이전</button><button className="btn btn-primary" onClick={() => showScreen('screen-step4', 100)}>다음</button></div>
                        </div>

                        <div id="screen-step4" className={`screen ${activeScreen === 'screen-step4' ? 'active' : ''}`}>
                            <div className="screen-content-wrapper">
                                <div className="header">
                                  <button className="back-btn" onClick={() => showScreen('screen-step3', 75)}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M17 20L7 12L17 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                  <span className="title">가게 등록 (4/4)</span>
                                </div>
                                <div className="progress-bar"><div className="progress"></div></div>
                                <h2>전시 공간을<br/>등록해주세요.</h2>
                                <p style={{ color: 'var(--subtle-text-color)', marginTop: '-10px', fontSize: '0.9rem' }}>* 공간의 사진, 이름, 크기를 입력해주세요.</p>
                                
                                <div className="space-list">
                                    {formData.spaces.map(space => (
                                        <div key={space.id} className="space-card">
                                            <img src={space.imagePreview || 'https://via.placeholder.com/70'} alt={space.name} className="space-card-img" />
                                            <div className="space-card-details">
                                                <div className="space-card-name">{space.name}</div>
                                                <div className="space-card-size">가로 {space.width}cm x 세로 {space.height}cm</div>
                                            </div>
                                            <div className="space-card-actions">
                                                <button onClick={() => openSpaceEditor(space)}>수정</button>
                                                <button onClick={() => deleteSpace(space.id)}>삭제</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button className="btn btn-secondary" onClick={() => openSpaceEditor(null)}>[+] 공간 추가하기</button>
                            </div>
                            <div className="btn-container"><button className="btn btn-secondary" onClick={() => showScreen('screen-step3', 75)}>이전</button><button className="btn btn-primary" onClick={() => showScreen('screen-confirm', 100)}>등록 내용 확인하기</button></div>
                        </div>

                        {isSpaceEditorOpen && currentSpace && (
                            <div className="space-editor-overlay">
                                <div className="space-editor-modal">
                                    <h3>{formData.spaces.some(s => s.id === currentSpace.id) ? '공간 수정' : '공간 추가'}</h3>
                                    <input
                                        type="file"
                                        ref={spaceFileInputRef}
                                        onChange={handleSpaceFileChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <div className="space-photo-uploader" onClick={() => spaceFileInputRef.current?.click()}>
                                        {currentSpace.imagePreview ? (
                                            <img src={currentSpace.imagePreview} alt="Preview" />
                                        ) : (
                                            <span style={{color: 'var(--subtle-text-color)', textAlign: 'center'}}>📸<br/>사진 추가</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="spaceName">공간 이름</label>
                                        <input type="text" id="spaceName" name="name" value={currentSpace.name} onChange={handleSpaceChange} placeholder="예) 1층 메인홀" />
                                    </div>
                                    <div className="form-group">
                                        <label>공간 크기 (cm)</label>
                                        <div className="size-input-group">
                                            <input type="number" name="width" value={currentSpace.width} onChange={handleSpaceChange} placeholder="가로" />
                                            <span>x</span>
                                            <input type="number" name="height" value={currentSpace.height} onChange={handleSpaceChange} placeholder="세로" />
                                        </div>
                                    </div>
                                    <div className="btn-container" style={{ position: 'static', padding: 0, background: 'none' }}>
                                        <button className="btn btn-secondary" onClick={closeSpaceEditor}>취소</button>
                                        <button className="btn btn-primary" onClick={saveSpace}>저장</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div id="screen-confirm" className={`screen ${activeScreen === 'screen-confirm' ? 'active' : ''}`}>
                            <div className="screen-content-wrapper">
                                <div className="header">
                                  <button className="back-btn" onClick={() => showScreen('screen-step4', 100)}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M17 20L7 12L17 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                  <span className="title">최종 확인</span>
                                </div>
                                <h2>사장님, 입력하신 내용이<br/>맞는지 확인해주세요.</h2>
                                <div className="confirm-section">
                                    <div className="confirm-header"><span>기본 정보</span><span className="edit-btn" onClick={() => showScreen('screen-step1', 25)}>수정</span></div>
                                    <div className="confirm-content">
                                        <p><strong>업체명:</strong> {formData.storeName || '미입력'}</p>
                                        <p><strong>업종:</strong> {formData.storeCategory}</p>
                                        <p><strong>주소:</strong> {`${formData.address} ${formData.addressDetail}`.trim() || '미입력'}</p>
                                    </div>
                                </div>
                                <div className="confirm-section">
                                    <div className="confirm-header"><span>상세 정보</span><span className="edit-btn" onClick={() => showScreen('screen-step2', 50)}>수정</span></div>
                                    <div className="confirm-content">
                                        <p><strong>연락처:</strong> {formData.phone || '미입력'}</p>
                                        <p><strong>옵션:</strong> {Object.entries(formData.options).filter(([, value]) => value).map(([key]) => {
                                            if (key === 'parking') return '주차 가능';
                                            if (key === 'pets') return '반려동물';
                                            if (key === 'twentyFourHours') return '24시간';
                                            return '';
                                        }).join(', ') || '없음'}</p>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label>사업자 정보 (필수)</label>
                                    <input type="text" placeholder="사업자등록번호 입력"/>
                                    <button className="btn btn-secondary" style={{ marginTop: '10px', width: '100%' }}>📄 사업자등록증 사본 첨부</button>
                                </div>
                            </div>
                            <div className="btn-container">
                                <button className="btn btn-secondary" onClick={() => showScreen('screen-step4', 100)}>이전</button>
                                <button className="btn btn-primary" onClick={() => alert('가게 등록이 완료되었습니다!')}>제출하고 등록 완료하기</button>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
    </>
  );
}