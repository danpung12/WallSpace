import { NotificationToggles } from "../app/components/NotificationSettingsModal";
export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  phone: string;
  avatarUrl: string; // ✅ 추가
  notificationSettings: {
    comments: boolean;
    exhibitions: boolean;
    messages: boolean;
  };
  userSettings: {
    darkMode: boolean;
  };
}
