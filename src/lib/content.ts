import { IMAGES } from '@/lib/images';
import type { SettingsMap } from '@/types';
import { getSetting } from '@/lib/utils';

export interface GalleryItem {
  src: string;
  alt: string;
  category: string;
  span?: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSection {
  title: string;
  items: FaqItem[];
}

export const DEFAULT_GALLERY: GalleryItem[] = [
  { src: IMAGES.hairStyling, alt: 'Bridal hair styling', category: 'Hair', span: true },
  { src: IMAGES.braiding, alt: 'Braiding session', category: 'Hair' },
  { src: IMAGES.facial, alt: 'Facial treatment', category: 'Spa' },
  { src: IMAGES.manicure, alt: 'Manicure session', category: 'Nails' },
  { src: IMAGES.salonInterior, alt: 'Salon interior', category: 'Space', span: true },
  { src: IMAGES.braidedPortrait, alt: 'Braided hairstyle', category: 'Hair' },
  { src: IMAGES.spaMassage2, alt: 'Massage therapy', category: 'Spa' },
  { src: IMAGES.barber, alt: 'Precision haircut', category: 'Hair' },
  { src: IMAGES.nailPolish, alt: 'Nail polish selection', category: 'Nails' },
  { src: IMAGES.salonChair, alt: 'Salon chair and mirror', category: 'Space' },
  { src: IMAGES.facialMask, alt: 'Facial mask application', category: 'Spa' },
  { src: IMAGES.bridalHair, alt: 'Bridal hair styling', category: 'Hair', span: true },
];

export const DEFAULT_FAQ: FaqSection[] = [
  {
    title: 'Booking',
    items: [
      {
        q: 'Do I need to create an account to book?',
        a: 'No. You can book without signing up. We only ask for your name, phone, and email so we can confirm your appointment.',
      },
      {
        q: 'Can I book multiple services in one appointment?',
        a: 'Yes. When booking, you can add as many services as you need. We calculate the total duration and price together.',
      },
      {
        q: 'How far in advance should I book?',
        a: 'We recommend booking at least 2–3 days ahead for braiding, colouring, and spa services. Shorter services can often be booked same-week.',
      },
      {
        q: 'Can I choose a specific stylist?',
        a: 'Yes. When booking, select from available specialists. If you have no preference, we assign based on availability.',
      },
    ],
  },
  {
    title: 'Home Service',
    items: [
      {
        q: 'Which services are available at home?',
        a: 'Most hair, nail, and massage services are available at home. Equipment-heavy treatments like colour processing are salon-only.',
      },
      {
        q: 'What area do you cover?',
        a: 'We cover locations within our service area. Contact us if you are outside the zone and we will see what we can arrange.',
      },
      {
        q: 'Is there a callout fee?',
        a: 'Yes, a flat callout fee is added to cover travel. The amount is shown before you confirm your booking.',
      },
      {
        q: 'What do I need to provide?',
        a: 'A comfortable space with good lighting and access to water. Your specialist brings tools and products.',
      },
    ],
  },
  {
    title: 'Payments & Cancellation',
    items: [
      {
        q: 'Do I need to pay when booking?',
        a: 'Yes. Complete the bank transfer after booking and wait for our team to confirm your payment before your booking ticket is released.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We currently accept bank transfer for booking confirmation. Your appointment is confirmed after payment is verified by our team.',
      },
      {
        q: 'What is your cancellation policy?',
        a: 'Cancel or reschedule up to 24 hours before at no charge. Within 24 hours, a 50% fee may apply.',
      },
      {
        q: 'What happens if I am running late?',
        a: 'Call us. We hold your slot for 15 minutes. After that, we may need to shorten your service or reschedule.',
      },
    ],
  },
];

export function parseJsonSetting<T>(raw: string | undefined, fallback: T): T {
  if (!raw?.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function getGalleryItems(settings: SettingsMap): GalleryItem[] {
  return parseJsonSetting(getSetting(settings, 'gallery_items'), DEFAULT_GALLERY);
}

export function getFaqSections(settings: SettingsMap): FaqSection[] {
  return parseJsonSetting(getSetting(settings, 'faq_sections'), DEFAULT_FAQ);
}

export function getHeroTitleLines(settings: SettingsMap): string[] {
  const raw = getSetting(settings, 'hero_title');
  return raw.split('\n').filter(Boolean);
}

export function getPhilosophyParagraphs(settings: SettingsMap): string[] {
  const raw = getSetting(settings, 'philosophy_body');
  return raw.split('\n\n').filter(Boolean);
}
