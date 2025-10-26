// ==========================================
// 테스트 계정 생성 스크립트
// ==========================================
// 실행 방법: node create-test-accounts.js
// ==========================================

const { createClient } = require('@supabase/supabase-js');

// Supabase 설정 (환경변수에서 가져오기)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role Key 필요

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env.local에 추가해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAccounts() {
  console.log('🚀 테스트 계정 생성 시작...\n');

  // 1. 작가/사장님 계정 생성
  console.log('📝 작가 계정 생성 중...');
  const { data: artistData, error: artistError } = await supabase.auth.admin.createUser({
    email: 'user@spacewall.com',
    password: 'user1234!!',
    email_confirm: true,
    user_metadata: {
      full_name: '김작가',
      name: '김작가',
      nickname: '예술가김',
      user_type: 'artist',
      phone: '010-1234-5678',
      website: 'https://instagram.com/artist_kim',
      bio: '현대 미술을 사랑하는 작가입니다.'
    }
  });

  if (artistError) {
    console.error('❌ 작가 계정 생성 실패:', artistError.message);
  } else {
    console.log('✅ 작가 계정 생성 완료!');
    console.log('   이메일: user@spacewall.com');
    console.log('   비밀번호: user1234!!');
    console.log('   User ID:', artistData.user.id);
  }

  console.log('');

  // 2. 손님 계정 생성 (전화번호, 닉네임 없음, 생년월일과 성별 포함)
  console.log('📝 손님 계정 생성 중...');
  const { data: guestData, error: guestError } = await supabase.auth.admin.createUser({
    email: 'guest@spacewall.com',
    password: 'guest1234!!',
    email_confirm: true,
    user_metadata: {
      full_name: '이손님',
      name: '이손님',
      user_type: 'guest',
      dob: '1995-05-15',
      gender: 'female',
      bio: '예술 작품 감상을 좋아합니다.'
    }
  });

  if (guestError) {
    console.error('❌ 손님 계정 생성 실패:', guestError.message);
  } else {
    console.log('✅ 손님 계정 생성 완료!');
    console.log('   이메일: guest@spacewall.com');
    console.log('   비밀번호: guest1234!!');
    console.log('   User ID:', guestData.user.id);
  }

  console.log('\n🎉 테스트 계정 생성 완료!');
  console.log('\n📋 생성된 계정:');
  console.log('1. 작가/사장님: user@spacewall.com / user1234!!');
  console.log('2. 손님: guest@spacewall.com / guest1234!!');
}

createTestAccounts();

