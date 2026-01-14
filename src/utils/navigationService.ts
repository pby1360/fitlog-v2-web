import { NavigateFunction } from 'react-router-dom';

let navigate: NavigateFunction | null = null;

export const setNavigator = (navigator: NavigateFunction) => {
  navigate = navigator;
};

export const getNavigator = (): NavigateFunction | null => {
  return navigate;
};

export const redirectToHome = () => {
  alert('인증이 만료되었습니다. 다시 로그인해주세요.');
  if (navigate) {
    navigate('/');
  } else {
    console.warn('Navigator not set, falling back to window.location.reload()');
    window.location.reload();
  }
};
