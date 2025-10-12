export interface Artwork {
  id: number;
  title: string;
  artist: string;
  dimensions: string;
  price: number;
  imageUrl: string;
  alt: string;
}

export const userArtworks: Artwork[] = [
  {
    id: 1,
    title: '푸른 밤의 항해',
    artist: '김선우',
    dimensions: '72.7 x 60.6 cm',
    price: 3500000,
    imageUrl: 'https://images.pexels.com/photos/302804/pexels-photo-302804.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '고요한 밤바다를 항해하는 배를 그린 유화',
  },
  {
    id: 2,
    title: '도시의 일몰',
    artist: '박서진',
    dimensions: '90.9 x 72.7 cm',
    price: 5200000,
    imageUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '해질녘 노을에 물든 도시 풍경을 담은 아크릴화',
  },
  {
    id: 3,
    title: '숲의 속삭임',
    artist: '이하나',
    dimensions: '65.1 x 53.0 cm',
    price: 2800000,
    imageUrl: 'https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '신비로운 안개 낀 숲속의 모습을 표현한 수채화',
  },
  {
    id: 4,
    title: '기억의 조각',
    artist: '최민준',
    dimensions: '53.0 x 45.5 cm',
    price: 4100000,
    imageUrl: 'https://images.pexels.com/photos/1183021/pexels-photo-1183021.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '다양한 색상의 조각들이 어우러진 추상화',
  },
];
