import type { MemberProfile } from '../types';

// 선택 목록과 배지 색을 한곳에서 관리한다 (서버에는 value 문자열을 그대로 저장)
export const GOAL_OPTIONS = [
  { value: '체중 감량', label: '체중 감량', badgeClass: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-500/20' },
  { value: '근력 증가', label: '근력 증가', badgeClass: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/20' },
  { value: '체력 향상', label: '체력 향상', badgeClass: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-300 border-green-200 dark:border-green-500/20' },
  { value: '근육량 증가', label: '근육량 증가', badgeClass: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/20' },
  { value: '건강 유지', label: '건강 유지', badgeClass: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-200 dark:border-teal-500/20' },
];

export const EXPERIENCE_OPTIONS = [
  { value: '초급자', label: '초급자 (6개월 미만)', badgeClass: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20' },
  { value: '중급자', label: '중급자 (6개월~2년)', badgeClass: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/20' },
  { value: '고급자', label: '고급자 (2년 이상)', badgeClass: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500/20' },
];

export const NEUTRAL_BADGE_CLASS = 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10';

export const PROVIDER_META: Record<string, { label: string; icon: string }> = {
  GOOGLE: { label: 'Google', icon: 'ri-google-fill' },
  KAKAO: { label: 'Kakao', icon: 'ri-kakao-talk-fill' },
};

// 프로필 수정 폼 값. 숫자도 입력 그대로 문자열로 다루고 저장할 때 바꾼다
export interface EditData {
  nickname: string;
  height: string;
  weight: string;
  goal: string;
  experience: string;
}

export const profileToEditData = (profile: MemberProfile): EditData => ({
  nickname: profile.nickname ?? '',
  height: profile.height != null ? String(profile.height) : '',
  weight: profile.weight != null ? String(profile.weight) : '',
  goal: profile.goal ?? '',
  experience: profile.experience ?? '',
});
