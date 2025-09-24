// data/locations.ts

// 공간 정보를 위한 새로운 인터페이스
export interface Space {
    name: string;
    imageUrl: string;
    isReserved: boolean;
}

// 후기 데이터 타입을 정의합니다.
export interface Review {
    artistName: string;
    artistImageUrl: string;
    comment: string;
}

// 지점(Location) 데이터 타입을 정의합니다.
export interface Location {
    id: number;
    name: string;
    lat: number;
    lng: number;
    statusText: string;
    statusColor: string;
    images: string[]; // 여러 이미지를 위한 배열
    description: string;
    spaces: Space[]; // 새로운 Space[] 타입으로 변경
    reviews: Review[];
    totalSlots: number; // 전체 예약 가능 슬롯 수
    reservedSlots: number; // 현재 예약된 슬롯 수
    reservationStatus: 'available' | 'reservedByUser' | 'unavailable'; // 나의 예약 상태
}

// 전체 지점 데이터를 정의한 배열입니다.
export const locations: Location[] = [
    {
        id: 1,
        name: '아트스페이스 광교',
        lat: 37.2842,
        lng: 127.0543,
        statusText: '예약 가능',
        statusColor: '#3B82F6',
        images: [
            'https://picsum.photos/id/10/800/600',
            'https://picsum.photos/id/11/800/600',
            'https://picsum.photos/id/12/800/600'
        ],
        description: '호수공원 옆에 위치한 현대적인 건축물로, 자연과 예술이 어우러진 공간입니다. 다양한 기획 전시와 문화 프로그램을 즐길 수 있습니다.',
        spaces: [
            { name: '제 1 전시실', imageUrl: 'https://picsum.photos/id/101/400/300', isReserved: false },
            { name: '멀티룸 A', imageUrl: 'https://picsum.photos/id/102/400/300', isReserved: false },
            { name: '야외 조각 공원', imageUrl: 'https://picsum.photos/id/103/400/300', isReserved: true },
        ],
        reviews: [
            {
                artistName: 'Alexia Ray',
                artistImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
                comment: '자연광이 정말 아름다운 공간입니다. 제 조각 작품들이 훨씬 돋보였어요. 다음 개인전도 여기서 하고 싶네요.',
            },
            {
                artistName: 'Joon Lee',
                artistImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
                comment: '시설이 정말 깨끗하고 관리가 잘 되어있습니다. 특히 야외 공간은 설치 미술에 최적의 장소라고 생각합니다. 강력 추천!',
            }
        ],
        totalSlots: 5,
        reservedSlots: 3,
        reservationStatus: 'available',
    },
    {
        id: 2,
        name: '서울시립미술관',
        lat: 37.5656,
        lng: 126.9753,
        statusText: '문의 필요',
        statusColor: '#F97316',
        images: [
            'https://picsum.photos/id/22/800/600',
            'https://picsum.photos/id/23/800/600'
        ],
        description: '덕수궁 돌담길에 위치한 서울의 대표 미술관입니다. 한국 근현대 미술의 흐름을 한눈에 볼 수 있는 상설 전시가 특징입니다.',
        spaces: [
            { name: '본관 전시실', imageUrl: 'https://picsum.photos/id/201/400/300', isReserved: false },
            { name: '프로젝트 갤러리', imageUrl: 'https://picsum.photos/id/202/400/300', isReserved: true },
        ],
        reviews: [
             {
                artistName: 'Clara Monet',
                artistImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
                comment: '역사와 현대가 공존하는 멋진 곳입니다. 관람객들의 집중도도 매우 높아서 만족스러운 전시를 할 수 있었습니다.',
            }
        ],
        totalSlots: 10,
        reservedSlots: 8,
        reservationStatus: 'reservedByUser',
    },
    {
        id: 3,
        name: '아라리오뮤지엄',
        lat: 37.5729,
        lng: 126.9852,
        statusText: '예약 가능',
        statusColor: '#3B82F6',
        images: [
            'https://picsum.photos/id/24/800/600',
            'https://picsum.photos/id/25/800/600',
            'https://picsum.photos/id/26/800/600',
            'https://picsum.photos/id/27/800/600'
        ],
        description: '오래된 공간을 개조하여 만든 독특한 분위기의 현대미술 갤러리입니다. 국내외 유명 작가들의 실험적인 작품들을 만나볼 수 있습니다.',
        spaces: [
            { name: '1F 갤러리', imageUrl: 'https://picsum.photos/id/301/400/300', isReserved: false },
            { name: '4F 루프탑', imageUrl: 'https://picsum.photos/id/302/400/300', isReserved: false },
            { name: '지하 상영관', imageUrl: 'https://picsum.photos/id/303/400/300', isReserved: false },
        ],
        reviews: [],
        totalSlots: 8,
        reservedSlots: 2,
        reservationStatus: 'available',
    },
    {
        id: 4,
        name: 'D뮤지엄',
        lat: 37.5383,
        lng: 127.0125,
        statusText: '예약 불가',
        statusColor: '#EF4444',
        images: [
            'https://picsum.photos/id/42/800/600',
            'https://picsum.photos/id/43/800/600'
        ],
        description: '젊고 감각적인 전시로 유명한 미술관입니다. 사진, 디자인, 패션 등 다양한 장르의 예술을 경험할 수 있어 많은 사랑을 받고 있습니다.',
        spaces: [
            { name: '스튜디오', imageUrl: 'https://picsum.photos/id/401/400/300', isReserved: true },
            { name: '라운지', imageUrl: 'https://picsum.photos/id/402/400/300', isReserved: true },
        ],
        reviews: [
            {
                artistName: 'Mark Chen',
                artistImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
                comment: '트렌디한 전시를 하기에 이보다 더 좋은 곳은 없습니다. 스태프분들도 매우 전문적이고 친절하셨어요.',
            }
        ],
        totalSlots: 4,
        reservedSlots: 4,
        reservationStatus: 'unavailable',
    },
];