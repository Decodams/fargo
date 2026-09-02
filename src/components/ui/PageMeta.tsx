import { useEffect } from 'react';
import { getSetting } from '@/lib/utils';
import { useSettings } from '@/lib/hooks';

interface PageMetaProps {
  title: string;
  description?: string;
  path?: string;
  noSuffix?: boolean;
  noindex?: boolean;
}

function removeMeta(name: string) {
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.remove();
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

export default function PageMeta({ title, description, path = '', noSuffix = false, noindex = false }: PageMetaProps) {
  const { settings } = useSettings();
  const siteName = getSetting(settings, 'business_name') || 'Fargo Unisex Salon & Spa';
  const settingsSiteUrl = getSetting(settings, 'site_url').trim().replace(/\/+$/, '');
  const baseUrl = settingsSiteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const defaultDesc = getSetting(settings, 'seo_description');
  const ogImage = getSetting(settings, 'seo_og_image');

  const fullTitle = noSuffix ? title : `${title} — ${siteName}`;
  const desc = description ?? defaultDesc;
  const url = `${baseUrl}${path}`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('description', desc);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', url, true);
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      removeMeta('robots');
    }
    if (ogImage) {
      setMeta('og:image', ogImage, true);
      setMeta('twitter:image', ogImage);
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [fullTitle, desc, url, ogImage, noindex]);

  return null;
}
