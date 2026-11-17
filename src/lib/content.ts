// 수도권(서울·경기·인천) 콘텐츠. 한국관광 100선·TourAPI에서 고른 후보를 MVP용으로 손으로 정리했다.
// 지도 좌표(x, y)는 100×80 개략도 위의 위치다(실제 축척 아님, 서울을 크게 그림).

export interface TalkCard {
  id: string;
  /** 이 카드를 말하기 편한 최소 TOPIK 급수 */
  level: number;
  ko: string;
  en: string;
}

export type Region = '서울' | '경기' | '인천';

export interface Activity {
  id: string;
  title: string;
  place: string;
  region: Region;
  district: string;
  /** 지도에 쓰는 짧은 이름 */
  pin: string;
  category: '역사' | '시장·음식' | '골목·문화' | '자연' | '체험';
  /** 주민과 대화하며 즐기기 좋은 최소 TOPIK 급수 */
  level: number;
  duration: string;
  summary: string;
  why: string;
  todo: string[];
  talkAbout: string[];
  x: number;
  y: number;
  cards: TalkCard[];
}

export const REGIONS: Region[] = ['서울', '경기', '인천'];

export const ACTIVITIES: Activity[] = [
  {
    id: 'gwangjang',
    title: '광장시장에서 빈대떡 부치는 골목 걷기',
    place: '광장시장',
    region: '서울', district: '종로구', pin: '광장시장',
    category: '시장·음식',
    level: 2,
    duration: '1시간 30분',
    summary: '100년 넘은 시장에서 주민 단골집의 빈대떡과 마약김밥을 먹어요.',
    why: '관광객으로 붐비지만, 주민과 함께면 어느 집이 진짜인지, 어떻게 주문하는지 배울 수 있어요.',
    todo: ['녹두 빈대떡 같이 먹기', '먹자골목에서 주문해 보기', '2층 원단·한복 상가 구경'],
    talkAbout: ['좋아하는 한국 음식', '고향 시장과 다른 점', '단골집 만드는 법'],
    x: 60, y: 34,
    cards: [
      { id: 'gj1', level: 1, ko: '이거 하나 주세요.', en: 'One of these, please.' },
      { id: 'gj2', level: 1, ko: '맵지 않게 해 주세요.', en: 'Please make it not spicy.' },
      { id: 'gj3', level: 2, ko: '여기서 제일 유명한 게 뭐예요?', en: 'What’s the most famous thing here?' },
      { id: 'gj4', level: 3, ko: '우리 고향 시장에서는 이런 걸 팔아요.', en: 'In my hometown market, they sell things like this.' },
      { id: 'gj5', level: 5, ko: '관광객이 많아진 뒤로 시장 분위기가 어떻게 바뀌었어요?', en: 'How has the market changed since tourists started coming?' },
    ],
  },
  {
    id: 'seochon',
    title: '서촌 골목 책방·한옥 카페 산책',
    place: '서촌 (통인시장·수성동 계곡)',
    region: '서울', district: '종로구', pin: '서촌',
    category: '골목·문화',
    level: 3,
    duration: '2시간',
    summary: '경복궁 서쪽 오래된 동네에서 작은 책방과 한옥 카페를 주민과 함께 걸어요.',
    why: '지도 앱에는 잘 안 나오는 가게가 많아서 주민이 함께할 때 가장 빛나는 코스예요.',
    todo: ['통인시장 엽전 도시락', '독립 책방에서 시집 한 권 고르기', '수성동 계곡까지 걷기'],
    talkAbout: ['요즘 읽는 책', '서울에서 오래 산 동네', '골목이 바뀐 이야기'],
    x: 39, y: 22,
    cards: [
      { id: 'sc1', level: 2, ko: '이 책 추천해 주실 수 있어요?', en: 'Could you recommend this book?' },
      { id: 'sc2', level: 3, ko: '이 골목은 언제부터 이렇게 예뻐졌어요?', en: 'Since when has this alley looked so nice?' },
      { id: 'sc3', level: 3, ko: '주말에는 보통 어디에서 쉬세요?', en: 'Where do you usually relax on weekends?' },
      { id: 'sc4', level: 5, ko: '오래된 동네가 유명해지면 원래 살던 사람들은 어떻게 느낄까요?', en: 'How do longtime residents feel when an old neighborhood becomes famous?' },
    ],
  },
  {
    id: 'naksan',
    title: '한양도성 낙산 성곽길 야경 걷기',
    place: '낙산공원 · 이화마을',
    region: '서울', district: '종로구', pin: '낙산 성곽길',
    category: '역사',
    level: 2,
    duration: '1시간 30분',
    summary: '조선의 서울을 둘러싼 성벽을 따라 걸으며 도시 야경을 봐요.',
    why: '걷기만 해도 볼거리가 많아 대화가 끊기지 않아요. 짧은 문장으로도 충분히 즐길 수 있어요.',
    todo: ['혜화문에서 낙산공원까지 걷기', '성곽 위에서 야경 보기', '이화마을 계단 구경'],
    talkAbout: ['조선 시대 서울', '서울에서 좋아하는 야경', '사진 잘 나오는 자리'],
    x: 61, y: 23,
    cards: [
      { id: 'ns1', level: 1, ko: '여기 정말 예뻐요!', en: 'It’s really beautiful here!' },
      { id: 'ns2', level: 2, ko: '사진 찍어 주실 수 있어요?', en: 'Could you take a photo for me?' },
      { id: 'ns3', level: 3, ko: '옛날에는 이 성벽 안이 서울이었어요?', en: 'Was Seoul only inside these walls in the old days?' },
      { id: 'ns4', level: 4, ko: '서울에서 야경이 제일 좋은 곳을 하나 더 알려 주세요.', en: 'Tell me one more great night-view spot in Seoul.' },
    ],
  },
  {
    id: 'mangwon',
    title: '망원시장 장보고 한강 피크닉',
    place: '망원시장 · 망원한강공원',
    region: '서울', district: '마포구', pin: '망원 한강',
    category: '시장·음식',
    level: 1,
    duration: '2시간',
    summary: '시장에서 간식을 사서 한강 잔디밭에 앉아 이야기해요.',
    why: '가격 묻기, 주문하기처럼 1~2급 표현을 바로 써 볼 수 있어요. 한강에서는 말이 적어도 편해요.',
    todo: ['고로케·닭강정 사기', '한강에서 돗자리 펴기', '편의점 라면 끓여 먹기'],
    talkAbout: ['자취 생활과 장보기', '고향의 강', '주말에 하는 일'],
    x: 30, y: 41,
    cards: [
      { id: 'mw1', level: 1, ko: '이거 얼마예요?', en: 'How much is this?' },
      { id: 'mw2', level: 1, ko: '같이 먹어요!', en: 'Let’s eat together!' },
      { id: 'mw3', level: 2, ko: '한강에서는 보통 뭐 해요?', en: 'What do people usually do at the Han River?' },
      { id: 'mw4', level: 3, ko: '우리 고향에도 큰 강이 있는데, 거기는 겨울에 얼어요.', en: 'My hometown has a big river too; it freezes in winter.' },
    ],
  },
  {
    id: 'bukchon-craft',
    title: '북촌 공방에서 전통 매듭 만들기',
    place: '북촌 한옥마을 공방',
    region: '서울', district: '종로구', pin: '북촌 공방',
    category: '체험',
    level: 1,
    duration: '1시간 30분',
    summary: '손으로 만드는 체험이라 말이 서툴러도 함께 웃으며 배울 수 있어요.',
    why: '한국어 1~2급도 부담 없이 시작할 수 있는 첫 만남 코스예요. 몸짓과 짧은 말로 충분해요.',
    todo: ['전통 매듭 팔찌 만들기', '한옥 마루에 앉아 차 마시기', '조용히 골목 걷기(주민이 사는 곳이에요)'],
    talkAbout: ['손으로 만드는 취미', '한옥과 우리 집의 차이', '선물하고 싶은 사람'],
    x: 50, y: 17,
    cards: [
      { id: 'bc1', level: 1, ko: '이렇게 하면 돼요?', en: 'Is this the right way?' },
      { id: 'bc2', level: 1, ko: '다시 보여 주세요.', en: 'Please show me again.' },
      { id: 'bc3', level: 2, ko: '이거 친구한테 선물할 거예요.', en: 'I’m going to give this to a friend.' },
      { id: 'bc4', level: 3, ko: '한옥에 살면 겨울에 춥지 않아요?', en: 'Isn’t it cold living in a hanok in winter?' },
    ],
  },
  {
    id: 'museum',
    title: '국립중앙박물관 ‘사유의 방’ 함께 보기',
    place: '국립중앙박물관',
    region: '서울', district: '용산구', pin: '국립중앙박물관',
    category: '역사',
    level: 4,
    duration: '2시간',
    summary: '반가사유상 두 점이 있는 방에서 조용히 보고, 나와서 느낀 점을 이야기해요.',
    why: '역사 어휘가 어렵지만 사람에게 직접 들으면 훨씬 기억에 남아요. 중급 이상에게 좋은 도전이에요.',
    todo: ['사유의 방 보기', '좋아하는 유물 하나씩 골라 소개하기', '거울못 산책'],
    talkAbout: ['우리나라 박물관', '생각에 잠기는 시간', '제일 인상 깊은 유물'],
    x: 46, y: 46,
    cards: [
      { id: 'ms1', level: 2, ko: '이건 무엇이에요?', en: 'What is this?' },
      { id: 'ms2', level: 3, ko: '이건 얼마나 오래된 거예요?', en: 'How old is this?' },
      { id: 'ms3', level: 4, ko: '이 표정을 보면 무슨 생각을 하는 것 같아요?', en: 'Looking at this face, what do you think it’s thinking?' },
      { id: 'ms4', level: 5, ko: '우리나라에도 비슷한 불상이 있어서 비교해 보고 싶어요.', en: 'My country has similar Buddha statues, so I’d like to compare.' },
    ],
  },
  {
    id: 'euljiro',
    title: '을지로 노포 골목 저녁 산책',
    place: '을지로3가 인쇄골목',
    region: '서울', district: '중구', pin: '을지로',
    category: '골목·문화',
    level: 4,
    duration: '2시간',
    summary: '인쇄소와 공구 가게 사이 오래된 식당에서 저녁을 먹으며 동네 이야기를 들어요.',
    why: '간판이 작고 숨어 있는 가게가 많아 혼자 가기 어려워요. 일과 세대에 대한 대화가 자연스럽게 나와요.',
    todo: ['오래된 식당에서 저녁', '인쇄골목 구경', '루프톱에서 도심 야경'],
    talkAbout: ['부모님 세대의 서울', '오래된 가게의 매력', '한국의 직장 문화'],
    x: 44, y: 33,
    cards: [
      { id: 'ej1', level: 2, ko: '여기는 몇 년 됐어요?', en: 'How many years has this place been here?' },
      { id: 'ej2', level: 3, ko: '이 동네는 낮과 밤이 많이 달라요?', en: 'Is this neighborhood very different by day and night?' },
      { id: 'ej3', level: 4, ko: '부모님 세대에는 을지로가 어떤 곳이었어요?', en: 'What was Euljiro like in your parents’ generation?' },
      { id: 'ej4', level: 6, ko: '오래된 가게가 사라지는 걸 막으려면 무엇이 필요할까요?', en: 'What would it take to keep old shops from disappearing?' },
    ],
  },
  {
    id: 'suwon',
    title: '수원 화성 성곽길과 행궁동 골목',
    place: '수원 화성 · 행궁동',
    region: '경기', district: '수원시', pin: '수원 화성',
    category: '역사',
    level: 2,
    duration: '반나절',
    summary: '유네스코 세계유산 성벽을 한 바퀴 걷고, 행궁동 골목에서 통닭을 먹어요.',
    why: '서울에서 지하철로 갈 수 있지만 외국인 방문은 생각보다 적어요. 걷기 좋고 볼거리가 많아요.',
    todo: ['화서문에서 방화수류정까지 걷기', '플라잉수원 열기구 보기', '수원 통닭 거리'],
    talkAbout: ['정조 임금 이야기', '수원에서 자란 이야기', '좋아하는 치킨'],
    x: 46, y: 70,
    cards: [
      { id: 'sw1', level: 1, ko: '같이 걸어요!', en: 'Let’s walk together!' },
      { id: 'sw2', level: 2, ko: '여기서 사진 찍어도 돼요?', en: 'Can I take a photo here?' },
      { id: 'sw3', level: 3, ko: '수원 사람들은 화성에 자주 와요?', en: 'Do Suwon locals come to the fortress often?' },
      { id: 'sw4', level: 4, ko: '정조는 왜 이곳에 성을 쌓았을까요?', en: 'Why do you think King Jeongjo built a fortress here?' },
    ],
  },
  {
    id: 'namhansan',
    title: '남한산성 둘레길 걷고 닭백숙',
    place: '남한산성',
    region: '경기', district: '광주시', pin: '남한산성',
    category: '자연',
    level: 3,
    duration: '반나절',
    summary: '산성 둘레길을 걷고 내려와 주민 단골 식당에서 백숙을 먹어요.',
    why: '등산을 좋아하는 한국 문화를 가장 자연스럽게 경험할 수 있어요. 버스 타는 법도 같이 배워요.',
    todo: ['북문에서 서문까지 성곽 걷기', '서문 전망대에서 서울 보기', '닭백숙 먹기'],
    talkAbout: ['한국 사람들이 등산을 좋아하는 이유', '건강 챙기는 법', '병자호란 이야기'],
    x: 74, y: 56,
    cards: [
      { id: 'nh1', level: 1, ko: '잠깐 쉬어요!', en: 'Let’s take a short break!' },
      { id: 'nh2', level: 2, ko: '여기까지 얼마나 걸려요?', en: 'How long does it take to get here?' },
      { id: 'nh3', level: 3, ko: '주말마다 등산하세요?', en: 'Do you go hiking every weekend?' },
      { id: 'nh4', level: 5, ko: '한국 사람들에게 등산은 운동 말고 어떤 의미예요?', en: 'Beyond exercise, what does hiking mean to Koreans?' },
    ],
  },
  {
    id: 'dumulmeori',
    title: '양평 두물머리 강변 산책',
    place: '두물머리 · 세미원',
    region: '경기', district: '양평군', pin: '두물머리',
    category: '자연',
    level: 1,
    duration: '반나절',
    summary: '두 강이 만나는 곳에서 물안개와 느티나무를 보고 연핫도그를 먹어요.',
    why: '대화가 꼭 많지 않아도 즐거운 활동이라 첫 만남에 부담이 적어요. 경의중앙선으로 갈 수 있어요.',
    todo: ['느티나무 아래 사진', '세미원 연꽃 정원', '연핫도그 먹기'],
    talkAbout: ['서울을 벗어나 쉬는 법', '계절마다 하는 일', '고향의 자연'],
    x: 88, y: 32,
    cards: [
      { id: 'dm1', level: 1, ko: '공기가 좋아요!', en: 'The air is so fresh!' },
      { id: 'dm2', level: 2, ko: '여기는 봄에도 예뻐요?', en: 'Is it pretty here in spring too?' },
      { id: 'dm3', level: 3, ko: '서울에서 답답할 때 어디로 가세요?', en: 'Where do you go when Seoul feels stifling?' },
    ],
  },
  {
    id: 'paju-books',
    title: '파주 출판도시 책 구경과 북카페',
    place: '파주출판도시 · 지혜의숲',
    region: '경기', district: '파주시', pin: '파주 출판도시',
    category: '골목·문화',
    level: 4,
    duration: '반나절',
    summary: '천장까지 책이 쌓인 도서관에서 한국 책을 함께 고르고 북카페에서 이야기해요.',
    why: '한국어 공부에 쓸 책을 주민 추천으로 고를 수 있어요. 읽기 수준을 넓히고 싶은 중급자에게 좋아요.',
    todo: ['지혜의숲에서 책 고르기', '출판사 서점 구경', '북카페에서 한 쪽씩 읽어 주기'],
    talkAbout: ['인생 책', '한국어 공부법', '한국 작가와 우리나라 작가'],
    x: 18, y: 8,
    cards: [
      { id: 'pj1', level: 2, ko: '쉬운 책 추천해 주세요.', en: 'Please recommend an easy book.' },
      { id: 'pj2', level: 3, ko: '어릴 때 제일 좋아한 책이 뭐예요?', en: 'What was your favorite book as a child?' },
      { id: 'pj3', level: 4, ko: '이 문장은 어떤 느낌으로 읽어야 해요?', en: 'What feeling should I read this sentence with?' },
      { id: 'pj4', level: 6, ko: '요즘 한국 젊은 사람들은 왜 책을 덜 읽을까요?', en: 'Why do young Koreans read fewer books these days?' },
    ],
  },
  {
    id: 'incheon-port',
    title: '인천 개항장 근대거리와 차이나타운',
    place: '인천 개항장 · 차이나타운',
    region: '인천', district: '중구', pin: '인천 개항장',
    category: '역사',
    level: 3,
    duration: '반나절',
    summary: '100년 전 항구 도시의 건물 사이를 걷고, 짜장면이 처음 생긴 곳에서 점심을 먹어요.',
    why: '한국이 세계와 처음 만난 이야기를 들을 수 있어요. 외국인으로서 할 이야기가 많은 곳이에요.',
    todo: ['짜장면박물관 구경', '동화마을·근대 건축 거리 걷기', '월미도 바다 보기'],
    talkAbout: ['한국에 처음 왔을 때', '이민과 고향', '짜장면 vs 짬뽕'],
    x: 6, y: 42,
    cards: [
      { id: 'ic1', level: 1, ko: '짜장면 좋아해요!', en: 'I love jjajangmyeon!' },
      { id: 'ic2', level: 2, ko: '이 건물은 언제 지었어요?', en: 'When was this building built?' },
      { id: 'ic3', level: 3, ko: '한국에 처음 왔을 때 제일 신기했던 건 ○○였어요.', en: 'When I first came to Korea, ○○ surprised me most.' },
      { id: 'ic4', level: 5, ko: '항구 도시라서 인천 사람들 성격이 다르다고 느끼세요?', en: 'Do you feel Incheon people differ because it’s a port city?' },
    ],
  },
];

