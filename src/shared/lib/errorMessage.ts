import { ApiError } from '@/shared/api/client';

// 사용자에게 보여줄 실패 메시지. 서버 요청 ID 가 있으면 문의할 때 쓰도록 붙인다
export const describeError = (action: string, error: unknown) => {
  const detail = error instanceof Error ? error.message : '';
  const requestId = error instanceof ApiError && error.requestId ? ` (요청 ID: ${error.requestId})` : '';
  return `${action}에 실패했습니다. ${detail}${requestId}`;
};
