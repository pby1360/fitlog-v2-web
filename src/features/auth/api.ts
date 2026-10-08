import { API_BASE_URL, sendRequest, toApiError } from '@/shared/api/client';
import { getRefreshToken } from '@/shared/lib/authStorage';
import type { LoginTokens } from './types';

// OAuth 콜백으로 받은 일회용 코드를 토큰으로 교환한다 (코드는 60초, 1회용)
export const exchangeLoginCode = async (code: string): Promise<LoginTokens> => {
  const response = await sendRequest(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  }, { 'Content-Type': 'application/json' });
  if (!response.ok) {
    throw await toApiError(response);
  }
  return response.json();
};

// 서버에 저장된 Refresh Token을 폐기한다. 네트워크 실패여도 로컬 로그아웃은 계속 진행해야 하므로 예외를 던지지 않는다.
export const revokeRefreshToken = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // 무시: 토큰은 만료 시각이 지나면 어차피 무효화된다
  }
};
