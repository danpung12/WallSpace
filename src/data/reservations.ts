export type Reservation = {
  id: string;
  artworkTitle: string;
  artistName: string;
  storeName: string;
  location: string;
  period: string; // This can be deprecated if we use startDate and endDate
  startDate: string; // ISO 8601 format e.g., "2025-10-20"
  endDate: string; // ISO 8601 format e.g., "2025-10-27"
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  image: string;
  price: number; // Daily rental price
  artwork: { // Nested object for artwork details
    title: string;
    artist: string;
    imageUrl: string;
    price: number;
  };
};

export const reservationsData: Reservation[] = [
  { 
    id: '#12345', 
    artworkTitle: '작품 3', 
    artistName: '김수민', 
    storeName: '스티치 카페 성수점',
    location: '서울 성동구 아차산로 12',
    period: '2025년 10월 20일 ~ 10월 27일',
    startDate: '2025-10-20',
    endDate: '2025-10-30', // 11 days total
    status: 'confirmed', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1hI9oEpCk1Pbvkp_kEABsMwq3UiQpEXgkQAjoKq3zsxh-1zCYNITVvuXmpNpLF9VoSrWCoNDyoRdxjyqMpDNrTBUpb1pjkgZe5LWlm7gnI0w_y_Q1ei5WNLT30zg7ppiyZf-7lqwmBeZH_SBYUF2jG9N9RewMBMkuchWyUez73Nu8RP_KzNk9qWCHKfu8BIpEzj-f2AZxHz8T-Bo5p7miSGc16CS856SoAquozkXt_T7iQLzYApp90MHErVPMIiIin7npi3pLCGH9',
    price: 250000,
    artwork: {
      title: '작품 3',
      artist: '김수민',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1hI9oEpCk1Pbvkp_kEABsMwq3UiQpEXgkQAjoKq3zsxh-1zCYNITVvuXmpNpLF9VoSrWCoNDyoRdxjyqMpDNrTBUpb1pjkgZe5LWlm7gnI0w_y_Q1ei5WNLT30zg7ppiyZf-7lqwmBeZH_SBYUF2jG9N9RewMBMkuchWyUez73Nu8RP_KzNk9qWCHKfu8BIpEzj-f2AZxHz8T-Bo5p7miSGc16CS856SoAquozkXt_T7iQLzYApp90MHErVPMIiIin7npi3pLCGH9',
      price: 250000
    }
  },
  { 
    id: '#67890', 
    artworkTitle: '작품 2', 
    artistName: '이현우', 
    storeName: '스티치 라운지 홍대점',
    location: '서울 마포구 와우산로 21',
    period: '2025년 11월 1일 ~ 11월 7일',
    startDate: '2025-11-01',
    endDate: '2025-11-07',
    status: 'pending', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrqrYmsEJa0Sd-hyxHCUnQfvGlC17-VRZFqnO2KJssC_FYvOvejVsv7MDblTqQo6GXa4feOkp2Q9XqoTkiTS3ieGWS7NEEh4j3q6Z4-eyXJ8dljd-kcVFiAIawmbP_BuTVX12EfItqKhwuqpNyubC79EynA2WMfBUv8XdIKZ04xV24RvUJ9eSGjWOP0XGLSb6t6Q6Zf8kMWVGlOT2lftAg6ni-rUQlECOCpekjm8vYjB8hR4N7amKCJyQx-YHmgbj3wXX_wF-XWZU4',
    price: 180000,
    artwork: {
      title: '작품 2',
      artist: '이현우',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrqrYmsEJa0Sd-hyxHCUnQfvGlC17-VRZFqnO2KJssC_FYvOvejVsv7MDblTqQo6GXa4feOkp2Q9XqoTkiTS3ieGWS7NEEh4j3q6Z4-eyXJ8dljd-kcVFiAIawmbP_BuTVX12EfItqKhwuqpNyubC79EynA2WMfBUv8XdIKZ04xV24RvUJ9eSGjWOP0XGLSb6t6Q6Zf8kMWVGlOT2lftAg6ni-rUQlECOCpekjm8vYjB8hR4N7amKCJyQx-YHmgbj3wXX_wF-XWZU4',
      price: 180000
    }
  },
  { 
    id: '#11223', 
    artworkTitle: '작품 1', 
    artistName: '박지영', 
    storeName: '스티치 카페 성수점',
    location: '서울 성동구 아차산로 12',
    period: '2025년 9월 15일 ~ 9월 22일',
    startDate: '2025-09-15',
    endDate: '2025-09-22',
    status: 'completed', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXN0jW9dNacMfUY9Z3bjC1_xCiS15tb-fbfkWAYsD4VZCqx2nvEDgCN5wP6FL6OejGRVn4Eulfteh41r_bOXziuW42R0g6AU-l7dKL7n-hgiMCjmU9WFRSYH6kezy3-ftseDg8p36pj2mdHxEKF8_zZh6pP-sJ__iaMHZw7Xs5ohv9UbA_IWKWQfo4SMO1xKqEm0DFPbSLowGMZ3sE6YCvwt7YrBBV4vaYdyCpTJrFTrJzQRbocN3Z77WgS2xiA_y7q-hEYaBbEiiG',
    price: 320000,
    artwork: {
      title: '작품 1',
      artist: '박지영',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXN0jW9dNacMfUY9Z3bjC1_xCiS15tb-fbfkWAYsD4VZCqx2nvEDgCN5wP6FL6OejGRVn4Eulfteh41r_bOXziuW42R0g6AU-l7dKL7n-hgiMCjmU9WFRSYH6kezy3-ftseDg8p36pj2mdHxEKF8_zZh6pP-sJ__iaMHZw7Xs5ohv9UbA_IWKWQfo4SMO1xKqEm0DFPbSLowGMZ3sE6YCvwt7YrBBV4vaYdyCpTJrFTrJzQRbocN3Z77WgS2xiA_y7q-hEYaBbEiiG',
      price: 320000
    }
  },
];
