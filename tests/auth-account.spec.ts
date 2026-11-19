import { expect, test, type Page } from '@playwright/test';
import type { DashboardStatsResponse } from '../src/services/api';
import { mockFitLogApi, savedTokens, signInFixture, testTokens } from './support/fitlog-api';

const member = {
  nickname: '테스트 회원',
  provider: 'GOOGLE',
  email: 'fixture@example.test',
  createdAt: '2026-11-01T10:00:00+09:00',
  totalWorkoutDays: 0,
  totalCompletedSets: 0,
  totalDurationSeconds: 0,
};

const emptyDashboard: DashboardStatsResponse = {
  totalWorkouts: 0,
  totalDurationSeconds: 0,
  totalCompletedSets: 0,
  averageCompletionRate: 0,
  longestWorkoutSeconds: 0,
  favoriteBodyPart: null,
  currentStreak: 0,
  weeklyWorkouts: 0,
  monthlyWorkouts: 0,
  weeklyProgress: [],
  monthlyStats: [],
  bodyPartStats: [],
  recentWorkouts: [],
};

async function expectSignedOut(page: Page) {
  await expect(page).toHaveURL('/');
  await expect.poll(() => savedTokens(page)).toEqual({ accessToken: null, refreshToken: null });
}

test('OAuth callback exchanges the code once, saves the tokens and leaves no code in the URL', async ({ page }) => {
  const exchanges: unknown[] = [];
  await mockFitLogApi(page, async (route, url) => {
    if (url.pathname === '/api/auth/token') {
      expect(route.request().method()).toBe('POST');
      exchanges.push(route.request().postDataJSON());
      return route.fulfill({ json: { ...testTokens, imageUrl: '', provider: 'KAKAO' } });
    }
    if (url.pathname === '/api/dashboard/stats') return route.fulfill({ json: emptyDashboard });
    if (url.pathname === '/api/workout-sessions/latest') return route.fulfill({ status: 204 });
    if (url.pathname === '/api/members/me') return route.fulfill({ json: member });
    return route.abort();
  });

  await page.goto('/auth/callback?code=fixture-once');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('이번 주 0회 운동했어요')).toBeVisible();
  expect(await savedTokens(page)).toEqual(testTokens);
  expect(exchanges).toEqual([{ code: 'fixture-once' }]);

  await page.reload();
  await expect(page.getByText('이번 주 0회 운동했어요')).toBeVisible();
  expect(exchanges).toEqual([{ code: 'fixture-once' }]);
});

test('an OAuth provider error displays recovery without requesting a token exchange', async ({ page }) => {
  const apiRequests: string[] = [];
  await mockFitLogApi(page, async (route, url) => {
    apiRequests.push(url.pathname);
    return route.abort();
  });

  const message = '로그인이 취소되었습니다.';
  await page.goto('/auth/callback?error=access_denied&message=' + encodeURIComponent(message));
  await expect(page.getByRole('heading', { name: '로그인 실패' })).toBeVisible();
  await expect(page.getByText(message)).toBeVisible();
  await page.getByRole('button', { name: '홈으로 돌아가기' }).click();
  await expectSignedOut(page);
  expect(apiRequests).toEqual([]);
});

test('an expired login code clears the URL, reports expiry and cannot be replayed by reload', async ({ page }) => {
  const exchanges: unknown[] = [];
  await mockFitLogApi(page, async (route, url) => {
    expect(url.pathname).toBe('/api/auth/token');
    exchanges.push(route.request().postDataJSON());
    return route.fulfill({ status: 401, json: { message: 'Invalid or expired login code' } });
  });

  await page.goto('/auth/callback?code=fixture-expired');
  await expect(page.getByText('로그인이 만료되었습니다. 다시 시도해주세요.')).toBeVisible();
  await expect(page).toHaveURL('/auth/callback');
  expect(await savedTokens(page)).toEqual({ accessToken: null, refreshToken: null });
  await page.reload();
  await expect(page.getByText('로그인 정보를 받아오지 못했습니다. 다시 시도해주세요.')).toBeVisible();
  expect(exchanges).toEqual([{ code: 'fixture-expired' }]);
});

