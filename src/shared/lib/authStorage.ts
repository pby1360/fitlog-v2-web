// 로그인 정보는 이 기기의 localStorage 에 둔다. 키 이름은 이 파일에서만 쓴다.

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const IMAGE_URL_KEY = 'imageUrl';
const PROVIDER_KEY = 'provider';

export interface StoredLogin {
  accessToken: string;
  refreshToken: string;
  imageUrl: string;
  provider: string;
}

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const hasAccessToken = () => getAccessToken() !== null;

// 토큰 재발급 결과 저장
export const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// 로그인 직후: 토큰과 프로필 표시용 정보 저장
export const saveLogin = (login: StoredLogin) => {
  saveTokens(login.accessToken, login.refreshToken);
  localStorage.setItem(IMAGE_URL_KEY, login.imageUrl || '');
  localStorage.setItem(PROVIDER_KEY, login.provider);
};

export const getProfileImageUrl = () => localStorage.getItem(IMAGE_URL_KEY);

// 로그아웃·탈퇴: 이 기기에 저장한 값을 모두 지운다 (테마·운동 타이머 보정값 포함)
export const clearLocalData = () => localStorage.clear();
