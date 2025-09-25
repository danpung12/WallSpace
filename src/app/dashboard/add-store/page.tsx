'use client';

import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';

// --- UI 컴포넌트 ---

// 입력 필드 그룹 컴포넌트
function InputGroup({ id, label, children, required = false }: { id: string; label: string; children: React.ReactNode; required?: boolean; }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-[#3D2C1D] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// 아이콘 컴포넌트
function PhotoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-gray-400">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
        </svg>
    );
}


// --- 메인 페이지 컴포넌트 ---
export default function AddStorePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    storeName: '',
    address: '',
    addressDetail: '',
    contact: '',
    businessNumber: '',
    storeType: 'cafe',
    totalSpaces: 1,
    description: '',
  });
  
  // 업로드된 파일과 이미지 미리보기 URL 상태
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // 입력 변경 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 파일 변경 핸들러
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  // 이미지 미리보기 제거 핸들러
  const removeImage = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // 폼 제출 핸들러
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: 여기에 폼 데이터 유효성 검사 및 서버 전송 로직 추가
    console.log('Form Submitted:', { formData, uploadedFiles });
    alert('가게 등록이 요청되었습니다.');
    router.push('/dashboard');
  };

  const managerBgClass = "bg-[#F5F1EC]";

  return (
    <>
      <Head>
        <title>Stitch - 가게 등록</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <style jsx global>{`
        .bg-\\[\\#F5F1EC\\] { --tw-bg-opacity: 1; background-color: rgb(245 241 236 / var(--tw-bg-opacity)); }
      `}</style>

      <div className={`relative flex min-h-[100dvh] flex-col text-[#3D2C1D] font-pretendard transition-colors duration-300 ${managerBgClass}`}>
        <header className={`sticky top-0 z-10 backdrop-blur-sm transition-colors duration-300 bg-[#F5F1EC]/80`}>
          <div className="flex items-center p-4">
            <button type="button" onClick={() => router.back()} aria-label="뒤로 가기" className="text-[#3D2C1D] active:scale-95 transition-transform">
              <svg fill="none" height="24" width="24" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="flex-1 text-center text-xl font-bold text-[#3D2C1D]">가게 등록</h1>
            <div className="w-6"></div> {/* 균형을 위한 빈 div */}
          </div>
        </header>

        <main className="p-4 space-y-8 pb-24">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 기본 정보 섹션 */}
            <section className="bg-white/50 rounded-xl shadow-md p-4 space-y-4">
                <h2 className="text-xl font-bold text-[#3D2C1D] mb-4">기본 정보</h2>
                
                <InputGroup id="storeName" label="가게 이름" required>
                    <input type="text" id="storeName" name="storeName" value={formData.storeName} onChange={handleChange} required className="w-full p-2 border border-[#EAE5DE] rounded-md focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition" />
                </InputGroup>

                <InputGroup id="address" label="가게 주소" required>
                    <div className="flex gap-2">
                        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required placeholder="주소 검색" className="w-full p-2 border border-[#EAE5DE] rounded-md focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition" />
                        <button type="button" className="bg-[#c19a6b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors">검색</button>
                    </div>
                </InputGroup>

                <InputGroup id="addressDetail" label="상세 주소">
                    <input type="text" id="addressDetail" name="addressDetail" value={formData.addressDetail} onChange={handleChange} className="w-full p-2 border border-[#EAE5DE] rounded-md focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition" />
                </InputGroup>

                <InputGroup id="contact" label="연락처" required>
                    <input type="tel" id="contact" name="contact" value={formData.contact} onChange={handleChange} required placeholder="010-1234-5678" className="w-full p-2 border border-[#EAE5DE] rounded-md focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition" />
                </InputGroup>

                <InputGroup id="businessNumber" label="사업자 등록번호" required>
                    <input type="text" id="businessNumber" name="businessNumber" value={formData.businessNumber} onChange={handleChange} required placeholder="123-45-67890" className="w-full p-2 border border-[#EAE5DE] rounded-md focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition" />
                </InputGroup>
            </section>

            {/* 추가 정보 섹션 */}
            <section className="bg-white/50 rounded-xl shadow-md p-4 space-y-4">
                <h2 className="text-xl font-bold text-[#3D2C1D] mb-4">추가 정보</h2>
                
                <InputGroup id="storeType" label="가게 유형" required>
                    <select id="storeType" name="storeType" value={formData.storeType} onChange={handleChange} className="w-full p-2 border border-[#EAE5DE] rounded-md focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition">
                        <option value="cafe">카페</option>
                        <option value="gallery">갤러리</option>
                        <option value="restaurant">레스토랑</option>
                        <option value="lounge">라운지</option>
                        <option value="complex">복합문화공간</option>
                        <option value="other">기타</option>
                    </select>
                </InputGroup>

                <InputGroup id="totalSpaces" label="전시 가능 공간 수" required>
                    <input type="number" id="totalSpaces" name="totalSpaces" min="1" value={formData.totalSpaces} onChange={handleChange} className="w-full p-2 border border-[#EAE5DE] rounded-md focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition" />
                </InputGroup>

                <InputGroup id="description" label="가게 소개">
                    <textarea id="description" name="description" rows={5} value={formData.description} onChange={handleChange} placeholder="작가들에게 가게의 매력을 어필해보세요. (예: 주차 가능, 유동인구 많은 곳, 자연광이 잘 드는 공간 등)" className="w-full p-2 border border-[#EAE5DE] rounded-md focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition" />
                </InputGroup>

                <InputGroup id="photos" label="가게 사진 (최대 5장)" required>
                    <div 
                        className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center">
                            <PhotoIcon />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <p className="pl-1">클릭 또는 드래그하여 사진 업로드</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF 등 (최대 10MB)</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} id="photos" name="photos" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                </InputGroup>

                {/* 이미지 미리보기 */}
                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                        {imagePreviews.map((src, index) => (
                            <div key={index} className="relative group">
                                <img src={src} alt={`미리보기 ${index + 1}`} className="h-24 w-full object-cover rounded-md" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-0 right-0 m-1 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="이미지 제거"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 제출 버튼 */}
            <div className="pt-4">
                <button type="submit" className="w-full bg-[#3D2C1D] text-white text-lg font-bold py-3 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition-colors active:scale-[0.99]">
                    등록하기
                </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}