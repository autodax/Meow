import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Square } from 'lucide-react';
import { CATS, CatProfile, VOCAL_FILTERS, VocalCategory } from './data/cats';
import { meowSynth } from './utils/meowSynth';
import { CatCard } from './components/CatCard';
import { CatLightbox } from './components/CatLightbox';

export default function App() {
  const [selectedFilter, setSelectedFilter] = useState<VocalCategory>('all');
  const [playingIds, setPlayingIds] = useState<Record<string, boolean>>({});
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [isChorusActive, setIsChorusActive] = useState(false);
  const [inspectedCatId, setInspectedCatId] = useState<string | null>(null);

  const activeTimersRef = useRef<Record<string, number>>({});
  const chorusTimersRef = useRef<number[]>([]);

  const filteredCats = useMemo(() => {
    if (selectedFilter === 'all') return CATS;
    return CATS.filter((cat) => cat.category === selectedFilter);
  }, [selectedFilter]);

  const totalMeows = useMemo(
    () => Object.values(playCounts).reduce((sum, count) => sum + count, 0),
    [playCounts]
  );

  const inspectedCat = useMemo(
    () => CATS.find((c) => c.id === inspectedCatId) ?? null,
    [inspectedCatId]
  );

  const triggerMeow = useCallback((cat: CatProfile, pitchScale = 1) => {
    const durationMs = meowSynth.play(cat.voice, pitchScale);

    setPlayingIds((prev) => ({ ...prev, [cat.id]: true }));
    setPlayCounts((prev) => ({
      ...prev,
      [cat.id]: (prev[cat.id] ?? 0) + 1,
    }));

    if (activeTimersRef.current[cat.id]) {
      window.clearTimeout(activeTimersRef.current[cat.id]);
    }

    activeTimersRef.current[cat.id] = window.setTimeout(() => {
      setPlayingIds((prev) => {
        const next = { ...prev };
        delete next[cat.id];
        return next;
      });
      delete activeTimersRef.current[cat.id];
    }, Math.max(durationMs, 420));
  }, []);

  const stopChorus = useCallback(() => {
    chorusTimersRef.current.forEach((id) => window.clearTimeout(id));
    chorusTimersRef.current = [];
    setIsChorusActive(false);
  }, []);

  const toggleChorus = useCallback(() => {
    if (isChorusActive) {
      stopChorus();
      return;
    }

    const roster = filteredCats.length > 0 ? filteredCats : CATS;
    setIsChorusActive(true);
    let offsetMs = 0;

    roster.forEach((cat, index) => {
      const timerId = window.setTimeout(() => {
        triggerMeow(cat);
        if (index === roster.length - 1) {
          const endTimer = window.setTimeout(() => {
            setIsChorusActive(false);
          }, Math.round(cat.voice.duration * 1000) + 250);
          chorusTimersRef.current.push(endTimer);
        }
      }, offsetMs);

      chorusTimersRef.current.push(timerId);
      offsetMs += Math.round(cat.voice.duration * 680) + 180;
    });
  }, [filteredCats, isChorusActive, stopChorus, triggerMeow]);

  // Sync volume & mute to audio engine
  useEffect(() => {
    meowSynth.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    meowSynth.setMuted(muted);
  }, [muted]);

  // Keyboard shortcuts: 1-6 for individual cats, Space for chorus
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const matchedCat = CATS.find((c) => c.shortcut === event.key);
      if (matchedCat) {
        event.preventDefault();
        triggerMeow(matchedCat);
        return;
      }

      if (event.code === 'Space' && !inspectedCatId && target?.tagName !== 'BUTTON') {
        event.preventDefault();
        toggleChorus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedCatId, toggleChorus, triggerMeow]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(activeTimersRef.current).forEach((id) => window.clearTimeout(id));
      chorusTimersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handleNavigateLightbox = useCallback(
    (direction: -1 | 1) => {
      if (!inspectedCatId) return;
      const currentIdx = CATS.findIndex((c) => c.id === inspectedCatId);
      if (currentIdx === -1) return;
      const nextIdx = (currentIdx + direction + CATS.length) % CATS.length;
      setInspectedCatId(CATS[nextIdx].id);
    },
    [inspectedCatId]
  );

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-[#FAFAF9]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <a
            href="#gallery"
            className="font-serif text-xl font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0"
          >
            Purrfolio
          </a>

          <nav
            aria-label="Primary"
            className="hidden sm:flex items-center gap-7 text-sm font-medium text-zinc-600"
          >
            <a
              href="#gallery"
              className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Gallery
            </a>
            <a
              href="#vocal-guide"
              className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Vocal Guide
            </a>
            <a
              href="#shortcuts"
              className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Shortcuts
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={toggleChorus}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2 ${
                isChorusActive
                  ? 'bg-[#E11D48] text-white hover:bg-[#BE123C]'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {isChorusActive ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <span>Stop Chorus</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <span>Play Chorus</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-12">
        {/* Editorial Intro & Controls */}
        <section id="gallery" aria-labelledby="gallery-heading">
          <div className="max-w-2xl">
            <h1
              id="gallery-heading"
              className="font-serif text-4xl font-medium tracking-tight text-zinc-900 sm:text-5xl leading-[1.1]"
            >
              Click any cat to hear their meow.
            </h1>
            <p className="mt-3 text-base text-zinc-600 leading-relaxed">
              Six studio portraits, each paired with its own synthesized feline voice—from a
              baritone Maine Coon trill to a tiny calico squeak.
            </p>
          </div>

          {/* Filter & Audio Toolbar */}
          <div className="mt-8 flex flex-col gap-4 border-y border-zinc-200 py-4 md:flex-row md:items-center md:justify-between">
            {/* Interactive segmented filter tabs */}
            <div
              role="group"
              aria-label="Filter cats by vocal register"
              className="flex items-center gap-1 overflow-x-auto rounded-lg bg-zinc-200/65 p-1 w-fit max-w-full"
            >
              {VOCAL_FILTERS.map((filter) => {
                const isActive = selectedFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setSelectedFilter(filter.id)}
                    aria-pressed={isActive}
                    className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] ${
                      isActive
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Volume + clean unboxed session count */}
            <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-600">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMuted((prev) => !prev)}
                  aria-label={muted ? 'Unmute sound' : 'Mute sound'}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-[#E11D48]" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <label htmlFor="master-volume" className="sr-only">
                  Master volume
                </label>
                <input
                  id="master-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const next = parseFloat(e.target.value);
                    setVolume(next);
                    if (next > 0 && muted) setMuted(false);
                  }}
                  className="w-24 accent-zinc-900 cursor-pointer"
                />
              </div>

              <span aria-hidden="true" className="hidden sm:inline text-zinc-300">
                |
              </span>

              <div className="flex items-center gap-2 font-mono tabular-nums text-zinc-600">
                <span>
                  {filteredCats.length} {filteredCats.length === 1 ? 'cat' : 'cats'}
                </span>
                <span aria-hidden="true" className="text-zinc-300">·</span>
                <span>
                  {totalMeows} {totalMeows === 1 ? 'meow' : 'meows'} played
                </span>
              </div>
            </div>
          </div>

          {/* 3-Column Editorial Cat Gallery */}
          <div className="mt-9 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCats.map((cat) => (
              <CatCard
                key={cat.id}
                cat={cat}
                isPlaying={Boolean(playingIds[cat.id])}
                playCount={playCounts[cat.id] ?? 0}
                onPlay={(selected) => triggerMeow(selected)}
                onInspect={(selected) => setInspectedCatId(selected.id)}
              />
            ))}
          </div>
        </section>

        {/* Vocal Guide Directory */}
        <section id="vocal-guide" className="mt-20 border-t border-zinc-200 pt-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-serif text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl">
                Vocal Guide
              </h2>
              <p className="mt-1.5 text-sm text-zinc-600">
                Each portrait triggers a custom formant-shaped vocal contour tuned to the cat’s breed and character.
              </p>
            </div>
          </div>

          <div className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
            {CATS.map((cat) => {
              const isPlaying = Boolean(playingIds[cat.id]);
              return (
                <div
                  key={cat.id}
                  className="grid grid-cols-1 items-center gap-3 py-4 sm:grid-cols-12 sm:gap-4"
                >
                  <div className="sm:col-span-3">
                    <span className="font-serif text-lg font-medium text-zinc-900">
                      {cat.name}
                    </span>
                    <span className="ml-2 text-xs text-zinc-500">{cat.breed}</span>
                  </div>

                  <p className="text-sm text-zinc-600 sm:col-span-5">
                    {cat.description}
                  </p>

                  <div className="flex items-center gap-3 font-mono text-xs text-zinc-500 tabular-nums sm:col-span-2 sm:justify-end">
                    <span>{cat.pitchLabel}</span>
                  </div>

                  <div className="flex sm:col-span-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => triggerMeow(cat)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] ${
                        isPlaying
                          ? 'bg-[#E11D48] text-white'
                          : 'border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:text-zinc-950'
                      }`}
                    >
                      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isPlaying ? cat.callout : 'Play Meow'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer id="shortcuts" className="border-t border-zinc-200 bg-[#FAFAF9]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-zinc-700">Keyboard shortcuts:</span>
            <span>Press 1–6 to trigger individual cats</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>Press Space to play the chorus</span>
          </p>

          {totalMeows > 0 && (
            <button
              type="button"
              onClick={() => setPlayCounts({})}
              className="w-fit font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-950 cursor-pointer whitespace-nowrap"
            >
              Reset meow count
            </button>
          )}
        </div>
      </footer>

      {inspectedCat && (
        <CatLightbox
          cat={inspectedCat}
          isPlaying={Boolean(playingIds[inspectedCat.id])}
          onClose={() => setInspectedCatId(null)}
          onPlay={(selected, pitchScale) => triggerMeow(selected, pitchScale)}
          onPrev={() => handleNavigateLightbox(-1)}
          onNext={() => handleNavigateLightbox(1)}
        />
      )}
    </div>
  );
}
