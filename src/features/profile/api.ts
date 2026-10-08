import { API_BASE_URL, fetchWithAuth } from '@/shared/api/client';
import type { MemberProfile, MemberUpdateRequest } from './types';

export const getMyProfile = async (): Promise<MemberProfile> => {
  return fetchWithAuth(`${API_BASE_URL}/members/me`);
};

export const updateMyProfile = async (data: MemberUpdateRequest): Promise<MemberProfile> => {
  return fetchWithAuth(`${API_BASE_URL}/members/me`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// 회원 탈퇴: 서버에서 개인정보·운동 기록·로그인 세션을 모두 파기한다
export const deleteMyAccount = async (): Promise<void> => {
  await fetchWithAuth(`${API_BASE_URL}/members/me`, { method: 'DELETE' });
};
