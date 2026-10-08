import type { NavigateFunction } from 'react-router-dom';

let navigate: NavigateFunction | null = null;

// 홈 화면이 "로그인 만료" 안내를 띄우도록 넘기는 이동 상태
export interface HomeRouteState {
  sessionExpired?: boolean;
}

export const setNavigator = (navigator: NavigateFunction) => {
  navigate = navigator;
};

export const getNavigator = (): NavigateFunction | null => {
  return navigate;
};

// 토큰을 재발급할 수 없을 때: 홈으로 보내 다시 로그인하게 한다
export const redirectToHome = () => {
  if (navigate) {
    const state: HomeRouteState = { sessionExpired: true };
    navigate('/', { state });
  } else {
    console.warn('Navigator not set, falling back to window.location.reload()');
    window.location.reload();
  }
};
