import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSeason } from '../context/SeasonContext';
import { TRAVEL_URL } from '../services/supabase';

export interface TravelPhoto {
  id: string;
  additional_images: string[];
  place: string;
  place_zh?: string;
  city: string;
  caption: string;
  caption_zh?: string;
  rating: number;
  is_cover: boolean;
  visited_at: string;
}

export interface TravelLocation {
  key: string;
  city_en: string;
  city_zh: string;
  region_en: string;
  region_zh: string;
}

interface TravelModalProps {
  photo: TravelPhoto | null;
  onClose: () => void;
  locations?: Record<string, TravelLocation>;
  lang?: 'en' | 'zh';
}

const renderStars = (rating: number) => {
  const validRating = Math.max(0, Math.min(5, Math.floor(rating)));
  return '★'.repeat(validRating);
};

export const TravelModal: React.FC<TravelModalProps> = ({
  photo,
  onClose,
  locations = {},
  lang = 'en',
}) => {
  const { season } = useSeason();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    setActiveImageIndex(0);

    if (photo) {
      document.body.classList.add('lightbox-open');
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.classList.remove('lightbox-open');
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [photo, onClose]);

  const getCardBgStyle = () => {
    switch (season) {
      case 'spring': return 'bg-rose-50';
      case 'summer': return 'bg-sky-50';
      case 'autumn': return 'bg-stone-900 dark';
      case 'winter': return 'bg-slate-900 dark';
      default: return 'bg-zinc-900';
    }
  };

  const getImageUrl = (filename: string) => {
    if (!filename) return '';
    return `${TRAVEL_URL}/${filename}`;
  };

  return (
    <AnimatePresence>
      {photo && (() => {
        const gallery = (photo.additional_images || []).slice(1);
        const viewportUrl = gallery.length > 0
          ? getImageUrl(gallery[activeImageIndex])
          : getImageUrl(photo.additional_images?.[0]);
        const loc = locations[photo.city];
        const cityLabel = loc ? (lang === 'zh' ? loc.city_zh : loc.city_en) : photo.city;
        const regionLabel = loc ? (lang === 'zh' ? loc.region_zh : loc.region_en) : '';

        const placeLabel = lang === 'zh' ? (photo.place_zh || photo.place) : photo.place;
        const captionLabel = lang === 'zh' ? (photo.caption_zh || photo.caption) : photo.caption;

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-natural-text/30 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`${getCardBgStyle()} w-full max-w-6xl rounded-[var(--radius-ui)] overflow-hidden border border-natural-border shadow-ui flex flex-col md:flex-row h-auto max-h-[90vh] md:max-h-[85vh]`}
            >
              {/* MEDIA VIEWPORT */}
              <div className="w-full md:w-[72%] h-[400px] md:h-auto md:aspect-[4/3] bg-black relative flex items-center justify-center overflow-hidden">
                {viewportUrl ? (
                  <motion.img
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    src={viewportUrl}
                    alt={placeLabel}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-text-muted font-mono text-xs">No preview images available</div>
                )}
              </div>

              {/* DETAILS + SIDEBAR GALLERY */}
              <div
                className="w-full md:w-[28%] p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-natural-border overflow-y-auto bg-surface-bg"
                style={{ backgroundColor: 'color-mix(in srgb, var(--surface-bg) 95%, black)' }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-accent uppercase tracking-widest">
                      {lang === 'zh' ? '景点详情' : 'Location Entry'} {gallery.length > 0 && `(${activeImageIndex + 1}/${gallery.length})`}
                    </span>
                    <button
                      onClick={onClose}
                      className="text-text-muted hover:text-accent text-xl transition-colors font-mono cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <h2 className="text-2xl font-display font-bold tracking-tight text-natural-text">
                      {placeLabel}
                    </h2>
                    <p className="text-sm font-mono text-text-muted mt-0.5 uppercase tracking-wider">
                      {cityLabel} {regionLabel && <><span className="mx-1 opacity-45"> | </span> {regionLabel}</>}
                    </p>
                  </div>

                  <div className="h-[1px] bg-natural-border" />

                  {/* HORIZONTAL GALLERY TRACK */}
                  {gallery.length > 1 && (
                    <div className="flex gap-2 py-4 overflow-x-auto max-w-full
                    [&::-webkit-scrollbar]:h-[8px]
                    [&::-webkit-scrollbar]:w-[8px]
                    [&::-webkit-scrollbar-thumb]:bg-accent/50
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-accent/80
                    [-webkit-overflow-scrolling:touch]">
                      {gallery.map((imgName, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all duration-200 shrink-0 cursor-pointer ${
                            activeImageIndex === idx
                              ? 'border-accent scale-105 shadow-sm'
                              : 'border-natural-border/60 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={getImageUrl(imgName)}
                            alt={`Gallery image ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {captionLabel && (
                    <p className="text-sm leading-relaxed text-natural-text font-serif pt-2">
                      {captionLabel}
                    </p>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-natural-border/60 space-y-2 font-mono text-[11px] text-text-muted">
                  <div className="flex justify-between">
                    <span>{lang === 'zh' ? '访问时间:' : 'Visited:'}</span>
                    <span>{photo.visited_at}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{lang === 'zh' ? '评分:' : 'Score:'}</span>
                    <span className="text-accent text-[9px] tracking-tighter">{renderStars(photo.rating)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
};
