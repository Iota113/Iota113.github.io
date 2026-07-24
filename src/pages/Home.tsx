import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import yotsugi from '../../images/yotsugi.webp';
import yotsugiMobile from '../../images/yotsugi-mobile.webp';
import { useSeason } from '@/context/SeasonContext';
import { supabase, ARCHIVE_HIGHLIGHTS_URL } from '../services/supabase';
import RollingGallery from '../components/RollingGallery';
import { HybridText } from '../components/HybridText';
import { SkillsList, Skill } from '../components/SkillsList';

interface Inspiration {
  id: string;
  title: string;
  link: string;
}

export const Home: React.FC = () => {
  const { season } = useSeason();
  const [hoveredInspiration, setHoveredInspiration] = useState<number | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [rollingItems, setRollingItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [inspirations, setInspirations] = useState<Inspiration[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, rollingRes, inspirationsRes] = await Promise.all([
          supabase.from('skills').select('*').order('display_order', { ascending: true }),
          supabase.from('archive_highlights').select('*'),
          supabase.from('inspirations').select('*')
        ]);

        if (skillsRes.error) throw skillsRes.error;
        if (skillsRes.data) setSkills(skillsRes.data);

        if (rollingRes.error) {
          console.error("Supabase Error fetching archive_highlights:", rollingRes.error);
        } else if (rollingRes.data) {
          setRollingItems(rollingRes.data.map(item => ({
            id: item.id,
            title: item.title,
            image_url: `${ARCHIVE_HIGHLIGHTS_URL}${item.image_filename}`
          })));
        }

        if (inspirationsRes.error) {
          console.error("Supabase Error fetching inspirations:", inspirationsRes.error);
        } else if (inspirationsRes.data) {
          setInspirations(inspirationsRes.data);
        }

      } catch (err) {
        console.error('Error loading home page context:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { damping: 30, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const xOffset = useTransform(smoothX, [0, 1], [20, -20]);
  const yOffset = useTransform(smoothY, [0, 1], [20, -20]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div className="mx-auto w-full min-h-screen flex flex-col relative overflow-hidden transition-colors duration-700">
      <div className="bg-blob top-10 right-10 w-96 h-96 bg-accent opacity-10" />
      <div className="bg-blob bottom-20 left-10 w-80 h-80 bg-secondary opacity-10" />

      <main className="flex-1 flex px-[8%] py-1 relative z-10">
        {/* Side Info */}
        <aside className="hidden md:flex w-12 flex-col justify-center items-center gap-8 border-r border-natural-border pr-8">
          <span className="rotate-180 [writing-mode:vertical-lr] text-[10px] uppercase tracking-[0.3em] opacity-40 text-natural-text">Current Page</span>
          <span className="text-xl font-light text-natural-text">01</span>
          <div className="h-24 w-px bg-natural-border" />
          <span className="text-xl font-light opacity-30 text-natural-text">04</span>
        </aside>

        <div className="flex-1 flex-col justify-center">
          <div
            className="relative w-full aspect-[4/5] md:aspect-[14/4] mb-8 items-center justify-center overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              WebkitMaskComposite: 'source-in',
              maskComposite: 'intersect'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1.05, opacity: 1 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              style={{ x: xOffset, y: yOffset }}
              className="w-full h-full flex items-center justify-center overflow-hidden"
            >
              <picture className="w-[110%] h-[110%] max-w-none flex items-center justify-center vignette-mask">
                <source media="(max-width: 1024px)" srcSet={yotsugiMobile} />
                <img
                  src={yotsugi}
                  alt="Ononoki Yotsugi"
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                />
              </picture>
            </motion.div>
          </div>

          <section className="ml-6 max-w-8xl space-y-8">

            <h1 className="text-2xl md:text-6xl font-light leading-tight tracking-tighter text-natural-text">
              <HybridText text="僕はキメ顔でそう言った。" revealType="blur" periodicInterval={4000} />
            </h1>

            <div className="flex flex-col md:flex-row gap-12 md:items-start">

              <div className="text-s md:text-l leading-relaxed text-text-muted space-y-4 md:w-1/2">
                <p>
                  Hi, I am <span className="text-natural-text not-italic font-semibold border-b border-accent transition-colors">Henry</span>, a year 3 Computer Science and Math student.
                  My academic interest lies in pure math and math-adjacent CS fields like algorithms and AI.
                </p>

                <p className='opacity-70 italic'>
                  Though my investment in pure math is facing some kind of a decline as the existential dread of the meaninglessness
                  in studying things like composition series and solvable groups is creeping up on me after taking my introductory abstract algebra course.
                </p>

                <p>
                  This is both a portfolio and a journal (built with React and Tailwind CSS). I record my notable projects and fun stuff like the media I have consumed and places I have travelled to. I
                  hope you have fun exploring my attempt at being creative.
                </p>
              </div>

              <SkillsList skills={skills} isLoading={isLoading} />

            </div>

          </section>

        </div>

      </main>

      <div className="relative w-full z-20 mb-10 md:mb-16">
        <RollingGallery items={rollingItems} tiltAngle={-3} />
      </div>

      {/* --- NEW INSPIRATIONS SECTION --- */}
      <div className="px-[10%] flex flex-col gap-6 md:pt-4 mb-6 md:mb-12">
        <h3 className="text-s font-mono tracking-[0.2em] text-accent uppercase flex items-center gap-2">
          inspirations <span className="h-[2px] w-16 bg-accent" />
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
          {inspirations.map((item, idx) => {
            const isHovered = hoveredInspiration === idx;
            return (
              <motion.a
                href={item.link}
                key={idx}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredInspiration(idx)}
                onMouseLeave={() => setHoveredInspiration(null)}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative py-3 px-4 rounded-lg border border-natural-border bg-natural-bg/50 backdrop-blur-sm group flex flex-col justify-between overflow-hidden"
              >
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      layoutId="inspirationGlow"
                      className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-secondary/5 -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center w-full gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-natural-text group-hover:text-accent transition-colors duration-300 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[10px] font-mono text-text-muted mt-0.5 truncate opacity-70">
                      {item.link}
                    </p>
                  </div>

                  <ExternalLink 
                    size={14} 
                    className="text-natural-text opacity-40 group-hover:opacity-100 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0"
                  />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* Decorative Grid Line */}
      <div className="absolute inset-0 px-[5%] flex justify-between pointer-events-none opacity-5">
        <div className="w-px h-full bg-natural-text" />
        <div className="w-px h-full bg-natural-text" />
      </div>
    </div>
  );
};