import { redirectToHome } from '@/shared/lib/navigation';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '@/shared/lib/authStorage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api'; // 백엔드 API 기본 URL

// API 오류. 서버 오류 응답 형식 {code, message, requestId} 를 그대로 담는다.
// - status: HTTP 상태 (네트워크 오류·시간 초과는 0)
// - code: 서버 오류 코드 (NOT_FOUND, CONFLICT 등) 또는 NETWORK / TIMEOUT
// - requestId: 서버 로그와 같은 값. 사용자 문의 시 해당 요청을 찾는 데 사용
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

// Cloud Run 콜드스타트를 고려한 요청 제한 시간
const REQUEST_TIMEOUT_MS = 20_000;

const newRequestId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// 제한 시간과 requestId 를 붙여 요청한다. 네트워크 오류·시간 초과는 status 0 의 ApiError 로 바꾼다.
export const sendRequest = async (url: string, options: RequestInit | undefined, headers: Record<string, string>): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const requestId = newRequestId();
  try {
    return await fetch(url, { ...options, headers: { ...headers, 'X-Request-Id': requestId }, signal: controller.signal });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.', 0, 'TIMEOUT', requestId);
    }
    throw new ApiError('네트워크 연결을 확인해주세요.', 0, 'NETWORK', requestId);
  } finally {
    clearTimeout(timer);
  }
};

export const toApiError = async (response: Response): Promise<ApiError> => {
  const body = await response.json().catch(() => null);
  return new ApiError(
    body?.message || 'API 요청 실패',
    response.status,
    body?.code,
    body?.requestId ?? response.headers.get('X-Request-Id') ?? undefined,
  );
};

let isRedirecting = false;
let refreshPromise: Promise<string | null> | null = null;

// Refresh 요청 1회.
// - 401/400: 로그인 세션이 끝난 것 → null (호출 측에서 로그아웃)
// - 네트워크 오류/5xx: 일시 장애 → 예외 (로그아웃하지 않고 해당 요청만 실패)
const requestTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  // 네트워크 오류·시간 초과는 sendRequest 가 ApiError(status 0)로 던진다 → 로그아웃하지 않음
  const response = await sendRequest(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }, { 'Content-Type': 'application/json' });

  if (response.status >= 500) {
    throw await toApiError(response);
  }
  if (!response.ok) return null;

  const data = await response.json();
  saveTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
};

// 여러 탭이 같은 Refresh 토큰으로 동시에 재발급하지 않도록 Web Locks 로 직렬화한다.
// 락을 얻었을 때 다른 탭이 이미 토큰을 갱신했다면(저장된 값이 바뀜) 그 토큰을 그대로 쓴다.
const refreshAccessToken = async (staleAccessToken: string | null): Promise<string | null> => {
  const run = async () => {
    const current = getAccessToken();
    if (current && current !== staleAccessToken) return current;
    return requestTokenRefresh();
  };
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('fitlog-token-refresh', run);
  }
  return run();
};

const logout = () => {
  if (!isRedirecting) {
    isRedirecting = true;
    clearTokens();
    redirectToHome();
  }
};

export const fetchWithAuth = async (url: string, options?: RequestInit) => {
  const token = getAccessToken();
  const extraHeaders = (options?.headers ?? {}) as Record<string, string>;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...extraHeaders,
  };

  const response = await sendRequest(url, options, headers);

  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken(token).finally(() => { refreshPromise = null; });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      const retryHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newToken}`,
        ...extraHeaders,
      };
      const retryResponse = await sendRequest(url, options, retryHeaders);

      if (retryResponse.status === 401) {
        logout();
        throw await toApiError(retryResponse);
      }

      if (!retryResponse.ok) {
        throw await toApiError(retryResponse);
      }

      const text = await retryResponse.text();
      return text ? JSON.parse(text) : null;
    }

    logout();
    throw await toApiError(response);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
