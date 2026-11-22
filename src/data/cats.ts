export type VocalCategory = 'all' | 'melodic' | 'deep' | 'high' | 'chirp';

export interface MeowVoiceProfile {
  /** Base starting fundamental frequency in Hz */
  startHz: number;
  /** Peak fundamental frequency in Hz */
  peakHz: number;
  /** Ending tail fundamental frequency in Hz */
  endHz: number;
  /** Total duration of the primary vocalization in seconds */
  duration: number;
  /** Relative time (0..1) where pitch hits its peak */
  peakTimeRatio: number;
  /** F1 formant contour [start, mid, end] in Hz */
  f1: [number, number, number];
  /** F2 formant contour [start, mid, end] in Hz */
  f2: [number, number, number];
  /** F3 nasal brightness frequency in Hz */
  f3: number;
  /** Nasal formant level (0..1) */
  nasality: number;
  /** Breathy air noise level (0..0.12) */
  breathiness: number;
  /** Optional rapid feline purr/trill modulation rate in Hz (0 for none) */
  trillHz: number;
  /** Depth of trill frequency modulation in Hz */
  trillDepth: number;
  /** Vibrato frequency in Hz */
  vibratoHz: number;
  /** Vibrato depth in Hz */
  vibratoDepth: number;
  /** Optional short opening chirp before main meow */
  doubleSyllable?: boolean;
}

export interface CatProfile {
  id: string;
  shortcut: string;
  name: string;
  breed: string;
  category: Exclude<VocalCategory, 'all'>;
  vocalStyle: string;
  callout: string;
  pitchLabel: string;
  durationLabel: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  fallbackGradient: string;
  voice: MeowVoiceProfile;
}

