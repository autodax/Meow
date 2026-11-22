import { useState } from 'react';
import { Maximize2, Volume2, Cat } from 'lucide-react';
import { CatProfile } from '../data/cats';

interface CatCardProps {
  cat: CatProfile;
  isPlaying: boolean;
  playCount: number;
  onPlay: (cat: CatProfile) => void;
  onInspect: (cat: CatProfile) => void;
}

export function CatCard({
  cat,
  isPlaying,
  playCount,
  onPlay,
  onInspect,
}: CatCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <button
          type="button"
          onClick={() => onPlay(cat)}
          aria-label={`Play ${cat.name}'s meow (${cat.vocalStyle})`}
          className={`relative block w-full aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100 text-left cursor-pointer transition-transform duration-200 ease-out active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF9] ${
            isPlaying
              ? 'ring-2 ring-[#E11D48] ring-offset-2 ring-offset-[#FAFAF9]'
              : 'border border-zinc-200/80'
          }`}
        >
          {!imageError ? (
            <img
              src={cat.imageUrl}
              alt={cat.imageAlt}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className={`h-full w-full object-cover transition-transform duration-300 ease-out ${
                isPlaying ? 'scale-[1.035]' : 'group-hover:scale-[1.025]'
              }`}
            />
          ) : (
            <div
              className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br ${cat.fallbackGradient} p-6 text-zinc-700`}
            >
              <Cat className="h-10 w-10 stroke-[1.5]" aria-hidden="true" />
              <span className="font-serif text-lg font-medium">{cat.name}</span>
            </div>
          )}

          {/* Measured contrast scrim on hover or active meow playback */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3.5 pt-12 transition-opacity duration-200 ${
              isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
            }`}
          >
            <div className="flex items-center gap-2.5 text-white">
              {isPlaying ? (
                <>
                  <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
                    <span
                      className="sound-bar h-full w-[3px] rounded-full bg-[#FB7185]"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="sound-bar h-full w-[3px] rounded-full bg-[#FB7185]"
                      style={{ animationDelay: '110ms' }}
                    />
                    <span
                      className="sound-bar h-full w-[3px] rounded-full bg-[#FB7185]"
                      style={{ animationDelay: '210ms' }}
                    />
                    <span
                      className="sound-bar h-full w-[3px] rounded-full bg-[#FB7185]"
                      style={{ animationDelay: '70ms' }}
                    />
                  </span>
                  <span className="font-serif text-base font-medium tracking-tight text-white">
                    “{cat.callout}”
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-white/90" aria-hidden="true" />
                  <span className="text-xs font-medium text-white/95">
                    Click to hear meow
                  </span>
                </>
              )}
            </div>

            <span className="font-mono text-xs text-white/80 tabular-nums">
              {cat.durationLabel}
            </span>
          </div>
        </button>

        {/* Secondary affordance: Fullscreen editorial lightbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInspect(cat);
          }}
          aria-label={`Inspect ${cat.name}'s portrait`}
          title="Inspect portrait"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-black/75 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Unboxed editorial metadata */}
      <div className="mt-3.5 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5">
            <h3 className="font-serif text-xl font-medium tracking-tight text-zinc-900">
              {cat.name}
            </h3>
            {isPlaying && (
              <span className="text-xs font-medium text-[#E11D48]">
                Playing
              </span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-zinc-600">
            <span>{cat.breed}</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>{cat.vocalStyle}</span>
          </p>
        </div>

        <div className="shrink-0 text-right font-mono text-xs text-zinc-500 tabular-nums">
          <span>Key {cat.shortcut}</span>
          {playCount > 0 && (
            <span className="ml-2 text-zinc-900 font-medium">{playCount}×</span>
          )}
        </div>
      </div>
    </article>
  );
}
