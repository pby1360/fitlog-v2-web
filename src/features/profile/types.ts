export interface MemberProfile {
  id: number;
  email: string;
  nickname: string;
  imageUrl: string | null;
  provider: string;
  height: number | null;
  weight: number | null;
  goal: string | null;
  experience: string | null;
  createdAt: string;  // "YYYY-MM-DD"
  totalWorkoutDays: number;
  totalCompletedSets: number;
  totalDurationSeconds: number;
}

export interface MemberUpdateRequest {
  nickname: string;
  height: number | null;
  weight: number | null;
  goal: string;
  experience: string;
}
