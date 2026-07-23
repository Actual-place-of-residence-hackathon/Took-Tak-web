# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code(claude.ai/code)에게 제공되는 가이드입니다.

@AGENTS.md

## 프로젝트 개요

- 이름: Took-Tak 뚝딱 (`package.json`의 name은 `took-tak-web`)
- 목적: AI 기반 교내 불편·시설 고장 신고 서비스. 학생(신고 등록/조회)과 관리자(대시보드)가 role로 분리된 하나의 앱
- 프레임워크: Next.js 16.2.11 (App Router, Turbopack) + TypeScript, React 19.2.4
- 스타일: Tailwind CSS v4 (`@theme` 기반, 별도 config 파일 없음 — `src/app/globals.css`에 토큰 정의)
- 서버 상태: TanStack Query / 클라이언트 상태: Zustand / 폼: React Hook Form + Zod / 업로드: react-dropzone / 토스트: sonner
- DB / Auth / Storage / Realtime: Supabase (클라이언트만 세팅됨, 인증 플로우는 아직 미구현)
- 배포: 아직 정해진 것 없음 (Vercel 관련 설정 파일 없음)

## 자주 사용하는 명령어

- `npm run dev` — 개발 서버 실행
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript + `eslint-config-prettier`)
- `npm run format` / `npm run format:check` — Prettier 적용 / 검사

테스트 프레임워크는 아직 도입되지 않았습니다 (`npm test` 없음). CI 워크플로우(`.github/workflows`)도 아직 없습니다. 둘 중 하나라도 추가되면 이 섹션을 업데이트하세요.

## 아키텍처

Feature-Sliced Design(FSD) 구조이며, `tsconfig.json`에 `@/*` → `src/*` 별칭이 잡혀있습니다. import 방향은 한쪽으로만 유지하세요: `app → views → widgets → features → entities → shared` (하위 레이어가 상위 레이어를 import하지 않음).

- `app/` — Next.js 라우팅만 담당. role별로 라우트 그룹을 분리했습니다: `(public)`(공통: `/`, `/login`), `(student)`(학생: `/report/new`, `/report/[id]`, `/my-reports` — 라우트 그룹이라 URL엔 안 보임), `admin`(관리자: `/admin/dashboard`, `/admin/reports` — 실제 경로 세그먼트. `/admin/:path*` 미들웨어 가드를 걸기 쉽게 하려는 의도이며, 가드 자체는 아직 미구현). `layout.tsx`가 `providers.tsx`(TanStack QueryClientProvider + `ReactQueryDevtools` + sonner `Toaster`)로 전체를 감쌉니다. `globals.css`의 `@theme`에 `color-primary-50~900`(옐로우 계열), `color-accent-50~900`(크림 계열) 팔레트가 정의되어 있습니다 — 브랜드 색상 이름이 확정되면 `primary`/`accent`를 실제 이름으로 리네이밍하세요.
- `views/` — FSD의 "pages" 레이어이지만 **의도적으로 `views`로 명명**했습니다. `src/pages`라는 이름을 쓰면 Next.js가 이를 Pages Router로 인식해 App Router 라우트와 경로 충돌(`App Router and Pages Router both match path`)이 나기 때문입니다. `common/`, `student/`, `admin/` 하위에 `app/`의 라우트 그룹과 1:1 대응하는 폴더가 있고, 각 폴더는 `index.ts`로 배럴 export하는 `ui/XxxPage.tsx` 컴포넌트를 가집니다. 지금은 전부 위젯 조립 전 placeholder 상태입니다.
- `widgets/`, `features/`, `entities/(report, user)`, `shared/(ui, api, lib, config, types)` — 폴더만 만들어두고 대부분 비어있습니다(`.gitkeep`). role로 폴더를 나누지 않고 도메인 단위로 유지하는 게 원칙이며, 관리자 전용 기능만 이름에 `admin-` 접두어를 붙이세요 (예: `widgets/admin-dashboard`).
- `shared/api/supabase.ts` — `@supabase/supabase-js`의 `createClient`로 만든 싱글턴 클라이언트. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 없으면 즉시 throw합니다. 값은 `.env.local`에 넣고(`.env.local.example` 참고), 서버 전용 키(service role 등)는 이 파일에 절대 넣지 마세요.
- `shared/types/role.ts` — `UserRole = "student" | "admin"`. role 분기 로직에서 이 타입을 기준으로 삼으세요.

## 코드 규칙

- 컴포넌트: 함수형 + hooks
- CSS: Tailwind CSS 유틸리티 클래스 사용 (인라인 스타일 지양), 색상은 `primary`/`accent` 토큰 우선 사용
- Prettier: 더블 쿼트(`singleQuote: false`), 세미콜론, trailing comma, 100컬럼, `prettier-plugin-tailwindcss`로 클래스 자동 정렬 (`.prettierrc.json` 기준)
- 경로 별칭 `@/*` → `src/*` (`tsconfig.json`)
- 클라이언트 훅/이벤트 핸들러가 필요한 컴포넌트는 파일 최상단에 `"use client"` 명시 (예: `app/providers.tsx`)

## 커밋 규칙

- 형식: `feat:` / `fix:` / `refactor:` / `docs:`
- 커밋 메세지는 한글로 작성 가능
- PR 단위: 기능 하나당 PR 하나
- 커밋 단위: 서로 무관한 변경을 한 커밋에 묶지 말 것. 연관 있는 변경끼리만 묶어서 커밋 (예: `package.json`과 `package-lock.json`은 함께, 의존성 추가/설정 변경/문서 변경처럼 성격이 다른 작업은 각각 별도 커밋으로 분리)
- `git add -A` / `git add .`로 변경된 파일을 한꺼번에 다 커밋하지 말 것. 파일을 이름으로 하나씩 골라서(`git add <file>`) 커밋 단위를 의도적으로 나눌 것
- 코드리뷰(Gemini 등) 피드백을 반영해 수정할 때, 커밋 메시지에 "제미나이 코드리뷰 반영" 같은 리뷰 도구/과정 언급을 넣지 말 것. 실제 변경 내용에 맞는 타입(`fix:` / `refactor:` / `test:` 등)과 설명으로 작성

## 하지 말아야 할 것

- `console.log` 남기지 말 것
- `any` 타입 사용 금지
- `.env` 파일 수정 및 커밋 금지
- `main` 브랜치에 직접 push 금지
- 기존 API 엔드포인트 삭제 금지
- `package.json`의 의존성 버전 변경 금지
- 사용자 확인 없이 DB 마이그레이션 실행 금지
