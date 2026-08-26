#!/usr/bin/env bash
# 프론트(fitlog-v2-web) 레포용 WIF 설정. **최초 1회만 실행.**
#
# 백엔드에서 만든 풀/공급자를 재사용하되 두 가지를 처리한다:
#   1) 공급자의 허용 레포 조건에 web 레포 추가
#      (현재 조건은 server 레포만 허용 → 그대로면 web 레포는 인증 거부)
#   2) 프론트 전용 배포 계정 분리
#      → web 레포는 Cloud Run을 못 건드리고, server 레포는 Hosting을 못 건드린다
#
# 사용법: bash gcp-setup-wif-web.sh

set -euo pipefail

# Git Bash에서 gcloud 번들 Python 경로 해결 (없으면 exec: python: not found)
if ! command -v python >/dev/null 2>&1 && [ -z "${CLOUDSDK_PYTHON:-}" ]; then
    for p in \
        "/c/Program Files (x86)/Google/Cloud SDK/google-cloud-sdk/platform/bundledpython/python.exe" \
        "/c/Program Files/Google/Cloud SDK/google-cloud-sdk/platform/bundledpython/python.exe"
    do
        [ -x "$p" ] && { export CLOUDSDK_PYTHON="$p"; break; }
    done
    [ -z "${CLOUDSDK_PYTHON:-}" ] && { echo "gcloud용 Python 미발견. PowerShell에서 실행하세요."; exit 1; }
fi

PROJECT_ID="fitlog-505315"
PROJECT_NUMBER="49782628417"
REPO_SERVER="pby1360/fitlog-v2-server"
REPO_WEB="pby1360/fitlog-v2-web"
POOL="github-pool"
PROVIDER="github-provider"
WEB_SA="fitlog-web-deployer"
WEB_SA_EMAIL="${WEB_SA}@${PROJECT_ID}.iam.gserviceaccount.com"

echo ""
echo "=== 1/4 프론트 배포 전용 서비스계정 ==="
if gcloud iam service-accounts describe "$WEB_SA_EMAIL" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "  이미 존재"
else
    gcloud iam service-accounts create "$WEB_SA" \
        --display-name="GitHub Actions Web Deployer" --project="$PROJECT_ID"
fi

echo ""
echo "=== 2/4 Firebase Hosting 권한만 부여 (Cloud Run 권한 없음) ==="
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${WEB_SA_EMAIL}" \
    --role="roles/firebasehosting.admin" --condition=None >/dev/null
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${WEB_SA_EMAIL}" \
    --role="roles/firebase.viewer" --condition=None >/dev/null
echo "  firebasehosting.admin / firebase.viewer"

echo ""
echo "=== 3/4 공급자 허용 레포에 web 추가 ==="
gcloud iam workload-identity-pools providers update-oidc "$PROVIDER" \
    --location=global --workload-identity-pool="$POOL" \
    --attribute-condition="assertion.repository=='${REPO_SERVER}' || assertion.repository=='${REPO_WEB}'" \
    --project="$PROJECT_ID"
echo "  허용: $REPO_SERVER, $REPO_WEB"

echo ""
echo "=== 4/4 web 레포에만 이 계정 사용 권한 위임 ==="
gcloud iam service-accounts add-iam-policy-binding "$WEB_SA_EMAIL" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.repository/${REPO_WEB}" \
    --project="$PROJECT_ID" >/dev/null
echo "  ${REPO_WEB} 만 허용"

echo ""
echo "════════════════════════════════════════════════════════════"
echo " fitlog-v2-web 레포 → Settings → Secrets and variables"
echo "   → Actions → Variables 탭 → New repository variable"
echo ""
echo " WIF_PROVIDER ="
echo "   projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/providers/${PROVIDER}"
echo ""
echo " DEPLOY_SA ="
echo "   ${WEB_SA_EMAIL}"
echo ""
echo " VITE_API_BASE_URL ="
echo "   https://fitlog-server-49782628417.asia-northeast3.run.app"
echo "   ※ .env 가 gitignore 되어 레포에 없으므로 CI에서 이 값으로 생성한다"
echo "════════════════════════════════════════════════════════════"
echo ""
