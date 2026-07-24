# Took-Tak 뚝딱

AI 기반 교내 불편·시설 고장 신고 서비스. 학생(신고 등록/조회)과 관리자(대시보드)가 role로 분리된 하나의 Next.js 앱입니다.

## 스택

- **프레임워크**: Next.js 16 (App Router, Turbopack) + TypeScript, React 19
- **스타일**: Tailwind CSS v4 (`src/app/globals.css`의 `@theme`로 토큰 정의, 별도 config 파일 없음)
- **서버 상태**: TanStack Query
- **클라이언트 상태**: Zustand
- **폼**: React Hook Form + Zod
- **업로드**: react-dropzone
- **토스트**: sonner
- **인증/데이터**: 자체 Express 백엔드([Took-Tak-back](https://github.com/Actual-place-of-residence-hackathon/Took-Tak-back))를 `/api/*`로 호출 (스튜던트는 디바이스 ID로 자동 로그인, 관리자는 패스코드 로그인). Supabase 클라이언트도 세팅되어 있음(`shared/api/supabase.ts`).

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

`.env.local`이 필요합니다 (`.env.local.example` 참고):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

ADMIN_PASSCODE=
```

## 자주 쓰는 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint (flat config) |
| `npm run format` | Prettier로 포맷 적용 |
| `npm run format:check` | Prettier 포맷 검사만 |

## 아키텍처 (Feature-Sliced Design)

`tsconfig.json`에 `@/*` → `src/*` 별칭이 잡혀 있고, import는 한 방향으로만 흐릅니다:

```
app → views → widgets → features → entities → shared
```

- **`app/`** — Next.js 라우팅 전용. role별 라우트 그룹: `(public)`(`/`, `/reports`), `(student)`(`/report/new`, `/report/[id]`), `admin`(`/admin`, `/admin/login`, `/admin/dashboard`, `/admin/statistics` — 실제 경로 세그먼트, `src/proxy.ts` 미들웨어가 `/admin/:path*`를 가드). `src/app/api/`엔 관리자 로그인/로그아웃 route handler만 있고, 그 외 `/api/*`는 nginx가 백엔드로 proxy.
- **`views/`** — FSD의 "pages" 레이어를 의도적으로 `views`라 이름 붙임 (`src/pages`는 Next.js가 Pages Router로 인식해 App Router와 경로 충돌 남). `common/`, `student/`, `admin/` 하위에 `app/`의 라우트 그룹과 1:1 대응.
- **`widgets/`** — `site-map`(건물 배치도 + zone 핀), `admin-dashboard`, `header` 등 여러 화면에서 조립되는 단위. 관리자 전용은 `admin-` 접두어.
- **`features/`** — `report-create`(신고 등록 폼 + 사진 업로드), `report-filter`, `report-status-update`(관리자 상태 변경/분류/병합).
- **`entities/report`** — `Report` 도메인 타입, TanStack Query 훅(`queries.ts`), 백엔드 wire 포맷 ↔ 프론트 타입 매핑(`report-api.ts`).
- **`shared/`** — `ui`(공용 컴포넌트: Button, Card, Modal, Sheet 등), `lib`(`backend-auth` — 백엔드 JWT 발급/저장, `admin-auth` — 관리자 패스코드 세션 쿠키, `use-location-tree` — 건물/층/zone 트리 조회), `config/site-map.ts`(배치도 이미지 S3 URL 매핑), `types/report.ts`.

## 백엔드 연동 메모

- 위치는 건물 → 층 → **zone**(관리자가 등록해둔 고정 좌표, 선택) 계층이며 `reports.zone_id`는 nullable입니다. 배치도에서 등록된 zone 핀을 탭하면 그 zone이 선택되고, 그 외 자리를 클릭하면 자유 좌표(`pin_x`/`pin_y`)로 신고 위치를 남길 수 있습니다 (`widgets/site-map/ui/PinMap.tsx`).
- 신고 사진은 `POST /api/reports/upload-images`로 먼저 업로드해 서버 URL을 받은 뒤, 그 URL만 신고 생성 요청의 `photoUrls`에 담습니다 (`URL.createObjectURL` 같은 브라우저 로컬 blob URL은 저장하지 않음).
- 배치도 이미지는 프론트 번들이 아니라 S3에서 불러옵니다 (`shared/config/site-map.ts`).
- 학생은 로그인 화면 없이 디바이스 ID 기반으로 자동 로그인되고, 관리자는 `/admin/login`에서 패스코드를 입력하면 프론트 세션 쿠키 + 백엔드 JWT를 함께 발급받습니다.

## 코드 규칙

- 컴포넌트: 함수형 + hooks, 클라이언트 훅/이벤트 핸들러가 필요하면 파일 최상단에 `"use client"`
- CSS: Tailwind 유틸리티 클래스 우선, 색상은 `primary`/`accent` 토큰 사용
- Prettier: 더블 쿼트, 세미콜론, trailing comma, 100컬럼, `prettier-plugin-tailwindcss`로 클래스 자동 정렬
- `any` 타입 사용 금지, `console.log` 남기지 않기

자세한 개발 가이드는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.
