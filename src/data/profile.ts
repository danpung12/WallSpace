import { NotificationToggles } from "../app/components/NotificationSettingsModal";
export interface UserProfile {
  id: string;
  nickname: string; // nickname 필드 추가
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  phone: string;
  address: string;
  isArtist: boolean;
  notificationSettings?: NotificationToggles; // 알림 설정 필드 추가 (선택적)
  // 필요한 다른 프로필 정보 추가
}
