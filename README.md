# 한국AI창의융합협회(KACCA) 홈페이지

## 협회 정보
- 협회명: 한국AI창의융합협회
- 영문명: Korea AI Creative Convergence Association
- 약칭: KACCA ✅ (KAICC ❌)

## 기술 스택
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (DB + Auth)
- React Router DOM

## 🚀 시작하기

### 1. 패키지 설치
```bash
npm install
```

### 2. Supabase 설정
1. https://supabase.com 접속 → New Project 생성
2. Dashboard > SQL Editor 에서 `SUPABASE_SQL.sql` 전체 실행
3. Authentication > Users > Add User 로 관리자 계정 생성

### 3. 환경변수 설정
`.env.local` 파일 수정:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co     ← Settings > API > Project URL
VITE_SUPABASE_ANON_KEY=eyJ...                   ← Settings > API > anon/public key
```

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 빌드
```bash
npm run build
```

## 📁 폴더 구조
```
src/
├── lib/supabase.ts        # Supabase 클라이언트 + 타입
├── data/fallback.ts       # Supabase 없을 때 기본 데이터
├── hooks/useData.ts       # 데이터 페칭 훅
└── pages/
    ├── HomePage.tsx       # 메인 홈페이지
    └── AdminPage.tsx      # 관리자 페이지 (/admin)
```

## 🔐 관리자 페이지
- URL: `/admin`
- Supabase Auth 이메일/비밀번호 로그인
- 푸터 맨 하단 [관리자] 버튼으로도 접근 가능

## 🌐 배포 (Vercel 추천)
```bash
npm i -g vercel
vercel
# 환경변수 설정
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

## 📝 실제 데이터 교체 순서
1. `/admin` 접속 → Supabase 관리자 계정으로 로그인
2. **사이트 설정** → 네이버 카페 URL, 카카오 채널 URL, 연락처 입력
3. **강의 관리** → 실제 강의 정보, 커리큘럼, 상세 페이지 링크 입력
4. 강사 관리, 후기 관리 순서로 진행

## 컬러 시스템
| 역할 | 색상 | HEX |
|------|------|-----|
| 메인 배경 | 웜 베이지 | #EDE8DF |
| 카드 배경 | 크림 | #FAF7F2 |
| 히어로 배경 | 리치 블랙 | #0B0A09 |
| 포인트 | 번-오렌지 | #C84B0F |
| 하이라이트 | 골드-앰버 | #F5B730 |
| 네이버 | 그린 | #03C75A |
