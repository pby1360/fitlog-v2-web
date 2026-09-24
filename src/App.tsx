import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppRoutes } from './router';
import { useEffect } from 'react';
import { getMyInfo } from './services/api';
import { setNavigator } from './utils/navigationService';
import { ThemeProvider } from './contexts/ThemeContext';

const AppNavigator = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);
  return <AppRoutes />;
};

function App() {
  // 저장된 토큰이 있으면 백그라운드로 확인한다 (만료 시 재발급, 불가하면 로그아웃).
  // 첫 화면 렌더링을 이 요청(콜드스타트 시 수 초)에 묶지 않는다. 각 페이지도 401을 스스로 처리한다.
  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      getMyInfo().catch((error) => {
        console.error('Token validation failed:', error);
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter basename={__BASE_PATH__}>
        <AppNavigator />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
