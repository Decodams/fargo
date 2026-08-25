import type { SettingsMap } from '@/types';

export const DEFAULT_SETTINGS: SettingsMap = {
  business_name: 'Fargo Unisex Salon & Spa',
  notification_email: 'Fargounisexsalon@gmail.com',
  tiktok_url: 'https://www.tiktok.com/@fargo.unisex.salon',
  site_url: 'https://fargounisexsalon.com',
  contact_phone: '09012101020',
  contact_email: 'Fargounisexsalon@gmail.com',
  address: 'No 8 Dr Billy Okoye Boulevard By Revenue House/Immigration Awka Anambra State',
  home_service_area: 'Within 15km of our salon location',
  home_service_fee: '2000',
  instagram_url: 'https://www.instagram.com/fargounisexsalonandspa?igsi=MXNydmV3eGUzYWU2eA==',
  facebook_url: 'https://www.facebook.com/share/1MQiUn9Dhm/',
  buffer_time_minutes: '15',
  currency_symbol: '₦',
  // Hero & homepage
  hero_title: 'Hair, beauty, and wellness — considered, not rushed.',
  hero_subtitle: 'An appointment should feel like a break, not a transaction. We\'re here when you are — in-salon or at home.',
  hero_image_url: '',
  stat_1_number: '20+',
  stat_1_label: 'Services',
  stat_1_sub: '',
  stat_2_number: '4',
  stat_2_label: 'Specialists',
  stat_2_sub: '',
  stat_3_number: '2',
  stat_3_label: 'Locations',
  stat_3_sub: 'Salon & Home',
  philosophy_eyebrow: 'Our Philosophy',
  philosophy_title: 'We don\'t just style hair. We give people back their time.',
  philosophy_body: 'Fargo is built on a simple idea: a salon visit should feel like a break, not a transaction. Whether you\'re here for a quick trim or a full spa day, the pace is yours.\n\nOur team covers the full range — braiding, colouring, cuts, facials, massage, nails, and more. And for days when you can\'t come in, we bring the salon to your door.',
  cta_title: 'Ready when you are.',
  cta_subtitle: 'Book in a few steps. No account needed — just pick a time that works.',
  location_strip: 'In-salon and at-home service',
  footer_tagline: 'A unisex hair, beauty, and wellness destination. In-salon and at-home, built around how you live.',
  // SEO
  seo_title: 'Fargo Unisex Salon & Spa — Hair, Beauty & Wellness',
  seo_description: 'Fargo Unisex Salon & Spa offers hair styling, braiding, facials, massage, and at-home services. Book your session in-salon or at home.',
  seo_keywords: 'unisex salon, spa, hair styling, braiding, facial, massage, home service, Nigeria salon',
  seo_og_image: 'https://images.pexels.com/photos/3992862/pexels-photo-3992862.jpeg?auto=compress&cs=tinysrgb&w=1200',
  // JSON content (empty = use built-in defaults)
  gallery_items: '',
  faq_sections: '',
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
