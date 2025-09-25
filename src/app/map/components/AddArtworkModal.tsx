'use client';

export default function AddArtworkModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="date-picker-modal-overlay" onClick={onClose}>
      <div
        className="date-picker-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="date-picker-modal-header">
          작품 추가
          <button className="close-btn" onClick={onClose}>
            <svg
              height="24"
              width="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main
          className="date-picker-modal-body"
          style={{
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p className="text-theme-brown-dark">
            작품을 추가하는 폼이 여기에 표시됩니다.
          </p>
        </main>
        <footer className="date-picker-modal-footer">
          <button
            className="w-full h-12 rounded-lg bg-[var(--theme-brown-darkest)] text-white font-bold text-base transition-colors duration-200 hover:bg-[#3a3229]"
            onClick={onClose}
          >
            저장
          </button>
        </footer>
      </div>
    </div>
  );
}
