import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { motion } from 'motion/react';
import { useSeason } from '../context/SeasonContext';
import { ParticleEffect } from './ParticleEffect';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-natural-bg overflow-x-clip">
      <ParticleEffect />
      <Header />
      
      <main className="relative z-10 flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};
