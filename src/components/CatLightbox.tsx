import { useEffect, useState } from 'react';
import { X, Volume2, ChevronLeft, ChevronRight, Cat } from 'lucide-react';
import { CatProfile } from '../data/cats';

interface CatLightboxProps {
  cat: CatProfile;
  isPlaying: boolean;
  onClose: () => void;
  onPlay: (cat: CatProfile, pitchScale?: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function CatLightbox({
  cat,
  isPlaying,
  onClose,
  onPlay,
  onPrev,
  onNext,
}: CatLightboxProps) {
  const [pitchScale, setPitchScale] = useState(1);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    setPitchScale(1);
  }, [cat.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        onPrev();
      } else if (event.key === 'ArrowRight') {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${cat.name} portrait viewer`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 p-4 sm:p-8 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-[#FAFAF9] shadow-2xl lg:grid-cols-12"
      >
        {/* High-contrast close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close portrait viewer"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Left: High-resolution interactive portrait */}
        <div className="relative bg-zinc-100 lg:col-span-7">
          <button
            type="button"
            onClick={() => onPlay(cat, pitchScale)}
            aria-label={`Play ${cat.name}'s meow`}
            className="group relative block h-full w-full aspect-[4/3] lg:aspect-auto cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E11D48]"
          >
            {!imageError ? (
              <img
                src={cat.imageUrl}
                alt={cat.imageAlt}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className={`h-full w-full object-cover transition-transform duration-300 ease-out ${
                  isPlaying ? 'scale-[1.03]' : 'group-hover:scale-[1.015]'
                }`}
              />
            ) : (
              <div
                className={`flex h-full min-h-[300px] w-full flex-col items-center justify-center gap-3 bg-gradient-to-br ${cat.fallbackGradient} p-8 text-zinc-700`}
              >
                <Cat className="h-12 w-12 stroke-[1.5]" aria-hidden="true" />
                <span className="font-serif text-xl">{cat.name}</span>
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/35 to-transparent px-6 pb-5 pt-14 text-white">
              <span className="font-serif text-lg font-medium">
                {isPlaying ? `“${cat.callout}”` : 'Click portrait to hear meow'}
              </span>
              {isPlaying && (
                <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
                  <span
                    className="sound-bar h-full w-[3px] rounded-full bg-[#FB7185]"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="sound-bar h-full w-[3px] rounded-full bg-[#FB7185]"
                    style={{ animationDelay: '100ms' }}
                  />
                  <span
                    className="sound-bar h-full w-[3px] rounded-full bg-[#FB7185]"
                    style={{ animationDelay: '200ms' }}
                  />
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Right: Acoustic profile & playback controls */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
          <div>
            <p className="text-xs font-medium text-zinc-500">
              Portrait {cat.shortcut} of 6 · {cat.breed}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-zinc-900">
              {cat.name}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              {cat.description}
            </p>

            {/* Acoustic specifications with hairline dividers */}
            <dl className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
              <div className="flex items-center justify-between py-3">
                <dt className="text-zinc-500">Vocal Style</dt>
                <dd className="font-medium text-zinc-900">{cat.vocalStyle}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-zinc-500">Pitch Range</dt>
                <dd className="font-mono text-zinc-900 tabular-nums">{cat.pitchLabel}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-zinc-500">Duration</dt>
                <dd className="font-mono text-zinc-900 tabular-nums">{cat.durationLabel}</dd>
              </div>
            </dl>

            {/* Pitch tuning control */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <label htmlFor="lightbox-pitch-slider" className="font-medium text-zinc-800">
                  Voice Pitch
                </label>
                <span className="font-mono tabular-nums">
                  {pitchScale === 1 ? 'Natural (1.00×)' : `${pitchScale.toFixed(2)}×`}
                </span>
              </div>
              <input
                id="lightbox-pitch-slider"
                type="range"
                min="0.8"
                max="1.25"
                step="0.05"
                value={pitchScale}
                onChange={(e) => setPitchScale(parseFloat(e.target.value))}
                className="mt-2 w-full accent-[#E11D48] cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onPlay(cat, pitchScale)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E11D48] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C] active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2 whitespace-nowrap"
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              <span>Play {cat.name}’s Meow</span>
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={onPrev}
                className="inline-flex items-center gap-1.5 py-2 pr-3 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 cursor-pointer whitespace-nowrap"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-1.5 py-2 pl-3 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 cursor-pointer whitespace-nowrap"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
