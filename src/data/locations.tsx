// data/locations.ts

// 공간 정보를 위한 새로운 인터페이스
export interface Space {
    id?: string; // UUID from database (optional for compatibility)
    name: string;
    imageUrl: string;
    isReserved: boolean;
    width: number;
    height: number;
    price: number; // 하루 당 비용
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
    category: string; // 카테고리 필드 추가
    lat: number;
    lng: number;
    address: string;
    phone: string;
    snsUrls: string[];
    options: {
        parking: boolean;
        pets: boolean;
        twentyFourHours: boolean;
    };
    tags: string[];
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
        name: '아트 스페이스 광교',
        category: '갤러리',
        lat: 37.2842,
        lng: 127.0543,
        address: '수원시 영통구 광교중앙로 140',
        phone: '031-228-3800',
        snsUrls: ['https://www.instagram.com/suwon_art_space/'],
        options: {
            parking: true,
            pets: false,
            twentyFourHours: false,
        },
        tags: ['따뜻한', '자연스러운', '모던한', '친근한'],
        statusText: '예약 가능',
        statusColor: '#3B82F6',
        images: [
            'https://picsum.photos/id/10/800/600',
            'https://picsum.photos/id/11/800/600',
            'https://picsum.photos/id/12/800/600'
        ],
        description: '호수공원 옆에 위치한 현대적인 건축물로, 자연과 예술이 어우러진 공간입니다. 다양한 기획 전시와 문화 프로그램을 즐길 수 있습니다.',
        spaces: [
            { name: '제 1 전시실', imageUrl: 'https://picsum.photos/id/101/400/300', isReserved: false, width: 1000, height: 500, price: 250000 },
            { name: '멀티룸 A', imageUrl: 'https://picsum.photos/id/102/400/300', isReserved: false, width: 500, height: 300, price: 150000 },
            { name: '야외 조각 공원', imageUrl: 'https://picsum.photos/id/103/400/300', isReserved: true, width: 2000, height: 2000, price: 500000 },
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
        category: '갤러리',
        lat: 37.5656,
        lng: 126.9753,
        address: '서울 중구 덕수궁길 61',
        phone: '02-2124-8800',
        snsUrls: ['https://www.instagram.com/seoulmuseumofart/'],
        options: {
            parking: true,
            pets: false,
            twentyFourHours: false,
        },
        tags: ['우아한', '클래식한', '고급스러운', '로맨틱한'],
        statusText: '문의 필요',
        statusColor: '#F97316',
        images: [
            'https://picsum.photos/id/22/800/600',
            'https://picsum.photos/id/23/800/600'
        ],
        description: '덕수궁 돌담길에 위치한 서울의 대표 미술관입니다. 한국 근현대 미술의 흐름을 한눈에 볼 수 있는 상설 전시가 특징입니다.',
        spaces: [
            { name: '본관 전시실', imageUrl: 'https://picsum.photos/id/201/400/300', isReserved: false, width: 1200, height: 600, price: 300000 },
            { name: '프로젝트 갤러리', imageUrl: 'https://picsum.photos/id/202/400/300', isReserved: true, width: 400, height: 400, price: 180000 },
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
        category: '갤러리',
        lat: 37.5729,
        lng: 126.9852,
        address: '서울 종로구 율곡로 83',
        phone: '02-736-5700',
        snsUrls: ['https://www.instagram.com/arariomuseum/'],
        options: {
            parking: false,
            pets: false,
            twentyFourHours: false,
        },
        tags: ['독특한', '힙한', '감각적인', '트렌디한'],
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
            { name: '1F 갤러리', imageUrl: 'https://picsum.photos/id/301/400/300', isReserved: false, width: 600, height: 400, price: 200000 },
            { name: '4F 루프탑', imageUrl: 'https://picsum.photos/id/302/400/300', isReserved: false, width: 700, height: 500, price: 280000 },
            { name: '지하 상영관', imageUrl: 'https://picsum.photos/id/303/400/300', isReserved: false, width: 300, height: 200, price: 120000 },
        ],
        reviews: [
            {
                artistName: 'Sera Kim',
                artistImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
                comment: '공간 자체가 하나의 예술 작품 같아요. 설치 미술 전시를 했는데, 공간과 작품이 잘 어우러져서 시너지가 났습니다.',
            }
        ],
        totalSlots: 8,
        reservedSlots: 2,
        reservationStatus: 'available',
    },
    {
        id: 4,
        name: 'D뮤지엄',
        category: '갤러리',
        lat: 37.5383,
        lng: 127.0125,
        address: '서울 성동구 왕십리로 83-21',
        phone: '070-5097-0020',
        snsUrls: ['https://www.instagram.com/dmuseum.seoul/'],
        options: {
            parking: true,
            pets: false,
            twentyFourHours: false,
        },
        tags: ['젊은', '활기찬', '트렌디한', '감각적인'],
        statusText: '예약 불가',
        statusColor: '#EF4444',
        images: [
            'https://picsum.photos/id/42/800/600',
            'https://picsum.photos/id/43/800/600'
        ],
        description: '젊고 감각적인 전시로 유명한 미술관입니다. 사진, 디자인, 패션 등 다양한 장르의 예술을 경험할 수 있어 많은 사랑을 받고 있습니다.',
        spaces: [
            { name: '스튜디오', imageUrl: 'https://picsum.photos/id/401/400/300', isReserved: true, width: 800, height: 500, price: 350000 },
            { name: '라운지', imageUrl: 'https://picsum.photos/id/402/400/300', isReserved: true, width: 500, height: 500, price: 220000 },
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
    // ---
    // 아래 데이터는 home/page.tsx의 추천 장소 데이터와 동기화됩니다.
    // '국립현대미술관 서울'과 '페이지스 바이 페이지'가 추가되었습니다.
    // '아트스페이스 광교'는 이미 id:1 로 존재하므로 중복 추가하지 않았습니다.
    // ---
    {
        id: 5, // 기존 데이터와 겹치지 않는 고유 ID
        name: '국립현대미술관 서울',
        category: '문화회관',
        lat: 37.5796,
        lng: 126.9804,
        address: '서울 종로구 삼청로 30',
        phone: '02-3701-9500',
        snsUrls: ['https://www.instagram.com/mmca.seoul/'],
        options: {
            parking: true,
            pets: false,
            twentyFourHours: false,
        },
        tags: ['웅장한', '정중한', '전문적인', '안정적인'],
        statusText: '예약 가능',
        statusColor: '#3B82F6',
        images: [
            'https://picsum.photos/id/10/800/600',
            'https://picsum.photos/id/11/800/600',
            'https://picsum.photos/id/12/800/600'
        ],
        description: '서울의 중심에 위치한 국립현대미술관은 한국 현대미술의 현재와 미래를 조망하는 다양한 전시를 선보입니다.',
        spaces: [
             { name: '제 1 전시실', imageUrl: 'https://picsum.photos/id/501/400/300', isReserved: false, width: 1500, height: 800, price: 400000 },
             { name: '디지털 라이브러리', imageUrl: 'https://picsum.photos/id/502/400/300', isReserved: false, width: 700, height: 400, price: 250000 },
        ],
        reviews: [
            {
                artistName: 'Minjun Park',
                artistImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026709d',
                comment: '접근성이 좋고 시설이 훌륭합니다. 특히 디지털 라이브러리는 미디어 아트 전시에 최적의 환경을 제공해주었습니다.',
            }
        ],
        totalSlots: 12,
        reservedSlots: 5,
        reservationStatus: 'available',
    },
    {
        id: 6, // 기존 데이터와 겹치지 않는 고유 ID
        name: '페이지스 바이 페이지',
        category: '카페',
        lat: 37.5495,
        lng: 126.9209,
        address: '서울 마포구 월드컵로14길 10',
        phone: '02-3144-0726',
        snsUrls: ['https://www.instagram.com/pages_by.pages/'],
        options: {
            parking: false,
            pets: true,
            twentyFourHours: false,
        },
        tags: ['아늑한', '따뜻한', '편안한', '친근한'],
        statusText: '문의 필요',
        statusColor: '#F97316',
        images: [
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2106&auto=format&fit=crop',
        ],
        description: '아늑한 분위기의 북카페로, 독립 서적과 함께 맛있는 커피를 즐길 수 있는 특별한 공간입니다.',
        spaces: [
            { name: '메인 홀', imageUrl: 'https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', isReserved: false, width: 300, height: 250, price: 100000 },
        ],
        reviews: [
            {
                artistName: 'Yuna Choi',
                artistImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026710d',
                comment: '아늑하고 따뜻한 분위기에서 소규모 전시를 열기에 완벽한 장소입니다. 책과 예술이 함께하는 특별한 경험을 할 수 있었어요.',
            }
        ],
        totalSlots: 5,
        reservedSlots: 2,
        reservationStatus: 'available',
    }
];