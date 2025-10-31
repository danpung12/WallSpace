'use client';

import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect, Suspense } from 'react';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useBottomNav } from '@/app/context/BottomNavContext';
import { uploadLocationImage, createLocation } from '@/lib/api/locations';
import { createClient } from '@/lib/supabase/client';

declare global {
  interface Window {
    daum: any;
    kakao: any;
  }
}

function AddStoreContent() {
    const { setIsNavVisible } = useBottomNav();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode'); // 'new' or 'edit'
    const locationId = searchParams.get('id');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        setIsNavVisible(false);
        return () => {
            setIsNavVisible(true);
        };
    }, [setIsNavVisible]);

    // mode가 'edit'이면 screen-step1부터 시작, 나머지는 screen-start
    const initialScreen = mode === 'edit' ? 'screen-step1' : 'screen-start';
    const initialProgress = mode === 'edit' ? 25 : 0;
    const initialMaxReached = mode === 'edit' ? 'screen-step4' : 'screen-start'; // edit 모드면 모든 단계 접근 가능
    
    const [activeScreen, setActiveScreen] = useState(initialScreen);
    const [progress, setProgress] = useState(initialProgress);
    const [maxScreenReached, setMaxScreenReached] = useState(initialMaxReached); // 도달한 최대 단계 추적
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
            price: string;
            maxArtworks: string;
            imageFile: File | null,
            imagePreview: string
        }[],
        businessLicenseNumber: '',
        businessLicenseFile: null as File | null,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const spaceFileInputRef = useRef<HTMLInputElement>(null);
    const businessLicenseInputRef = useRef<HTMLInputElement>(null);

    // State for space editor modal
    const [isSpaceEditorOpen, setSpaceEditorOpen] = useState(false);
    const [currentSpace, setCurrentSpace] = useState<{
        id: number;
        name: string;
        width: string;
        height: string;
        price: string;
        maxArtworks: string;
        imageFile: File | null,
        imagePreview: string
    } | null>(null);

    // Error states for validation
    const [errors, setErrors] = useState({
        storeName: '',
        address: '',
        phone: '',
        imageFiles: '',
        spaces: '',
    });

    const [spaceErrors, setSpaceErrors] = useState({
        imagePreview: '',
        name: '',
        width: '',
        height: '',
        price: '',
        maxArtworks: '',
    });

    // 화면 순서 정의
    const screenOrder = ['screen-start', 'screen-step1', 'screen-step2', 'screen-step3', 'screen-step4', 'screen-confirm'];

    const showScreen = (screenId: string, progressValue: number) => {
        // 현재 도달한 최대 단계보다 앞으로 가려는 시도 방지
        const targetIndex = screenOrder.indexOf(screenId);
        const maxReachedIndex = screenOrder.indexOf(maxScreenReached);
        
        // 이미 도달한 단계까지만 이동 가능 (뒤로 가기나 이미 완료한 단계로만 이동)
        if (targetIndex <= maxReachedIndex) {
        setActiveScreen(screenId);
        setProgress(progressValue);
        } else {
            // 아직 도달하지 않은 다음 단계로 가려는 시도는 무시
            console.log('아직 이전 단계를 완료하지 않았습니다.');
        }
    };

    // SNS URL에서 아이콘 추출
    const getSnsIconName = (url: string) => {
        if (!url) return 'link';
        if (url.includes('instagram.com')) return 'photo_camera';
        if (url.includes('facebook.com')) return 'groups';
        if (url.includes('twitter.com') || url.includes('x.com')) return 'tag';
        if (url.includes('tiktok.com')) return 'videocam';
        if (url.includes('youtube.com')) return 'play_circle';
        if (url.includes('linkedin.com')) return 'work';
        return 'link';
    };

    // Load existing location data in edit mode
    useEffect(() => {
        const loadLocationData = async () => {
            if (mode === 'edit' && locationId) {
                setIsLoadingData(true);
                try {
                    const response = await fetch(`/api/locations?id=${locationId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch location data');
                    }
                    
                    const locations = await response.json();
                    const location = locations[0]; // GET returns array
                    
                    if (!location) {
                        alert('가게 정보를 찾을 수 없습니다.');
                        router.push('/dashboard');
                        return;
                    }

                    console.log('📦 Loaded location data:', location);

                    // Parse address
                    const addressParts = location.address ? location.address.split(' ') : [];
                    const baseAddress = addressParts.slice(0, -1).join(' ') || '';
                    const detail = addressParts[addressParts.length - 1] || '';

                    // Load images as previews (URLs)
                    const imagePreviews = location.images || [];

                    // Load spaces
                    const loadedSpaces = (location.spaces || []).map((space: any, index: number) => ({
                        id: Date.now() + index,
                        name: space.name || '',
                        width: space.width?.toString() || '',
                        height: space.height?.toString() || '',
                        price: space.price?.toString() || '',
                        maxArtworks: space.max_artworks?.toString() || '1',
                        imageFile: null,
                        imagePreview: space.images?.[0] || '',
                    }));

                    // Load SNS URLs
                    const snsUrls = location.sns?.map((s: any) => s.url) || [''];
                    if (snsUrls.length === 0) snsUrls.push('');

                    setFormData({
                        storeName: location.name || '',
                        storeCategory: location.category?.name || 'cafe',
                        address: baseAddress,
                        addressDetail: detail,
                        phone: location.phone || '',
                        snsUrls: snsUrls,
                        options: {
                            parking: location.options?.parking || false,
                            pets: location.options?.pets || false,
                            twentyFourHours: location.options?.twenty_four_hours || false,
                        },
                        description: location.description || '',
                        tags: location.tags?.map((t: any) => t.tag?.name || t.name).filter(Boolean) || [],
                        tagInput: '',
                        imageFiles: [],
                        imagePreviews: imagePreviews,
                        spaces: loadedSpaces,
                        businessLicenseNumber: '',
                        businessLicenseFile: null,
                    });

                    console.log('✅ Form data loaded successfully');
                } catch (error) {
                    console.error('Error loading location data:', error);
                    alert('가게 정보를 불러오는데 실패했습니다.');
                } finally {
                    setIsLoadingData(false);
                }
            }
        };

        loadLocationData();
    }, [mode, locationId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 전화번호 포맷팅
    if (name === 'phone') {
        const numbers = value.replace(/[^0-9]/g, '');
        let formatted = numbers;
        
        if (numbers.length === 0) {
            formatted = '';
        }
        // 02 (서울 지역번호)
        else if (numbers.startsWith('02')) {
            if (numbers.length <= 2) {
                formatted = numbers;
            } else if (numbers.length <= 5) {
                formatted = numbers.slice(0, 2) + '-' + numbers.slice(2);
            } else if (numbers.length <= 9) {
                formatted = numbers.slice(0, 2) + '-' + numbers.slice(2, 5) + '-' + numbers.slice(5);
            } else {
                formatted = numbers.slice(0, 2) + '-' + numbers.slice(2, 6) + '-' + numbers.slice(6, 10);
            }
        }
        // 010, 011, 016, 017, 018, 019 (휴대폰)
        else if (numbers.startsWith('01')) {
            if (numbers.length <= 3) {
                formatted = numbers;
            } else if (numbers.length <= 7) {
                formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
            } else if (numbers.length <= 11) {
                formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7);
            } else {
                formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7, 11);
            }
        }
        // 15xx, 16xx (대표번호)
        else if (numbers.startsWith('15') || numbers.startsWith('16')) {
            if (numbers.length <= 4) {
                formatted = numbers;
            } else if (numbers.length <= 8) {
                formatted = numbers.slice(0, 4) + '-' + numbers.slice(4);
            } else {
                formatted = numbers.slice(0, 4) + '-' + numbers.slice(4, 8);
            }
        }
        // 기타 지역번호 (031, 032, 033, 041, 042, 043, 051, 052, 053, 054, 055, 061, 062, 063, 064 등)
        else {
            if (numbers.length <= 3) {
                formatted = numbers;
            } else if (numbers.length <= 6) {
                formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
            } else if (numbers.length <= 10) {
                formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 6) + '-' + numbers.slice(6);
            } else {
                formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7, 11);
            }
        }
        
        setFormData(prev => ({ ...prev, [name]: formatted }));
        setErrors(prev => ({ ...prev, phone: '' }));
        return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (name === 'storeName' || name === 'address') {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
        alert("사진은 최대 4장까지 업로드할 수 있습니다.");
        return;
      }

      const newImageFiles = [...formData.imageFiles, ...newFiles];

      // Promise.all을 사용하여 모든 파일에 대한 데이터 URL을 비동기적으로 생성합니다.
      Promise.all(
        newImageFiles.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }),
      ).then(newImagePreviews => {
        setFormData(prev => ({
          ...prev,
          imageFiles: newImageFiles,
          imagePreviews: newImagePreviews,
        }));
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImageFiles = formData.imageFiles.filter((_, index) => index !== indexToRemove);
    const newImagePreviews = formData.imagePreviews.filter((_, index) => index !== indexToRemove);

    setFormData(prev => ({
      ...prev,
      imageFiles: newImageFiles,
      imagePreviews: newImagePreviews,
    }));
  };

  const handleBusinessLicenseChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        businessLicenseFile: file,
      }));
    }
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

    // Wait for Kakao Maps API to be fully loaded
    const waitForKakaoMaps = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                resolve(true);
                return;
            }

            // Wait up to 5 seconds for Kakao Maps to load
            let attempts = 0;
            const maxAttempts = 50; // 50 * 100ms = 5 seconds
            const interval = setInterval(() => {
                attempts++;
                if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                    clearInterval(interval);
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    console.error('Kakao Maps API failed to load within 5 seconds');
                    resolve(false);
                }
            }, 100);
        });
    };

    // Get coordinates from address using Kakao Maps Geocoding API
    const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
        // Wait for Kakao Maps API to load
        const isLoaded = await waitForKakaoMaps();
        if (!isLoaded) {
            console.error('Kakao Maps API not loaded');
            return null;
        }

        return new Promise((resolve) => {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.addressSearch(address, (result: any[], status: any) => {
                if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                    console.log('✅ Coordinates found:', { lat: result[0].y, lng: result[0].x });
                    resolve({
                        lat: parseFloat(result[0].y),
                        lng: parseFloat(result[0].x),
                    });
                } else {
                    console.error('Failed to get coordinates for address:', address, 'Status:', status);
                    resolve(null);
                }
            });
        });
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Validate required fields
            if (!formData.storeName || !formData.address) {
                alert('가게 이름과 주소는 필수입니다.');
                return;
            }

            // Get current user
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('로그인이 필요합니다.');
                router.push('/');
                return;
            }

            // Get coordinates from address
            console.log('🔍 주소로 좌표 검색 중:', formData.address);
            const coordinates = await getCoordinatesFromAddress(formData.address);
            if (!coordinates) {
                alert('주소에서 좌표를 가져올 수 없습니다.\n\n주소 검색 버튼을 사용하여 정확한 주소를 입력했는지 확인해주세요.\n\n문제가 계속되면 페이지를 새로고침 후 다시 시도해주세요.');
                return;
            }
            console.log('✅ 좌표 검색 성공:', coordinates);

            // Upload location images
            console.log('Uploading location images...');
            const imageUrls: string[] = [];
            for (const file of formData.imageFiles) {
                try {
                    const url = await uploadLocationImage(file, user.id);
                    imageUrls.push(url);
                } catch (error) {
                    console.error('Failed to upload image:', error);
                }
            }

            // Upload space images and prepare spaces data
            console.log('Uploading space images...');
            const spacesData = [];
            for (const space of formData.spaces) {
                let spaceImageUrl = '';
                if (space.imageFile) {
                    try {
                        spaceImageUrl = await uploadLocationImage(space.imageFile, user.id);
                    } catch (error) {
                        console.error('Failed to upload space image:', error);
                    }
                }

                spacesData.push({
                    name: space.name,
                    width: space.width,
                    height: space.height,
                    price: space.price,
                    maxArtworks: space.maxArtworks,
                    imageUrl: spaceImageUrl,
                    description: '',
                });
            }

            // Create or Update location
            let result;
            if (mode === 'edit' && locationId) {
                console.log('Updating location...');
                const response = await fetch('/api/locations', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: locationId,
                        storeName: formData.storeName,
                        storeCategory: formData.storeCategory,
                        address: formData.address,
                        addressDetail: formData.addressDetail,
                        phone: formData.phone,
                        description: formData.description,
                        lat: coordinates.lat,
                        lng: coordinates.lng,
                        snsUrls: formData.snsUrls.filter(url => url && url.trim()),
                        options: formData.options,
                        tags: formData.tags,
                        imageUrls,
                        spaces: spacesData,
                    }),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update location');
                }
                
                result = await response.json();
                console.log('✅ Location updated:', result);
            } else {
                console.log('Creating location...');
                result = await createLocation({
                    storeName: formData.storeName,
                    storeCategory: formData.storeCategory,
                    address: formData.address,
                    addressDetail: formData.addressDetail,
                    phone: formData.phone,
                    description: formData.description,
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    snsUrls: formData.snsUrls.filter(url => url && url.trim()),
                    options: formData.options,
                    tags: formData.tags,
                    imageUrls,
                    spaces: spacesData,
                });
                console.log('✅ Location created:', result);
            }

            alert(mode === 'edit' ? '가게 정보가 수정되었습니다!' : '가게 등록이 완료되었습니다!');
            router.push(`/dashboard?refresh=${Date.now()}`);

        } catch (error: any) {
            console.error('Error submitting store:', error);
            alert(`가게 등록 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Space Management Handlers ---
    const openSpaceEditor = (space: { id: number; name: string; width: string; height: string; price: string; maxArtworks: string; imageFile: File | null, imagePreview: string } | null = null) => {
        // Reset space errors when opening modal
        setSpaceErrors({
            imagePreview: '',
            name: '',
            width: '',
            height: '',
            price: '',
            maxArtworks: '',
        });
        
        if (space) {
            setCurrentSpace({ ...space });
        } else {
            setCurrentSpace({
                id: Date.now(),
                name: '',
                width: '',
                height: '',
                price: '',
                maxArtworks: '1',
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
        setCurrentSpace(prev => (prev ? { ...prev, [name]: value } : null));
        // Clear error when user types
        if (name in spaceErrors) {
            setSpaceErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSpaceFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentSpace) {
            const file = e.target.files[0];

            // FileReader를 사용하여 데이터 URL 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentSpace(prev => (prev ? { ...prev, imageFile: file, imagePreview: reader.result as string } : null));
                setSpaceErrors(prev => ({ ...prev, imagePreview: '' }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const saveSpace = () => {
        if (!currentSpace) {
            return;
        }
        
        let hasError = false;
        const newErrors = {
            imagePreview: '',
            name: '',
            width: '',
            height: '',
            price: '',
            maxArtworks: '',
        };
        
        // 필수 필드 검증
        if (!currentSpace.imagePreview) {
            newErrors.imagePreview = '공간 사진을 등록해주세요';
            hasError = true;
        }
        
        if (!currentSpace.name.trim()) {
            newErrors.name = '공간 이름을 입력해주세요';
            hasError = true;
        }
        
        if (!currentSpace.width) {
            newErrors.width = '가로 크기를 입력해주세요';
            hasError = true;
        }
        
        if (!currentSpace.height) {
            newErrors.height = '세로 크기를 입력해주세요';
            hasError = true;
        }
        
        if (!currentSpace.price) {
            newErrors.price = '비용을 입력해주세요';
            hasError = true;
        }
        
        if (!currentSpace.maxArtworks) {
            newErrors.maxArtworks = '작품 수를 입력해주세요';
            hasError = true;
        }

        setSpaceErrors(newErrors);

        if (hasError) {
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
        setSpaceErrors({
            imagePreview: '',
            name: '',
            width: '',
            height: '',
            price: '',
            maxArtworks: '',
        });
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

    // Validation functions
    const isStep1Valid = () => {
        return formData.storeName.trim() !== '' && formData.address.trim() !== '';
    };

    const isStep2Valid = () => {
        return formData.phone.trim() !== '';
    };

    const isStep3Valid = () => {
        return formData.imageFiles.length > 0;
    };

    const isStep4Valid = () => {
        return formData.spaces.length > 0;
    };

    const isSpaceValid = () => {
        if (!currentSpace) return false;
        return currentSpace.imagePreview !== '' &&
               currentSpace.name.trim() !== '' &&
               currentSpace.width !== '' &&
               currentSpace.height !== '' &&
               currentSpace.price !== '' &&
               currentSpace.maxArtworks !== '';
    };

    // Handle next button clicks with validation
    const handleStep1Next = () => {
        const newErrors = {
            storeName: formData.storeName.trim() ? '' : '업체명을 입력해주세요',
            address: formData.address.trim() ? '' : '주소를 검색해주세요',
            phone: '',
            imageFiles: '',
            spaces: '',
        };
        setErrors(newErrors);
        
        if (isStep1Valid()) {
            setMaxScreenReached('screen-step2'); // 다음 단계 잠금 해제
            showScreen('screen-step2', 50);
        }
    };

    const handleStep2Next = () => {
        const newErrors = {
            storeName: '',
            address: '',
            phone: formData.phone.trim() ? '' : '연락처를 입력해주세요',
            imageFiles: '',
            spaces: '',
        };
        setErrors(newErrors);
        
        if (isStep2Valid()) {
            setMaxScreenReached('screen-step3'); // 다음 단계 잠금 해제
            showScreen('screen-step3', 75);
        }
    };

    const handleStep3Next = () => {
        const newErrors = {
            storeName: '',
            address: '',
            phone: '',
            imageFiles: formData.imageFiles.length > 0 ? '' : '가게 사진을 최소 1장 이상 등록해주세요',
            spaces: '',
        };
        setErrors(newErrors);
        
        if (isStep3Valid()) {
            setMaxScreenReached('screen-step4'); // 다음 단계 잠금 해제
            showScreen('screen-step4', 100);
        }
    };

    const handleStep4Next = () => {
        const newErrors = {
            storeName: '',
            address: '',
            phone: '',
            imageFiles: '',
            spaces: formData.spaces.length > 0 ? '' : '전시 공간을 최소 1개 이상 등록해주세요',
        };
        setErrors(newErrors);
        
        if (isStep4Valid()) {
            setMaxScreenReached('screen-confirm'); // 다음 단계 잠금 해제
            showScreen('screen-confirm', 100);
        }
    };

  return (
    <>
      <Head>
                <title>{mode === 'edit' ? '가게 수정' : '가게 등록'}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </Head>
      <Script
                src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
                strategy="afterInteractive"
            />
      <Script
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
                strategy="afterInteractive"
                onLoad={() => {
                    if (window.kakao && window.kakao.maps) {
                        window.kakao.maps.load(() => {
                            console.log('✅ Kakao Maps API loaded in add-store page');
                        });
                    }
                }}
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
                    border-radius: 0;
                    box-shadow: 0 4px 30px rgba(0,0,0,0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .main-content {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .screen {
                    display: none;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                }

                .screen.active {
                    display: flex;
                }

                .screen-content-wrapper {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 20px;
                    padding-bottom: 120px; /* Space for fixed button container */
                    box-sizing: border-box;
                    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
                }

                .screen::-webkit-scrollbar,
                .screen-content-wrapper::-webkit-scrollbar {
                    width: 4px;
                }
                .screen::-webkit-scrollbar-track,
                .screen-content-wrapper::-webkit-scrollbar-track {
                    background-color: transparent;
                }
                .screen::-webkit-scrollbar-thumb,
                .screen-content-wrapper::-webkit-scrollbar-thumb {
                    background-color: var(--border-color);
                    border-radius: 2px;
                }
                .screen::-webkit-scrollbar-thumb:hover,
                .screen-content-wrapper::-webkit-scrollbar-thumb:hover {
                    background-color: var(--accent-color);
                }

                .screen h2 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    line-height: 1.4;
                    margin-top: 32px;
                    margin-bottom: 24px;
                    color: var(--text-color);
                }
                
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0;
                    margin-left: -20px;
                    margin-right: -20px;
                    margin-top: -40px;
                    padding: 20px;
                    padding-top: 40px;
                    padding-bottom: 0;
                    font-weight: 700;
                    font-size: 1.1rem;
                    background-color: #FFFFFF;
                    position: sticky;
                    top: -40px;
                    z-index: 20;
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
                    width: calc(100% + 40px);
                    height: 26px;
                    border-radius: 0;
                    margin-bottom: 20px;
                    margin-left: -20px;
                    margin-right: -20px;
                    margin-top: 0;
                    position: sticky;
                    top: 52px;
                    z-index: 20;
                    background: linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 20px, transparent 20px, transparent 100%);
                }
                .progress-bar::before {
                    content: '';
                    position: absolute;
                    top: 12px;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background-color: var(--border-color);
                }
                .progress-bar .progress {
                    width: ${progress}%;
                    height: 6px;
                    background-color: var(--accent-color);
                    transition: width 0.3s ease;
                    position: absolute;
                    top: 12px;
                    left: 0;
                    z-index: 1;
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
                    background: var(--surface-color);
                    border-top: none;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    box-sizing: border-box;
                    flex-shrink: 0;
                    z-index: 10;
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
                .sns-icon {
                    font-size: 1.5rem;
                    color: var(--accent-color);
                    margin-right: 12px;
                    flex-shrink: 0;
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
                    flex-direction: column;
                    gap: 6px;
                    align-items: stretch;
                }
                 .space-card-actions button {
                    background: white;
                    border: 1px solid #E0E0E0;
                    color: var(--text-color);
                    padding: 6px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    white-space: nowrap;
                    width: 100%;
                }
                 .space-card-actions button:hover {
                    background-color: #F8F9FA;
                    border-color: #C0C0C0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transform: translateY(-1px);
                 }
                 .space-card-actions button:active {
                    transform: translateY(0);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
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
                    max-width: 550px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
                .space-editor-modal h3 {
                    margin-top: 0;
                    font-size: 1.5rem;
                    color: var(--text-color);
                }
                .space-editor-modal .btn {
                    padding: 10px 16px;
                    font-size: 1rem;
                }
                .space-editor-modal .form-row {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                @media (min-width: 768px) {
                    .space-editor-modal .form-row {
                        grid-template-columns: 1fr 1fr;
                    }
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
                    border-radius: 12px;
                    overflow: hidden;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: box-shadow 0.3s ease;
                }
                .confirm-section:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                }
                .confirm-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #F9F7F5 0%, #F0EBE4 100%);
                    padding: 14px 18px;
                    font-weight: 600;
                    border-bottom: 1px solid var(--border-color);
                    font-size: 1rem;
                }
                .confirm-header span:first-child {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .edit-btn {
                    color: var(--accent-color);
                    font-size: 0.9rem;
                    cursor: pointer;
                    font-weight: 500;
                    padding: 4px 10px;
                    border-radius: 6px;
                    transition: background-color 0.2s ease;
                }
                .edit-btn:hover {
                    background-color: rgba(168, 149, 135, 0.15);
                }
                .confirm-content {
                    padding: 18px;
                    font-size: 0.95rem;
                    line-height: 1.8;
                    background-color: white;
                }
                .confirm-content p { 
                    margin: 0 0 10px;
                    padding-left: 8px;
                }
                .confirm-content p:last-child { margin-bottom: 0; }
                .confirm-content strong { 
                    color: var(--accent-color);
                    font-weight: 600;
                    margin-right: 8px;
                }

                .pc-sidebar {
                    display: none;
                }

                .close-button {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background-color: rgba(0, 0, 0, 0.05);
                    border: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    z-index: 30;
                    font-size: 20px;
                    color: var(--text-color);
                }
                .close-button:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                    transform: scale(1.05);
                }
                .close-button:active {
                    transform: scale(0.95);
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
                        overflow: visible;
                    }
                    .close-button {
                        top: 20px;
                        right: 20px;
                        width: 40px;
                        height: 40px;
                        font-size: 22px;
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

                    .screen-content-wrapper {
                        padding: 40px;
                        padding-bottom: 40px; /* Reset for PC */
                    }
                    .screen-content-wrapper > * {
                        width: 100%;
                        max-width: 600px;
                    }
                     .screen h2, #screen-start h1 {
                        font-size: 2.25rem;
                        margin-bottom: 40px;
                    }
                     .screen .header {
                        display: none; /* Hide mobile header on PC */
                    }
                    .screen .progress-bar {
                        display: none; /* Hide mobile progress bar on PC */
                    }
                    #screen-start .screen-content-wrapper {
                        justify-content: center;
                        padding-top: 10vh;
                    }
                    #screen-start h1 { 
                        font-size: 2.5rem; 
                    }
                    #screen-start .btn-container {
                        justify-content: center;
                        border-top: none;
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
                    .space-editor-modal {
                        max-width: 420px;
                    }
                    .space-editor-modal .btn {
                        padding: 8px 16px;
                        height: 80%;
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
                        gap: 6px;
                        align-items: stretch;
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
                    <button className="close-button" onClick={() => router.push('/dashboard')}>
                        ✕
                    </button>
                    <div className="pc-sidebar">
                        <h1>{mode === 'edit' ? '가게 수정' : '가게 등록'}</h1>
                        <div
                            className={`pc-step ${activeScreen.includes('step1') ? 'active' : ''} ${screenOrder.indexOf(maxScreenReached) > screenOrder.indexOf('screen-step1') ? 'completed' : ''}`}
                            onClick={() => showScreen('screen-step1', 25)}
                            style={{ 
                                cursor: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-step1') ? 'pointer' : 'not-allowed', 
                                opacity: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-step1') ? 1 : 0.4 
                            }}
                        >
                            1. 필수 정보
                        </div>
                        <div
                            className={`pc-step ${activeScreen.includes('step2') ? 'active' : ''} ${screenOrder.indexOf(maxScreenReached) > screenOrder.indexOf('screen-step2') ? 'completed' : ''}`}
                            onClick={() => showScreen('screen-step2', 50)}
                            style={{ 
                                cursor: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-step2') ? 'pointer' : 'not-allowed', 
                                opacity: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-step2') ? 1 : 0.4 
                            }}
                        >
                            2. 상세 정보
                        </div>
                        <div
                            className={`pc-step ${activeScreen.includes('step3') ? 'active' : ''} ${screenOrder.indexOf(maxScreenReached) > screenOrder.indexOf('screen-step3') ? 'completed' : ''}`}
                            onClick={() => showScreen('screen-step3', 75)}
                            style={{ 
                                cursor: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-step3') ? 'pointer' : 'not-allowed', 
                                opacity: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-step3') ? 1 : 0.4 
                            }}
                        >
                            3. 가게 소개
                        </div>
                        <div
                            className={`pc-step ${activeScreen.includes('step4') ? 'active' : ''} ${screenOrder.indexOf(maxScreenReached) > screenOrder.indexOf('screen-step4') ? 'completed' : ''}`}
                            onClick={() => showScreen('screen-step4', 100)}
                            style={{ 
                                cursor: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-step4') ? 'pointer' : 'not-allowed', 
                                opacity: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-step4') ? 1 : 0.4 
                            }}
                        >
                            4. 공간 등록
                        </div>
                         <div
                            className={`pc-step ${activeScreen.includes('confirm') ? 'active' : ''}`}
                            onClick={() => showScreen('screen-confirm', 100)}
                            style={{ 
                                cursor: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-confirm') ? 'pointer' : 'not-allowed', 
                                opacity: screenOrder.indexOf(maxScreenReached) >= screenOrder.indexOf('screen-confirm') ? 1 : 0.4 
                            }}
                        >
                            최종 확인
                        </div>
                    </div>
                    <div className="main-content">
                        <div id="screen-start" className={`screen ${activeScreen === 'screen-start' ? 'active' : ''}`}>
                            <div className="screen-content-wrapper">
                                <img className="start-icon" src="https://em-content.zobj.net/source/apple/391/party-popper_1f389.png" alt="Party Popper Icon" />
                                <h1>{mode === 'edit' ? '가게 정보를 수정하세요' : '가게 등록, 시작해볼까요?'}</h1>
                                <p>몇 가지 정보만 입력하면<br/>사장님의 가게를 더 많은 고객에게<br/>알릴 수 있습니다!</p>
                            </div>
                            <div className="btn-container">
                                <button className="btn btn-primary" onClick={() => {
                                    setMaxScreenReached('screen-step1'); // 첫 단계 잠금 해제
                                    showScreen('screen-step1', 25);
                                }}>{mode === 'edit' ? '정보 수정 시작하기' : '가게 등록 시작하기'}</button>
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
                                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                        <label htmlFor="storeName" style={{marginBottom: 0}}>업체명</label>
                                        {errors.storeName && <span style={{color: '#E74C3C', fontSize: '0.85rem', marginLeft: '8px'}}>{errors.storeName}</span>}
                                    </div>
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
                                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                        <label htmlFor="address" style={{marginBottom: 0}}>가게 주소</label>
                                        {errors.address && <span style={{color: '#E74C3C', fontSize: '0.85rem', marginLeft: '8px'}}>{errors.address}</span>}
                                    </div>
                                    <div className="input-wrapper">
                                        <input type="text" id="address" name="address" placeholder="주소를 검색해주세요" value={formData.address} readOnly />
                                        <button type="button" className="inner-btn" onClick={handleAddressSearch}>주소 검색</button>
                                    </div>
                                    <input type="text" id="addressDetail" name="addressDetail" placeholder="상세주소 입력 (예: 2층 201호)" value={formData.addressDetail} onChange={handleChange} style={{marginTop: '10px'}}/>
                                </div>
                            </div>
                            <div className="btn-container">
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleStep1Next}
                                    style={{opacity: isStep1Valid() ? 1 : 0.5, cursor: isStep1Valid() ? 'pointer' : 'not-allowed'}}
                                >
                                    다음
                                </button>
                            </div>
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
                                <div className="form-group">
                                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                        <label htmlFor="phone" style={{marginBottom: 0}}>연락처</label>
                                        {errors.phone && <span style={{color: '#E74C3C', fontSize: '0.85rem', marginLeft: '8px'}}>{errors.phone}</span>}
                                    </div>
                                    <input type="tel" id="phone" name="phone" placeholder="010-1234-5678" value={formData.phone} onChange={handleChange} />
                                </div>
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
                                            <span className="material-symbols-outlined sns-icon">{getSnsIconName(url)}</span>
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
                            <div className="btn-container">
                                <button className="btn btn-secondary" onClick={() => showScreen('screen-step1', 25)}>이전</button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleStep2Next}
                                    style={{opacity: isStep2Valid() ? 1 : 0.5, cursor: isStep2Valid() ? 'pointer' : 'not-allowed'}}
                                >
                                    다음
                                </button>
                            </div>
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
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                                        <label style={{marginBottom: 0}}>
                                            가게 사진 
                                            <span style={{fontSize: '0.85rem', color: 'var(--subtle-text-color)', marginLeft: '8px'}}>
                                                ({formData.imageFiles.length}/4)
                                            </span>
                                        </label>
                                        {errors.imageFiles && <span style={{color: '#E74C3C', fontSize: '0.85rem'}}>{errors.imageFiles}</span>}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => {
                                            handleFileChange(e);
                                            setErrors(prev => ({ ...prev, imageFiles: '' }));
                                        }}
                                        multiple
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    
                                    {/* 메인 업로드 영역 */}
                                    {formData.imageFiles.length === 0 ? (
                                        <div 
                                            className="photo-upload-main"
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                border: '2px dashed var(--border-color)',
                                                borderRadius: '16px',
                                                padding: '48px 24px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: '#FAFAF8',
                                                transition: 'all 0.3s ease',
                                                marginBottom: '16px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--accent-color)';
                                                e.currentTarget.style.backgroundColor = '#F9F7F5';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                                e.currentTarget.style.backgroundColor = '#FAFAF8';
                                            }}
                                        >
                                            <div style={{fontSize: '3rem', marginBottom: '16px'}}>📸</div>
                                            <h3 style={{fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-color)', marginBottom: '8px'}}>
                                                가게 사진을 추가해주세요
                                            </h3>
                                            <p style={{fontSize: '0.9rem', color: 'var(--subtle-text-color)', marginBottom: '16px'}}>
                                                최대 4장까지 등록 가능합니다
                                            </p>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '10px 24px',
                                                backgroundColor: 'var(--accent-color)',
                                                color: 'white',
                                                borderRadius: '8px',
                                                fontSize: '0.95rem',
                                                fontWeight: '600'
                                            }}>
                                                사진 선택하기
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* 업로드된 사진 그리드 */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: '12px',
                                                marginBottom: '16px'
                                            }}>
                                        {formData.imagePreviews.map((src, index) => (
                                                    <div 
                                                        key={index}
                                                        style={{
                                                            position: 'relative',
                                                            aspectRatio: '4/3',
                                                            borderRadius: '12px',
                                                            overflow: 'hidden',
                                                            border: index === 0 ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1.02)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                                        }}
                                                    >
                                                        <img 
                                                            src={src} 
                                                            alt={`preview ${index + 1}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        {index === 0 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '8px',
                                                                left: '8px',
                                                                backgroundColor: 'var(--accent-color)',
                                                                color: 'white',
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                대표
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeImage(index);
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '8px',
                                                                right: '8px',
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '50%',
                                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                                color: 'white',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '1.2rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'rgba(231,76,60,0.9)';
                                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)';
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                            </div>
                                        ))}
                                            </div>
                                            
                                            {/* 추가 버튼 */}
                                        {formData.imageFiles.length < 4 && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    style={{
                                                        width: '100%',
                                                        padding: '16px',
                                                        border: '2px dashed var(--border-color)',
                                                        borderRadius: '12px',
                                                        backgroundColor: 'transparent',
                                                        color: 'var(--text-color)',
                                                        fontSize: '0.95rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--accent-color)';
                                                        e.currentTarget.style.backgroundColor = '#F9F7F5';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <span style={{fontSize: '1.5rem'}}>+</span>
                                                    <span>사진 추가하기 ({4 - formData.imageFiles.length}장 더 가능)</span>
                                                </button>
                                            )}
                                            
                                            {/* 도움말 */}
                                            <div style={{
                                                marginTop: '12px',
                                                padding: '12px',
                                                backgroundColor: '#F9F7F5',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                color: 'var(--subtle-text-color)',
                                                lineHeight: '1.5'
                                            }}>
                                                <span style={{fontWeight: '600', color: 'var(--text-color)'}}>💡 Tip:</span> 첫 번째 사진이 대표 사진으로 설정됩니다
                            </div>
                                        </>
                        )}
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
                            <div className="btn-container">
                                <button className="btn btn-secondary" onClick={() => showScreen('screen-step2', 50)}>이전</button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleStep3Next}
                                    style={{opacity: isStep3Valid() ? 1 : 0.5, cursor: isStep3Valid() ? 'pointer' : 'not-allowed'}}
                                >
                                    다음
                                </button>
                            </div>
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
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', marginTop: '32px'}}>
                                    <div>
                                        <h2 style={{margin: 0, marginBottom: '24px'}}>전시 공간을<br/>등록해주세요.</h2>
                                        <p style={{ color: 'var(--subtle-text-color)', marginTop: '8px', fontSize: '0.9rem' }}>* 공간의 사진, 이름, 크기를 입력해주세요.</p>
                                    </div>
                                    {errors.spaces && <span style={{color: '#E74C3C', fontSize: '0.85rem', marginTop: '4px'}}>{errors.spaces}</span>}
                                </div>
                                
                                <div className="space-list">
                                    {formData.spaces.map(space => (
                                        <div key={space.id} className="space-card">
                                            <img src={space.imagePreview || 'https://via.placeholder.com/70'} alt={space.name} className="space-card-img" />
                                            <div className="space-card-details">
                                                <div className="space-card-name">{space.name}</div>
                                                <div className="space-card-size" style={{whiteSpace: 'nowrap'}}>{space.width}cm × {space.height}cm</div>
                                                <div className="space-card-size" style={{color: 'var(--accent-color)', fontWeight: '600'}}>{parseInt(space.price).toLocaleString()}원/일</div>
                                            </div>
                                            <div className="space-card-actions">
                                                <button onClick={() => openSpaceEditor(space)}>✏️ 수정</button>
                                                <button onClick={() => deleteSpace(space.id)} style={{color: '#E74C3C'}}>🗑️ 삭제</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-secondary" onClick={() => {
                                    openSpaceEditor(null);
                                    setErrors(prev => ({ ...prev, spaces: '' }));
                                }}>[+] 공간 추가하기</button>
                            </div>
                            <div className="btn-container">
                                <button className="btn btn-secondary" onClick={() => showScreen('screen-step3', 75)}>이전</button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleStep4Next}
                                    style={{opacity: isStep4Valid() ? 1 : 0.5, cursor: isStep4Valid() ? 'pointer' : 'not-allowed'}}
                                >
                                    등록 내용 확인하기
                                </button>
                            </div>
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
                                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                        <label style={{marginBottom: 0, fontWeight: 600, fontSize: '0.9rem'}}>공간 사진</label>
                                        {spaceErrors.imagePreview && <span style={{color: '#E74C3C', fontSize: '0.85rem', marginLeft: '8px'}}>{spaceErrors.imagePreview}</span>}
                                    </div>
                                    <div className="space-photo-uploader" onClick={() => spaceFileInputRef.current?.click()}>
                                        {currentSpace.imagePreview ? (
                                            <img src={currentSpace.imagePreview} alt="Preview" />
                                        ) : (
                                            <span style={{color: 'var(--subtle-text-color)', textAlign: 'center'}}>📸<br/>사진 추가</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                            <label htmlFor="spaceName" style={{marginBottom: 0}}>공간 이름</label>
                                            {spaceErrors.name && <span style={{color: '#E74C3C', fontSize: '0.85rem', marginLeft: '8px'}}>{spaceErrors.name}</span>}
                                        </div>
                                        <input type="text" id="spaceName" name="name" value={currentSpace.name} onChange={handleSpaceChange} placeholder="예) 1층 메인홀" />
                                    </div>
                                    <div className="form-group">
                                        <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                            <label style={{marginBottom: 0}}>공간 크기 (cm)</label>
                                            {(spaceErrors.width || spaceErrors.height) && <span style={{color: '#E74C3C', fontSize: '0.85rem', marginLeft: '8px'}}>{spaceErrors.width || spaceErrors.height}</span>}
                                        </div>
                                        <div className="size-input-group">
                                            <input type="number" name="width" value={currentSpace.width} onChange={handleSpaceChange} placeholder="가로" />
                                            <span>x</span>
                                            <input type="number" name="height" value={currentSpace.height} onChange={handleSpaceChange} placeholder="세로" />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                                <label htmlFor="spacePrice" style={{marginBottom: 0}}>하루 당 비용 (원)</label>
                                                {spaceErrors.price && <span style={{color: '#E74C3C', fontSize: '0.85rem', marginLeft: '8px'}}>{spaceErrors.price}</span>}
                                            </div>
                                            <input type="number" id="spacePrice" name="price" value={currentSpace.price} onChange={handleSpaceChange} placeholder="예) 250000" />
                                        </div>
                                        <div className="form-group">
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                                <label htmlFor="spaceMaxArtworks" style={{marginBottom: 0}}>예약 가능 작품 수</label>
                                                {spaceErrors.maxArtworks && <span style={{color: '#E74C3C', fontSize: '0.85rem', marginLeft: '8px'}}>{spaceErrors.maxArtworks}</span>}
                                            </div>
                                            <input type="number" id="spaceMaxArtworks" name="maxArtworks" value={currentSpace.maxArtworks} onChange={handleSpaceChange} placeholder="예) 5" min="1" />
                                        </div>
                                    </div>
                                    <div className="btn-container" style={{ position: 'static', padding: '16px 0 0 0', background: 'none', marginTop: '8px' }}>
                                        <button className="btn btn-secondary" onClick={closeSpaceEditor}>취소</button>
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={saveSpace}
                                            style={{opacity: isSpaceValid() ? 1 : 0.5, cursor: isSpaceValid() ? 'pointer' : 'not-allowed'}}
                                        >
                                            저장
                                        </button>
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
                                    <div className="confirm-header">
                                        <span>
                                            <span className="material-symbols-outlined" style={{fontSize: '1.2rem', color: 'var(--accent-color)'}}>store</span>
                                            기본 정보
                                        </span>
                                        <span className="edit-btn" onClick={() => showScreen('screen-step1', 25)}>✏️ 수정</span>
                                    </div>
                                    <div className="confirm-content">
                                        <p><strong>업체명:</strong> {formData.storeName || '미입력'}</p>
                                        <p><strong>업종:</strong> {formData.storeCategory}</p>
                                        <p><strong>주소:</strong> {`${formData.address} ${formData.addressDetail}`.trim() || '미입력'}</p>
                                    </div>
                                </div>
                                <div className="confirm-section">
                                    <div className="confirm-header">
                                        <span>
                                            <span className="material-symbols-outlined" style={{fontSize: '1.2rem', color: 'var(--accent-color)'}}>info</span>
                                            상세 정보
                                        </span>
                                        <span className="edit-btn" onClick={() => showScreen('screen-step2', 50)}>✏️ 수정</span>
                                    </div>
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
                                <div className="confirm-section">
                                    <div className="confirm-header">
                                        <span>
                                            <span className="material-symbols-outlined" style={{fontSize: '1.2rem', color: 'var(--accent-color)'}}>business</span>
                                            사업자 정보
                                        </span>
                                    </div>
                                    <div className="confirm-content">
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>사업자등록번호</label>
                                            <input 
                                                type="text" 
                                                name="businessLicenseNumber"
                                                placeholder="사업자등록번호 입력"
                                                value={formData.businessLicenseNumber}
                                                onChange={handleChange}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>사업자등록증 사본</label>
                                            <input
                                                type="file"
                                                ref={businessLicenseInputRef}
                                                onChange={handleBusinessLicenseChange}
                                                accept="image/*,.pdf"
                                                style={{ display: 'none' }}
                                            />
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ marginTop: '0', width: '100%' }}
                                                onClick={() => businessLicenseInputRef.current?.click()}
                                                type="button"
                                            >
                                                📄 사업자등록증 사본 첨부
                                            </button>
                                            {formData.businessLicenseFile && (
                                                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#28a745', fontWeight: 500 }}>
                                                    ✓ {formData.businessLicenseFile.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="btn-container">
                                <button className="btn btn-secondary" onClick={() => showScreen('screen-step4', 100)} disabled={isSubmitting}>이전</button>
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? '등록 중...' : (mode === 'edit' ? '수정 완료하기' : '등록 완료하기')}
                                </button>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
    </>
  );
}

export default function AddStorePrototypePage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
            <AddStoreContent />
        </Suspense>
    );
}