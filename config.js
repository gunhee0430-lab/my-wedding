/**
 * Luxury Gold Wedding Invitation Configuration
 *
 * 이 파일에서 청첩장의 모든 정보를 수정할 수 있습니다.
 * 이미지는 설정이 필요 없습니다. 아래 폴더에 순번 파일명으로 넣으면 자동 감지됩니다.
 *
 * 이미지 폴더 구조 (파일명 규칙):
 *   images/hero/1.jpg      - 메인 사진 (1장, 필수)
 *   images/story/1.jpg, 2.jpg, ...  - 스토리 사진들 (순번, 자동 감지)
 *   images/gallery/1.jpg, 2.jpg, ... - 갤러리 사진들 (순번, 자동 감지)
 *   images/location/1.jpg  - 약도/지도 이미지 (1장)
 *   images/og/1.jpg        - 카카오톡 공유 썸네일 (1장)
 */

const CONFIG = {
  // ── 초대장 열기 ──
  useCurtain: true,  // 초대장 열기 화면 사용 여부 (true: 사용, false: 바로 본문 표시)

  // ── 메인 (히어로) ──
  groom: {
    name: "조건희",
    nameEn: "Groom",
    father: "조성철",
    mother: "이현미",
    fatherDeceased: false,
    motherDeceased: true
  },

  bride: {
    name: "박수지",
    nameEn: "Bride",
    father: "박시현",
    mother: "조영순",
    fatherDeceased: false,
    motherDeceased: false
  },

 
  wedding: {
    date: "2026-12-13",
    time: "13:30",
    venue: "카리스호텔",
    hall: "13층 오스카홀",
    address: "인천 계양구 계양대로 28",
    tel: "032-556-0880",
    mapLinks: {
      kakao: "https://kko.to/mKY5gTuuiD",
      naver: "https://naver.me/5OQjhuEx"
    }
  },

  // ── 인사말 ──
  greeting: {
    title: "소중한 분들을 초대합니다",
    content: "가장 추운 계절에\n가장 따뜻한 약속을 하려 합니다.\n\n서로의 온기가 되어 살아가겠습니다\n그 첫 자리에 함께해 주세요."
  },

 // ── 우리의 이야기 ──
  story: {
    title: "우리의 이야기",
    content: "서로 다른 길을 걷던 두 사람이\n하나의 길을 함께 걷게 되었습니다.\n\n여러분을 소중한 자리에 초대합니다."
  },

  // ── 오시는 길 ──
  // (mapLinks는 wedding 객체 내에 포함)

  // ── 마음 전하실 곳 ──
  accounts: {
    groom: [
      { role: "신랑", name: "조건희", bank: "신한은행", number: "110-279-165126" },
      { role: "아버지", name: "조성철", bank: "카카오뱅크", number: "3333-0202-92316" },
    ],
    bride: [
      { role: "신부", name: "박수지", bank: "국민은행", number: "457002-01-330579" },
      { role: "아버지", name: "박시현", bank: "국민은행", number: "535925-94-101175" },
      { role: "어머니", name: "조영순", bank: "국민은행", number: "743-24-0045-437" }
    ]
  },

  // ── 사진 보내주기 (하객 사진 업로드) ──
  // url 에 업로드 링크를 넣으면 섹션이 자동으로 나타납니다.
  // url 이 비어 있으면 섹션 자체가 표시되지 않습니다.
  photoShare: {
    enabled: true,
    title: "결혼식 사진을 보내주세요",
    desc: "잘 나온 사진도 흔들린 사진도 좋습니다\n오늘 담아주신 그대로 보내주시면\n\n감사히 간직하겠습니다.",
    url: "https://www.dropbox.com/request/f3fgetp8fjofqoo1ub3p", 
    buttonText: "사진 올리기",
    note: "링크를 열고 사진을 선택하면 바로 업로드됩니다."
  },

  // ── 링크 공유 시 나타나는 문구 ──
  meta: {
    title: "조건희 ♥ 박수지 결혼합니다",
    description: "2026년 12월 13일, 소중한 분들을 초대합니다."
  }
};
