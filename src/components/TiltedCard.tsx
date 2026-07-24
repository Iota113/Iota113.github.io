import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from 'motion/react';

interface TiltedCardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
}

export const TiltedCard: React.FC<TiltedCardProps> = ({
    children,
    onClick,
    className = '',
    style,
    ...motionProps
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Mouse position coordinates normalized between 0 and 1
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const scale = useMotionValue(1);

    // Springs for physics-based fluid movement
    const springConfig = { damping: 20, stiffness: 150, mass: 0.6 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);
    const scaleSpring = useSpring(scale, springConfig);

    // Map normalized inputs to tilt degrees
    const rotateX = useTransform(ySpring, [0, 1], [15, -15]);
    const rotateY = useTransform(xSpring, [0, 1], [-15, 15]);

    // Combine into a single perspective transform string to ensure it applies in correct order
    const tiltTransform = useTransform(
        [rotateX, rotateY, scaleSpring],
        ([rx, ry, s]) => `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${s}, ${s}, ${s})`
    );

    // Glare shine coordinates mapping
    const shineX = useTransform(xSpring, [0, 1], ['0%', '100%']);
    const shineY = useTransform(ySpring, [0, 1], ['0%', '100%']);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        
        // Calculate relative coordinates (0 to 1)
        const relativeX = (e.clientX - rect.left) / rect.width;
        const relativeY = (e.clientY - rect.top) / rect.height;
        
        x.set(relativeX);
        y.set(relativeY);
        scale.set(1.04); // Pop card up slightly
    };

    const handleMouseLeave = () => {
        // Reset rotation to neutral center and original scale
        x.set(0.5);
        y.set(0.5);
        scale.set(1);
    };

    return (
        <motion.div
            onClick={onClick}
            style={style}
            {...motionProps}
        >
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: tiltTransform,
                    transformStyle: 'preserve-3d',
                }}
                className={`relative group w-full h-full select-none cursor-pointer overflow-hidden transition-shadow duration-300 ${className}`}
            >
                {/* Gloss/reflection layer */}
                <motion.div
                    style={{
                        background: useTransform(
                            [shineX, shineY],
                            ([sX, sY]) => `radial-gradient(circle at ${sX} ${sY}, rgba(255, 255, 255, 0.15) 0%, transparent 65%)`
                        ),
                        transform: 'translateZ(1px)',
                    }}
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                {/* Content wrapper */}
                <div style={{ transform: 'translateZ(0px)', transformStyle: 'preserve-3d' }} className="w-full h-full flex flex-col">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
};
