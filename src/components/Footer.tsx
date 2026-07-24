import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import { useSeason } from '../context/SeasonContext';

export const Footer: React.FC = () => {
  const { season } = useSeason();

  const seasonIcons = {
    spring: '🌸',
    summer: '🌻',
    autumn: '🍂',
    winter: '❄️'
  };

  return (
    <footer className="hidden md:flex h-24 px-[5%] border-t border-natural-border justify-between items-center bg-natural-bg transition-colors duration-700">
    <div className="flex items-center gap-6">
        <span className="text-[10px] uppercase tracking-[0.15em] opacity-50">Reach out:</span>
        <div className="flex items-center gap-8">
          <a
            href="https://github.com/Iota113"
            target="_blank"
            rel="noopener noreferrer"
            className="text-natural-text opacity-40 hover:opacity-100 transition-opacity"
          >
            <Github size={18} />
          </a>
          <a
            href="https://www.linkedin.com/in/henry-tse-9027aa147/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-natural-text opacity-40 hover:opacity-100 transition-opacity"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </div>
      
      <div className="flex items-center gap-8 text-right mt-4 md:mt-0 text-natural-text">
        <div>
          <div className="text-[10px] tracking-widest opacity-60 mb-1">Iota113</div>
          <div className="text-xs font-sans opacity-80">No Rights Reserved.</div>
        </div>
        <div className="w-10 h-10 rounded-full border border-natural-border flex items-center justify-center text-accent text-sm transition-colors duration-700 shadow-sm bg-surface-bg">
           <span>{seasonIcons[season]}</span>
        </div>
      </div>
    </footer>
  );
};
