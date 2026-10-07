# FitLog v2 Web — 프로젝트 가이드

에이전트와 사람이 함께 읽는 프로젝트 안내서입니다. 구조·규칙이 바뀌면 이 문서도 같은 PR에서 갱신합니다.

## 1. 개요

- 운동 프로그램(루틴)을 만들고, 운동 세션을 진행하고, 기록을 조회하는 웹 앱(PWA)의 프론트엔드.
- 백엔드 API는 별도 저장소. 이 저장소는 정적 SPA 빌드만 담당한다.
- 로그인: Google·Kakao OAuth → 백엔드가 교환 코드로 `/auth/callback` 리다이렉트 → 토큰 저장.
- 운영 주소: https://fit2log.com (Firebase Hosting)

## 2. 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 빌드 | Vite 7 (`@vitejs/plugin-react-swc`), `vite-plugin-pwa` |
| UI | React 19, Tailwind CSS 3 (`darkMode: 'class'`), Remix Icon (`index.html` CDN, `ri-*` 클래스) |
| 라우팅 | React Router v7 — `useRoutes` + `lazy()` (`src/router/config.tsx`) |
| 언어 | TypeScript 5.8 (`strict`, `noUnusedLocals`, `verbatimModuleSyntax`) |
| 상태·데이터 | 라이브러리 없음. 페이지별 `useState`/`useEffect` + `src/services/api.ts` |
| 테스트 | 없음 |

> **Next.js가 아니다.** `pages/**/page.tsx` 는 파일 이름 관례일 뿐이고, 라우트는 `src/router/config.tsx` 에 직접 등록한다. `'use client'`, `layout.tsx` 같은 Next 개념은 쓰지 않는다.

## 3. 명령어와 환경

```bash
npm run dev        # 개발 서버 (localhost:3000, LAN 테스트는 `npm run dev -- --host`)
npm run build      # tsc -b && vite build → out/
npm run typecheck  # tsc -b
npm run lint       # eslint .
npm run preview    # 빌드 결과 미리보기
```

- 환경 변수: `.env` 에 `VITE_API_BASE_URL` (gitignore 대상, 레포에 없음)
  - API: `${VITE_API_BASE_URL}/api`, OAuth 시작: `${VITE_API_BASE_URL}/oauth2/authorization/{provider}`
- CI (`.github/workflows/deploy.yml`)
  - PR(→ `main`, `dev`): `lint` + `typecheck` 만 실행
  - `main` push: 검사 통과 후 빌드 → `out/` 검증 → Firebase Hosting 배포 (GitHub 저장소 변수의 `VITE_API_BASE_URL` 로 `.env` 생성)

## 4. 디렉터리 구조

### 4.1 현재 구조

```
src/
  main.tsx, App.tsx          진입점. ThemeProvider + BrowserRouter, 토큰 백그라운드 검증
  index.css                  Tailwind 지시문 + 전역 스타일
  router/
    config.tsx               라우트 목록 (lazy 페이지)
    index.ts                 AppRoutes (useRoutes)
  pages/                     라우트별 화면. 대부분 한 파일에 UI·상태·API 호출이 함께 있음
    home/                    랜딩 (비로그인, 항상 다크)
    auth/callback/           OAuth 교환 코드 → 토큰 저장
    dashboard/               통계 요약
    programs/                프로그램 목록·4단계 생성/수정 위저드
      ManageWorkoutsView.tsx 운동 종목 관리 (라우트 아님, programs 내부 뷰)
    workout/                 프로그램 선택 → 시작 전 순서·운동 편집
      session/               진행 중인 운동 세션 (타이머, 세트 완료, 휴식, 순서 변경)
    history/                 기록 목록·캘린더·상세 (`/history/:id`)
    profile/                 프로필 조회·수정·탈퇴
    legal/                   개인정보처리방침·이용약관 (+ LegalLayout)
    NotFound.tsx
  components/
    base/                    Button, Card, Input
    feature/                 Header, LoginModal
  contexts/ThemeContext.tsx  다크/라이트 테마
  services/api.ts            API 클라이언트 + 전 도메인 엔드포인트 + DTO 타입
  utils/
    date.ts                  KST 날짜 유틸
    navigationService.ts     컴포넌트 밖에서 navigate (401 → 홈 이동)
  i18n/                      설정만 있고 사용하지 않음
```

### 4.2 목표 구조 (리팩터링 진행 중)

페이지에 몰린 코드를 기능 단위로 분리한다. **새로 작성하는 코드는 이 구조를 따른다.**

