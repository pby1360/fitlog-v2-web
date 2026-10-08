import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExercisePickerModal, type PendingSet, type WorkoutResponse } from '@/features/exercises';
import {
  CompleteDialog,
  CurrentSetPanel,
  RestPanel,
  SessionConfirmDialog,
  SessionExerciseList,
  SessionHeader,
  SessionProgress,
  SessionStats,
  getRemainingIndexes,
  getSessionProgress,
  isActiveStatus,
  useWorkoutSession,
  type SessionExercise,
} from '@/features/session';
import { ErrorBanner } from '@/shared/ui/ErrorBanner';

export default function WorkoutSessionPage() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  const session = useWorkoutSession({
    soundEnabled,
    onWorkoutCompleted: () => setShowCompleteModal(true),
  });
  const { workoutSession, allExercises } = session;

  if (!workoutSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 dark:border-indigo-500 border-dashed rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">운동 세션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 세션에 저장된 이름을 우선 사용한다 (종목 이름이 바뀌거나 보관돼 카탈로그에 없어도 표시)
  const catalogValue = (exerciseId: number, property: keyof WorkoutResponse) =>
    allExercises.find(ex => ex.id === exerciseId)?.[property] || '';
  const getExerciseName = (exercise: SessionExercise) => exercise.workoutName || String(catalogValue(exercise.exerciseId, 'name'));

  const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
  const currentSet = currentExercise?.sets[workoutSession.currentSetIndex];
  const currentBodyPart = currentExercise ? (currentExercise.workoutPartName || String(catalogValue(currentExercise.exerciseId, 'bodyPart'))) : '';
  const currentExerciseName = currentExercise ? getExerciseName(currentExercise) : '';
  const remainingIndexes = isActiveStatus(workoutSession.status) ? getRemainingIndexes(workoutSession) : [];

  const handleAddExercise = async (workout: WorkoutResponse, sets: PendingSet[]) => {
    if (await session.addExercise(workout, sets)) setShowAddExerciseModal(false);
  };

  const handleStop = async () => {
    await session.stop();
    setShowStopModal(false);
  };

  const handleSkip = () => {
    setShowSkipModal(false);
    session.skipExercise();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <SessionHeader
        programName={workoutSession.programName}
        status={workoutSession.status}
        isResting={session.isResting}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onPause={session.pause}
        onResume={session.resume}
        onStop={() => setShowStopModal(true)}
        onComplete={session.complete}
      />

      {session.actionError && (
        <ErrorBanner
          action={
            <button onClick={session.clearActionError} className="shrink-0 font-medium" aria-label="오류 닫기">
              <i className="ri-close-line" />
            </button>
          }
        >
          {session.actionError}
        </ErrorBanner>
      )}

      <SessionStats
        totalTime={session.totalTime}
        exerciseTime={session.elapsedExerciseTime}
        bodyPart={currentBodyPart}
        exerciseName={currentExerciseName}
      />

      <SessionProgress progress={getSessionProgress(workoutSession)} />

      {session.isResting && (
        <RestPanel
          restTimeLeft={session.restTimeLeft}
          onSkipRest={session.stopRest}
          onSkipExercise={() => setShowSkipModal(true)}
        />
      )}

      {workoutSession.status === 'IN_PROGRESS' && currentSet && (
        <CurrentSetPanel
          key={currentSet.id}
          set={currentSet}
          setNumber={workoutSession.currentSetIndex + 1}
          setCount={currentExercise?.sets.length ?? 0}
          isResting={session.isResting}
          isCompletingSet={session.isCompletingSet}
          isAddingSet={session.isAddingSet}
          onComplete={session.completeSet}
          onSkip={() => setShowSkipModal(true)}
          onAddSet={session.addSet}
        />
      )}

      <SessionExerciseList
        session={workoutSession}
        remainingIndexes={remainingIndexes}
        isReordering={session.isReordering}
        getExerciseName={getExerciseName}
        onMove={session.moveRemainingExercise}
        onAddExercise={() => setShowAddExerciseModal(true)}
      />

      {showAddExerciseModal && (
        <ExercisePickerModal
          workouts={allExercises}
          isAdded={(workoutId) => workoutSession.exercises.some(ex => ex.exerciseId === workoutId)}
          onConfirm={handleAddExercise}
          onClose={() => setShowAddExerciseModal(false)}
          isSubmitting={session.isAddingExercise}
        />
      )}

      {showCompleteModal && (
        <CompleteDialog totalTime={session.totalTime} onConfirm={() => navigate('/history')} />
      )}

      {showStopModal && (
        <SessionConfirmDialog
          title="운동 종료"
          message="정말로 운동을 종료하시겠습니까? 지금까지의 기록은 저장되지 않습니다."
          confirmLabel="종료"
          confirmClassName="bg-red-600 hover:bg-red-700"
          onConfirm={handleStop}
          onCancel={() => setShowStopModal(false)}
        />
      )}

      {showSkipModal && (
        <SessionConfirmDialog
          title="운동 건너뛰기"
          message={
            <>
              현재 운동({currentExerciseName})을 건너뛰고 다음 운동으로 이동하시겠습니까?
              남은 세트는 미완료 상태로 유지됩니다.
            </>
          }
          confirmLabel="건너뛰기"
          confirmClassName="bg-orange-600 hover:bg-orange-700"
          onConfirm={handleSkip}
          onCancel={() => setShowSkipModal(false)}
        />
      )}
    </div>
  );
}
