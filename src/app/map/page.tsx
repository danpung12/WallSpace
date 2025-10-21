'use client';

import React, { useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useBottomNav } from '../context/BottomNavContext';
import { useMap, isSameDay, fmtKoreanDate } from '@/context/MapContext';
import { userArtworks } from '@/data/artworks';
import { locations } from '@/data/locations';
import Header from '../components/Header';

// --- OptionsMenu Component Definition ---
interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function OptionsMenu({ isOpen, onClose }: OptionsMenuProps) {
  const {
    parkingFilter,
    setParkingFilter,
    open24HoursFilter,
    setOpen24HoursFilter,
    petsAllowedFilter,
    setPetsAllowedFilter,
  } = useMap();

  const handleParkingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParkingFilter(e.target.checked);
  };

  const handleOpen24HoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpen24HoursFilter(e.target.checked);
  };

  const handlePetsAllowedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPetsAllowedFilter(e.target.checked);
  };

  return (
    <div className={`options-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`options-menu-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="options-menu-header">
          <span>필터</span>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="options-menu-body">
          <div className="option-item">
            <label htmlFor="parking-checkbox" className="option-label">
              주차 가능
            </label>
            <label className="switch">
              <input
                id="parking-checkbox"
                type="checkbox"
                checked={parkingFilter}
                onChange={handleParkingChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="option-item">
            <label htmlFor="24-hours-checkbox" className="option-label">
              24시간 운영
            </label>
            <label className="switch">
              <input
                id="24-hours-checkbox"
                type="checkbox"
                checked={open24HoursFilter}
                onChange={handleOpen24HoursChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="option-item">
            <label htmlFor="pets-allowed-checkbox" className="option-label">
              반려동물 허용
            </label>
            <label className="switch">
              <input
                id="pets-allowed-checkbox"
                type="checkbox"
                checked={petsAllowedFilter}
                onChange={handlePetsAllowedChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Dynamic Imports ---
const AddArtworkModal = dynamic(
  () => import('../dashboard/components/AddArtworkModal')
);
const SearchModal = dynamic(() => import('./components/SearchModal'));
const LocationDetailPage = dynamic(
  () => import('./components/LocationDetailPage')
);

// Components
import MapDisplay from '../components/MapDisplay';
import LoadingScreen from './components/LoadingScreen';
import ArtworkSelector from './components/ArtworkSelector';
import PlaceDetailPanel from './components/PlaceDetailPanel';

// --- 메인 페이지 컴포넌트 ---
function MapPageContent() {
    const { setIsNavVisible } = useBottomNav();
    const {
        mapInstance, // mapInstance 추가
        isDetailPageVisible, setDetailPageVisible,
        isDatePickerOpen, setDatePickerOpen,
        startDate,
        endDate,
        activeFilter,
        selectedArtwork, setSelectedArtwork,
        isArtworkModalOpen, setArtworkModalOpen,
        isArtworkSelectorVisible,
        isSearchModalOpen, setSearchModalOpen,
        selectedPlace, setSelectedPlace,
        locationInfo,
        isMapLoading,
        cells, hasRange, filterButtons, headerLabel,
        isOptionsMenuOpen, setOptionsMenuOpen,
        handlePlaceSelect, gotoMonth, isDisabled, onClickDay, getDayClass, handleFilterClick,
    } = useMap();
    const searchParams = useSearchParams();

    useEffect(() => {
        const placeId = searchParams.get('placeId');
        if (placeId) {
            const place = locations.find((p) => p.id === placeId);
            if (place) {
                setSelectedPlace(place);
            }
        }
    }, [searchParams, setSelectedPlace]);

    // 작품 추가/수정 관련 핸들러
    const handleSaveArtwork = (artworkData: any) => {
        // TODO: Implement actual save logic (e.g., API call)
        console.log('Saving artwork:', artworkData);
        // For now, we can just close the modal.
        // In a real app, you might want to refetch artworks list.
    };

    useEffect(() => {
        if (selectedPlace && mapInstance.current && window.kakao) {
            const { lat, lng } = selectedPlace;
            const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
            mapInstance.current.panTo(moveLatLon);
        }
    }, [selectedPlace, mapInstance]);

    useEffect(() => {
        if (isDetailPageVisible) {
            setIsNavVisible(false);
        } else {
            setIsNavVisible(true);
        }
        return () => {
            setIsNavVisible(true);
        };
    }, [isDetailPageVisible, setIsNavVisible]);

    return (
        <div className="map-page-container">
            <div className="header-trigger-zone"></div>
            <Header />
            <style>{`
              /* PC header hover effect */
              @media (min-width: 1024px) {
                .map-page-container {
                  position: relative;
                }
                .header-trigger-zone {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 2rem; /* 32px, Increased hover area */
                  z-index: 100;
                }
                .map-page-container > header {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  z-index: 50;
                  transform: translateY(-100%);
                  transition: transform 0.3s ease-in-out;
                  border-bottom: 1px solid #e5e7eb;
                }
                .header-trigger-zone:hover ~ header,
                .map-page-container > header:hover {
                  transform: translateY(0);
                }
                .map-page-container .top-search-bar {
                  transition: top 0.3s ease-in-out;
                }
                .header-trigger-zone:hover ~ .page-container .top-search-bar,
                .map-page-container > header:hover ~ .page-container .top-search-bar {
                  top: 4rem; /* h-16 (Header height) */
                }
              }

              :root { --theme-brown-lightest:#F5F3F0; --theme-brown-light:#E9E4DD; --theme-brown-medium:#D4C8B8; --theme-brown-dark:#A18F79; --theme-brown-darkest:#4D4337; --white:#ffffff; }
              body { font-family: 'Pretendard', sans-serif; background-color: var(--theme-brown-lightest); color: var(--theme-brown-darkest); overflow: hidden; min-height: 100vh; overscroll-behavior: none; }
              .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-size: 28px; vertical-align: middle; }
              .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              .page-container { position: relative; height: 100vh; width: 100vw; }
              .background-map { position: absolute; inset: 0; z-index: 0; }
              .top-search-bar { position: absolute; top: 0; left: 0; right: 0; padding: 1rem; z-index: 20; }
              .top-search-bar-inner { max-width: 24rem; margin: 0 auto; background-color: rgba(255,255,255,0.95); backdrop-filter: blur(4px); border-radius: 1rem; border: 1px solid var(--theme-brown-light); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .search-input-card { flex-grow: 1; margin: 0 1.25rem; padding: 0.5rem 1rem; background-color: var(--white); border-radius: 9999px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 8px rgba(0,0,0,0.08); transition: all 0.3s ease; cursor: pointer; }
              .search-input-card:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }
              .search-input-card .main-text { font-weight: bold; font-size: 1.125rem; } .search-input-card .sub-text { font-size: 0.875rem; color: var(--theme-brown-dark); }
              .filter-buttons { padding: 0.5rem; display: flex; justify-content: space-around; gap: 0.25rem; overflow-x: auto; }
              .filter-button { padding: 0.375rem 0.75rem; font-size: 0.875rem; white-space: nowrap; border-radius: 9999px; border: 1px solid var(--theme-brown-medium); background-color: rgba(255,255,255,0.9); color: var(--theme-brown-darkest); box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s; cursor: pointer; }
              .filter-button:hover { background-color: var(--theme-brown-light); }
              .filter-button.active { background-color: var(--theme-brown-darkest); color: var(--white); border-color: var(--theme-brown-darkest); }
              .date-picker-modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.6); z-index: 50; display: flex; align-items: center; justify-content: center; }
              .date-picker-modal-content { background-color: var(--theme-brown-lightest); width: 100%; max-width: 28rem; max-height: 90vh; display: flex; flex-direction: column; border-radius: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: 1rem; animation: fadeIn 0.3s ease-out; }
              @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
              .date-picker-modal-header { padding: 1rem; text-align: center; font-weight: bold; font-size: 1.25rem; border-bottom: 1px solid var(--theme-brown-light); position: relative; }
              .date-picker-modal-header .close-btn { position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); cursor: pointer; padding: 0.5rem; }
              .date-picker-modal-body { overflow-y: auto; padding: 1rem; }
              .date-picker-modal-footer { padding: 1rem; border-top: 1px solid var(--theme-brown-light); }
              .date-picker-day { display: flex; align-items: center; justify-content: center; aspect-ratio: 1/1; border-radius: 9999px; transition: all 0.2s; cursor: pointer; }
              .date-picker-day-selected { background: var(--theme-brown-darkest); color: var(--white); }
              .date-picker-day-disabled { background: #F3F4F6; color: #bdbdbd; cursor: not-allowed; text-decoration: line-through; }
              .date-picker-day-in-range { background: var(--theme-brown-light); color: var(--theme-brown-darkest); border-radius: 0; }
              .date-picker-day-muted { color: var(--theme-brown-medium); }
              .date-range-start { border-top-right-radius: 0; border-bottom-right-radius: 0; }
              .date-range-end { border-top-left-radius: 0; border-bottom-left-radius: 0; }
              .custom-overlay-style { padding: 8px 12px; background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; cursor: pointer; font-size: 13px; }

              /* OptionsMenu 스타일 */
              .options-menu-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.6); backdrop-filter: blur(0px); z-index: 100; display: flex; justify-content: center; align-items: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out; }
              .options-menu-overlay.open { opacity: 1; pointer-events: auto; backdrop-filter: blur(4px); }
              .options-menu-content { background-color: var(--theme-brown-lightest); width: 100%; max-width: 28rem; border-radius: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: 1rem; transform: scale(0.95); opacity: 0; transition: transform 0.3s ease-out, opacity 0.3s ease-out; }
              .options-menu-content.open { transform: scale(1); opacity: 1; }
              .options-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--theme-brown-light); font-weight: bold; font-size: 1.25rem; }
              .options-menu-header .close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--theme-brown-dark); padding: 0; line-height: 1; }
              .options-menu-body { padding: 1rem; }
              .option-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; }
              .option-label { font-size: 1rem; }
              .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
              .switch input { opacity: 0; width: 0; height: 0; }
              .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
              .slider.round { border-radius: 34px; }
              .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
              input:checked + .slider { background-color: var(--theme-brown-darkest); }
              input:checked + .slider:before { transform: translateX(22px); }
            `}</style>

            <div className={`page-container`}>
                <MapDisplay />
                {isMapLoading && <LoadingScreen />}

                {!isMapLoading && (
                  <div className="top-search-bar">
                      <div className="top-search-bar-inner">
                          <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem' }}>
                              <span className="material-symbols-outlined cursor-pointer" style={{ color: 'var(--theme-brown-dark)', fontSize: '32px' }} onClick={() => setSearchModalOpen(true)}>search</span>
                              <div className="search-input-card" onClick={() => setDatePickerOpen(true)}>
                                  <p className="main-text">{locationInfo.city}</p>
                                  <p className="sub-text">{hasRange ? (isSameDay(startDate!, endDate!) ? fmtKoreanDate(startDate!) : `${fmtKoreanDate(startDate!)} - ${fmtKoreanDate(endDate!)}`) : '날짜를 선택하세요'}</p>
                              </div>
                              <div style={{ width: '1px', height: '2rem', backgroundColor: 'var(--theme-brown-light)', margin: '0 0.75rem 0 0' }}></div>
                              <span className="material-symbols-outlined cursor-pointer" style={{ fontSize: '32px', color: 'var(--theme-brown-darkest)' }} onClick={() => setOptionsMenuOpen(true)}>tune</span>
                          </div>
                          <hr style={{ borderTop: '1px solid var(--theme-brown-light)' }} />
                          <div className="filter-buttons no-scrollbar">{filterButtons.map((label) => (<button key={label} className={`filter-button flex items-center gap-1 ${(label === '작품 선택' && isArtworkSelectorVisible) || activeFilter === label ? 'active' : ''}`} onClick={() => handleFilterClick(label)}>
                            {label}
                            {label === '작품 선택' && (
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                {isArtworkSelectorVisible ? 'expand_less' : 'expand_more'}
                              </span>
                            )}
                            </button>))}</div>
                      </div>
                  </div>
                )}
                <ArtworkSelector
                  artworks={userArtworks}
                  selectedArtwork={selectedArtwork}
                  onSelectArtwork={setSelectedArtwork}
                  isVisible={isArtworkSelectorVisible}
                  onAddArtwork={() => setArtworkModalOpen(true)}
                />
                <OptionsMenu
                  isOpen={isOptionsMenuOpen}
                  onClose={() => setOptionsMenuOpen(false)}
                />
                {isDatePickerOpen && (
                    <div className="date-picker-modal-overlay" onClick={() => setDatePickerOpen(false)}>
                        <div className="date-picker-modal-content" onClick={(e) => e.stopPropagation()}>
                            <header className="date-picker-modal-header">날짜 선택<button className="close-btn" onClick={() => setDatePickerOpen(false)}><svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg></button></header>
                            <main className="date-picker-modal-body">
                                <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => gotoMonth(-1)}><svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20"><path d="m15 18-6-6 6-6"></path></svg></button>
                                        <h2 className="text-base font-bold">{headerLabel}</h2>
                                        <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => gotoMonth(1)}><svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20"><path d="m9 18 6-6-6-6"></path></svg></button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1 text-center text-sm text-[var(--theme-brown-dark)] mb-2"><div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div></div>
                                    <div className="grid grid-cols-7 gap-x-0 gap-y-2">{cells.map(({ date: cell, inMonth }) => (<div key={cell.toISOString()} className={getDayClass(cell, inMonth)} onClick={() => onClickDay(cell)}>{cell.getDate()}</div>))}</div>
                                </div>
                            </main>
                            <footer className="date-picker-modal-footer">
                                <button onClick={() => setDatePickerOpen(false)} className="w-full h-12 rounded-lg bg-[var(--theme-brown-darkest)] text-white font-bold text-base transition-colors duration-200 hover:bg-[#3a3229]">선택 완료</button>
                            </footer>
                        </div>
                    </div>
                )}
                <AddArtworkModal
                  isOpen={isArtworkModalOpen}
                  onClose={() => setArtworkModalOpen(false)}
                  onSave={handleSaveArtwork}
                  artworkToEdit={null} // Pass null for adding new artwork
                />
                <SearchModal isOpen={isSearchModalOpen} onClose={() => setSearchModalOpen(false)} onPlaceSelect={handlePlaceSelect} />
                <div className={`transition-opacity duration-300 ease-in-out ${selectedPlace && !isDetailPageVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {selectedPlace && <PlaceDetailPanel place={selectedPlace} onClose={() => setSelectedPlace(null)} onShowDetail={() => setDetailPageVisible(true)} />}
                </div>
                {isDetailPageVisible && selectedPlace && (<LocationDetailPage place={selectedPlace} onClose={() => setDetailPageVisible(false)} />)}
            </div>
        </div>
    );
}

export default function MapPage() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <MapPageContent />
        </Suspense>
    );
}