import { formatDistanceToNow } from 'date-fns';

export function relativeTime(date) {
  if (!date) return 'unknown';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'unknown';
  }
}

export function truncate(str, len) {
  if (!str) return '';
  const s = str.replace(/\n/g, ' ').trim();
  return s.length > len ? s.slice(0, len - 1) + '…' : s;
}

export function padEnd(str, len) {
  if (str.length >= len) return str.slice(0, len);
  return str + ' '.repeat(len - str.length);
}
