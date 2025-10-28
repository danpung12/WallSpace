import { NotificationToggles } from "../app/components/NotificationSettingsModal";
export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  phone: string;
  avatarUrl: string;
  dob?: string; // 생년월일 (Date of Birth)
  gender?: string; // 성별 (male, female, other)
  user_type?: 'artist' | 'manager'; // 사용자 유형 (작가/사장님)
  notificationSettings: {
    comments: boolean;
    exhibitions: boolean;
    messages: boolean;
  };
  userSettings: {
    darkMode: boolean;
  };
}
