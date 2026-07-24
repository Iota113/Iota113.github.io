import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Github, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSeason } from '@/context/SeasonContext'

const NAV_LINKS = [
  { path: '/', label: 'Home', id: '01' },
  { path: '/archive', label: 'Archive', id: '02' },
  { path: '/projects', label: 'Projects', id: '03' },
  { path: '/travel', label: 'Travel', id: '04' },
];

type Season = 'spring' | 'summer' | 'autumn' | 'winter';
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

const SEASON_ICONS: Record<Season, string> & { transition: string } = {
  spring: '🌸',
  summer: '🌻',
  autumn: '🍂',
  winter: '❄️',
  transition: '🌔'
};

const getNextSeasonStyle = (isHovered: boolean, nextSeason: Season) => {
  if (!isHovered) return {};

  return {
    backgroundColor: `var(--season-${nextSeason}-accent)`,
    borderColor: `var(--season-${nextSeason}-accent)`,
  };
};

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { season, setSeason } = useSeason();
  const [isHovered, setIsHovered] = useState(false);

  const currentIndex = SEASONS.indexOf(season);
  const nextSeason = SEASONS[(currentIndex + 1) % SEASONS.length];

  const handleSeasonToggle = () => {
    setSeason(nextSeason);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-natural-bg/60 px-[5%] py-8 backdrop-blur-md border-b border-natural-border transition-colors duration-700">
      <Link to="/" className="text-xl font-display font-light tracking-widest text-natural-text">
        Iota's World
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-10">
        <ul className="flex items-center gap-10">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`group relative pb-1 text-[0.8rem] tracking-[0.2em] transition-all duration-300
                      after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-accent after:transition-transform after:duration-300
                      ${isActive 
                        ? 'opacity-100 text-accent after:scale-x-100' 
                        : 'opacity-60 text-current hover:opacity-100 hover:text-accent after:scale-x-0 hover:after:scale-x-100 after:origin-left'
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        
        {/* Desktop Season Toggle */}
        <div className="w-[140px] flex justify-center items-center">
        <button 
          onClick={handleSeasonToggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`ml-4 flex items-center justify-center gap-2 text-sm py-1.5 rounded-full border transform transition-all duration-400 ease-out text-[0.70rem] tracking-wider font-mono select-none cursor-pointer ${
            isHovered 
              ? 'bg-black text-white px-5 shadow-md scale-105 border-black border-2' 
              : 'bg-transparent text-natural border-natural-border px-3 scale-100'
          }`}
          aria-label="Toggle Season"
        >
          <div className="flex items-center gap-2">
            {/* Icon Container */}
            <span className="relative flex h-4 w-5 items-center justify-center text-base leading-none overflow-hidden">
              {/* Current Season Icon */}
              <span 
                className={`absolute inset-0 transform transition-all duration-400 ease-out flex items-center justify-center ${
                  isHovered 
                    ? 'opacity-0 translate-x-4 scale-75' 
                    : 'opacity-100 translate-x-0 scale-100'
                }`}
              >
                {SEASON_ICONS[season]}
              </span>
              
              {/* New Transition Icon */}
              <span 
                className={`absolute inset-0 transform transition-all duration-400 ease-out flex items-center justify-center ${
                  isHovered 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 -translate-x-4 scale-75'
                }`}
              >
                {SEASON_ICONS.transition}
              </span>
            </span>

            {/* Text */}
            <div className="flex items-center gap-2 transition-all duration-400 ease-out">
              <span className="capitalize">{season}</span>
            </div>
          </div>
        </button>
      </div>
                
      </nav>

      {/* Mobile Toggle Icons */}
      <div className="flex items-center gap-4 lg:hidden">
        {/* Mobile Season Toggle Mini */}
        <button 
          onClick={handleSeasonToggle}
          className="text-mono-black p-1 focus:outline-none"
          aria-label="Toggle Season"
        >
          {SEASON_ICONS[season]}
        </button>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-mono-black p-1 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[60] flex h-[100dvh] w-[70%] max-w-sm flex-col bg-natural-bg/95 lg:hidden"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 z-10 p-2 text-natural-text opacity-60 hover:opacity-100"
            >
              <X size={32} />
            </button>

            <div className="flex flex-1 flex-col items-end justify-center w-full pr-8 ">
              <ul className="flex flex-col items-stretch gap-4 mb-12 w-full">
                {NAV_LINKS.map((link) => (
                  <li key={link.path} className="w-full">
                            <Link
                              to={link.path}
                              onClick={() => setIsOpen(false)}
                              className={`group flex items-center justify-end gap-4 w-full py-2 text-right transition-colors duration-300`}
                            >
                              <span
                                className={`text-xl font-display font-bold uppercase tracking-wider transition-colors duration-300 ${
                                  'text-natural-text group-hover:text-accent'
                                }`}
                              >
                                {link.label}
                              </span>

                              <span
                                className={`text-xl font-light font-sans transition-colors duration-300 ${
                                  'text-natural-text/40 group-hover:text-accent'
                                }`}
                              >
                                &gt;
                              </span>
                            </Link>
                          </li>
                ))}
              </ul>

              <button 
                onClick={handleSeasonToggle}
                className="flex gap-3 px-6 py-3 rounded-full border border-natural-border text-natural-text"
              >
                <span className="text-m">{SEASON_ICONS[season]}</span>
                <span className="capitalize tracking-widest font-mono text-sm">{season}</span>
              </button>
            </div>

            <div className="pb-8 pt-8 border-t border-natural-border/20 flex flex-col items-end gap-6 w-full px-6 text-right">
              <div className="flex items-end justify-end gap-8 w-full">
                <a
                  href="https://github.com/Iota113"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-natural-text opacity-40 hover:opacity-100 transition-opacity"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://www.linkedin.com/in/henry-tse-9027aa147/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-natural-text opacity-40 hover:opacity-100 transition-opacity"
                >
                  <Linkedin size={20} />
                </a>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">personal website</div>
                <div className="text-xs font-sans opacity-60">4 Pages Planned • 4 Complete</div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};