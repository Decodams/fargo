import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { BusinessHour } from '@/types';
import { DAY_SHORT } from '@/lib/utils';

/**
 * Reveals an element on scroll by adding the `visible` class
 * when it enters the viewport. Use with the `.reveal` CSS class.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/**
 * Fetches all settings from the database and merges with defaults.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.from('settings').select('key, value');
        if (active && data) {
          const map: Record<string, string> = {};
          data.forEach((row: { key: string; value: string }) => {
            map[row.key] = row.value;
          });
          setSettings(map);
        }
      } catch {
        // use defaults
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}

function formatHourTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function useBusinessHours() {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.from('business_hours').select('*').order('day_of_week');
        if (active && data) setHours(data as BusinessHour[]);
      } catch {
        // empty
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openDays = hours.filter((h) => !h.is_closed);
  const summaryLines = openDays.map(
    (h) => `${DAY_SHORT[h.day_of_week]} ${formatHourTime(h.open_time)}–${formatHourTime(h.close_time)}`
  );

  return { hours, loading, summaryLines, openDays };
}
