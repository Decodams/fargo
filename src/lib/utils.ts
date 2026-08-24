import type { SettingsMap } from '@/types';

export const DEFAULT_SETTINGS: SettingsMap = {
  business_name: 'Fargo Unisex Salon & Spa',
  notification_email: 'hello@fargosalon.com',
  contact_phone: '+234 800 000 0000',
  contact_email: 'hello@fargosalon.com',
  address: 'Southeast Nigeria',
  home_service_area: 'Within 15km of our salon location',
  home_service_fee: '2000',
  instagram_url: 'https://instagram.com',
  facebook_url: 'https://facebook.com',
  buffer_time_minutes: '15',
  currency_symbol: '₦',
};

export function getSetting(settings: SettingsMap, key: string): string {
  return settings[key] ?? DEFAULT_SETTINGS[key] ?? '';
}

export function formatPrice(value: number, symbol = '₦'): string {
  return `${symbol}${value.toLocaleString('en-NG')}`;
}

export function formatPriceRange(min: number, max: number, symbol = '₦'): string {
  if (min === max) return formatPrice(min, symbol);
  return `${formatPrice(min, symbol)} – ${formatPrice(max, symbol)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(d);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min ago`;
  return 'Just now';
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
