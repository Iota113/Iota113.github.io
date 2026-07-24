import React from 'react';
import { motion } from 'motion/react';

interface RollingItem {
  id: string;
  title: string;
  image_url: string;
}

interface RollingGalleryProps {
  items: RollingItem[];
  speed?: number;
  tiltAngle?: number;
  direction?: 'left' | 'right';
}

export const RollingGallery: React.FC<RollingGalleryProps> = ({ items, speed = 35, tiltAngle = 0, direction = 'left'}) => {
  // Duplicating the items to fill out the scrolling track
  const duplicatedItems = [...items, ...items, ...items];
  const initialX = direction === 'left' ? '0%' : '-33.3333%';
  const animateX = direction === 'left' ? '-33.3333%' : '0%';

  if (items.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-surface-bg/30 py-8 block relative select-none z-20 min-h-[160px]">
      <div 
        className="bg-surface-bg flex items-center h-[160px] sm:h-[200px]"
        style={{ marginLeft: '-20%', width: '140%', transform:`rotate(${tiltAngle}deg)` }}
      >
        <motion.div
          className="flex flex-row whitespace-nowrap gap-2 py-4 pr-4"
          initial={{ x: initialX }}
          animate={{ x: animateX }}
          transition={{
            ease: "linear",
            duration: speed,
            repeat: Infinity,
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex-shrink-0 w-[200px] sm:w-[240px] aspect-[4/3] overflow-hidden bg-zinc-900 shadow-lg relative group/ticker-item"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover pointer-events-none"
                draggable="false"
              />
              {/* Overlay styling for names when hovering */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/ticker-item:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <p className="text-[10px] font-mono tracking-wide text-white truncate w-full">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RollingGallery;