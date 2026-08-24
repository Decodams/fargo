import { useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { IMAGES } from '@/lib/images';
import Reveal from '@/components/ui/Reveal';

interface GalleryItem {
  src: string;
  alt: string;
  category: 'Hair' | 'Spa' | 'Nails' | 'Space';
  span?: boolean;
}

const GALLERY: GalleryItem[] = [
  { src: IMAGES.hairStyling, alt: 'Bridal hair styling with curling iron', category: 'Hair', span: true },
  { src: IMAGES.braiding, alt: 'Braiding session in salon', category: 'Hair' },
  { src: IMAGES.facial, alt: 'Facial treatment close-up', category: 'Spa' },
  { src: IMAGES.manicure, alt: 'Manicure with nail polish application', category: 'Nails' },
  { src: IMAGES.salonInterior, alt: 'Salon interior with modern furniture', category: 'Space', span: true },
  { src: IMAGES.braidedPortrait, alt: 'Intricate braided hairstyle portrait', category: 'Hair' },
  { src: IMAGES.spaMassage2, alt: 'Back massage in spa setting', category: 'Spa' },
  { src: IMAGES.barber, alt: 'Barber giving a precision haircut', category: 'Hair' },
  { src: IMAGES.nailPolish, alt: 'Selecting nail polish colors', category: 'Nails' },
  { src: IMAGES.salonChair, alt: 'Salon chair and mirror', category: 'Space' },
  { src: IMAGES.facialMask, alt: 'Facial mask application', category: 'Spa' },
  { src: IMAGES.bridalHair, alt: 'Bridal hair with floral accessories', category: 'Hair', span: true },
];

const FILTERS = ['All', 'Hair', 'Spa', 'Nails', 'Space'] as const;

export default function Gallery() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = filter === 'All' ? GALLERY : GALLERY.filter((g) => g.category === filter);

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-cream-100 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-5">Gallery</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-ink-900 leading-[1.05] text-balance max-w-3xl">
            Work, atmosphere, and moments from the chair.
          </h1>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-20 z-30 bg-cream-50/95 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-3 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-2 text-sm tracking-wide transition-colors ${
                filter === f ? 'bg-ink-900 text-cream-50' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry-style grid with varied spans */}
      <section className="py-12 lg:py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {items.map((item, i) => (
              <Reveal
                key={`${item.src}-${i}`}
                delay={(i % 4) * 60}
                className={item.span ? 'col-span-2 lg:row-span-2' : ''}
              >
                <button
                  onClick={() => setLightbox(i)}
                  className="group relative block w-full overflow-hidden"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      item.span ? 'h-full min-h-[300px] lg:min-h-[400px]' : 'h-48 lg:h-64'
                    }`}
                  />
                  <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/20 transition-colors duration-300" />
                  <span className="absolute bottom-3 left-3 text-xs uppercase tracking-wider-2 text-cream-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.category}
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && items[lightbox] && (
        <div
          className="fixed inset-0 z-[100] bg-ink-900/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 text-cream-50 hover:text-rose-400 transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <button
            className="absolute left-5 text-cream-50 hover:text-rose-400 transition-colors disabled:opacity-30"
            onClick={(e) => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)); }}
            disabled={lightbox === 0}
            aria-label="Previous"
          >
            <ArrowLeft size={28} />
          </button>
          <img
            src={items[lightbox].src}
            alt={items[lightbox].alt}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-5 text-cream-50 hover:text-rose-400 transition-colors disabled:opacity-30"
            onClick={(e) => { e.stopPropagation(); setLightbox(Math.min(items.length - 1, lightbox + 1)); }}
            disabled={lightbox === items.length - 1}
            aria-label="Next"
          >
            <ArrowRight size={28} />
          </button>
          <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-cream-100/70">
            {items[lightbox].alt} — {lightbox + 1} / {items.length}
          </p>
        </div>
      )}
    </>
  );
}
