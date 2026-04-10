import { formatDate, getTodayStr, offsetDate } from './date.utils';

describe('DateUtils', () => {

  it('should correctly format date to YYYY-MM-DD', () => {
    const d1 = new Date(2023, 0, 5); // 5 Jan 2023
    expect(formatDate(d1)).toBe('2023-01-05');

    const d2 = new Date(2023, 11, 25); // 25 Dec 2023
    expect(formatDate(d2)).toBe('2023-12-25');
  });

  it('should correctly return today date string in YYYY-MM-DD', () => {
    const tdStr = getTodayStr();
    expect(tdStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const parts = tdStr.split('-');
    expect(parts.length).toBe(3);
  });

  it('should calculate offset date correctly', () => {
    const base = new Date(2023, 0, 5); // 5 Jan 2023
    const nextDay = offsetDate(1, base);
    expect(nextDay.getDate()).toBe(6);

    const prevDay = offsetDate(-1, base);
    expect(prevDay.getDate()).toBe(4);
  });

});
