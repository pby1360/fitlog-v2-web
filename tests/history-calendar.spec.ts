import { expect, test, type Page } from '@playwright/test';

const apiOrigin = 'http://127.0.0.1:8080';
const logsPath = '/api/workout-sessions/logs';

function record(id: number, date: string, name: string) {
  return { id, workoutProgramName: name, startTime: date + 'T19:00:00+09:00',
    endTime: date + 'T19:30:00+09:00', durationSeconds: 1800, totalSets: 1, completedSets: 1 };
}

type RecordSummary = ReturnType<typeof record>;

function logPage(content: RecordSummary[], currentPage = 0, totalPages = 1) {
  return { content, currentPage, totalPages, first: currentPage === 0, last: currentPage + 1 >= totalPages };
}

function holdResponse() {
  let release!: () => void;
  const released = new Promise<void>(resolve => { release = resolve; });
  return { release, released };
}

function isMonthRequest(url: URL, month: string) {
  return url.pathname === logsPath && url.searchParams.get('size') === '200'
    && url.searchParams.get('startDate') === month + '-01';
}

async function mockHistory(
  page: Page,
  respond: (url: URL) => { status?: number; json: unknown } | Promise<{ status?: number; json: unknown }>,
  details: RecordSummary[] = [],
) {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === test.info().project.use.baseURL) return route.continue();
    if (url.origin !== apiOrigin) return route.abort();
    if (url.pathname === logsPath) return route.fulfill(await respond(url));

    const summary = details.find(item => url.pathname === logsPath + '/' + item.id);
    if (summary) {
      return route.fulfill({ json: { ...summary, exercises: [{
        id: summary.id,
        workoutName: '스쿼트',
        sets: [{ id: summary.id, reps: 10, actualReps: 9, actualWeight: 20, restTime: 30, completed: true }],
      }] } });
    }
    return route.fulfill({ status: 404, json: {} });
  });
}

const previousMonth = (page: Page) => page.locator('button').filter({ has: page.locator('.ri-arrow-left-s-line') });

async function openCalendar(page: Page) {
  await page.goto('/history');
  await page.getByRole('button', { name: '캘린더', exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-18T13:00:00Z'));
});

test('older successes and failures cannot overwrite the latest month or request its next page', async ({ page }) => {
  const october = holdResponse();
  const september = holdResponse();
  const octoberPages: string[] = [];
  const augustRecord = record(8, '2026-08-15', '8월 세션');

  await mockHistory(page, async url => {
    if (isMonthRequest(url, '2026-10')) {
      octoberPages.push(url.searchParams.get('page') ?? '');
      await october.released;
      return { json: logPage([record(10, '2026-10-15', '10월 세션')], 0, 2) };
    }
    if (isMonthRequest(url, '2026-09')) {
      await september.released;
      return { status: 503, json: {} };
    }
    return { json: logPage(isMonthRequest(url, '2026-08') ? [augustRecord] : []) };
  });

  await openCalendar(page);
  for (const month of ['2026-10', '2026-09', '2026-08']) {
    const request = page.waitForRequest(req => isMonthRequest(new URL(req.url()), month));
    await previousMonth(page).click();
    await request;
  }

  const currentRecord = page.getByRole('button', { name: augustRecord.workoutProgramName });
  await expect(currentRecord).toBeVisible();

  const oldResponses = ['2026-10', '2026-09'].map(month =>
    page.waitForResponse(res => isMonthRequest(new URL(res.url()), month)));
  october.release();
  september.release();
  for (const response of await Promise.all(oldResponses)) await response.finished();
  // Let both fetch continuations and their React updates run after the bodies arrive.
  await page.evaluate(async () => {
    for (let i = 0; i < 2; i++) await new Promise(resolve => requestAnimationFrame(resolve));
  });

  await expect(page.getByRole('heading', { name: '2026년 8월' })).toBeVisible();
  await expect(currentRecord).toBeVisible();
  await expect(page.getByText('이 달의 운동 기록을 불러오지 못했습니다.')).toHaveCount(0);
  expect(octoberPages).toEqual(['0']);
});

test('calendar detail returns to the previously selected month after a reload', async ({ page }) => {
  const session = record(10, '2026-10-15', '10월 세션');
  await mockHistory(page, url => ({ json: logPage(isMonthRequest(url, '2026-10') ? [session] : []) }), [session]);
  await openCalendar(page);
  await previousMonth(page).click();
  await page.getByRole('button', { name: session.workoutProgramName }).click();
  await expect(page.getByRole('heading', { name: session.workoutProgramName })).toBeVisible();
  await page.reload();
  await expect(page.getByText('스쿼트', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '캘린더로' }).click();
  await expect(page.getByRole('heading', { name: '2026년 10월' })).toBeVisible();
  await expect(page.getByRole('button', { name: session.workoutProgramName })).toBeVisible();
});

test('list detail returns to the same list filter', async ({ page }) => {
  const session = record(4, '2026-11-18', '1주 운동');
  await mockHistory(page, url => ({
    json: logPage(url.searchParams.get('startDate') === '2026-11-11' ? [session] : []),
  }), [session]);
  await page.goto('/history');
  await page.getByRole('button', { name: '1주일', exact: true }).click();
  await page.getByRole('heading', { name: session.workoutProgramName }).click();
  await expect(page.getByText('스쿼트', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '목록으로' }).click();
  await expect(page.getByText('조회 기간', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: session.workoutProgramName })).toBeVisible();
});

