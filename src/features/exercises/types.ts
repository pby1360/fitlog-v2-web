export interface WorkoutPartResponse {
  id: number;
  name: string;
  editable: boolean; // 본인이 만든 부위만 true (공용 부위는 수정/삭제 불가)
}

export interface WorkoutResponse {
  id: number;
  name: string;
  bodyPart: string;
  bodyPartId: number;
  editable: boolean; // 본인이 만든 운동만 true (공용 운동은 수정/삭제 불가)
}
