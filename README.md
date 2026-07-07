# 전자결재 시스템 (e-approval)

다우오피스 스타일의 전자결재 시스템 MVP입니다. Next.js + Prisma + SQLite로 만들었습니다.

## 실행 방법

```bash
npm install
cp .env.example .env
npx prisma db push       # 데이터베이스 테이블 생성
npm run db:seed          # 데모 사용자/문서 데이터 넣기
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 데모 계정 (로그인 없이 상단 드롭다운으로 전환)

| 이름 | 역할 |
|------|------|
| 김민수 | 사원 |
| 박지현 | 팀장 |
| 이수영 | 부서장 |
| 최영호 | 대표 |
| 정하늘 | 사원 |

박지현으로 전환한 뒤 "결재함"을 눌러보면 대기중인 문서를 승인/반려할 수 있습니다.

## 지금 구현된 것

- 문서 기안 (제목/종류/내용 + 결재선 순서 지정)
- 순차 결재 (앞사람이 승인해야 다음 사람에게 넘어감)
- 승인/반려 처리, 결재 의견 남기기
- 기안함 / 결재함 / 진행함 / 완료함 / 반려함 필터

## 아직 없는 것 (다음 단계로 추천)

- **실제 로그인 인증** — 지금은 상단에서 사용자를 그냥 선택하는 방식입니다. 실 서비스로 가려면 NextAuth.js 같은 인증이 필요합니다.
- **알림** (내 결재 차례가 왔을 때 메일/푸시)
- **조직도 기반 결재선 자동완성** (팀 구조에 따라 결재자 자동 추천)
- **첨부파일**
- **회수/재상신**
- PostgreSQL로 전환 (`prisma/schema.prisma`의 `provider`를 `postgresql`로 바꾸고 `DATABASE_URL` 교체)

## 폴더 구조

```
prisma/schema.prisma       데이터 모델 (User, Document, ApprovalStep)
prisma/seed.ts              데모 데이터
src/app/page.tsx             결재함 대시보드
src/app/new/page.tsx         새 기안 작성
src/app/api/documents        문서 목록 조회 / 생성 API
src/app/api/documents/[id]/decide   승인/반려 처리 API
src/components/ApprovalLine.tsx     결재라인 시각화 컴포넌트
```
