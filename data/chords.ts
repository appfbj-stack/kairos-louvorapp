export interface GuitarChord {
  frets: number[]; // 6 elements, from Low E (index 0) to High e (index 5). -1 means muted, 0 means open string
  fingers?: string[]; // 6 elements corresponding to fingers used (1=index, 2=middle, 3=ring, 4=pinky, or '' for open/muted)
  baseFret: number; // The fret where the grid starts (usually 1)
  barre?: {
    fret: number; // Relative to grid (1 to 5)
    startString: number; // 0 to 5 (0 is Low E, 5 is High e)
    endString: number;   // 0 to 5
  };
}

export interface ChordData {
  name: string;
  guitar: GuitarChord;
  keyboard: {
    keys: number[]; // Key offsets from C inside a 2-octave range (0 to 23)
  };
}

export const ROOT_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type RootType = typeof ROOT_NAMES[number];

export const CHORD_TYPES = [
  { id: '', label: 'Maior', suffix: '' },
  { id: 'm', label: 'Menor', suffix: 'm' },
  { id: '7', label: '7ª Dominante', suffix: '7' },
  { id: '7M', label: '7ª Maior', suffix: '7M' },
  { id: 'add9', label: '9ª (Nona)', suffix: 'add9' },
  { id: 'sus4', label: 'Sus4', suffix: 'sus4' }
] as const;

export type ChordTypeSuffix = typeof CHORD_TYPES[number]['id'];

// Keyboard key index offsets relative to C
// 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B
export const ROOT_OFFSETS: Record<RootType, number> = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
};

export const TYPE_OFFSETS: Record<ChordTypeSuffix, number[]> = {
  '': [0, 4, 7],         // Major: Root, Major 3rd, Perfect 5th
  'm': [0, 3, 7],        // Minor: Root, Minor 3rd, Perfect 5th
  '7': [0, 4, 7, 10],    // Dominant 7th
  '7M': [0, 4, 7, 11],   // Major 7th
  'add9': [0, 2, 4, 7],  // Major Add9 (Root, 2nd, 3rd, 5th)
  'sus4': [0, 5, 7]      // Suspended 4th
};

