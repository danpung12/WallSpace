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

  // 어떤 정보를 사용자에게 물어봐야 하는지 결정하는 상태
  const [needsUserType, setNeedsUserType] = useState(true);
  const [needsGender, setNeedsGender] = useState(true);
  const [needsAgeRange, setNeedsAgeRange] = useState(true);
  const [needsNickname, setNeedsNickname] = useState(true);
  const [needsPhone, setNeedsPhone] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace('/login');
          return;
        }

        setUserData(user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const metadata = user.user_metadata || {};

        // 1. 사용자 타입 결정
        if (profile?.user_type) {
          setUserType(profile.user_type);
          setNeedsUserType(false);
        }

        // 2. 성별 결정
        let finalGender: Gender = null;
        if (profile?.gender) {
          finalGender = profile.gender;
        } else if (metadata.gender) {
          const genderMap: Record<string, Gender> = {
            'male': 'male', 'female': 'female', 'M': 'male', 'F': 'female',
          };
          finalGender = genderMap[metadata.gender] || null;
        }
        if (finalGender) {
          setGender(finalGender);
          setNeedsGender(false);
        }

        // 3. 나이대 결정
        let finalAgeRange: AgeRange = null;
        if (profile?.age_range) {
          finalAgeRange = profile.age_range;
        } else if (metadata.age_range) { // 카카오
          const ageRangeMap: Record<string, AgeRange> = {
            '10~19': '10s', '20~29': '20s', '30~39': '30s',
            '40~49': '40s', '50~59': '50s', '60~': '60s+',
          };
          finalAgeRange = ageRangeMap[metadata.age_range] || null;
        } else if (metadata.age) { // 네이버 (e.g., "20-29")
          const ageStr = metadata.age.split('-')[0];
          const age = parseInt(ageStr);
          if (age < 20) finalAgeRange = '10s';
          else if (age < 30) finalAgeRange = '20s';
          else if (age < 40) finalAgeRange = '30s';
          else if (age < 50) finalAgeRange = '40s';
          else if (age < 60) finalAgeRange = '50s';
          else finalAgeRange = '60s+';
        }
        if (finalAgeRange) {
          setAgeRange(finalAgeRange);
          setNeedsAgeRange(false);
        }
        
        // 4. 아티스트 정보 결정
        if (profile?.nickname) {
            setNickname(profile.nickname);
            if(profile.nickname !== '무명') setNeedsNickname(false);
        }
        if (profile?.phone) {
            setPhone(profile.phone);
            setNeedsPhone(false);
        }

        // 프로필이 이미 완성되었는지 최종 확인
        if (profile?.user_type) {
            const isGuestComplete = profile.user_type === 'guest' && finalGender && finalAgeRange;
            const isArtistComplete = profile.user_type === 'artist' && profile.nickname && profile.phone;
            if (isGuestComplete) {
                router.replace('/guest');
                return;
            }
            if (isArtistComplete) {
                router.replace('/');
                return;
            }
        }

        setLoading(false);
      } catch (error) {
        console.error('Onboarding check error:', error);
        setLoading(false);
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

    if (userType === 'guest' && (!gender || !ageRange)) {
      alert('게스트 정보(성별, 나이대)를 모두 입력해주세요.');
      return;
    }

    if (userType === 'artist' && (!nickname.trim() || !phone.trim())) {
      alert('아티스트 정보(닉네임, 휴대폰 번호)를 모두 입력해주세요.');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const updateData: any = {
        user_type: userType,
        updated_at: new Date().toISOString(),
      };

      if (userType === 'guest') {
        updateData.gender = gender;
        updateData.age_range = ageRange;
        if (!nickname) updateData.nickname = '무명';
      } else {
        updateData.nickname = nickname;
        updateData.phone = phone;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userData.id);

      if (error) throw error;

      if (userType === 'guest') {
        router.replace('/guest');
      } else {
        router.replace('/');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      alert('프로필 저장 중 오류가 발생했습니다.');
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

        {needsUserType && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#3E352F] mb-3">
              사용자 타입 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setUserType('artist')} className={`p-4 rounded-xl border-2 transition-all ${userType === 'artist' ? 'border-[#D2B48C] bg-[#D2B48C]/10' : 'border-[#EAE5DE] hover:border-[#D2B48C]/50'}`}>
                    <div className="text-2xl mb-1">🎨</div>
                    <div className="font-semibold text-[#3E352F]">아티스트</div>
                    <div className="text-xs text-[#6B5E54] mt-1">작품을 전시합니다</div>
                </button>
                <button type="button" onClick={() => setUserType('guest')} className={`p-4 rounded-xl border-2 transition-all ${userType === 'guest' ? 'border-[#D2B48C] bg-[#D2B48C]/10' : 'border-[#EAE5DE] hover:border-[#D2B48C]/50'}`}>
                    <div className="text-2xl mb-1">👤</div>
                    <div className="font-semibold text-[#3E352F]">게스트</div>
                    <div className="text-xs text-[#6B5E54] mt-1">작품을 감상합니다</div>
                </button>
            </div>
          </div>
        )}

        {userType === 'guest' && (
          <>
            {needsGender && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#3E352F] mb-3">성별 <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {[{ value: 'male', label: '남성', emoji: '👨' }, { value: 'female', label: '여성', emoji: '👩' }, { value: 'other', label:[object Object]} type="button" onClick={() => setGender(option.value as Gender)} className={`p-3 rounded-xl border-2 transition-all ${gender === option.value ? 'border-[#D2B48C] bg-[#D2B48C]/10' : 'border-[#EAE5DE] hover:border-[#D2B48C]/50'}`}>
                      <div className="text-xl mb-1">{option.emoji}</div>
                      <div className="text-sm font-medium text-[#3E352F]">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needsAgeRange && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-[#3E352F] mb-3">나이대 <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {[{ value: '10s', label: '10대' }, { value: '20s', label: '20대' }, { value: '30s', label: '30대' }, { value: '40s', label: '40대' }, { value: '50s', label: '50대' }, { value: '60s+', label: '60대+' }].map((option) => (
                    <button key={option.value} type="button" onClick={() => setAgeRange(option.value as AgeRange)} className={`p-3 rounded-xl border-2 transition-all ${ageRange === option.value ? 'border-[#D2B48C] bg-[#D2B48C]/10' : 'border-[#EAE5DE] hover:border-[#D2B48C]/50'}`}>
                      <div className="text-sm font-medium text-[#3E352F]">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {userType === 'artist' && (
          <>
            {needsNickname && (
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#3E352F] mb-3">닉네임 <span className="text-red-500">*</span></label>
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임을 입력하세요" className="w-full px-4 py-3 rounded-xl border-2 border-[#EAE5DE] focus:border-[#D2B48C] focus:outline-none transition-all" maxLength={20} />
                </div>
            )}

            {needsPhone && (
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-[#3E352F] mb-3">휴대폰 번호 <span className="text-red-500">*</span></label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" className="w-full px-4 py-3 rounded-xl border-2 border-[#EAE5DE] focus:border-[#D2B48C] focus:outline-none transition-all" maxLength={13} />
                    <p className="text-xs text-[#6B5E54] mt-2">하이픈(-)을 포함하여 입력해주세요</p>
                </div>
            )}
          </>
        )}

        <button onClick={handleComplete} disabled={saving || !userType || (userType === 'guest' && (!gender || !ageRange)) || (userType === 'artist' && (!nickname.trim() || !phone.trim()))} className={`w-full h-14 rounded-full font-bold text-white transition-all ${saving || !userType || (userType === 'guest' && (!gender || !ageRange)) || (userType === 'artist' && (!nickname.trim() || !phone.trim())) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#D2B48C] hover:bg-[#A89587]'}`}>
          {saving ? '처리 중...' : '시작하기'}
        </button>
      </div>
    </div>
  );
}
