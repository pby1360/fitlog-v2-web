# FitLog V2 웹 개발 규칙

## 공식 문서와 작업 범위

1. [문서 관리 규칙](https://github.com/pby1360/fitlog-v2-docs/blob/main/AGENTS.md), [현재 상태](https://github.com/pby1360/fitlog-v2-docs/blob/main/status/CURRENT_STATUS.md), [백로그](https://github.com/pby1360/fitlog-v2-docs/blob/main/status/BACKLOG.md)를 읽는다. [기능 목록](https://github.com/pby1360/fitlog-v2-docs/blob/main/features/README.md)에서 해당 PRD·Tech Spec과 완료 조건, 관련 Issue·ADR을 찾는다.
2. 문서 저장소의 원격 `main`을 기준으로 확인한다. 같은 작업 환경에 문서 체크아웃이 있으면 원격 기준 커밋과 대조한다. 체크아웃이 없어도 공식 GitHub 링크를 사용하며, 기준 문서와 코드가 어긋나면 확인한 커밋과 근거를 기록한다.
3. 요구사항이나 공개 API 계약, 데이터 모델·마이그레이션 정책, 인증·보안, 장기 아키텍처를 변경해야 하면 영향과 대안, 호환성·검증 계획을 제시하고 해당 변경의 사용자 승인을 기다린다. 승인된 설계 안의 수정과 검증은 요청 범위에서 진행한다.
4. 코드 변경마다 문서 영향을 판단한다. 영향받는 Tech Spec·API·아키텍처를 갱신하고 CURRENT_STATUS와 BACKLOG에 검사 근거와 남은 항목을 남긴다. 개발 이력은 한국 시간 날짜의 `history/` 항목에 추가한다. 문서가 필요 없으면 코드 PR에 이유를 남긴다.
5. 문서가 필요한 경우 독립 브랜치에 Docs PR을 하나 만들고 두 PR을 상호 연결한다. Docs PR에는 코드 저장소, PR 번호, 기준 SHA를 기록한다. 문서 저장소가 사용자 요청에서 읽기 전용이면 필요한 변경을 코드 PR에 명시한다. [문서 동기화 절차](https://github.com/pby1360/fitlog-v2-docs/blob/main/operations/DOCS_SYNC.md)

## 승인 대기·차단 대응 (Codex 적용)

- 코드 변경 전 `$fitlog-loop`의 **승인 대기·차단 진단** 규칙을 따른다. 기술 정보 부족, 제품·운영 정책, 법적 검토, 승인, 접근 제한, 기존 실행 미확인 사유를 구분하고 가능한 읽기 전용 조사·근거·대안을 먼저 제시한다. [공식 개발 절차](https://github.com/pby1360/fitlog-v2-docs/blob/main/operations/DEVELOPMENT_WORKFLOW.md#승인-대기-중-차단-진단과-의사결정-지원)
- **조사 요청은 구현 승인과 다르다.** 승인 없이는 TASKS 선점, 코드·정책 변경, PR 생성, Cloud 실행/재실행, 병합 또는 배포를 수행하지 않는다. 기존 Task ID·PR·Cloud 상태를 교차 확인하고 미확인 항목은 그대로 보고한다.
- 사용자 승인 후에는 Docs `main`의 최신 Task 상태·승인 SHA·선점 근거를 다시 확인하고 기존 개발 루프로 진입한다. 기존 테스트·수정 최대 5회, 코드 Draft PR 및 사용자 수동 병합 규칙은 유지한다.

## 아키텍처 및 코딩 표준

- React 19, TypeScript, Vite와 npm 잠금 파일을 사용한다. 페이지와 라우팅은 `src/pages/`와 `src/router/config.tsx`의 기존 구성을 따른다. 공통 UI는 `src/components/base/`, 기능 UI는 `src/components/feature/`에서 알맞은 구현을 우선 재사용한다. [프런트엔드 설계](https://github.com/pby1360/fitlog-v2-docs/blob/main/architecture/FRONTEND.md)
- API 호출은 `src/services/api.ts`의 공통 요청 경로를 사용한다. 승인된 서버 계약과 타입을 맞추고 기존 인증 갱신, 제한시간, 요청 ID와 오류 처리를 유지한다. [API 계약](https://github.com/pby1360/fitlog-v2-docs/blob/main/api/README.md)
- 화면 변경은 로딩·빈 결과·실패를 구별하고 재시도 또는 복귀 흐름을 확인한다. 비동기 조회에서 늦게 온 응답이 최신 화면 상태를 덮지 않게 한다. 날짜 표시는 해당 Tech Spec과 `src/utils/date.ts`의 KST 기준을 확인한다.

## 테스트 및 검증

- CI와 같은 Node 20 계열을 사용한다. 저장소 루트에서 잠금 파일 기준으로 의존성을 설치한다.

  ```sh
  npm ci
  npm run lint
  npm run typecheck
  VITE_API_BASE_URL=http://localhost:8080 npm run build
  ```

- `npm run build`는 타입 검사 후 Vite 결과를 `out/`에 만든다. [워크플로](.github/workflows/deploy.yml)는 `main`·`dev` 대상 PR에서 설치·린트·타입 검사를 수행한다. 기능·빌드·테스트 변경 또는 배포 검토 대상 변경에서는 로컬 API 주소로 번들 빌드 및 Playwright도 검사한다. 로컬에서 위 네 명령을 확인한다.
- Chromium이 없는 환경은 `npx playwright install chromium`으로 준비한다. UI 또는 동작 수정은 `npm test`로 로컬 Playwright 시나리오를 실행한다. 테스트는 로컬 화면을 시작하고 API 응답을 가로채므로 운영 서비스에 접속할 필요가 없다. 추가 수동 검사에는 아래 명령을 사용하고 확인한 경로와 흐름을 기록한다.

  ```sh
  VITE_API_BASE_URL=http://localhost:8080 npm run dev
  ```

- 테스트·검사·검증 시나리오를 삭제하거나 건너뛰어 성공으로 처리하지 않는다. 이미 존재하는 경고와 새 경고를 구분하고, 실행하지 못한 검사는 사유를 기록한다. 운영 API·DB·OAuth 계정과 배포 환경에 접근하거나 배포를 실행하지 않는다. 테스트에는 로컬 데이터와 테스트 자격증명만 사용하고 비밀정보를 저장소·PR·로그에 노출하지 않는다.

## Git 및 PR

- 원격 `main`을 기준으로 저장소별 작업 브랜치를 사용한다. 기존 작업과 변경을 보존한다. 여러 저장소를 수정하는 요청에서는 검증과 Draft PR을 저장소마다 관리하고 의존하는 PR을 서로 연결한다.
- 코드 변경은 [`$fitlog-loop`](.agents/skills/fitlog-loop/SKILL.md)로 진행한다. 저장소 루트에서 호출해 해당 저장소의 지침과 검증 명령을 사용한다.
- 자체 검토 후 요청에 포함된 Draft PR을 만든다. 본문에 백로그 또는 Issue, 관련 PRD·Tech Spec, 변경 요약, 검증 명령·결과, 남은 항목을 기록한다. Draft PR의 GitHub Actions 결과를 확인해 기록한다. 기능 변경·버그 수정의 커밋과 병합 메시지에 `[skip ci]` 등 CI 생략 문구를 추가하지 않는다.
- 코드 PR은 사용자 승인 후 수동 병합한다. 구현 동기화만 담긴 Docs PR은 승인된 병합 커밋이 지정한 문서 SHA로 검증한 뒤 자동 병합할 수 있다. 요구사항, 보안 정책, 제품 범위와 아키텍처 결정은 별도 승인을 받는다. [자동 병합 기준](https://github.com/pby1360/fitlog-v2-docs/blob/main/operations/DOCS_SYNC.md)
- `main` 직접 수정과 푸시를 금지한다. 운영 배포는 사용자 승인 후 `main`에 병합된 배포 대상 변경에서 GitHub Actions가 수행한다. 에이전트는 운영 배포나 `workflow_dispatch`를 직접 실행하지 않는다. [배포 정책](https://github.com/pby1360/fitlog-v2-docs/blob/main/operations/DEPLOYMENT.md)