```
src/
  app/        진입·프로바이더·라우터·AppLayout(Header + 페이지 셸 + <Outlet/>)
  pages/      라우트 진입점. feature를 조립만 한다 (~100줄 이하 목표)
  features/   도메인별 폴더
    auth/ exercises/ programs/ workout-start/ session/ history/ dashboard/ profile/
      api.ts        해당 도메인 엔드포인트
      types.ts      도메인 타입 (유일한 정의 위치)
      components/   도메인 UI
      hooks/        상태·이펙트·비즈니스 로직
      lib/          순수 함수 (DTO 변환 등)
      index.ts      외부 공개 API
  shared/
    api/client.ts   ApiError, sendRequest, fetchWithAuth
    ui/             Button, Input, Card, Modal, ConfirmDialog, Spinner, EmptyState,
                    ErrorBanner, StatTile, SectionCard, PageHeader
    hooks/          useReorder 등 도메인 무관 훅
    lib/            date, format, navigation
```

마이그레이션 진행 상태 (완료 시 체크하고 4.1 을 갱신):

- [ ] 1. 기반 정리 — `app/`·`shared/` 생성, `api.ts` 를 `shared/api/client.ts` + `features/*/api.ts` 로 분리
- [ ] 2. 공용 UI 키트 + `AppLayout` 레이아웃 라우트
- [ ] 3. `exercises` feature — 운동 폼 모달·운동 추가 피커·순서 변경 공통화
- [ ] 4. 큰 페이지 분해 — session → programs → history → workout → dashboard → profile
- [ ] 5. 포매터 통일 (`shared/lib/format.ts`)
- [ ] 6. (선택) TanStack Query, 토큰 저장소 모듈, 미사용 의존성 정리

## 5. 도메인 용어

| 용어 | 코드 이름 | 설명 |
|---|---|---|
| 부위 | `WorkoutPart` | 가슴·등 등. 공용(수정 불가) + 사용자 정의. `editable` 로 구분 |
| 운동(종목) | `Workout` | 부위에 속한 운동. 공용 종목은 "기본 운동"으로 표시, 수정·삭제 불가 |
| 프로그램 | `WorkoutProgram` | 루틴. `parts[] → exercises[](order) → sets[](reps, weight, restTime, memo)`. UI에서는 평탄화해 편집하고 저장 시 부위별로 묶는다 |
| 세션 | `WorkoutSession` | 프로그램으로 시작한 운동. 상태 `IN_PROGRESS · PAUSED · COMPLETED · CANCELLED`. 일시정지 누적(`totalPausedSeconds`), 종목 skip, 세트·종목 추가, 남은 종목 순서 변경 |
| 휴식 타이머 | — | 클라이언트 전용. 마감 시각 기준 계산 + 종료 비프음 |
| 기록 | `WorkoutLog` | 완료된 세션. 종목명은 세션 시점의 스냅샷. 세트별 목표 대비 실제 값 |
| 대시보드 통계 | `DashboardStats` | 연속 일수, 주간·월간 횟수, 요일별 진행, 부위 분포 등 (서버 집계) |
| 회원 | `MemberProfile` | 닉네임, 키·몸무게, 목표·경력(고정 한글 enum), OAuth 제공자 |

## 6. 아키텍처 규칙

- **의존 방향은 `pages → features → shared` 한 방향.** `shared` 는 `features`·`pages` 를 import하지 않는다.
- feature 간 import는 상대 feature의 `index.ts` 를 통해서만. 기반 도메인인 `exercises` 는 `programs`·`workout-start`·`session` 에서 사용해도 된다. 순환 참조 금지.
- **page는 조립만** 한다. 상태·이펙트가 많아지면 `hooks/`, 화면 조각은 `components/` 로 뺀다.
- 한 파일에 컴포넌트 하나, 컴포넌트는 ~250줄 이하를 목표로 한다.
- 도메인 타입은 해당 feature의 `types.ts` 에서만 정의한다. 페이지 안에서 `Program`, `Exercise` 같은 타입을 다시 선언하지 않는다.
- 같은 UI가 두 곳 이상에 생기면 `shared/ui` 또는 해당 feature의 `components/` 로 올린다. 모달은 직접 `fixed inset-0 ...` 을 쓰지 말고 공용 `Modal`/`ConfirmDialog` 를 쓴다(2단계 이후).

## 7. 코딩 컨벤션

- **import**: `@/` alias (`@/*` → `src/*`). 상대 경로는 같은 폴더(같은 feature) 안에서만.
- **export**: 페이지는 `lazy()` 때문에 default export. 그 외 컴포넌트·훅·함수는 named export.
- **이름**: 컴포넌트 파일 PascalCase(`ExerciseFormModal.tsx`), 훅 `useXxx.ts`, 그 외 camelCase.
- **auto-import**: `unplugin-auto-import` 가 React·react-router 훅을 전역으로 만들지만, 명시적으로 import한다.
- **스타일**
  - Tailwind 유틸리티만 사용. 색상 클래스에는 항상 `dark:` 쌍을 둔다.
  - 페이지 배경 `bg-gray-50 dark:bg-[#0a0a0a]`, 카드·패널 `bg-white dark:bg-[#111]`, 본문 폭 `max-w-4xl mx-auto px-4 py-6`.
  - 주요 버튼은 브랜드 그라디언트 `bg-gradient-to-r from-indigo-500 to-violet-600`.
  - 아이콘은 Remix Icon `<i className="ri-..."/>`. `lucide-react` 는 쓰지 않는다.
