import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/data/profile';

// API Route 내부에서 mockUserProfile 관리
let mockUserProfile: UserProfile = {
  id: "user-123",
  nickname: "Selena",
  name: "홍길동",
  email: "artist@example.com",
  avatarUrl: "https://i.pravatar.cc/150?img=68",
  bio: "열정적인 아티스트입니다. 다양한 공간에서 저의 작품을 선보이고 싶습니다.",
  phone: "010-1234-5678",
  address: "서울시 강남구 역삼동",
  isArtist: true,
  notificationSettings: {
    booking: true,
    space: false,
    promo: true,
    news: false,
  },
};

export async function GET() {
  return NextResponse.json(mockUserProfile);
}

export async function PUT(req: NextRequest) {
  const updatedProfile: UserProfile = await req.json();

  // 간단한 유효성 검사 (실제 환경에서는 더 철저하게)
  if (!updatedProfile || !updatedProfile.id) {
    return NextResponse.json({ message: "Invalid profile data" }, { status: 400 });
  }

  // mockUserProfile 업데이트
  // 실제로는 데이터베이스에 저장하는 로직이 들어갑니다.
  mockUserProfile = { ...mockUserProfile, ...updatedProfile };

  return NextResponse.json(mockUserProfile);
}
