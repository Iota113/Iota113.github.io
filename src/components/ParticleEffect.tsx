import React, { useEffect, useRef } from 'react';
import { useSeason } from '../context/SeasonContext';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  angle: number;
  spin: number;
  swaySpeed: number;
  swayOffset: number;
  type?: 'leaf' | 'firefly' | 'circle' | 'crystal';
}

const AUTUMN_COLORS = ['#D13E2E', '#DF9A67', '#C75A32', '#E07A5F', '#B54728'];

export const ParticleEffect: React.FC = () => {
  const { season } = useSeason();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle canvas resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeParticles(season, canvas.width, canvas.height);
    };

    // Initialize particles according to selected season
    const initializeParticles = (currentSeason: Season, width: number, height: number) => {
      const particles: Particle[] = [];
      let maxParticles = 20;

      // Adjust particle count depending on device screen width to prevent performance drops on mobile
      if (width < 768) {
        maxParticles = 10;
      }

      for (let i = 0; i < maxParticles; i++) {
        particles.push(createParticle(currentSeason, width, height, true));
      }

      particlesRef.current = particles;
    };

    // Create a single particle
    const createParticle = (
      currentSeason: Season,
      width: number,
      height: number,
      randomY = false
    ): Particle => {
      const sizeRandom = Math.random();
      const x = Math.random() * width;
      // If randomY is true, scatter them across height. If false, spawn them off-screen (e.g. top or bottom)
      const y = randomY
        ? Math.random() * height
        : (currentSeason === 'summer' ? height + 10 : -15);

      switch (currentSeason) {
        case 'spring': // Sakura Petals
          return {
            x,
            y,
            vx: (Math.random() - 0.3) * 0.8, // subtle draft
            vy: 0.4 + Math.random() * 0.5, // gentle fall speed
            size: 6 + sizeRandom * 5, // size range 6 to 11
            opacity: 0.4 + Math.random() * 0.45,
            color: 'rgba(232, 122, 144, ', // pink (alpha added on draw)
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.02,
            swaySpeed: 0.005 + Math.random() * 0.01,
            swayOffset: Math.random() * 100,
          };

        case 'summer': // Fireflies + Green Leaves
          return {
            x,
            y: randomY ? Math.random() * height : -15,
            vx: 0.6 + Math.random() * 1.0, // drift sideways
            vy: 0.4 + Math.random() * 0.6,
            size: 5 + sizeRandom * 6,
            opacity: 0.25 + Math.random() * 0.4,
            color: 'rgba(77, 158, 58, ', // leaf green
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.025,
            swaySpeed: 0.01 + Math.random() * 0.015,
            swayOffset: Math.random() * 100,
            type: 'leaf',
          };

        case 'autumn': // Maple Leaves
          return {
            x,
            y,
            vx: (Math.random() - 0.2) * 0.6,
            vy: 0.6 + Math.random() * 0.6,
            size: 8 + sizeRandom * 7,
            opacity: 0.3 + Math.random() * 0.2,
            color: AUTUMN_COLORS[Math.floor(Math.random() * AUTUMN_COLORS.length)],
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.035,
            swaySpeed: 0.015 + Math.random() * 0.02,
            swayOffset: Math.random() * 100,
          };

        case 'winter': // Snowballs + Stellar Ice Crystals
          const isCrystal = Math.random() > 0.85; // 85% simple snow, 15% complex crystals
          return {
            x,
            y,
            vx: (Math.random() - 0.2) * 0.3, // soft wind drift
            vy: 0.3 + Math.random() * 0.6,
            size: isCrystal ? 7 + sizeRandom * 4 : 1.5 + sizeRandom * 3,
            opacity: isCrystal ? 0.3 + Math.random() * 0.2 : 0.25 + Math.random() * 0.3,
            color: 'rgba(255, 255, 255, ',
            angle: Math.random() * Math.PI * 2,
            spin: isCrystal ? (Math.random() - 0.5) * 0.015 : 0,
            swaySpeed: 0.01 + Math.random() * 0.02,
            swayOffset: Math.random() * 100,
            type: isCrystal ? 'crystal' : 'circle',
          };
      }
    };

    // Animation Loop
    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Move and update positions
        p.swayOffset += p.swaySpeed;

        // Add horizontal sway
        const sway = Math.sin(p.swayOffset) * (p.type === 'firefly' ? 0.3 : 0.5);
        p.x += p.vx + sway;
        p.y += p.vy;
        p.angle += p.spin;

        // Special handling for firefly twinkling opacity
        if (p.type === 'firefly') {
          // Twinkle using sine wave + small noise
          p.opacity = 0.15 + 0.65 * Math.abs(Math.sin(p.swayOffset * 0.6));
        }

        // 2. Recycle particles that wander off-screen
        let offScreen = false;
        if (season === 'summer' && p.type === 'firefly') {
          // Fireflies go up
          offScreen = p.y < -15 || p.x < -15 || p.x > width + 15;
        } else {
          // Other things fall down
          offScreen = p.y > height + 15 || p.x < -15 || p.x > width + 15;
        }

        if (offScreen) {
          particles[i] = createParticle(season, width, height, false);
          continue;
        }

        // 3. Draw particle shapes
        ctx.save();

        switch (season) {
          case 'spring': // Sakura petal drawing (curved drop shape)
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = `${p.color}${p.opacity})`;
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            // Form a curved sakura petal using bezier curves
            ctx.quadraticCurveTo(p.size * 1.4, -p.size * 0.8, p.size * 0.8, p.size * 0.8);
            ctx.quadraticCurveTo(-p.size * 0.4, p.size * 0.8, -p.size * 0.8, 0);
            ctx.closePath();
            ctx.fill();
            break;

          case 'summer':
            if (p.type === 'firefly') {
              // Glowing yellow-green circle gradient
              const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
              grad.addColorStop(0, `rgba(180, 240, 90, ${p.opacity})`);
              grad.addColorStop(0.3, `rgba(180, 240, 90, ${p.opacity * 0.3})`);
              grad.addColorStop(1, 'rgba(180, 240, 90, 0)');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Summer breeze leaf (slender fresh green leaf)
              ctx.translate(p.x, p.y);
              ctx.rotate(p.angle);
              ctx.fillStyle = `${p.color}${p.opacity})`;
              ctx.beginPath();
              ctx.moveTo(0, -p.size);
              ctx.quadraticCurveTo(p.size * 0.5, -p.size * 0.2, 0, p.size);
              ctx.quadraticCurveTo(-p.size * 0.5, -p.size * 0.2, 0, -p.size);
              ctx.closePath();
              ctx.fill();
            }
            break;

          case 'autumn': // Stylized 5-pointed maple leaf
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.beginPath();

            // Stem start
            ctx.moveTo(0, p.size);
            // Stem end
            ctx.lineTo(0, p.size * 0.2);

            // Lobe 1 (Bottom Left)
            ctx.lineTo(-p.size * 0.4, p.size * 0.35);
            ctx.lineTo(-p.size * 0.25, 0.0);

            // Lobe 2 (Mid Left)
            ctx.lineTo(-p.size * 0.9, -p.size * 0.15);
            ctx.lineTo(-p.size * 0.45, -p.size * 0.4);

            // Lobe 3 (Top Left)
            ctx.lineTo(-p.size * 0.65, -p.size * 0.8);
            ctx.lineTo(-p.size * 0.2, -p.size * 0.55);

            // Center Lobe (Top Tip)
            ctx.lineTo(0, -p.size * 1.15);

            // Lobe 4 (Top Right)
            ctx.lineTo(p.size * 0.2, -p.size * 0.55);
            ctx.lineTo(p.size * 0.65, -p.size * 0.8);
            ctx.lineTo(p.size * 0.45, -p.size * 0.4);

            // Lobe 5 (Mid Right)
            ctx.lineTo(p.size * 0.9, -p.size * 0.15);
            ctx.lineTo(p.size * 0.25, 0.0);

            // Lobe 6 (Bottom Right)
            ctx.lineTo(p.size * 0.4, p.size * 0.35);

            ctx.closePath();
            ctx.fill();
            break;

          case 'winter':
            if (p.type === 'crystal') {
              // 6-pointed detailed snowflake crystal
              ctx.translate(p.x, p.y);
              ctx.rotate(p.angle);
              ctx.strokeStyle = `rgba(200, 230, 255, ${p.opacity})`;
              ctx.lineWidth = 1.0;
              ctx.beginPath();

              for (let d = 0; d < 6; d++) {
                ctx.moveTo(0, 0);
                const angle = (d * Math.PI) / 3;
                const tx = Math.cos(angle) * p.size;
                const ty = Math.sin(angle) * p.size;
                ctx.lineTo(tx, ty);

                // branch points
                const bx = Math.cos(angle) * (p.size * 0.55);
                const by = Math.sin(angle) * (p.size * 0.55);

                ctx.moveTo(bx, by);
                ctx.lineTo(
                  bx + Math.cos(angle + Math.PI / 6) * (p.size * 0.25),
                  by + Math.sin(angle + Math.PI / 6) * (p.size * 0.25)
                );
                ctx.moveTo(bx, by);
                ctx.lineTo(
                  bx + Math.cos(angle - Math.PI / 6) * (p.size * 0.25),
                  by + Math.sin(angle - Math.PI / 6) * (p.size * 0.25)
                );
              }
              ctx.stroke();
            } else {
              // Soft fuzzy circular snowflake
              const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
              grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
              grad.addColorStop(0.5, `rgba(255, 255, 255, ${p.opacity * 0.6})`);
              grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
        }

        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Initial setup
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationFrameId.current = requestAnimationFrame(animate);

    // Stop animation if window tab is hidden (save battery/CPU resources)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      } else {
        if (!animationFrameId.current) {
          animationFrameId.current = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [season]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};
