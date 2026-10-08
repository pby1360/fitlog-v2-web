import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PreStartEditor,
  ProgramPicker,
  StartingOverlay,
  useWorkoutStart,
  type StartProgram,
} from '@/features/workout-start';

export default function WorkoutPage() {
  const location = useLocation();
  // 선택한 프로그램이 있으면 시작 전 편집 화면을 보여준다
  const [selectedProgram, setSelectedProgram] = useState<StartProgram | null>(null);

  // /programs 목록의 "운동 시작" 버튼으로 진입한 경우 해당 프로그램을 바로 편집 화면으로
  const selectFromRouteState = (programs: StartProgram[]) => {
    const selectedProgramId = (location.state as { selectedProgramId?: number } | null)?.selectedProgramId;
    if (selectedProgramId == null) return;
    const target = programs.find(p => p.id === selectedProgramId);
    if (target) setSelectedProgram(target);
  };

  const { programs, allWorkouts, isLoading, loadError, isStarting, startError, clearStartError, startWorkout } =
    useWorkoutStart(selectFromRouteState);

  return (
    <>
      {isStarting && <StartingOverlay />}
      {selectedProgram ? (
        <PreStartEditor
          key={selectedProgram.id}
          program={selectedProgram}
          allWorkouts={allWorkouts}
          isStarting={isStarting}
          startError={startError}
          onClearStartError={clearStartError}
          onBack={() => { clearStartError(); setSelectedProgram(null); }}
          onStart={(exercises) => startWorkout(selectedProgram.id, exercises)}
        />
      ) : (
        <ProgramPicker programs={programs} isLoading={isLoading} loadError={loadError} onSelect={setSelectedProgram} />
      )}
    </>
  );
}
