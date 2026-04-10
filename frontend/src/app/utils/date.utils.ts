/**
 * Formats a Date object into a string 'YYYY-MM-DD'.
 */
export function formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns strongly formatted today date string.
 */
export function getTodayStr(): string {
    return formatDate(new Date());
}

/**
 * Returns a new Date object offset by the specified number of days from another date.
 * If baseDate is not provided, uses today.
 */
export function offsetDate(days: number, baseDate: Date = new Date()): Date {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    return d;
}
