import { QueryClient } from '@tanstack/react-query';

// 서버 상태 캐시. 화면을 다시 열면 캐시를 먼저 보여주고 서버에서 새로 받아온다(staleTime 0).
// - retry: false — 실패를 바로 화면에 알리고, 401 은 fetchWithAuth 가 토큰 재발급으로 처리한다
// - refetchOnWindowFocus: false — 운동 중 탭을 오가도 화면이 바뀌지 않게 한다
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