test('UTC browser shows the KST month and highlights the KST date at midnight', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-31T15:30:00Z'));
  const query = page.waitForRequest(req => isMonthRequest(new URL(req.url()), '2026-11'));
  await mockHistory(page, () => ({ json: logPage([]) }));
  await openCalendar(page);
  await expect(page.getByRole('heading', { name: '2026년 11월' })).toBeVisible();
  expect(new URL((await query).url()).searchParams.get('endDate')).toBe('2026-11-30');
  await expect(page.locator('[aria-current="date"]')).toHaveText('1');
});

test('leap February includes the 29th in the grid and the requested date range', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2024-03-01T03:00:00Z'));
  const session = record(29, '2024-02-29', '윤년 운동');
  await mockHistory(page, url => ({ json: logPage(isMonthRequest(url, '2024-02') ? [session] : []) }));
  await openCalendar(page);
  const query = page.waitForRequest(req => isMonthRequest(new URL(req.url()), '2024-02'));
  await previousMonth(page).click();
  expect(new URL((await query).url()).searchParams.get('endDate')).toBe('2024-02-29');
  await expect(page.getByRole('button', { name: session.workoutProgramName })).toBeVisible();
});

test('201 records are available without duplicate month requests', async ({ page }) => {
  const first = Array.from({ length: 200 }, (_, i) => record(i + 1, '2026-11-18', '앞 페이지 ' + (i + 1)));
  const last = record(201, '2026-11-01', '201번째 운동');
  const pages: string[] = [];
  await mockHistory(page, url => {
    if (!isMonthRequest(url, '2026-11')) return { json: logPage([]) };
    const number = url.searchParams.get('page') ?? '';
    pages.push(number);
    return { json: number === '0' ? logPage(first, 0, 2) : logPage([last], 1, 2) };
  }, [last]);

  await openCalendar(page);
  await page.getByRole('button', { name: last.workoutProgramName }).click();
  await expect(page.getByRole('heading', { name: last.workoutProgramName })).toBeVisible();
  expect(pages).toEqual(['0', '1']);
});

test('mobile calendar keeps two previews and opens the third record through the day list', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  const sessions = [1, 2, 3].map(id => record(id, '2026-11-18', '같은 날 운동 ' + id));
  await mockHistory(page, () => ({ json: logPage(sessions) }), sessions);
  await openCalendar(page);
  await expect(page.getByRole('button', { name: sessions[0].workoutProgramName })).toBeVisible();
  await expect(page.getByRole('button', { name: sessions[1].workoutProgramName })).toBeVisible();
  await expect(page.getByRole('button', { name: sessions[2].workoutProgramName })).toHaveCount(0);
  await page.getByRole('button', { name: /\+1개 더/ }).click();
  const dayList = page.getByRole('dialog');
  await expect(dayList).toBeVisible();
  for (const session of sessions) {
    await expect(dayList.getByRole('button', { name: session.workoutProgramName })).toBeVisible();
  }
  await dayList.getByRole('button', { name: sessions[2].workoutProgramName }).click();
  await expect(page.getByRole('heading', { name: sessions[2].workoutProgramName })).toBeVisible();
});

test('empty calendar is distinguishable from an API error', async ({ page }) => {
  await mockHistory(page, () => ({ json: logPage([], 0, 0) }));
  await openCalendar(page);
  await expect(page.getByText('이 달의 운동 기록이 없습니다.')).toBeVisible();
  await expect(page.getByText('이 달의 운동 기록을 불러오지 못했습니다.')).toHaveCount(0);
});