// Detailed definitions for 72 guitar chords (12 roots x 6 types)
export const GUITAR_CHORD_DB: Record<RootType, Record<ChordTypeSuffix, GuitarChord>> = {
  'C': {
    '': { frets: [-1, 3, 2, 0, 1, 0], fingers: ['', '3', '2', '', '1', ''], baseFret: 1 },
    'm': { frets: [-1, 3, 5, 5, 4, 3], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 3, barre: { fret: 1, startString: 1, endString: 5 } },
    '7': { frets: [-1, 3, 2, 3, 1, 0], fingers: ['', '3', '2', '4', '1', ''], baseFret: 1 },
    '7M': { frets: [-1, 3, 2, 0, 0, 0], fingers: ['', '3', '2', '', '', ''], baseFret: 1 },
    'add9': { frets: [-1, 3, 2, 0, 3, 0], fingers: ['', '2', '1', '', '3', ''], baseFret: 1 },
    'sus4': { frets: [-1, 3, 3, 0, 1, 1], fingers: ['', '3', '4', '', '1', '1'], baseFret: 1 }
  },
  'C#': {
    '': { frets: [-1, 4, 6, 6, 6, 4], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 4, barre: { fret: 1, startString: 1, endString: 5 } },
    'm': { frets: [-1, 4, 6, 6, 5, 4], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 4, barre: { fret: 1, startString: 1, endString: 5 } },
    '7': { frets: [-1, 4, 3, 4, 2, -1], fingers: ['', '3', '2', '4', '1', ''], baseFret: 3 },
    '7M': { frets: [-1, 4, 6, 5, 6, 4], fingers: ['', '1', '3', '2', '4', '1'], baseFret: 4, barre: { fret: 1, startString: 1, endString: 5 } },
    'add9': { frets: [-1, 4, 3, 1, 4, -1], fingers: ['', '3', '2', '1', '4', ''], baseFret: 1 },
    'sus4': { frets: [-1, 4, 6, 6, 7, 4], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 4, barre: { fret: 1, startString: 1, endString: 5 } }
  },
  'D': {
    '': { frets: [-1, -1, 0, 2, 3, 2], fingers: ['', '', '', '1', '3', '2'], baseFret: 1 },
    'm': { frets: [-1, -1, 0, 2, 3, 1], fingers: ['', '', '', '2', '3', '1'], baseFret: 1 },
    '7': { frets: [-1, -1, 0, 2, 1, 2], fingers: ['', '', '', '2', '1', '3'], baseFret: 1 },
    '7M': { frets: [-1, -1, 0, 2, 2, 2], fingers: ['', '', '', '1', '1', '1'], baseFret: 1, barre: { fret: 2, startString: 3, endString: 5 } },
    'add9': { frets: [-1, -1, 0, 2, 3, 0], fingers: ['', '', '', '1', '2', ''], baseFret: 1 },
    'sus4': { frets: [-1, -1, 0, 2, 3, 3], fingers: ['', '', '', '1', '3', '4'], baseFret: 1 }
  },
  'D#': {
    '': { frets: [-1, 6, 8, 8, 8, 6], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 6, barre: { fret: 1, startString: 1, endString: 5 } },
    'm': { frets: [-1, 6, 8, 8, 7, 6], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 6, barre: { fret: 1, startString: 1, endString: 5 } },
    '7': { frets: [-1, 6, 5, 6, 4, -1], fingers: ['', '3', '2', '4', '1', ''], baseFret: 5 },
    '7M': { frets: [-1, 6, 8, 7, 8, 6], fingers: ['', '1', '3', '2', '4', '1'], baseFret: 6, barre: { fret: 1, startString: 1, endString: 5 } },
    'add9': { frets: [-1, 6, 5, 3, 6, -1], fingers: ['', '3', '2', '1', '4', ''], baseFret: 3 },
    'sus4': { frets: [-1, 6, 8, 8, 9, 6], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 6, barre: { fret: 1, startString: 1, endString: 5 } }
  },
  'E': {
    '': { frets: [0, 2, 2, 1, 0, 0], fingers: ['', '2', '3', '1', '', ''], baseFret: 1 },
    'm': { frets: [0, 2, 2, 0, 0, 0], fingers: ['', '2', '3', '', '', ''], baseFret: 1 },
    '7': { frets: [0, 2, 0, 1, 0, 0], fingers: ['', '2', '', '1', '', ''], baseFret: 1 },
    '7M': { frets: [0, 2, 1, 1, 0, 0], fingers: ['', '3', '1', '2', '', ''], baseFret: 1 },
    'add9': { frets: [0, 2, 4, 1, 0, 0], fingers: ['', '2', '4', '1', '', ''], baseFret: 1 },
    'sus4': { frets: [0, 2, 2, 2, 0, 0], fingers: ['', '2', '3', '4', '', ''], baseFret: 1 }
  },
  'F': {
    '': { frets: [1, 3, 3, 2, 1, 1], fingers: ['1', '3', '4', '2', '1', '1'], baseFret: 1, barre: { fret: 1, startString: 0, endString: 5 } },
    'm': { frets: [1, 3, 3, 1, 1, 1], fingers: ['1', '3', '4', '1', '1', '1'], baseFret: 1, barre: { fret: 1, startString: 0, endString: 5 } },
    '7': { frets: [1, 3, 1, 2, 1, 1], fingers: ['1', '3', '1', '2', '1', '1'], baseFret: 1, barre: { fret: 1, startString: 0, endString: 5 } },
    '7M': { frets: [-1, 3, 3, 2, 1, 0], fingers: ['', '3', '4', '2', '1', ''], baseFret: 1 },
    'add9': { frets: [1, 3, 3, 2, 1, 3], fingers: ['1', '2', '3', '1', '1', '4'], baseFret: 1 },
    'sus4': { frets: [1, 3, 3, 3, 1, 1], fingers: ['1', '3', '4', '2', '1', '1'], baseFret: 1, barre: { fret: 1, startString: 0, endString: 5 } }
  },
  'F#': {
    '': { frets: [2, 4, 4, 3, 2, 2], fingers: ['1', '3', '4', '2', '1', '1'], baseFret: 2, barre: { fret: 1, startString: 0, endString: 5 } },
    'm': { frets: [2, 4, 4, 2, 2, 2], fingers: ['1', '3', '4', '1', '1', '1'], baseFret: 2, barre: { fret: 1, startString: 0, endString: 5 } },
    '7': { frets: [2, 4, 2, 3, 2, 2], fingers: ['1', '3', '1', '2', '1', '1'], baseFret: 2, barre: { fret: 1, startString: 0, endString: 5 } },
    '7M': { frets: [2, 4, 3, 3, 2, 2], fingers: ['1', '3', '2', '4', '1', '1'], baseFret: 2, barre: { fret: 1, startString: 0, endString: 5 } },
    'add9': { frets: [2, 4, 4, 3, 2, 4], fingers: ['1', '2', '3', '1', '1', '4'], baseFret: 2 },
    'sus4': { frets: [2, 4, 4, 4, 2, 2], fingers: ['1', '3', '4', '2', '1', '1'], baseFret: 2, barre: { fret: 1, startString: 0, endString: 5 } }
  },
  'G': {
    '': { frets: [3, 2, 0, 0, 0, 3], fingers: ['2', '1', '', '', '', '3'], baseFret: 1 },
    'm': { frets: [3, 5, 5, 3, 3, 3], fingers: ['1', '3', '4', '1', '1', '1'], baseFret: 3, barre: { fret: 1, startString: 0, endString: 5 } },
    '7': { frets: [3, 2, 0, 0, 0, 1], fingers: ['3', '2', '', '', '', '1'], baseFret: 1 },
    '7M': { frets: [3, 2, 0, 0, 0, 2], fingers: ['3', '1', '', '', '', '2'], baseFret: 1 },
    'add9': { frets: [3, 2, 0, 2, 0, 3], fingers: ['2', '1', '', '3', '', '4'], baseFret: 1 },
    'sus4': { frets: [3, 3, 0, 0, 1, 3], fingers: ['3', '4', '', '', '1', '2'], baseFret: 1 }
  },
  'G#': {
    '': { frets: [4, 6, 6, 5, 4, 4], fingers: ['1', '3', '4', '2', '1', '1'], baseFret: 4, barre: { fret: 1, startString: 0, endString: 5 } },
    'm': { frets: [4, 6, 6, 4, 4, 4], fingers: ['1', '3', '4', '1', '1', '1'], baseFret: 4, barre: { fret: 1, startString: 0, endString: 5 } },
    '7': { frets: [4, 6, 4, 5, 4, 4], fingers: ['1', '3', '1', '2', '1', '1'], baseFret: 4, barre: { fret: 1, startString: 0, endString: 5 } },
    '7M': { frets: [4, 6, 5, 5, 4, 4], fingers: ['1', '3', '2', '4', '1', '1'], baseFret: 4, barre: { fret: 1, startString: 0, endString: 5 } },
    'add9': { frets: [4, 6, 6, 5, 4, 6], fingers: ['1', '2', '3', '1', '1', '4'], baseFret: 4 },
    'sus4': { frets: [4, 6, 6, 6, 4, 4], fingers: ['1', '3', '4', '2', '1', '1'], baseFret: 4, barre: { fret: 1, startString: 0, endString: 5 } }
  },
  'A': {
    '': { frets: [-1, 0, 2, 2, 2, 0], fingers: ['', '', '1', '2', '3', ''], baseFret: 1 },
    'm': { frets: [-1, 0, 2, 2, 1, 0], fingers: ['', '', '2', '3', '1', ''], baseFret: 1 },
    '7': { frets: [-1, 0, 2, 0, 2, 0], fingers: ['', '', '1', '', '2', ''], baseFret: 1 },
    '7M': { frets: [-1, 0, 2, 1, 2, 0], fingers: ['', '', '2', '1', '3', ''], baseFret: 1 },
    'add9': { frets: [-1, 0, 2, 4, 2, 0], fingers: ['', '', '1', '3', '2', ''], baseFret: 1 },
    'sus4': { frets: [-1, 0, 2, 2, 3, 0], fingers: ['', '', '1', '2', '4', ''], baseFret: 1 }
  },
  'A#': {
    '': { frets: [-1, 1, 3, 3, 3, 1], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 1, barre: { fret: 1, startString: 1, endString: 5 } },
    'm': { frets: [-1, 1, 3, 3, 2, 1], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 1, barre: { fret: 1, startString: 1, endString: 5 } },
    '7': { frets: [-1, 1, 3, 1, 3, 1], fingers: ['', '1', '3', '1', '2', '1'], baseFret: 1, barre: { fret: 1, startString: 1, endString: 5 } },
    '7M': { frets: [-1, 1, 3, 2, 3, 1], fingers: ['', '1', '3', '2', '4', '1'], baseFret: 1, barre: { fret: 1, startString: 1, endString: 5 } },
    'add9': { frets: [-1, 1, 3, 5, 3, 1], fingers: ['', '1', '2', '4', '3', '1'], baseFret: 1 },
    'sus4': { frets: [-1, 1, 3, 3, 4, 1], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 1, barre: { fret: 1, startString: 1, endString: 5 } }
  },
  'B': {
    '': { frets: [-1, 2, 4, 4, 4, 2], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 2, barre: { fret: 1, startString: 1, endString: 5 } },
    'm': { frets: [-1, 2, 4, 4, 3, 2], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 2, barre: { fret: 1, startString: 1, endString: 5 } },
    '7': { frets: [-1, 2, 1, 2, 0, 2], fingers: ['', '2', '1', '3', '', '4'], baseFret: 1 },
    '7M': { frets: [-1, 2, 4, 3, 4, 2], fingers: ['', '1', '3', '2', '4', '1'], baseFret: 2, barre: { fret: 1, startString: 1, endString: 5 } },
    'add9': { frets: [-1, 2, 1, 4, 2, -1], fingers: ['', '2', '1', '4', '3', ''], baseFret: 1 },
    'sus4': { frets: [-1, 2, 4, 4, 5, 2], fingers: ['', '1', '3', '4', '2', '1'], baseFret: 2, barre: { fret: 1, startString: 1, endString: 5 } }
  }
};

