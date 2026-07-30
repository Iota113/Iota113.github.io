

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TRAVEL_URL } from '../services/supabase';
import type { TravelPhoto, TravelLocation } from './TravelModal';

const ROUNDS = 5;
const PTS_EXACT = 1000;
const PTS_REGION = 300;
const STREAK_BONUS = 150;
const BEST_KEY = 'travel-guess-best';

type Verdict = 'exact' | 'region' | 'miss';

interface RoundResult {
  photo: TravelPhoto;
  guessKey: string | null;
  verdict: Verdict;
  points: number;
}

interface CityOption {
  key: string;
  label: string;
  en: string;
  zh: string;
}

interface TravelGuessGameProps {
  open: boolean;
  photos: TravelPhoto[];
  locations: Record<string, TravelLocation>;
  lang: 'en' | 'zh';
  onClose: () => void;
}

const t = (lang: 'en' | 'zh', en: string, zh: string) => (lang === 'zh' ? zh : en);

const verdictMeta: Record<Verdict, { icon: string; accent: string }> = {
  exact: { icon: '✔', accent: 'text-emerald-400' },
  region: { icon: '≈', accent: 'text-amber-400' },
  miss: { icon: '✕', accent: 'text-rose-400' },
};

export const TravelGuessGame: React.FC<TravelGuessGameProps> = ({
  open,
  photos,
  locations,
  lang,
  onClose,
}) => {
  const playablePhotos = useMemo(
    () => photos.filter((p) => locations[p.city] && p.additional_images?.length),
    [photos, locations],
  );

  const buildDeck = useCallback(() => {
    const shuffled = [...playablePhotos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(ROUNDS, shuffled.length));
  }, [playablePhotos]);

  const [deck, setDeck] = useState<TravelPhoto[]>(() => buildDeck());
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<'guessing' | 'revealed' | 'finished'>('guessing');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [copied, setCopied] = useState(false);
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem(BEST_KEY) || 0));
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());

  const inputRef = useRef<HTMLInputElement>(null);

  const current = deck[roundIndex];
  const lastResult = results[results.length - 1];

  const getImageUrl = (filename?: string) => (filename ? `${TRAVEL_URL}/${filename}` : '');

  // Mirror TravelModal's viewport: the full-size gallery images live at
  // additional_images[1..]; index 0 is only a low-res thumbnail. Fall back to
  // [0] when a photo has no separate gallery.
  const heroImage = (photo?: TravelPhoto) => {
    const imgs = photo?.additional_images ?? [];
    const gallery = imgs.slice(1);
    return gallery.length > 0 ? gallery[0] : imgs[0];
  };

  const currentUrl = getImageUrl(heroImage(current));
  const currentReady = !currentUrl || loaded.has(currentUrl);

  // Every unique city that appears in the playable pool — the answer bank.
  const cityOptions = useMemo<CityOption[]>(() => {
    const seen = new Set<string>();
    const opts: CityOption[] = [];
    playablePhotos.forEach((p) => {
      if (seen.has(p.city)) return;
      const loc = locations[p.city];
      if (!loc) return;
      seen.add(p.city);
      opts.push({ key: p.city, label: lang === 'zh' ? loc.city_zh : loc.city_en, en: loc.city_en, zh: loc.city_zh });
    });
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [playablePhotos, locations, lang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cityOptions;
    return cityOptions.filter(
      (o) => o.en.toLowerCase().includes(q) || o.zh.toLowerCase().includes(q) || o.key.toLowerCase().includes(q),
    );
  }, [query, cityOptions]);

  const restart = useCallback(() => {
    setDeck(buildDeck());
    setRoundIndex(0);
    setResults([]);
    setScore(0);
    setStreak(0);
    setQuery('');
    setHighlight(0);
    setPhase('guessing');
  }, [buildDeck]);

  // Fresh deck each time the game is opened.
  useEffect(() => {
    if (open) restart();
  }, [open, restart]);

  // Modal chrome: lock scroll, hide sticky header, Esc to close.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('lightbox-open');
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('lightbox-open');
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Focus the input at the start of each guessing round.
  useEffect(() => {
    if (open && phase === 'guessing') {
      setQuery('');
      setHighlight(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
  }, [open, phase, roundIndex]);

  // Persist a new best when the game finishes.
  useEffect(() => {
    if (phase === 'finished' && score > best) {
      localStorage.setItem(BEST_KEY, String(score));
      setBest(score);
    }
  }, [phase, score, best]);

  // Preload every round's full-size image up front so rounds 2–5 are instant.
  // Round 1 loads first (never starve the frame you need now); the rest warm
  // in parallel behind it. Cancels in-flight loads when the game closes so we
  // don't keep pulling Supabase egress for images no one will see.
  useEffect(() => {
    if (!open || deck.length === 0) return;
    const urls = deck.map((p) => getImageUrl(heroImage(p))).filter(Boolean);
    const images: HTMLImageElement[] = [];
    let cancelled = false;

    const preload = (url: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        images.push(img);
        const done = () => {
          // Resolve on error too, so a broken image never hangs the loader.
          if (!cancelled) setLoaded((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
          resolve();
        };
        img.onload = done;
        img.onerror = done;
        img.src = url;
      });

    (async () => {
      if (urls[0]) await preload(urls[0]);
      if (!cancelled) await Promise.all(urls.slice(1).map(preload));
    })();

    return () => {
      cancelled = true;
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = ''; // best-effort abort of the pending download
      });
    };
    // getImageUrl/heroImage are pure; re-running on `loaded` would abort mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deck]);

  const commitGuess = (cityKey: string) => {
    if (phase !== 'guessing' || !current) return;
    const guessLoc = locations[cityKey];
    const answerLoc = locations[current.city];

    let verdict: Verdict = 'miss';
    let points = 0;
    if (cityKey === current.city) {
      verdict = 'exact';
      points = PTS_EXACT + streak * STREAK_BONUS;
      setStreak((s) => s + 1);
    } else if (guessLoc && answerLoc && guessLoc.region_en === answerLoc.region_en) {
      verdict = 'region';
      points = PTS_REGION;
      setStreak(0);
    } else {
      setStreak(0);
    }

    setScore((s) => s + points);
    setResults((r) => [...r, { photo: current, guessKey: cityKey, verdict, points }]);
    setPhase('revealed');
  };

  const next = () => {
    if (roundIndex + 1 >= deck.length) {
      setPhase('finished');
    } else {
      setRoundIndex((i) => i + 1);
      setPhase('guessing');
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (phase !== 'guessing') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = filtered[highlight] || filtered[0];
      if (pick) commitGuess(pick.key);
    }
  };

  const share = async () => {
    const text = t(
      lang,
      `I scored ${score} on Iota's City Guesser — can you beat me?`,
      `我在 Iota 的猜城挑战中拿了 ${score} 分 🗾 你能超过我吗？`,
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  const label = (loc: TravelLocation | undefined, kind: 'city' | 'region') => {
    if (!loc) return '';
    if (kind === 'city') return lang === 'zh' ? loc.city_zh : loc.city_en;
    return lang === 'zh' ? loc.region_zh : loc.region_en;
  };

  const enoughToPlay = deck.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-natural-text/30 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-[var(--radius-ui)] overflow-hidden border border-natural-border bg-surface-bg text-natural-text shadow-ui flex flex-col max-h-[90vh]"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-natural-border/60 shrink-0 bg-surface-bg">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-accent uppercase tracking-widest">
                  {t(lang, 'City Guesser', '猜城挑战')}
                </span>
                {phase !== 'finished' && enoughToPlay && (
                  <span className="font-mono text-[11px] text-text-muted">
                    {t(lang, 'Round', '回合')} {roundIndex + 1}/{deck.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] text-text-muted">
                  {t(lang, 'Score', '得分')}{' '}
                  <span className="text-accent font-semibold">{score}</span>
                </span>
                {streak > 1 && phase !== 'finished' && (
                  <span className="font-mono text-[11px] text-amber-400" title={t(lang, 'Streak', '连击')}>
                    🔥 {streak}
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-accent text-lg transition-colors font-mono cursor-pointer leading-none"
                  aria-label={t(lang, 'Close', '关闭')}
                >
                  ✕
                </button>
              </div>
            </div>

            {!enoughToPlay ? (
              <div className="p-10 text-center font-mono text-sm text-text-muted">
                {t(lang, 'Not enough photos to play yet.', '照片还不够，无法开始游戏。')}
              </div>
            ) : phase === 'finished' ? (
              /* ── END SCREEN ── */
              <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-6 seasonal-scrollbar bg-surface-bg">
                <div className="text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
                    {t(lang, 'Final Score', '最终得分')}
                  </p>
                  <p className="text-5xl font-display font-bold text-accent mt-1">{score}</p>
                  <p className="font-mono text-[11px] text-text-muted mt-2">
                    {t(lang, 'Best', '最佳')}: {Math.max(best, score)}
                    {score >= best && score > 0 && (
                      <span className="text-amber-400 ml-2">★ {t(lang, 'New best!', '新纪录！')}</span>
                    )}
                  </p>
                </div>

                {/* Per-round recap */}
                <div className="flex flex-col gap-2">
                  {results.map((r, i) => {
                    const loc = locations[r.photo.city];
                    const guessLoc = r.guessKey ? locations[r.guessKey] : undefined;
                    const meta = verdictMeta[r.verdict];
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-2 rounded-md border border-natural-border/50 bg-natural-bg font-mono text-[11px]"
                      >
                        <span className={`${meta.accent} text-sm w-4 text-center`}>{meta.icon}</span>
                        <img
                          src={getImageUrl(r.photo.additional_images?.[0])}
                          alt=""
                          className="w-9 h-9 rounded object-cover border border-natural-border/60"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-natural-text">{label(loc, 'city')}</span>
                          {r.verdict !== 'exact' && (
                            <span className="text-text-muted">
                              {' '}
                              ← {t(lang, 'you', '你')}: {label(guessLoc, 'city') || '—'}
                            </span>
                          )}
                        </div>
                        <span className="text-accent shrink-0">+{r.points}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={restart}
                    className="flex-1 px-4 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider bg-accent text-white hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {t(lang, 'Play Again', '再玩一次')}
                  </button>
                  <button
                    onClick={share}
                    className="flex-1 px-4 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider border border-accent/50 text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                  >
                    {copied ? t(lang, 'Copied!', '已复制！') : t(lang, 'Share Score', '分享成绩')}
                  </button>
                </div>
              </div>
            ) : (
              /* ── ROUND (guessing / revealed) ── */
              <div className="flex flex-col overflow-y-auto seasonal-scrollbar">
                {/* Image */}
                <div className="relative w-full aspect-[16/10] bg-black overflow-hidden shrink-0">
                  {currentReady && currentUrl && (
                    <>
                      {/* Blurred, dimmed copy fills the letterbox so portrait
                          photos don't sit in dead black bars. */}
                      <img
                        src={currentUrl}
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-50"
                      />
                      {/* The full, uncropped photo — same contain behavior as the lightbox. */}
                      <img
                        src={currentUrl}
                        alt={t(lang, 'Where is this?', '这是哪里？')}
                        className="absolute inset-0 z-[1] w-full h-full object-contain"
                      />
                    </>
                  )}
                  {!currentReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                      <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted animate-pulse">
                        {t(lang, 'Loading…', '加载中…')}
                      </span>
                    </div>
                  )}
                  {phase === 'revealed' && lastResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute inset-x-0 bottom-0 z-10 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent"
                    >
                      <p className={`font-mono text-xs uppercase tracking-widest ${verdictMeta[lastResult.verdict].accent}`}>
                        {verdictMeta[lastResult.verdict].icon}{' '}
                        {lastResult.verdict === 'exact'
                          ? t(lang, 'Perfect!', '完美！')
                          : lastResult.verdict === 'region'
                            ? t(lang, 'So close — right region!', '就差一点 — 地区正确！')
                            : t(lang, 'Missed', '错过了')}
                        <span className="text-white/90 ml-2">+{lastResult.points}</span>
                      </p>
                      <h3 className="text-xl font-display font-bold text-white mt-0.5">
                        {lang === 'zh' ? current?.place_zh || current?.place : current?.place}
                      </h3>
                      <p className="font-mono text-[11px] text-white/70">
                        {label(locations[current.city], 'city')}
                        <span className="mx-1 opacity-50">|</span>
                        {label(locations[current.city], 'region')}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Interaction area */}
                <div className="p-5 flex flex-col gap-3 bg-surface-bg">
                  {phase === 'guessing' ? (
                    <>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
                        {t(lang, 'Which city is this?', '这是哪座城市？')}
                      </p>
                      <div className="relative">
                        <input
                          ref={inputRef}
                          value={query}
                          onChange={(e) => {
                            setQuery(e.target.value);
                            setHighlight(0);
                          }}
                          onKeyDown={onInputKeyDown}
                          placeholder={t(lang, 'Type a city…', '输入城市…')}
                          className="w-full px-4 py-2.5 rounded-[var(--radius-ui)] bg-natural-bg border border-natural-border focus:border-accent outline-none font-mono text-sm text-natural-text placeholder:text-text-muted/60 transition-colors"
                        />
                        {filtered.length > 0 && (
                          <div className="mt-2 max-h-44 overflow-y-auto rounded-[var(--radius-ui)] border border-natural-border/60 bg-natural-bg divide-y divide-natural-border/40 seasonal-scrollbar">
                            {filtered.map((o, i) => (
                              <button
                                key={o.key}
                                onMouseEnter={() => setHighlight(i)}
                                onClick={() => commitGuess(o.key)}
                                className={`w-full text-left px-4 py-2 font-mono text-sm cursor-pointer transition-colors ${
                                  i === highlight ? 'bg-accent/15 text-accent' : 'text-natural-text hover:bg-accent/10'
                                }`}
                              >
                                {o.label}
                                <span className="text-text-muted/60 text-[11px] ml-2">
                                  {lang === 'zh' ? o.en : o.zh}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        {filtered.length === 0 && (
                          <p className="mt-2 px-1 font-mono text-[11px] text-text-muted">
                            {t(lang, 'No match — try another spelling.', '没有匹配 — 换个拼写试试。')}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {(lang === 'zh' ? current?.caption_zh || current?.caption : current?.caption) && (
                        <p className="text-sm leading-relaxed text-natural-text font-serif">
                          {lang === 'zh' ? current?.caption_zh || current?.caption : current?.caption}
                        </p>
                      )}
                      <button
                        onClick={next}
                        className="self-end px-6 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider bg-accent text-white hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        {roundIndex + 1 >= deck.length
                          ? t(lang, 'See Results', '查看结果')
                          : t(lang, 'Next', '下一题')}{' '}
                        →
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
