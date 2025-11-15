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
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const supabase = createClient();
        
        // 먼저 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
        }
        
        if (!session) {
          console.log('No session found, redirecting to login');
          router.replace('/login');
          return;
        }
        
        console.log('Session found, user:', session.user?.email);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Auth error:', userError);
          router.replace('/login');
          return;
        }

        if (!user) {
          console.log('No user found, redirecting to login');
          router.replace('/login');
          return;
        }

        console.log('User found:', user.email);

        // 프로필 체크 - 이미 완전한 프로필이 있으면 홈으로
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          // 에러가 있지만 계속 진행 (프로필이 없을 수 있음)
        }

        if (profile && profile.nickname && profile.phone) {
          // 이미 완전한 프로필이 있으면 user_type에 따라 리다이렉트
          if (profile.user_type === 'guest') {
            router.replace('/guest');
          } else {
            router.replace('/');
          }
          return;
        }

        // 기존 프로필 데이터가 있다면 필드 채우기
        if (profile) {
          if (profile.user_type) setUserType(profile.user_type);
          if (profile.gender) setGender(profile.gender);
          if (profile.age_range) setAgeRange(profile.age_range);
          if (profile.nickname) setNickname(profile.nickname);
          if (profile.phone) setPhone(profile.phone);
        }

        setUserData(user);

        // 소셜 로그인에서 받은 정보 자동 채우기
        const metadata = user.user_metadata || {};
        
        console.log('User metadata:', metadata);
        
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
      } catch (error) {
        console.error('Onboarding check error:', error);
        setLoading(false);
        alert('오류가 발생했습니다. 다시 시도해주세요.');
        router.replace('/login');
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const handleComplete = async () => {
    if (!userType) {
      alert('사용자 타입을 선택해주세요.');
      return;
    }
    
    // 게스트인 경우: 성별, 나이대 필수
    if (userType === 'guest') {
      if (!gender) {
        alert('성별을 선택해주세요.');
        return;
      }
      if (!ageRange) {
        alert('나이대를 선택해주세요.');
        return;
      }
    }
    
    // 아티스트인 경우: 닉네임, 휴대폰 번호 필수
    if (userType === 'artist') {
      if (!nickname.trim()) {
        alert('닉네임을 입력해주세요.');
        return;
      }
      if (!phone.trim()) {
        alert('휴대폰 번호를 입력해주세요.');
        return;
      }
      // 휴대폰 번호 형식 검증
      const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
      if (!phoneRegex.test(phone.replace(/[- ]/g, ''))) {
        alert('올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)');
        return;
      }
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const metadata = userData.user_metadata;
      
      // profiles 테이블에 데이터 저장
      const fullName = metadata.full_name || metadata.name || metadata.nickname || userData.email?.split('@')[0];
      const avatarUrl = metadata.avatar_url || metadata.picture || metadata.profile_image || '/default-profile.svg';
      
      // 프로필이 이미 있는지 확인
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.id)
        .single();

      let error;
      
      if (existingProfile) {
        // 기존 프로필 업데이트
        const updateData: any = {
          user_type: userType,
          updated_at: new Date().toISOString(),
        };
        
        // 게스트: 성별, 나이대 저장
        if (userType === 'guest') {
          updateData.gender = gender;
          updateData.age_range = ageRange;
          updateData.nickname = '무명'; // 게스트 기본 닉네임
        }
        
        // 아티스트: 닉네임, 휴대폰 저장
        if (userType === 'artist') {
          updateData.nickname = nickname;
          updateData.phone = phone;
        }
        
        const updateResult = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userData.id);
        error = updateResult.error;
      } else {
        // 새 프로필 생성
        const insertData: any = {
          id: userData.id,
          email: userData.email,
          full_name: fullName,
          avatar_url: avatarUrl,
          user_type: userType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // 게스트: 성별, 나이대 저장
        if (userType === 'guest') {
          insertData.gender = gender;
          insertData.age_range = ageRange;
          insertData.nickname = '무명'; // 게스트 기본 닉네임
        }
        
        // 아티스트: 닉네임, 휴대폰 저장
        if (userType === 'artist') {
          insertData.nickname = nickname;
          insertData.phone = phone;
        }
        
        const insertResult = await supabase.from('profiles').insert(insertData);
        error = insertResult.error;
      }

      if (error) {
        console.error('Profile save error:', error);
        alert('프로필 저장 중 오류가 발생했습니다.');
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

        {/* 게스트 선택 시: 성별, 나이대 */}
        {userType === 'guest' && (
          <>
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
          </>
        )}

        {/* 아티스트 선택 시: 닉네임, 휴대폰 번호 */}
        {userType === 'artist' && (
          <>
            {/* 닉네임 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#3E352F] mb-3">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#EAE5DE] focus:border-[#D2B48C] focus:outline-none transition-all"
                maxLength={20}
              />
            </div>

            {/* 휴대폰 번호 입력 */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-[#3E352F] mb-3">
                휴대폰 번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#EAE5DE] focus:border-[#D2B48C] focus:outline-none transition-all"
                maxLength={13}
              />
              <p className="text-xs text-[#6B5E54] mt-2">하이픈(-)을 포함하여 입력해주세요</p>
            </div>
          </>
        )}

        {/* 완료 버튼 */}
        <button
          onClick={handleComplete}
          disabled={
            saving || 
            !userType || 
            (userType === 'guest' && (!gender || !ageRange)) ||
            (userType === 'artist' && (!nickname.trim() || !phone.trim()))
          }
          className={`w-full h-14 rounded-full font-bold text-white transition-all ${
            saving || 
            !userType || 
            (userType === 'guest' && (!gender || !ageRange)) ||
            (userType === 'artist' && (!nickname.trim() || !phone.trim()))
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