// Returns the 6 core chords of a key's natural major harmonic field (Graus I, II, III, IV, V, VI)
export function getHarmonicField(key: string): { degree: string; chord: string; name: string }[] {
  // Normalize key string
  let root = key.trim().replace('M', '');
  if (root.endsWith('m')) {
    root = root.slice(0, -1);
  }
  
  // Safe root fallback
  const normalizedRoot = (ROOT_NAMES as readonly string[]).includes(root) ? (root as RootType) : 'C';

  const roots = ROOT_NAMES;
  const rootIndex = roots.indexOf(normalizedRoot);

  const getRelativeRoot = (semitones: number): RootType => {
    const idx = (rootIndex + semitones) % 12;
    return roots[idx];
  };

  return [
    { degree: 'I', chord: `${getRelativeRoot(0)}`, name: 'Tônica' },
    { degree: 'ii', chord: `${getRelativeRoot(2)}m`, name: 'Supertônica' },
    { degree: 'iii', chord: `${getRelativeRoot(4)}m`, name: 'Mediante' },
    { degree: 'IV', chord: `${getRelativeRoot(5)}`, name: 'Subdominante' },
    { degree: 'V', chord: `${getRelativeRoot(7)}`, name: 'Dominante' },
    { degree: 'vi', chord: `${getRelativeRoot(9)}m`, name: 'Relativa Menor' }
  ];
}
