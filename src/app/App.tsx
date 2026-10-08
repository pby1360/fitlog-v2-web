import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { profileQueries } from '@/features/profile';
import { queryClient } from '@/shared/api/queryClient';
import { hasAccessToken } from '@/shared/lib/authStorage';
import { setNavigator } from '@/shared/lib/navigation';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppRoutes } from './router/AppRoutes';

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
  // 받은 프로필은 캐시에 남아 프로필 화면에서 바로 쓴다.
  useEffect(() => {
    if (hasAccessToken()) {
      queryClient.fetchQuery(profileQueries.me()).catch((error) => {
        console.error('Token validation failed:', error);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter basename={__BASE_PATH__}>
          <AppNavigator />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
