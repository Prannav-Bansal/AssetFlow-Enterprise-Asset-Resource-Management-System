import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Format a date string or Date object to "MMM DD, YYYY" (e.g. "Jul 12, 2026").
 */
export function formatDate(date: string | Date): string {
  return dayjs(date).format('MMM DD, YYYY');
}

/**
 * Format a date string or Date object to "MMM DD, YYYY HH:mm" (e.g. "Jul 12, 2026 14:30").
 */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('MMM DD, YYYY HH:mm');
}

/**
 * Return a human-readable relative time string (e.g. "2 hours ago").
 */
export function getRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * Extract up to 2 initials from a full name (e.g. "John Doe" → "JD").
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a numeric value as USD currency (e.g. 1234.5 → "$1,234.50").
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Truncate a string to the given length, appending "..." if truncated.
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

/**
 * Check whether a given date is in the past.
 */
export function isOverdue(date: string | Date): boolean {
  return dayjs(date).isBefore(dayjs());
}

/**
 * Return a promise that resolves after the specified number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a URL query string from a key-value record, omitting null/undefined/empty values.
 */
export function generateQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

/**
 * Create a debounced version of the given function that delays invocation
 * until after `delay` milliseconds have elapsed since the last call.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Safely retrieve a status config (bg, text, dot classes) from a config map,
 * falling back to neutral gray when the status key is not found.
 */
export function getStatusConfig(
  status: string,
  configMap: Record<string, { bg: string; text: string; dot: string }>,
): { bg: string; text: string; dot: string } {
  return (
    configMap[status] || {
      bg: 'bg-gray-50 dark:bg-gray-950/30',
      text: 'text-gray-700 dark:text-gray-400',
      dot: 'bg-gray-500',
    }
  );
}
