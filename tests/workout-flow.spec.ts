import { expect, test } from '@playwright/test';
import type { ProgramResponse, WorkoutSessionResponse } from '../src/services/api';
import { historyPage, logsPath, mockFitLogApi, signInFixture, testTokens } from './support/fitlog-api';

const startTime = '2026-11-18T13:00:00Z';
const endTime = '2026-11-18T13:02:00Z';
const workout = { id: 17, name: '스쿼트', bodyPart: '하체', bodyPartId: 4, editable: false };
const plannedSets = [
  { setNumber: 1, weight: 35, reps: 10, restTime: 30 },
  { setNumber: 2, weight: 35, reps: 10, restTime: 0 },
];
const program: ProgramResponse = {
  id: 28,
  name: '하체 운동 검증 프로그램',
  description: '테스트용 운동 프로그램',
  createdAt: startTime,
  parts: [{
    id: 5,
    workoutPartId: workout.bodyPartId,
    workoutPartName: workout.bodyPart,
    order: 1,
    exercises: [{
      id: 6,
      workoutId: workout.id,
      workoutName: workout.name,
      workoutPartName: workout.bodyPart,
      order: 1,
      sets: plannedSets.map((set, index) => ({ ...set, id: 60 + index })),
    }],
  }],
};

interface SetWrite {
  workoutSessionExerciseId: number;
  workoutSessionSetId: number;
  actualWeight: number;
  actualReps: number;
  memo: string;
}

test('selects a program, recovers a set write, rests, and opens the completed workout in history', async ({ page }) => {
  const sessionRoot = '/api/workout-sessions';
  const completedSets = new Map<number, SetWrite>();
  const setWrites: SetWrite[] = [];
  const starts: unknown[] = [];
  const session: WorkoutSessionResponse = {
    id: 72,
    workoutProgramId: program.id,
    workoutProgramName: program.name,
    startTime,
    status: 'IN_PROGRESS',
    exercises: [{
      id: 73,
      workoutId: workout.id,
      workoutName: workout.name,
      bodyPart: workout.bodyPart,
      order: 1,
      skipped: false,
      sets: plannedSets.map((set, index) => ({ ...set, id: 74 + index, completed: false, memo: '' })),
    }],
  };
  const logSummary = {
    id: session.id,
    workoutProgramName: program.name,
    startTime,
    endTime,
    durationSeconds: 120,
    completedExercises: 1,
    totalExercises: 1,
    completedSets: 2,
    totalSets: 2,
    bodyParts: [workout.bodyPart],
  };

  await mockFitLogApi(page, async (route, url) => {
    const request = route.request();
    if (url.pathname === '/api/members/me') return route.fulfill({ json: { nickname: '테스트 회원' } });
    expect(request.headers()['authorization']).toBe('Bearer ' + testTokens.accessToken);
    switch (url.pathname) {
      case '/api/workout-programs':
        return route.fulfill({ json: [program] });
      case '/api/workout/workouts':
        return route.fulfill({ json: [workout] });
      case sessionRoot:
        expect(request.method()).toBe('POST');
        starts.push(request.postDataJSON());
        return route.fulfill({ status: 201, json: session });
      case sessionRoot + '/latest':
        return starts.length ? route.fulfill({ json: session }) : route.fulfill({ status: 204 });
      case sessionRoot + '/' + session.id + '/exercises/73/start':
        expect(request.method()).toBe('PATCH');
        return route.fulfill({ status: 204 });
      case sessionRoot + '/' + session.id + '/complete-set': {
        expect(request.method()).toBe('PATCH');
        const write: SetWrite = request.postDataJSON();
        setWrites.push(write);
        if (setWrites.length === 1) {
          return route.fulfill({ status: 503, json: { message: '잠시 후 다시 시도해주세요.' } });
        }
        const exercise = session.exercises[0];
        const set = exercise.sets.find(candidate => candidate.id === write.workoutSessionSetId);
        expect(write.workoutSessionExerciseId).toBe(exercise.id);
        expect(set).toBeDefined();
        expect(completedSets.has(write.workoutSessionSetId)).toBe(false);
        if (!set) return route.abort();
        completedSets.set(set.id, write);
        Object.assign(set, {
          completed: true, actualWeight: write.actualWeight, actualReps: write.actualReps, completedAt: endTime,
        });
        if (completedSets.size === plannedSets.length) session.status = 'COMPLETED';
        return route.fulfill({ json: session });
      }
      case logsPath:
        return route.fulfill({ json: historyPage(session.status === 'COMPLETED' ? [logSummary] : []) });
      case logsPath + '/' + session.id:
        return route.fulfill({ json: { ...logSummary, exercises: session.exercises } });
      default:
        return route.abort();
    }
  });

  await page.clock.install({ time: new Date(startTime) });
  await signInFixture(page);
  await page.goto('/workout');
  const start = page.getByRole('button', { name: '운동 시작', exact: true });
  await expect(page.getByRole('heading', { name: program.name })).toBeVisible();
  await start.click();
  await start.click();
  await expect(page).toHaveURL('/workout/session');
  expect(starts).toEqual([{
    workoutProgramId: program.id,
    customExercises: [{ workoutId: workout.id, order: 1, sets: plannedSets }],
  }]);

  const weight = page.locator('#actual-weight');
  const reps = page.locator('#actual-reps');
  const completeSet = page.getByRole('button', { name: '세트 완료', exact: true });
  await weight.fill('42.5');
  await reps.fill('12');
  await completeSet.click();

  await expect(page.getByText(/세트 기록 저장에 실패했습니다/)).toBeVisible();
  await expect(weight).toHaveValue('42.5');
  await expect(reps).toHaveValue('12');
  expect(completedSets.size).toBe(0);
  await completeSet.click();

  const skipRest = page.getByRole('button', { name: '휴식 건너뛰기' });
  await expect(skipRest).toBeVisible();
  await page.clock.fastForward(31_000);
  await expect(skipRest).toBeHidden();

  await weight.fill('47.5');
  await reps.fill('9');
  await completeSet.click();
  await expect(page.getByRole('heading', { name: '운동 완료!' })).toBeVisible();

  const firstSet = { workoutSessionExerciseId: 73, workoutSessionSetId: 74, actualWeight: 42.5, actualReps: 12 };
  expect(setWrites).toEqual([
    expect.objectContaining(firstSet),
    expect.objectContaining(firstSet),
    expect.objectContaining({
      workoutSessionExerciseId: 73, workoutSessionSetId: 75, actualWeight: 47.5, actualReps: 9,
    }),
  ]);

  await page.getByRole('button', { name: '기록 보러가기' }).click();
  await expect(page).toHaveURL('/history');
  await page.getByRole('heading', { name: program.name }).click();
  await expect(page).toHaveURL('/history/' + session.id);
  await expect(page.getByText(workout.name, { exact: true })).toBeVisible();
  await expect(page.getByText('42.5', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText('47.5', { exact: true }).filter({ visible: true })).toBeVisible();
});
