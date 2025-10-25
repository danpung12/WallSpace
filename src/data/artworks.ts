export interface Artwork {
  id: number;
  title: string;
  artist: string;
  dimensions: string;
  price: number;
  imageUrl: string;
  alt: string;
  description?: string;
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
    description: '깊은 밤, 별빛이 반짝이는 고요한 바다 위를 홀로 항해하는 배의 모습을 담았습니다. 어둠 속에서도 희망의 빛을 잃지 않고 나아가는 여정을 유화로 표현했습니다.',
  },
  {
    id: 2,
    title: '도시의 일몰',
    artist: '박서진',
    dimensions: '90.9 x 72.7 cm',
    price: 5200000,
    imageUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '해질녘 노을에 물든 도시 풍경을 담은 아크릴화',
    description: '분주한 도시의 하루가 저물어 가는 순간, 하늘을 붉게 물들이는 노을과 도시의 실루엣이 만들어내는 장엄한 풍경을 아크릴 물감으로 역동적으로 표현했습니다.',
  },
  {
    id: 3,
    title: '숲의 속삭임',
    artist: '이하나',
    dimensions: '65.1 x 53.0 cm',
    price: 2800000,
    imageUrl: 'https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '신비로운 안개 낀 숲속의 모습을 표현한 수채화',
    description: '이른 아침 안개가 자욱한 숲 속, 나뭇잎 사이로 스며드는 부드러운 햇살과 자연의 신비로운 분위기를 수채화 특유의 투명한 색감으로 섬세하게 담아냈습니다.',
  },
  {
    id: 4,
    title: '기억의 조각',
    artist: '최민준',
    dimensions: '53.0 x 45.5 cm',
    price: 4100000,
    imageUrl: 'https://images.pexels.com/photos/1183021/pexels-photo-1183021.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '다양한 색상의 조각들이 어우러진 추상화',
    description: '시간 속에 흩어진 기억들, 그 파편들이 모여 만들어내는 새로운 의미를 추상적 형태와 대담한 색채의 조합으로 표현한 작품입니다. 각자의 기억 속 이야기를 발견할 수 있습니다.',
  },
];
