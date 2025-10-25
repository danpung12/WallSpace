'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type UserType = 'artist' | 'guest' | null;
type Gender = 'male' | 'female' | 'other' | null;
type AgeRange = '10s' | '20s' | '30s' | '40s' | '50s' | '60s+' | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [gender, setGender] = useState<Gender>(null);
  const [ageRange, setAgeRange] = useState<AgeRange>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      // 이미 프로필이 있으면 홈으로
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        // 이미 프로필이 있으면 user_type에 따라 리다이렉트
        if (profile.user_type === 'guest') {
          router.replace('/guest');
        } else {
          router.replace('/');
        }
        return;
      }

      setUserData(user);

      // 소셜 로그인에서 받은 정보 자동 채우기
      const metadata = user.user_metadata;
      
      // 성별 자동 채우기 (카카오/네이버)
      if (metadata.gender) {
        const genderMap: Record<string, Gender> = {
          'male': 'male',
          'female': 'female',
          'M': 'male',
          'F': 'female',
        };
        setGender(genderMap[metadata.gender] || null);
      }

      // 나이대 자동 채우기 (카카오)
      if (metadata.age_range) {
        // 카카오: "20~29" 형식
        const ageRangeMap: Record<string, AgeRange> = {
          '0~9': '10s',
          '10~14': '10s',
          '15~19': '10s',
          '20~29': '20s',
          '30~39': '30s',
          '40~49': '40s',
          '50~59': '50s',
          '60~': '60s+',
        };
        setAgeRange(ageRangeMap[metadata.age_range] || null);
      }
      // 네이버 나이대
      else if (metadata.age) {
        const age = parseInt(metadata.age);
        if (age < 20) setAgeRange('10s');
        else if (age < 30) setAgeRange('20s');
        else if (age < 40) setAgeRange('30s');
        else if (age < 50) setAgeRange('40s');
        else if (age < 60) setAgeRange('50s');
        else setAgeRange('60s+');
      }

      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [router]);

  const handleComplete = async () => {
    if (!userType) {
      alert('사용자 타입을 선택해주세요.');
      return;
    }
    if (!gender) {
      alert('성별을 선택해주세요.');
      return;
    }
    if (!ageRange) {
      alert('나이대를 선택해주세요.');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const metadata = userData.user_metadata;
      
      // profiles 테이블에 데이터 저장
      const fullName = metadata.full_name || metadata.name || metadata.nickname || userData.email?.split('@')[0];
      const avatarUrl = metadata.avatar_url || metadata.picture || metadata.profile_image || '/default-profile.svg';
      
      const { error } = await supabase.from('profiles').insert({
        id: userData.id,
        email: userData.email,
        full_name: fullName,
        nickname: '무명', // 기본 필명
        avatar_url: avatarUrl, // 기본 프로필 사진
        user_type: userType,
        gender: gender,
        age_range: ageRange,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Profile creation error:', error);
        alert('프로필 생성 중 오류가 발생했습니다.');
        setSaving(false);
        return;
      }

      // user_type에 따라 다른 페이지로 리다이렉트
      if (userType === 'guest') {
        router.replace('/guest');
      } else {
        router.replace('/');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      alert('오류가 발생했습니다.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1EC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#3E352F] mb-2">환영합니다! 👋</h1>
        <p className="text-[#6B5E54] mb-8">몇 가지 정보만 입력하면 시작할 수 있어요</p>

        {/* 사용자 타입 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#3E352F] mb-3">
            사용자 타입 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType('artist')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userType === 'artist'
                  ? 'border-[#D2B48C] bg-[#D2B48C]/10'
                  : 'border-[#EAE5DE] hover:border-[#D2B48C]/50'
              }`}
            >
              <div className="text-2xl mb-1">🎨</div>
              <div className="font-semibold text-[#3E352F]">아티스트</div>
              <div className="text-xs text-[#6B5E54] mt-1">작품을 전시합니다</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('guest')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userType === 'guest'
                  ? 'border-[#D2B48C] bg-[#D2B48C]/10'
                  : 'border-[#EAE5DE] hover:border-[#D2B48C]/50'
              }`}
            >
              <div className="text-2xl mb-1">👤</div>
              <div className="font-semibold text-[#3E352F]">게스트</div>
              <div className="text-xs text-[#6B5E54] mt-1">작품을 감상합니다</div>
            </button>
          </div>
        </div>

        {/* 성별 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#3E352F] mb-3">
            성별 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'male', label: '남성', emoji: '👨' },
              { value: 'female', label: '여성', emoji: '👩' },
              { value: 'other', label: '기타', emoji: '🙂' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGender(option.value as Gender)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  gender === option.value
                    ? 'border-[#D2B48C] bg-[#D2B48C]/10'
                    : 'border-[#EAE5DE] hover:border-[#D2B48C]/50'
                }`}
              >
                <div className="text-xl mb-1">{option.emoji}</div>
                <div className="text-sm font-medium text-[#3E352F]">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 나이대 선택 */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-[#3E352F] mb-3">
            나이대 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '10s', label: '10대' },
              { value: '20s', label: '20대' },
              { value: '30s', label: '30대' },
              { value: '40s', label: '40대' },
              { value: '50s', label: '50대' },
              { value: '60s+', label: '60대+' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAgeRange(option.value as AgeRange)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  ageRange === option.value
                    ? 'border-[#D2B48C] bg-[#D2B48C]/10'
                    : 'border-[#EAE5DE] hover:border-[#D2B48C]/50'
                }`}
              >
                <div className="text-sm font-medium text-[#3E352F]">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 완료 버튼 */}
        <button
          onClick={handleComplete}
          disabled={saving || !userType || !gender || !ageRange}
          className={`w-full h-14 rounded-full font-bold text-white transition-all ${
            saving || !userType || !gender || !ageRange
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#D2B48C] hover:bg-[#A89587]'
          }`}
        >
          {saving ? '처리 중...' : '시작하기'}
        </button>
      </div>
    </div>
  );
}