export const CATS: CatProfile[] = [
  {
    id: 'mochi',
    shortcut: '1',
    name: 'Mochi',
    breed: 'Cream Scottish Fold',
    category: 'melodic',
    vocalStyle: 'Soft classic meow',
    callout: 'Mee-ow!',
    pitchLabel: '480–720 Hz',
    durationLabel: '0.58s',
    description:
      'A gentle, balanced rising-and-falling greeting with warm rounded vowels and an affectionate tail.',
    imageUrl: '/src/assets/images/cat_scottish_fold_1795310163969.jpg',
    imageAlt: 'Cream Scottish Fold cat with folded ears and round amber eyes sitting on a limestone pedestal',
    fallbackGradient: 'from-stone-200 via-stone-100 to-amber-50',
    voice: {
      startHz: 470,
      peakHz: 710,
      endHz: 410,
      duration: 0.58,
      peakTimeRatio: 0.36,
      f1: [420, 860, 440],
      f2: [1450, 2150, 960],
      f3: 2850,
      nasality: 0.22,
      breathiness: 0.035,
      trillHz: 0,
      trillDepth: 0,
      vibratoHz: 6.2,
      vibratoDepth: 9,
    },
  },
  {
    id: 'barnaby',
    shortcut: '2',
    name: 'Barnaby',
    breed: 'Ginger Maine Coon',
    category: 'deep',
    vocalStyle: 'Baritone trill-mrow',
    callout: 'Mrrr-oww',
    pitchLabel: '240–390 Hz',
    durationLabel: '0.76s',
    description:
      'A deep, resonant chest voice opening with a rolling feline trill before settling into a relaxed low mrow.',
    imageUrl: '/src/assets/images/cat_maine_coon_1795310166624.jpg',
    imageAlt: 'Fluffy ginger Maine Coon cat with tufted ears seated on dark oak wood',
    fallbackGradient: 'from-amber-100 via-stone-200 to-stone-100',
    voice: {
      startHz: 245,
      peakHz: 390,
      endHz: 215,
      duration: 0.76,
      peakTimeRatio: 0.42,
      f1: [320, 680, 350],
      f2: [980, 1520, 760],
      f3: 2450,
      nasality: 0.16,
      breathiness: 0.025,
      trillHz: 26,
      trillDepth: 22,
      vibratoHz: 5.2,
      vibratoDepth: 7,
    },
  },
  {
    id: 'cleo',
    shortcut: '3',
    name: 'Cleo',
    breed: 'Seal Point Siamese',
    category: 'melodic',
    vocalStyle: 'Expressive yowl',
    callout: 'Maaa-ow!',
    pitchLabel: '430–675 Hz',
    durationLabel: '0.82s',
    description:
      'Bright, brassy, and unmistakably conversational—rich nasal harmonics with a dramatic sustained midrange.',
    imageUrl: '/src/assets/images/cat_siamese_1795310166856.jpg',
    imageAlt: 'Seal Point Siamese cat with sapphire blue eyes and mouth open mid-meow',
    fallbackGradient: 'from-slate-200 via-zinc-100 to-stone-100',
    voice: {
      startHz: 430,
      peakHz: 675,
      endHz: 350,
      duration: 0.82,
      peakTimeRatio: 0.34,
      f1: [520, 1020, 480],
      f2: [1650, 2380, 1080],
      f3: 3150,
      nasality: 0.48,
      breathiness: 0.028,
      trillHz: 0,
      trillDepth: 0,
      vibratoHz: 6.8,
      vibratoDepth: 15,
    },
  },
  {
    id: 'pip',
    shortcut: '4',
    name: 'Pip',
    breed: 'Calico Kitten',
    category: 'high',
    vocalStyle: 'Tiny kitten mew',
    callout: 'Mew!',
    pitchLabel: '790–1180 Hz',
    durationLabel: '0.35s',
    description:
      'A quick, bright high-register squeak with airy overtones and a curious upward lilt at the finish.',
    imageUrl: '/src/assets/images/cat_calico_kitten_1795310167412.jpg',
    imageAlt: 'Tiny fluffy calico kitten with hazel eyes resting on a natural linen pillow',
    fallbackGradient: 'from-orange-50 via-stone-100 to-stone-200',
    voice: {
      startHz: 790,
      peakHz: 1180,
      endHz: 860,
      duration: 0.35,
      peakTimeRatio: 0.45,
      f1: [620, 1080, 680],
      f2: [1950, 2750, 1650],
      f3: 3550,
      nasality: 0.25,
      breathiness: 0.055,
      trillHz: 0,
      trillDepth: 0,
      vibratoHz: 7.8,
      vibratoDepth: 12,
    },
  },
  {
    id: 'soot',
    shortcut: '5',
    name: 'Soot',
    breed: 'Black Bombay',
    category: 'chirp',
    vocalStyle: 'Playful upward chirp',
    callout: 'Mrrp?!',
    pitchLabel: '410–820 Hz',
    durationLabel: '0.42s',
    description:
      'An inquisitive, rapid chirrup that glides briskly upward like a greeting whenever someone enters the room.',
    imageUrl: '/src/assets/images/cat_black_bombay_1795310165770.jpg',
    imageAlt: 'Glossy jet-black Bombay cat with golden-copper eyes against a matte charcoal studio backdrop',
    fallbackGradient: 'from-zinc-700 via-zinc-600 to-zinc-800',
    voice: {
      startHz: 410,
      peakHz: 820,
      endHz: 760,
      duration: 0.42,
      peakTimeRatio: 0.72,
      f1: [380, 760, 620],
      f2: [1150, 2100, 1850],
      f3: 2950,
      nasality: 0.28,
      breathiness: 0.03,
      trillHz: 30,
      trillDepth: 34,
      vibratoHz: 6.5,
      vibratoDepth: 8,
      doubleSyllable: true,
    },
  },
  {
    id: 'duchess',
    shortcut: '6',
    name: 'Duchess',
    breed: 'White Persian',
    category: 'high',
    vocalStyle: 'Delicate breathy sigh',
    callout: 'Meee-ow...',
    pitchLabel: '530–680 Hz',
    durationLabel: '0.66s',
    description:
      'Silky and unhurried—a soft, airy feline sigh with gentle downward phrasing and subtle breath shimmer.',
    imageUrl: '/src/assets/images/cat_white_persian_1795310166926.jpg',
    imageAlt: 'Fluffy snow-white Persian cat with emerald green eyes lounging on a dove-grey knit throw',
    fallbackGradient: 'from-slate-100 via-zinc-100 to-slate-200',
    voice: {
      startHz: 540,
      peakHz: 680,
      endHz: 390,
      duration: 0.66,
      peakTimeRatio: 0.28,
      f1: [460, 780, 410],
      f2: [1550, 2280, 1020],
      f3: 3050,
      nasality: 0.18,
      breathiness: 0.075,
      trillHz: 0,
      trillDepth: 0,
      vibratoHz: 5.5,
      vibratoDepth: 10,
    },
  },
];

export const VOCAL_FILTERS: { id: VocalCategory; label: string }[] = [
  { id: 'all', label: 'All Cats' },
  { id: 'melodic', label: 'Melodic' },
  { id: 'deep', label: 'Deep' },
  { id: 'high', label: 'High' },
  { id: 'chirp', label: 'Chirp' },
];
