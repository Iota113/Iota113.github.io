import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import snapSoundUrl from '../../sounds/snap-sound-effect.mp3';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonContextType {
  season: Season;
  setSeason: (season: Season) => void;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export const SeasonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [season, setSeasonState] = useState<Season>(() => {
    const saved = localStorage.getItem('user-season') as Season;
    return saved || 'summer';
  });

  const [isSnapping, setIsSnapping] = useState(false);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const cleanupRef  = useRef<(() => void) | null>(null);

  // Auto-detect only when no preference is stored
  useEffect(() => {
    if (localStorage.getItem('user-season')) return;
    const month = new Date().getMonth();
    let detected: Season;
    if      (month >= 2 && month <= 4)  detected = 'spring';
    else if (month >= 5 && month <= 7)  detected = 'summer';
    else if (month >= 8 && month <= 10) detected = 'autumn';
    else                                detected = 'winter';
    setSeasonState(detected);
  }, []);

  // Persist + apply body class
  useEffect(() => {
    localStorage.setItem('user-season', season);
    const { classList } = document.body;
    classList.remove('theme-spring', 'theme-summer', 'theme-autumn', 'theme-winter');
    classList.add(`theme-${season}`);
  }, [season]);

  const setSeason = useCallback((newSeason: Season) => {
    if (newSeason === season || isSnapping) return;

    const SWAP_AT = 300;
    const DONE_AT = 600;

    playSnapSound();

    setTimeout(() => {
      setIsSnapping(true);
      setSeasonState(newSeason);
    }, SWAP_AT);

    setTimeout(() => {
      setIsSnapping(false);
      cleanupRef.current = null;
    }, DONE_AT);

  }, [season, isSnapping]);

  return (
    <SeasonContext.Provider value={{ season, setSeason }}>
      {children}

      {/* Snap overlay: flash + ripple canvas host */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[9999]"
      >
        {isSnapping && (
          <div className="snap-flash" />
        )}
      </div>
    </SeasonContext.Provider>
  );
};

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) throw new Error('useSeason must be used within a SeasonProvider');
  return context;
};

const snapAudio = new Audio(snapSoundUrl);
snapAudio.preload = 'auto';

function playSnapSound() {
  snapAudio.currentTime = 0;
  snapAudio.volume = 1.0;
  snapAudio.play().catch(() => {
  });
}