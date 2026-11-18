# FitLog V2 웹 개발 규칙

## 공식 문서와 작업 범위

1. [문서 관리 규칙](https://github.com/pby1360/fitlog-v2-docs/blob/main/AGENTS.md), [현재 상태](https://github.com/pby1360/fitlog-v2-docs/blob/main/status/CURRENT_STATUS.md), [백로그](https://github.com/pby1360/fitlog-v2-docs/blob/main/status/BACKLOG.md)를 읽는다. [기능 목록](https://github.com/pby1360/fitlog-v2-docs/blob/main/features/README.md)에서 해당 PRD·Tech Spec과 완료 조건, 관련 Issue·ADR을 찾는다.
2. 문서 저장소의 원격 `main`을 기준으로 확인한다. 같은 작업 환경에 문서 체크아웃이 있으면 원격 기준 커밋과 대조한다. 체크아웃이 없어도 공식 GitHub 링크를 사용하며, 기준 문서와 코드가 어긋나면 확인한 커밋과 근거를 기록한다.
3. 요구사항이나 공개 API 계약, 데이터 모델·마이그레이션 정책, 인증·보안, 장기 아키텍처를 변경해야 하면 영향과 대안, 호환성·검증 계획을 제시하고 해당 변경의 사용자 승인을 기다린다. 승인된 설계 안의 수정과 검증은 요청 범위에서 진행한다.
4. 승인된 설계 변경은 관련 공식 문서와 ADR에 연결한다. 공식 문서 저장소가 읽기 전용인 작업에서는 필요한 문서 갱신과 출처를 코드 PR에 기록한다. 구현 완료 표시는 실제로 확인한 동작과 검사 범위에 근거한다.

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

- `npm run build`는 타입 검사 후 Vite 결과를 `out/`에 만든다. [워크플로](.github/workflows/deploy.yml)는 `main`·`dev` 대상 PR에서 설치·린트·타입 검사를 수행하고, 번들 빌드는 배포 잡에서 실행한다. 로컬에서 위 네 명령을 모두 확인한다.
- 현재 `package.json`에 웹 테스트 스크립트가 없다. UI 또는 동작 수정은 다음 명령으로 로컬 화면을 시작한 후 로컬 서버 또는 모의 API 응답으로 해당 수용 기준의 브라우저 시나리오를 검증한다. 확인한 경로·데이터·브라우저 흐름을 기록한다. 실제 테스트 스크립트가 추가되면 기존 검사와 함께 실행한다.

  ```sh
  VITE_API_BASE_URL=http://localhost:8080 npm run dev
  ```

- 테스트·검사·검증 시나리오를 삭제하거나 건너뛰어 성공으로 처리하지 않는다. 이미 존재하는 경고와 새 경고를 구분하고, 실행하지 못한 검사는 사유를 기록한다. 운영 API·DB·OAuth 계정과 배포 환경에 접근하거나 배포를 실행하지 않는다. 테스트에는 로컬 데이터와 테스트 자격증명만 사용하고 비밀정보를 저장소·PR·로그에 노출하지 않는다.

## Git 및 PR

- 원격 `main`을 기준으로 저장소별 작업 브랜치를 사용한다. 기존 작업과 변경을 보존한다. 여러 저장소를 수정하는 요청에서는 검증과 Draft PR을 저장소마다 관리하고 의존하는 PR을 서로 연결한다.
- 코드 변경은 [`$fitlog-loop`](.agents/skills/fitlog-loop/SKILL.md)로 진행한다. 저장소 루트에서 호출해 해당 저장소의 지침과 검증 명령을 사용한다.
- 자체 검토 후 요청에 포함된 Draft PR을 만든다. 본문에 백로그 또는 Issue, 관련 PRD·Tech Spec, 변경 요약, 검증 명령·결과, 남은 항목을 기록한다. 배포 잡을 수동 실행하지 않는다.
- `main` 직접 수정과 푸시를 금지한다. 사용자 승인 없이 병합하지 않는다.