- **문구**: UI 텍스트·주석·커밋 메시지는 한국어. i18n은 쓰지 않으므로 문자열을 직접 쓴다.
- **날짜·시간**: 서버 기준은 KST. `utils/date.ts` (`toKstDateString`, `toKstTimeString`, `kstDateDaysAgo`, `monthRange`) 를 쓰고 `new Date().toISOString().slice(0,10)` 같은 UTC 기준 계산은 하지 않는다.
- **API 호출**
  - 반드시 `services/api.ts` 의 함수를 거친다 (`fetchWithAuth`: 토큰 첨부, 20초 제한, `X-Request-Id`, 401 시 탭 간 직렬화된 토큰 갱신 후 재시도, 실패 시 로그아웃 → 홈).
  - 오류는 `ApiError` (`status`, `code`, `requestId`). 사용자에게 보여줄 때 `requestId` 를 함께 노출한다.
  - 새 코드에서는 `alert()` 대신 화면 내 에러 표시(배너)를 쓴다.
- **localStorage 키** (임의로 키를 추가하지 말고 여기에 기록)

  | 키 | 위치 | 용도 |
  |---|---|---|
  | `accessToken`, `refreshToken` | `services/api.ts`, `auth/callback` | 인증 토큰 |
  | `imageUrl`, `provider` | `auth/callback`, `Header` | 프로필 이미지, 로그인 제공자 |
  | `theme` | `ThemeContext` | 다크/라이트 |
  | `exercise_start_time`, `pause_snapshot` | `workout/session` | 새로고침 후 타이머 복원 |

## 8. 주의 사항·알려진 부채

- `i18next`·`react-i18next`·`recharts`·`lucide-react` 는 설치돼 있지만 사용하지 않는다 (`main.tsx` 가 `./i18n` 만 import).
- 컴포넌트 밖 navigate 수단이 두 개다: `utils/navigationService.ts` (사용 중), `router/index.ts` 의 `window.REACT_APP_NAVIGATE`·`navigatePromise` (사실상 미사용).
- `getMyInfo` 와 `getMyProfile` 은 같은 `/members/me` 를 호출한다.
- `history` 의 `formatDate` 는 로컬 시간대 기준이라 대시보드(KST 기준)와 결과가 다를 수 있다.
- `formatTime` 이 페이지마다 출력 형식이 다르다 (`N시간 N분` / `H:MM:SS` / `Nh Nm`). 통일할 때 화면 출력은 유지한다.
- `components/base` 의 `Button`·`Card`·`Input` 과 `LoginModal` 은 다크모드 스타일이 없다. `Button` variant는 브랜드 색과 달라 대부분 `className` 으로 덮어쓴다.
- 라우트 가드가 없다. 비로그인 접근은 API 401 → 홈 리다이렉트로 처리된다.
- 세션 화면의 세트 입력값은 `document.getElementById` 로 읽는다 (리팩터링 시 controlled state로 전환 예정).

## 9. 검증

자동 테스트가 없으므로 PR 전에 아래를 모두 통과시킨다.

```bash
npm run lint && npm run typecheck && npm run build
```

화면을 건드렸다면 `npm run dev` 로 해당 흐름을 직접 확인한다. 리팩터링 PR은 전체 흐름을 확인한다.

- 로그인 → 콜백 → 대시보드
- 프로그램 생성·수정·삭제 (4단계 위저드), 운동 종목 관리
- 운동 시작 (순서 변경·운동 추가) → 세션: 세트 완료, 휴식 타이머, 일시정지·재개, 세트·운동 추가, 남은 운동 순서 변경, 스킵, 종료
- 기록 목록·기간 필터·캘린더·상세
- 프로필 수정, 다크/라이트 전환, 모바일 폭 레이아웃

## 10. Git 워크플로

- 기본 브랜치 `main` (push 시 운영 배포). 작업은 브랜치에서 하고 PR로 병합한다.
- 브랜치: `feature/<이슈번호>-<설명>` (예: `feature/35-re-order-item`)
- 커밋: `<type>: <한국어 요약>` — type은 `feat`, `fix`, `chore`, `refactor`, `docs`. 관련 이슈 번호를 적는다 (예: `chore: 출시 후 #29 - 미사용 SDK 제거`).