/** 어느 활동에서나 쓸 수 있는 첫 만남 카드 */
export const COMMON_CARDS: TalkCard[] = [
  { id: 'c1', level: 1, ko: '만나서 반가워요. 저는 ○○에서 왔어요.', en: 'Nice to meet you. I’m from ○○.' },
  { id: 'c2', level: 1, ko: '천천히 말해 주세요.', en: 'Please speak slowly.' },
  { id: 'c3', level: 2, ko: '제가 틀리면 고쳐 주세요.', en: 'Please correct me if I’m wrong.' },
  { id: 'c4', level: 3, ko: '이 동네에서 제일 좋아하는 곳이 어디예요?', en: 'What’s your favorite place in this neighborhood?' },
];

export const ALL_CARDS: TalkCard[] = [...COMMON_CARDS, ...ACTIVITIES.flatMap((a) => a.cards)];

export function activityById(id: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

export function cardById(id: string): TalkCard | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

export type Fit = 'easy' | 'fit' | 'challenge' | 'hard';

/** TOPIK 급수와 활동 난이도를 비교한 추천 꼬리표 */
export function fitFor(level: number, activity: Activity): Fit {
  const gap = activity.level - level;
  if (gap <= -2) return 'easy';
  if (gap <= 0) return 'fit';
  if (gap === 1) return 'challenge';
  return 'hard';
}

export const FIT_LABEL: Record<Fit, string> = {
  easy: '편하게 즐기기',
  fit: '지금 수준에 딱',
  challenge: '조금 도전',
  hard: '조금 어려워요',
};

const FIT_ORDER: Record<Fit, number> = { fit: 0, challenge: 1, easy: 2, hard: 3 };

export function recommend(level: number): Activity[] {
  return [...ACTIVITIES].sort((a, b) => FIT_ORDER[fitFor(level, a)] - FIT_ORDER[fitFor(level, b)] || b.level - a.level);
}

/** 급수에 맞는 대화 카드를 자동으로 고른다: 지금 급수 ±1 범위, 활동 카드 먼저 */
export function suggestCards(level: number, activity: Activity): TalkCard[] {
  const near = (c: TalkCard) => c.level <= level + 1;
  const picked = [...activity.cards.filter(near), ...COMMON_CARDS.filter(near)];
  return picked.sort((a, b) => Math.abs(a.level - level) - Math.abs(b.level - level));
}
