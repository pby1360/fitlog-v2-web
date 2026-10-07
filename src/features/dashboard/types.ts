// Dashboard Stats Types
export interface DashboardWeeklyProgress {
    dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    workoutCount: number;
    totalDurationSeconds: number;
}

export interface DashboardBodyPartStat {
    bodyPart: string;
    count: number;
    percentage: number;
}

export interface DashboardMonthlyStat {
    year: number;
    month: number;
    workoutCount: number;
    totalDurationSeconds: number;
}

export interface DashboardRecentWorkout {
    id: number;
    programName: string;
    date: string; // "YYYY-MM-DD"
    totalDurationSeconds: number;
    completedSets: number;
    totalSets: number;
}

export interface DashboardStatsResponse {
    totalWorkouts: number;
    totalDurationSeconds: number;
    totalCompletedSets: number;
    averageCompletionRate: number;
    currentStreak: number;
    weeklyWorkouts: number;
    monthlyWorkouts: number;
    longestWorkoutSeconds: number;
    favoriteBodyPart: string | null;
    weeklyProgress: DashboardWeeklyProgress[];
    bodyPartStats: DashboardBodyPartStat[];
    monthlyStats: DashboardMonthlyStat[];
    recentWorkouts: DashboardRecentWorkout[];
}
