"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
  rejection_reason?: string | null;
}

interface NotificationListModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationListModal({ open, onClose }: NotificationListModalProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState<{
    reason: string;
    title: string;
  } | null>(null);

  // 디버깅: 모달 상태 변경 감지
  useEffect(() => {
    console.log('🚨 showRejectionModal changed:', showRejectionModal);
    console.log('🚨 selectedRejection:', selectedRejection);
  }, [showRejectionModal, selectedRejection]);

  // 알림 목록 가져오기 (open이 true로 변경될 때만)
  useEffect(() => {
    if (open && notifications.length === 0) {
      // 처음 열 때만 fetch
      fetchNotifications();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // 읽은 알림 자동 삭제하고 읽지 않은 알림만 가져오기
      const response = await fetch('/api/notifications?cleanupRead=true');
      if (response.ok) {
        const data = await response.json();
        console.log('🔔 === NOTIFICATIONS DEBUG ===');
        console.log('Total notifications:', data.length);
        console.log('All notifications:', data);
        data.forEach((n: any, idx: number) => {
          console.log(`Notification ${idx}:`, {
            id: n.id,
            type: n.type,
            title: n.title,
            rejection_reason: n.rejection_reason,
            hasRejectionReason: !!n.rejection_reason
          });
        });
        console.log('🔔 === END DEBUG ===');
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // 알림 클릭 (읽음 처리 후 목록에서 제거 + 페이지 이동)
  const handleNotificationClick = async (notification: Notification) => {
    try {
      console.log('🖱️ === CLICK DEBUG ===');
      console.log('Clicked notification:', notification);
      console.log('Type:', notification.type);
      console.log('Type check result:', notification.type === 'reservation_cancelled');
      console.log('Rejection reason:', notification.rejection_reason);
      console.log('Has rejection reason:', !!notification.rejection_reason);
      console.log('Both conditions:', notification.type === 'reservation_cancelled' && !!notification.rejection_reason);
      
      // 거절 알림이고 거절 사유가 있으면 팝업 표시
      if (notification.type === 'reservation_cancelled' && notification.rejection_reason) {
        console.log('✅✅✅ OPENING REJECTION MODAL!');
        setSelectedRejection({
          reason: notification.rejection_reason,
          title: notification.title || '예약이 거절되었습니다'
        });
        setShowRejectionModal(true);
        console.log('Modal state set to true');
        
        // 읽음 처리 및 삭제
        if (!notification.is_read) {
          await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: notification.id }),
          });
        }
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        fetch(`/api/notifications?id=${notification.id}`, {
          method: 'DELETE',
        }).catch(error => {
          console.error('Failed to delete notification:', error);
        });
        return;
      }
      
      // 읽음 처리
      if (!notification.is_read) {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification.id }),
        });
      }
      
      // 로컬 state에서 즉시 제거 (UI 반응 빠르게)
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      
      // 백그라운드에서 삭제 (비동기)
      fetch(`/api/notifications?id=${notification.id}`, {
        method: 'DELETE',
      }).catch(error => {
        console.error('Failed to delete notification:', error);
      });

      // 페이지 이동
      if (notification.related_id) {
        let path = '';
        if (notification.type === 'reservation_request') {
          // 매니저: 예약 요청 상세
          path = `/manager-booking-approval?id=${notification.related_id}`;
        } else if (notification.type === 'reservation_status_update' || notification.type === 'reservation_confirmed') {
          // 작가: 전시중 상세 페이지
          path = `/exhibition-detail?id=${notification.related_id}`;
        } else if (notification.type === 'reservation_cancelled') {
          // 작가: 예약 상세
          path = `/bookingdetail?id=${notification.related_id}`;
        }
        if (path) {
          router.push(path);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
      // 에러가 발생해도 모달은 닫기
      onClose();
    }
  };

  // 알림 삭제
  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // 시간 포맷
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    if (diff < 10080) return `${Math.floor(diff / 1440)}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 알림 타입별 아이콘
  const getIcon = (type: string) => {
    switch (type) {
      case 'reservation_request':
        return '📬';
      case 'reservation_confirmed':
        return '✅';
      case 'reservation_cancelled':
        return '❌';
      default:
        return '🔔';
    }
  };

  return (
    <>
      {/* 모바일: 전체 화면 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 flex items-start justify-center pt-16 lg:hidden"
          onClick={onClose}
        >
        <div
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100">알림</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-72px)] custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                notifications_off
              </span>
              <p className="text-gray-500 dark:text-gray-400">알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    console.log('🖱️ Div clicked!');
                    handleNotificationClick(notification);
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => console.log('📍 Content clicked!')}>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-[#3D2C1D] dark:text-gray-100 text-sm">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatTime(notification.created_at)}
                        </span>
                        {notification.type === 'reservation_cancelled' && notification.rejection_reason && (
                          <span className="text-xs text-[#D2B48C] dark:text-[#E8C8A0] font-medium">
                            자세히 보기
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
        </div>
      )}

      {/* PC: 중앙 모달 */}
      {open && (
        <div className="hidden lg:block">
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-[998] bg-black/50"
            onClick={onClose}
          />
          
          {/* 드롭다운 메뉴 */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-8rem)] overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100">알림</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-xl">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-12rem)] custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                  notifications_off
                </span>
                <p className="text-gray-500 dark:text-gray-400">알림이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[#3D2C1D] dark:text-gray-100 text-sm">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                          {notification.type === 'reservation_cancelled' && notification.rejection_reason && (
                            <span className="text-xs text-[#D2B48C] dark:text-[#E8C8A0] font-medium">
                              자세히 보기
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* 거절 사유 팝업 */}
      {showRejectionModal && selectedRejection && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] px-4"
          onClick={() => {
            setShowRejectionModal(false);
            setSelectedRejection(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100">
                {selectedRejection.title}
              </h3>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedRejection(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-[#5D4E3E] dark:text-gray-300 mb-2">
                거절 사유
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-[#3D2C1D] dark:text-gray-100 leading-relaxed">
                  {selectedRejection.reason}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowRejectionModal(false);
                setSelectedRejection(null);
                onClose();
              }}
              className="w-full bg-[#D2B48C] dark:bg-[#E8C8A0] text-white font-semibold py-3 rounded-lg hover:bg-[#C19A6B] dark:hover:bg-[#D2B48C] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}

