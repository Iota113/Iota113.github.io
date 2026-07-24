import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { supabase, ArchiveMedia, ARCHIVE_URL } from '../services/supabase';
import botwMasterTrials from '../../images/botw-master-trials.webp';

export const Archive: React.FC = () => {
  const [items, setItems] = useState<ArchiveMedia[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Target reference for the hero section parallax
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position specifically relative to the hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Map scroll progress to a physical Y translation and subtle scaling/fade
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 1], [0.15, 0]); // Adjust 0.15 to change your image visibility

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('archive_media')
        .select('*')
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

      if (data) setItems(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const uniqueTypes = ['all', ...new Set(items.map((item) => item.type.toLowerCase()))];
  const filteredItems = items.filter((item) => filter === 'all' || item.type.toLowerCase() === filter);

  // Group by year
  const groupedItems = filteredItems.reduce((acc, item) => {
    const year = item.year === 0 ? 'Legacy' : item.year.toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {} as Record<string, ArchiveMedia[]>);

  const sortedYears = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Legacy') return 1;
    if (b === 'Legacy') return -1;
    return parseInt(b) - parseInt(a);
  });

  return (
    <div className="min-h-screen text-natural-text">
      {/* Hero Section */}
      <section ref={heroRef} className="px-[5%] py-16 md:py-24 relative overflow-hidden">
        
        {/* Parallax Background Container */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ y: backgroundY, opacity: backgroundOpacity }}
        >
          <img 
            src={botwMasterTrials} alt="BOTW Master Trials"
            className="w-full h-[120%] object-cover object-center filter grayscale brightness- contrast-125"
          />
          {/* Edge-fading gradients to seamlessly merge with your natural-bg */}
          <div className="absolute inset-0 bg-gradient-to-t from-natural-bg via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-natural-bg/50 via-transparent to-transparent" />
        </motion.div>

        {/* Hero Content Grid */}
        <div className="mx-auto max-w-[1300px] relative z-10 grid grid-cols-1 md:grid-cols-[1fr_400px] gap-12 items-center">
          
          {/* Left Text Block */}
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-2 block">Media log</span>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-none mb-8">
              The Archive
            </h1>
            <p className="max-w-2xl text-natural-muted text-lg serif-italic leading-relaxed">
              Here I abandon my dignity by sharing my favourite games, shows and music.
            </p>
          </div>

          {/* Right Angled Screen Element (Anism-style) */}
          <div className="w-full flex justify-center md:block [perspective:1200px] justify-self-center lg:justify-self-end mr-6 md:mr-36">
            <div 
              className="group/screen relative w-[320px] h-[180px] sm:w-[480px] sm:h-[270px] lg:w-[560px] lg:h-[315px] border border-natural-border/30 bg-surface-bg/40 backdrop-blur-sm shadow-2xl transition-transform duration-700 hover:rotate-y-[-15deg] hover:rotate-x-[8deg]"
              style={{ 
                borderRadius: 'var(--radius-ui)',
                transform: 'rotateY(-12deg) rotateX(12deg) rotateZ(3deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Outer screen bezel glow */}
              <div 
                className="absolute inset-2 overflow-hidden bg-black border flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-accent),0.15)]"
                style={{ borderRadius: 'calc(var(--radius-ui) - 4px)' }}
              >
                <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center scale-[1.02]">
                  <iframe
                    id="hero-youtube-embed"
                    className="w-[140%] h-[140%] min-w-[130%] min-h-[130%] object-cover opacity-80 mix-blend-screen filter brightness-110 contrast-125"
                    src="https://www.youtube-nocookie.com/embed/8QJ8KNdhkiA?autoplay=1&mute=1&loop=1&playlist=8QJ8KNdhkiA&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&enablejsapi=1"
                    title="Archive Hero Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{ border: 0 }}
                  />
                </div>
                
                {/* Mute/Unmute Control Toggle Button overlay */}
                <button
                  onClick={() => {
                    const iframe = document.getElementById('hero-youtube-embed') as HTMLIFrameElement | null;
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.postMessage(
                        JSON.stringify({
                          event: 'command',
                          func: isMuted ? 'unMute' : 'mute',
                        }),
                        '*'
                      );
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="absolute bottom-3 right-3 z-50 bg-black/80 hover:bg-black text-white/90 hover:text-accent py-2 px-3 md:p-2 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover/screen:opacity-100 shadow-lg"
                  title={isMuted ? "Unmute Video" : "Mute Video"}
                >
                  {isMuted ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                      </svg>
                      <span className="text-[10px] font-mono tracking-wider md:hidden uppercase pr-1">Tap to Unmute</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                      </svg>
                      <span className="text-[10px] font-mono tracking-wider md:hidden uppercase pr-1">Mute</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Subtle Ambient Shadow thrown behind the screen */}
              <div 
                className="absolute -inset-4 bg-accent/5 blur-3xl -z-10 translate-y-4"
                style={{ transform: 'translateZ(-20px)' }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1300px] grid grid-cols-1 lg:grid-cols-[140px_1fr] gap-12 px-[5%] pb-32 items-start relative z-10">

        {/* Sidebar */}
        <aside className="sticky top-[80px] lg:top-28 z-40 self-start flex flex-col items-center gap-4 lg:gap-12 text-center lg:border-r lg:border-natural-border lg:pr-8 bg-natural-bg/90 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none py-4 lg:py-0 w-full lg:w-auto">
          <div className="flex lg:flex-col items-center lg:items-start space-x-6 lg:space-x-0 lg:space-y-8 w-full overflow-x-auto no-scrollbar">
            <label className="hidden lg:inline-block text-[10px] uppercase tracking-[0.3em] opacity-40 [writing-mode:vertical-lr] rotate-180">
              Filter
            </label>
            <div className="flex flex-row lg:flex-col gap-6 lg:gap-4 w-max lg:w-auto">
              {uniqueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`text-[14px] uppercase tracking-[0.1em] transition-all hover:opacity-100 flex-shrink-0 cursor-pointer ${
                    filter === type 
                      ? 'opacity-100 font-bold border-b-2 lg:border-b-0 lg:border-r-2 border-accent pb-1 lg:pb-0 lg:pr-2 text-accent' 
                      : 'opacity-30 hover:opacity-70'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Gallery */}
        <main>
          {isLoading ? (
            <div className="flex justify-center py-20 text-accent animate-pulse font-mono uppercase tracking-[0.3em] text-[10px]">
              Retrieving Records...
            </div>
          ) : (
            <div className="space-y-16">
              {sortedYears.map((year) => (
                <section key={year}>
                  <div className="flex items-baseline gap-4 border-b border-natural-border pb-4">
                    <h2 className="text-4xl font-light tracking-tighter">{year}</h2>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-8">
                    <AnimatePresence mode="popLayout">
                      {groupedItems[year].map((item, index) => (
                        <MediaCard key={item.id} item={item} index={index} />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const MediaCard: React.FC<{ item: ArchiveMedia; index: number }> = ({ item, index }) => {
  const imageUrl = `${ARCHIVE_URL}${item.image_filename}`;

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 45, scale: 0.92, rotate: index % 2 === 0 ? 2 : -2 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1], 
        delay: (index % 5) * 0.08 
      }}
      className="group relative"
    >
    <div 
      style={{ borderRadius: 'var(--radius-ui)' }}
      className="relative aspect-[3/4] overflow-hidden bg-surface-bg border border-natural-border p-2 transition-all duration-500 shadow-ui group-hover:scale-[1.02]"
    >
      <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: 'calc(var(--radius-ui) - 4px)' }}>
        <img 
          src={imageUrl} 
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
          <h4 className="text-sm font-serif italic text-white mb-1">{item.title}</h4>
          <span className="text-[8px] uppercase tracking-[0.2em] text-white/70">{item.type}</span>
        </div>
      </div>
    </div>
    <div className="mt-4 flex justify-between items-baseline px-1 text-natural-text">
      <span className="text-[9px] uppercase tracking-[0.2em] opacity-60">{item.type}</span>
      <span className="text-[8px] serif-italic opacity-50">{item.displayYear}</span>
    </div>
  </motion.article>
  );
};