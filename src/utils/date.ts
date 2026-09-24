// 서비스 날짜 기준은 한국 시간(KST)이다.
// Date.toISOString() 은 UTC 기준이라 KST 00:00~09:00 에 날짜가 하루 밀리므로 날짜 문자열에는 사용하지 않는다.

const SERVICE_TIME_ZONE = 'Asia/Seoul';

// en-CA 로케일은 YYYY-MM-DD 형식으로 출력한다
const kstDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SERVICE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const kstTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: SERVICE_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const DAY_MS = 24 * 60 * 60 * 1000;

/** 주어진 시각의 한국 날짜 (YYYY-MM-DD) */
export const toKstDateString = (date: Date): string => kstDateFormatter.format(date);

/** 주어진 시각의 한국 시:분 (HH:mm) */
export const toKstTimeString = (date: Date): string => kstTimeFormatter.format(date);

/** 오늘로부터 days 일 전(음수면 이후)의 한국 날짜 */
export const kstDateDaysAgo = (days: number, now: Date = new Date()): string =>
  toKstDateString(new Date(now.getTime() - days * DAY_MS));

/** 해당 월의 첫날과 마지막 날 (YYYY-MM-DD). month 는 1~12 */
export const monthRange = (year: number, month: number): { startDate: string; endDate: string } => {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return { startDate: `${year}-${mm}-01`, endDate: `${year}-${mm}-${String(lastDay).padStart(2, '0')}` };
};
