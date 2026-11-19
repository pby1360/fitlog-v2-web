import { test, type Page, type Route } from '@playwright/test';

export const apiOrigin = 'http://127.0.0.1:8080';
export const logsPath = '/api/workout-sessions/logs';

export async function mockFitLogApi(page: Page, handler: (route: Route, url: URL) => Promise<void>) {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === test.info().project.use.baseURL) return route.continue();
    if (url.origin !== apiOrigin) return route.abort();
    return handler(route, url);
  });
}

export function historyPage<T>(content: T[], currentPage = 0, totalPages = 1) {
  return { content, currentPage, totalPages, first: currentPage === 0, last: currentPage + 1 >= totalPages };
}

export const testTokens = { accessToken: 'fixture-access', refreshToken: 'fixture-refresh' };

export async function signInFixture(page: Page) {
  await page.goto('/');
  await page.evaluate(tokens => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('provider', 'GOOGLE');
  }, testTokens);
}

export function savedTokens(page: Page) {
  return page.evaluate(() => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }));
}
