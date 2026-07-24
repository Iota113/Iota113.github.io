import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export const StaggerReveal = ({ 
    text, 
    periodicInterval = 4000 
}: { 
    text: string; 
    periodicInterval?: number; 
}) => {
    const [key, setKey] = useState(0);
    const characters = text.split('');

    useEffect(() => {
        if (!periodicInterval) return;
        const interval = setInterval(() => {
            setKey(prev => prev + 1);
        }, periodicInterval);
        return () => clearInterval(interval);
    }, [periodicInterval]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const charVariants = {
        hidden: { y: '100%', opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                ease: [0.2, 0.65, 0.3, 0.9] as const,
                duration: 0.8,
            },
        },
    };

    return (
        <motion.span
            key={key}
            className="inline-flex flex-wrap overflow-hidden py-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {characters.map((char, idx) => (
                <span key={idx} className="overflow-hidden inline-block">
                    <motion.span variants={charVariants} className="inline-block">
                        {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                </span>
            ))}
        </motion.span>
    );
};