test('concurrent 401 responses share one token refresh and retry with the renewed access token', async ({ page }) => {
  const fresh = { accessToken: 'renewed-access', refreshToken: 'renewed-refresh' };
  const authorizations: (string | undefined)[] = [];
  const refreshes: unknown[] = [];

  await mockFitLogApi(page, async (route, url) => {
    const request = route.request();
    if (url.pathname === '/api/members/me') {
      const authorization = request.headers().authorization;
      authorizations.push(authorization);
      if (authorization === 'Bearer ' + fresh.accessToken) return route.fulfill({ json: member });
      return route.fulfill({ status: 401, json: { message: 'expired' } });
    }
    if (url.pathname === '/api/auth/refresh') {
      expect(request.method()).toBe('POST');
      refreshes.push(request.postDataJSON());
      // Keep the refresh pending until at least two old-token calls have reached the API.
      await expect.poll(() => authorizations.filter(value => value === 'Bearer ' + testTokens.accessToken).length)
        .toBeGreaterThanOrEqual(2);
      return route.fulfill({ json: fresh });
    }
    return route.abort();
  });

  await signInFixture(page);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: member.nickname, exact: true })).toBeVisible();
  await expect.poll(() => authorizations.filter(value => value === 'Bearer ' + fresh.accessToken).length)
    .toBeGreaterThanOrEqual(2);
  expect(refreshes).toEqual([{ refreshToken: testTokens.refreshToken }]);
  expect(await savedTokens(page)).toEqual(fresh);
});

test('failed refresh clears expired credentials and prevents access to the profile', async ({ page }) => {
  const refreshes: unknown[] = [];
  await mockFitLogApi(page, async (route, url) => {
    if (url.pathname === '/api/auth/refresh') refreshes.push(route.request().postDataJSON());
    if (['/api/members/me', '/api/auth/refresh'].includes(url.pathname)) {
      return route.fulfill({ status: 401, json: { message: 'expired' } });
    }
    return route.abort();
  });

  await signInFixture(page);
  await page.goto('/profile');
  await expectSignedOut(page);
  await expect(page.getByRole('heading', { name: member.nickname, exact: true })).toHaveCount(0);
  expect(refreshes).toEqual([{ refreshToken: testTokens.refreshToken }]);
});

test('sign out revokes the refresh token and blocks a direct signed-out profile visit', async ({ page }) => {
  const logouts: unknown[] = [];
  const profileAuthorization: (string | undefined)[] = [];
  await mockFitLogApi(page, async (route, url) => {
    const request = route.request();
    if (url.pathname === '/api/auth/logout') {
      expect(request.method()).toBe('POST');
      logouts.push(request.postDataJSON());
      return route.fulfill({ status: 204 });
    }
    if (url.pathname !== '/api/members/me') return route.abort();
    const authorization = request.headers().authorization;
    profileAuthorization.push(authorization);
    return authorization ? route.fulfill({ json: member }) : route.fulfill({ status: 401, json: {} });
  });

  await signInFixture(page);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: member.nickname, exact: true })).toBeVisible();
  await page.getByRole('button').filter({ has: page.locator('.ri-user-line') }).click();
  await page.getByRole('button', { name: '로그아웃' }).click();
  await expectSignedOut(page);
  expect(logouts).toEqual([{ refreshToken: testTokens.refreshToken }]);

  await page.goto('/profile');
  await expectSignedOut(page);
  expect(profileAuthorization).toContain(undefined);
});

for (const status of [204, 409] as const) {
  test(`account deletion confirmation handles HTTP ${status}`, async ({ page }) => {
    const deleteRequests: (string | undefined)[] = [];
    const conflict = '다른 회원의 데이터와 연결된 항목이 있어 탈퇴를 자동으로 완료할 수 없습니다.';
    let deleted = false;
    await mockFitLogApi(page, async (route, url) => {
      if (url.pathname !== '/api/members/me') return route.abort();
      const request = route.request();
      const authorization = request.headers().authorization;
      if (request.method() === 'DELETE') {
        deleteRequests.push(authorization);
        if (status === 409) return route.fulfill({ status, json: { message: conflict } });
        deleted = true;
        return route.fulfill({ status });
      }
      if (!deleted && authorization) return route.fulfill({ json: member });
      return route.fulfill({ status: 401, json: {} });
    });

    await signInFixture(page);
    await page.goto('/profile');
    await page.getByRole('button', { name: '계정 삭제' }).click();
    await expect(page.getByRole('heading', { name: '계정을 삭제할까요?' })).toBeVisible();
    await page.getByRole('button', { name: '취소', exact: true }).click();
    await expect(page.getByRole('heading', { name: '계정을 삭제할까요?' })).toHaveCount(0);
    expect(deleteRequests).toEqual([]);

    await page.getByRole('button', { name: '계정 삭제' }).click();
    await page.getByRole('button', { name: '영구 삭제' }).click();
    if (status === 409) {
      await expect(page.getByText(conflict, { exact: true })).toBeVisible();
      await expect(page).toHaveURL('/profile');
      expect(await savedTokens(page)).toEqual(testTokens);
    } else {
      await expectSignedOut(page);
      await page.goto('/profile');
      await expectSignedOut(page);
      await expect(page.getByRole('heading', { name: member.nickname, exact: true })).toHaveCount(0);
    }
    expect(deleteRequests).toEqual(['Bearer ' + testTokens.accessToken]);
  });
}
