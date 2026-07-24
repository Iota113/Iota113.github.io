import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate, AnimatePresence, useTransform } from 'motion/react';

export interface Skill {
  id: string;
  name: string;
  icon_url: string;
}

interface SkillsListProps {
  skills: Skill[];
  isLoading: boolean;
}

export const SkillsList: React.FC<SkillsListProps> = ({ skills, isLoading }) => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Mouse tracking state for the background spotlight glow
  const skillsMouseX = useMotionValue(0);
  const skillsMouseY = useMotionValue(0);
  const skillsSpringConfig = { damping: 25, stiffness: 120 };
  const smoothSkillsX = useSpring(skillsMouseX, skillsSpringConfig);
  const smoothSkillsY = useSpring(skillsMouseY, skillsSpringConfig);
  const [showSkillsGlow, setShowSkillsGlow] = useState(false);

  const handleSkillsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    skillsMouseX.set(e.clientX - rect.left);
    skillsMouseY.set(e.clientY - rect.top);
  };

  const GLOW_OFFSET = 100;
  const glowX = useTransform(smoothSkillsX, (x) => x + GLOW_OFFSET);
  const glowY = useTransform(smoothSkillsY, (y) => y + GLOW_OFFSET);
  // Center the radial gradient relative to the enlarged element's coordinate space
  const skillsGlowBg = useMotionTemplate`radial-gradient(120px circle at ${glowX}px ${glowY}px, var(--color-accent), transparent 70%)`

  return (
    <div className="md:w-1/2 w-full flex flex-col">
      <h3 className="text-s font-mono tracking-[0.2em] text-accent uppercase mb-4 flex items-center md:pl-10">
        skills  <span className="h-[1.5px] w-12" />
      </h3>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-3 animate-pulse py-4 px-0 md:p-6 md:ml-8">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-20 h-20 rounded-xl bg-natural-border" />
          ))}
        </div>
      ) : (
        <div
          className="py-4 px-0 md:p-6 relative grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap gap-3 w-full justify-items-start items-center justify-start md:ml-8 overflow-visible"
          onMouseMove={handleSkillsMouseMove}
          onMouseEnter={() => setShowSkillsGlow(true)}
          onMouseLeave={() => setShowSkillsGlow(false)}
        >
          {/* Fading circular glow centered at mouse */}
          <AnimatePresence>
            {showSkillsGlow && (
              <motion.div
                className="absolute -inset-[100px] pointer-events-none rounded-xl z-0"
                style={{
                  background: skillsGlowBg,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {skills.map((skill) => {
            const isExpanded = hoveredSkill === skill.id;
            return (
              <motion.div
                key={skill.id}
                onMouseEnter={() => setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
                animate={{
                  scale: isExpanded ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 w-20 h-20 rounded-xl border border-natural-border bg-natural-bg/50 backdrop-blur-sm cursor-default transition-shadow duration-300 justify-self-start
                  ${isExpanded ? 'shadow-md md:border-accent/40 z-20' : 'z-10'}
                `}
              >
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-gradient-to-b from-accent/5 to-secondary/5 -z-10 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                {/* Skill Icon Container */}
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center p-1.5 rounded-xl transition-all duration-300">
                  <img
                    src={skill.icon_url}
                    alt={`${skill.name} icon`}
                    className="w-full h-full object-contain dark:invert-[0.1] opacity-80"
                  />
                </div>

                {/* Skill Name underneath Icon on Hover */}
                <div className="h-4 mt-1.5 flex items-center justify-center w-full text-center overflow-visible">
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 2 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="font-mono text-[8px] font-semibold text-natural-text block truncate"
                      >
                        {skill.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
