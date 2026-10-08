// 운동 시작 전 편집하는 운동 (시작 시 세션의 customExercises 로 보낸다)
export interface StartExercise {
  id: string; // 클라이언트 임시 ID
  exerciseId: number;
  workoutName: string;
  workoutPartName: string;
  sets: {
    id: string;
    reps: number;
    weight?: number;
    restTime: number;
    memo?: string;
  }[];
}

export interface StartProgram {
  id: number;
  name: string;
  description: string;
  exercises: StartExercise[];
  createdAt: string;
}
