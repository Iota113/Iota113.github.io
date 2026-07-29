import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { supabase, TRAVEL_URL } from '../services/supabase';
import { useSeason } from '../context/SeasonContext';
import { TiltedCard } from '../components/TiltedCard';
import { TravelModal } from '../components/TravelModal';
import { TravelGuessGame } from '../components/TravelGuessGame';
import skirkVideoUrl from '../../videos/skirk-star-odyssey.mp4';

interface TravelLocation {
    key: string;
    city_en: string;
    city_zh: string;
    region_en: string;
    region_zh: string;
}

interface TravelPhoto {
    id: string;
    additional_images: string[];
    place: string;
    place_zh?: string; // Added to support your updated database table schema
    city: string;
    caption: string;
    caption_zh?: string; // Added to support bilingual captions if needed
    rating: number;
    is_cover: boolean;
    visited_at: string;
}

export const Travel: React.FC = () => {
    const { season } = useSeason();
    const [photos, setPhotos] = useState<TravelPhoto[]>([]);
    const [locations, setLocations] = useState<Record<string, TravelLocation>>({});
    const [lang, setLang] = useState<'en' | 'zh'>('en');
    const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
    const [selectedCity, setSelectedCity] = useState<string>('ALL');
    const [activePhoto, setActivePhoto] = useState<TravelPhoto | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [gameOpen, setGameOpen] = useState(false);

    const pageRef = useRef<HTMLDivElement>(null);
    
    const { scrollYProgress } = useScroll({
        target: pageRef,
        offset: ["start start", "end end"]
    });

    const videoOpacity = useTransform(
        scrollYProgress,
        [0, 0.5],
        [0.8, 0.6],
        { clamp: true }
    );

    useEffect(() => {
        const fetchTravelData = async () => {
            try {
                const [photosRes, locationsRes] = await Promise.all([
                    supabase
                        .from('travel_photos')
                        .select('*')
                        .order('visited_at', { ascending: false }),
                    supabase
                        .from('travel_locations')
                        .select('*')
                ]);

                if (photosRes.error) throw photosRes.error;
                if (locationsRes.error) throw locationsRes.error;

                if (photosRes.data) {
                    setPhotos(photosRes.data as TravelPhoto[]);
                }

                if (locationsRes.data) {
                    const locMap: Record<string, TravelLocation> = {};
                    (locationsRes.data as TravelLocation[]).forEach((loc) => {
                        locMap[loc.key] = loc;
                    });
                    setLocations(locMap);
                }
            } catch (err) {
                console.error("Error retrieving travel data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTravelData();
    }, []);

    useEffect(() => {
        setSelectedCity('ALL');
    }, [selectedRegion]);

    const getThumbnail = (images: string[]) => {
        if (!images || images.length === 0) return '';
        const thumbnailInName = images.find(img => img.toLowerCase().includes('thumbnail'));
        if (thumbnailInName && images[0] !== thumbnailInName) {
            console.warn(
                `[Travel] Thumbnail warning: First image "${images[0]}" is not the thumbnail, but "${thumbnailInName}" contains 'thumbnail'. Falling back to "${thumbnailInName}".`
            );
            return thumbnailInName;
        }
        return images[0];
    };

    const regions = useMemo(() => {
        const list = new Set<string>();
        photos.forEach(p => {
            const loc = locations[p.city];
            if (loc) {
                list.add(loc.region_en);
            }
        });
        return ['ALL', ...Array.from(list)];
    }, [photos, locations]);

    const cities = useMemo(() => {
        const list = new Set<string>();
        photos.forEach(p => {
            const loc = locations[p.city];
            if (loc) {
                if (selectedRegion === 'ALL' || loc.region_en === selectedRegion) {
                    list.add(p.city);
                }
            }
        });
        return ['ALL', ...Array.from(list)];
    }, [photos, locations, selectedRegion]);

    const stats = useMemo(() => {
        const uniquePlaces = new Set(photos.map(p => p.place)).size;
        const uniqueCities = new Set(photos.map(p => p.city)).size;
        const expLevel = Math.max(1, uniquePlaces * 2 + uniqueCities * 5);

        return {
            level: expLevel,
            placesCount: uniquePlaces,
            photosCount: photos.length
        };
    }, [photos]);

    const filteredPhotos = useMemo(() => {
        const baseFiltered = photos.filter(p => {
            const loc = locations[p.city];
            const matchesRegion = selectedRegion === 'ALL' || (loc && loc.region_en === selectedRegion);
            const matchesCity = selectedCity === 'ALL' || p.city === selectedCity;
            return matchesRegion && matchesCity;
        });

        return [...baseFiltered].sort((a, b) => {
            const dateA = a.visited_at ? a.visited_at.substring(0, 7) : '';
            const dateB = b.visited_at ? b.visited_at.substring(0, 7) : '';

            if (dateA !== dateB) {
                return dateB.localeCompare(dateA);
            }

            // Fallback locale sorting depending on selected language
            const nameA = lang === 'zh' ? (a.place_zh || a.place) : a.place;
            const nameB = lang === 'zh' ? (b.place_zh || b.place) : b.place;
            return nameA.localeCompare(nameB, lang === 'zh' ? 'zh-Hans-CN' : 'en');
        });
    }, [photos, locations, selectedRegion, selectedCity, lang]);

    const renderStars = (rating: number) => {
        const validRating = Math.max(0, Math.min(5, Math.floor(rating)));
        return '★'.repeat(validRating);
    };

    const getImageUrl = (filename: string) => {
        return `${TRAVEL_URL}/${filename}`;
    };

    if (loading) return <div className="min-h-screen bg-natural-bg flex items-center justify-center text-accent font-mono animate-pulse">Retrieving Travel Compendium...</div>;

    const getCardBgStyle = () => {
        switch (season) {
            case 'spring': return 'bg-rose-50';
            case 'summer': return 'bg-sky-50';
            case 'autumn': return 'bg-stone-900 dark';
            case 'winter': return 'bg-slate-900 dark';
            default: return 'bg-zinc-900';
        }
    };

    return (
        <div ref={pageRef} className="min-h-screen w-full text-natural-text flex flex-col items-center pb-16 font-sans overflow-hidden relative transition-colors duration-700">

            {/* --- HEADER SECTION --- */}
            <section className="w-full pt-12 pb-6 px-[10%] relative overflow-hidden flex justify-center border-b border-natural-border/30">
                
                {/* Parallax MP4 Video Background */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <motion.div
                        className="fixed md:inset-[20%] w-[80vw] h-[80vh] mx-auto my-auto"
                        style={{ opacity: videoOpacity }}
                    >
                        <div className="relative w-full h-full overflow-hidden">
                            <video
                                src={skirkVideoUrl} 
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover object-center brightness-[0.9]"
                            />
                            <div 
                                className="absolute inset-0"
                                style={{ background: 'radial-gradient(circle at center, transparent 15%, var(--natural-bg, #0b0f19) 80%)' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-natural-bg via-transparent to-natural-bg/30" />
                            <div className="absolute inset-0 bg-gradient-to-r from-natural-bg via-transparent to-natural-bg" />
                        </div>
                    </motion.div>
                </div>

                {/* MASTER STATUS BANNER */}
                <div className="w-full z-10">
                    <div className="w-full bg-surface-bg/30 backdrop-blur-md border border-natural-border/30 shadow-2xl rounded-[var(--radius-ui)] p-4 md:p-6 flex flex-col gap-6 relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full border-2 border-accent flex flex-col items-center justify-center bg-natural-bg/80 font-mono shadow-md">
                                    <span className="text-xl font-bold tracking-tighter text-accent">{stats.placesCount}</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-display font-bold tracking-tight">
                                        {lang === 'zh' ? '旅行日志' : 'Travel Compendium'}
                                    </h1>
                                    <p className="text-xs font-mono text-text-muted mt-1 uppercase tracking-wider">
                                        {lang === 'zh' ? '兴趣点' : 'Points of Interest'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-auto">

                            {/* GUESS-THE-CITY GAME LAUNCHER */}
                            <button
                                onClick={() => setGameOpen(true)}
                                className="px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-wider border border-accent/60 bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-300 shadow-sm cursor-pointer flex items-center gap-1.5"
                            >
                                {lang === 'zh' ? '猜城挑战' : 'Guess the City'}
                            </button>

                            {/* BILINGUAL TOGGLE */}
                            <button
                                onClick={() => setLang(prev => (prev === 'en' ? 'zh' : 'en'))}
                                className="relative flex items-center bg-natural-bg/60 border border-natural-border/40 rounded-full p-1 shadow-sm backdrop-blur-sm cursor-pointer select-none structure-focus"
                                aria-label={`Switch language. Current language is ${lang === 'en' ? 'English' : 'Chinese'}`}
                            >
                                <div
                                    className={`absolute top-1 bottom-1 left-1 rounded-full bg-accent shadow-sm transition-all duration-300 ease-in-out ${
                                        lang === 'en' ? 'w-[40px] translate-x-0' : 'w-[54px] translate-x-[40px]'
                                    }`}
                                />
                                <span className={`relative z-10 w-[40px] py-1 text-center text-[14px] font-mono tracking-wider transition-colors duration-300 ${lang === 'en' ? 'text-white' : 'text-text-muted hover:text-natural-text'}`}>
                                    EN
                                </span>
                                <span className={`relative z-10 w-[54px] py-1 text-center text-[14px] font-mono tracking-wider transition-colors duration-300 ${lang === 'zh' ? 'text-white' : 'text-text-muted hover:text-natural-text'}`}>
                                    中文
                                </span>
                            </button>
                            </div>
                        </div>

                        <hr className="border-natural-border/20" />

                        {/* Dual Tier Filtering UI */}
                        <div className="flex flex-col gap-4">
                            {/* Region Filters */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                                    {lang === 'zh' ? '地区:' : 'Region:'}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {regions.map((region) => {
                                        let displayLabel = region;
                                        if (region !== 'ALL') {
                                            const loc = Object.values(locations).find(l => l.region_en === region);
                                            displayLabel = lang === 'zh' && loc ? loc.region_zh : region;
                                        } else {
                                            displayLabel = lang === 'zh' ? '全部' : 'ALL';
                                        }
                                        return (
                                            <button
                                                key={region}
                                                onClick={() => setSelectedRegion(region)}
                                                className={`px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider border transition-all duration-300 ${selectedRegion === region
                                                    ? 'bg-accent text-white border-accent shadow-sm'
                                                    : 'bg-natural-bg/80 text-text-muted border-natural-border hover:border-accent/40'
                                                    }`}
                                            >
                                                {displayLabel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* City Filters */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                                    {lang === 'zh' ? '城市:' : 'City:'}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {cities.map((city) => {
                                        let displayLabel = city;
                                        if (city !== 'ALL') {
                                            const loc = locations[city];
                                            displayLabel = lang === 'zh' && loc ? loc.city_zh : (loc ? loc.city_en : city);
                                        } else {
                                            displayLabel = lang === 'zh' ? '全部' : 'ALL';
                                        }
                                        return (
                                            <button
                                                key={city}
                                                onClick={() => setSelectedCity(city)}
                                                className={`px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider border transition-all duration-300 ${selectedCity === city
                                                    ? 'bg-accent/20 text-accent border-accent/40'
                                                    : 'bg-natural-bg/40 text-text-muted border-natural-border/60 hover:border-accent/30'
                                                    }`}
                                            >
                                                {displayLabel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MAIN CONTENT SECTION (PHOTO GRID) --- */}
            <section className="w-full px-[10%] z-10 flex flex-col gap-8 pt-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredPhotos.map((photo, index) => {
                            const loc = locations[photo.city];
                            const cityLabel = loc ? (lang === 'zh' ? loc.city_zh : loc.city_en) : photo.city;
                            const regionLabel = loc ? (lang === 'zh' ? loc.region_zh : loc.region_en) : '';
                            
                            // Dynamic fallback handling for the specific location names
                            const placeLabel = lang === 'zh' ? (photo.place_zh || photo.place) : photo.place;

                            return (
                                <TiltedCard
                                    layout
                                    key={photo.id}
                                    initial={{ opacity: 0, y: 50, scale: 0.92 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    exit={{ opacity: 0, y: 30, scale: 0.92 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: (index % 6) * 0.05,
                                        ease: [0.25, 0.8, 0.25, 1]
                                    }}
                                    onClick={() => {
                                        setActivePhoto(photo);
                                        setActiveImageIndex(0);
                                    }}
                                    className="bg-surface-bg border border-natural-border hover:border-accent/80 shadow-sm hover:shadow-ui transition-all duration-300 flex flex-col"
                                >
                                    <div className="aspect-[4/5] w-full bg-natural-bg relative overflow-hidden border-b border-natural-border/90">
                                        <img
                                            src={getImageUrl(getThumbnail(photo.additional_images))}
                                            alt={placeLabel}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-115 [.group:not(:hover)_&]:duration-1500"
                                            loading="lazy"
                                        />
                                        {photo.is_cover && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-accent text-white font-mono text-[9px] rounded-sm tracking-widest uppercase">
                                                Iota's Choice
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 right-2 px-2 py-0.5 font-mono text-[12px] rounded-sm border border-accent/25 bg-surface-bg/80 text-yellow-400 backdrop-blur-sm tracking-tight font-semibold">
                                            {renderStars(photo.rating)}
                                        </div>
                                    </div>

                                    <div className="p-3 flex flex-col gap-0.5 bg-surface-bg">
                                        <div className="flex justify-between items-center text-[10px] font-mono text-text-muted uppercase tracking-wider">
                                            <span className="truncate max-w-[65%]">{cityLabel}</span>
                                            <span className="opacity-50 text-[9px] truncate max-w-[35%] text-right">{regionLabel}</span>
                                        </div>
                                        <h3 className="text-base font-display font-semibold truncate group-hover:text-accent transition-colors">
                                            {placeLabel}
                                        </h3>
                                    </div>
                                </TiltedCard>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </section>

            {/* --- INSPECT MODAL --- */}
            <TravelModal
                photo={activePhoto}
                onClose={() => setActivePhoto(null)}
                locations={locations}
                lang={lang}
            />

            {/* --- GUESS-THE-CITY MINIGAME --- */}
            <TravelGuessGame
                open={gameOpen}
                photos={photos}
                locations={locations}
                lang={lang}
                onClose={() => setGameOpen(false)}
            />

        </div>
    );
};