test('retry recovers the selected month after the second page fails', async ({ page }) => {
  const pages: string[] = [];
  const first = record(1, '2026-11-18', '첫 페이지 운동');
  const last = record(2, '2026-11-17', '둘째 페이지 운동');
  await mockHistory(page, url => {
    if (!isMonthRequest(url, '2026-11')) return { json: logPage([]) };
    const number = url.searchParams.get('page') ?? '';
    pages.push(number);
    if (number === '0') return { json: logPage([first], 0, 2) };
    return pages.length === 2 ? { status: 503, json: {} } : { json: logPage([last], 1, 2) };
  });

  await openCalendar(page);
  await expect(page.getByText('이 달의 운동 기록을 불러오지 못했습니다.')).toBeVisible();
  await expect(page.getByText('이 달의 운동 기록이 없습니다.')).toHaveCount(0);
  await page.getByRole('button', { name: '다시 시도' }).click();
  await expect(page.getByRole('button', { name: first.workoutProgramName })).toBeVisible();
  await expect(page.getByRole('button', { name: last.workoutProgramName })).toBeVisible();
  expect(pages).toEqual(['0', '1', '0', '1']);
});

test('list uses the default date range, resets filtering to page one and pages through all records', async ({ page }) => {
  const requests: string[][] = [];
  await mockHistory(page, url => {
    const number = url.searchParams.get('page') ?? '';
    const start = url.searchParams.get('startDate') ?? '';
    const end = url.searchParams.get('endDate') ?? '';
    requests.push([number, start, end]);
    return { json: logPage([record(1, '2026-11-18', start ? '기간 조회 운동' : '전체 운동 ' + number)],
      Number(number), 2) };
  });
  await page.goto('/history');
  await expect(page.getByRole('heading', { name: '기간 조회 운동' })).toBeVisible();
  expect(requests).toContainEqual(['0', '2026-10-19', '2026-11-18']);
  await page.getByRole('button', { name: '전체', exact: true }).click();
  await expect(page.getByRole('heading', { name: '전체 운동 0' })).toBeVisible();
  await page.getByRole('button', { name: '2', exact: true }).click();
  await expect(page.getByRole('heading', { name: '전체 운동 1' })).toBeVisible();
  expect(requests.slice(-2)).toEqual([['0', '', ''], ['1', '', '']]);
});

test('calendar toggle preserves the list range and page', async ({ page }) => {
  await mockHistory(page, url => {
    if (url.searchParams.get('size') !== '10') return { json: logPage([]) };
    const number = Number(url.searchParams.get('page'));
    const name = url.searchParams.get('startDate') === '2026-11-11' ? '1주 페이지 ' + (number + 1) : '기본 목록';
    return { json: logPage([record(1, '2026-11-18', name)], number, 2) };
  });
  await page.goto('/history');
  await page.getByRole('button', { name: '1주일', exact: true }).click();
  await page.getByRole('button', { name: '2', exact: true }).click();
  await expect(page.getByRole('heading', { name: '1주 페이지 2' })).toBeVisible();
  await page.getByRole('button', { name: '캘린더', exact: true }).click();
  await expect(page.getByRole('heading', { name: '2026년 11월' })).toBeVisible();
  await previousMonth(page).click();
  await page.getByRole('button', { name: '목록', exact: true }).click();
  await expect(page.getByRole('heading', { name: '1주 페이지 2' })).toBeVisible();
});

test('direct calendar opens once and crosses the year boundary in KST', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2025-12-31T15:30:00Z'));
  const queries: string[][] = [];
  await mockHistory(page, url => {
    queries.push([
      url.searchParams.get('size') ?? '',
      url.searchParams.get('startDate') ?? '',
      url.searchParams.get('endDate') ?? '',
    ]);
    return { json: logPage([]) };
  });
  await page.goto('/history?view=calendar');
  await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
  await expect(page.locator('[aria-current="date"]')).toHaveText('1');
  await expect(page.getByText('이 달의 운동 기록이 없습니다.')).toBeVisible();
  await previousMonth(page).click();
  await expect(page.getByRole('heading', { name: '2025년 12월' })).toBeVisible();
  await expect(page.getByText('이 달의 운동 기록이 없습니다.')).toBeVisible();
  expect(queries).toEqual([
    ['200', '2026-01-01', '2026-01-31'],
    ['200', '2025-12-01', '2025-12-31'],
  ]);
});
