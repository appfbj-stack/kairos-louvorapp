import React, { useState, useEffect } from 'react';
import { X, Music, Sparkles } from 'lucide-react';
import { 
  ROOT_NAMES, 
  CHORD_TYPES, 
  GUITAR_CHORD_DB, 
  ROOT_OFFSETS, 
  TYPE_OFFSETS, 
  RootType, 
  ChordTypeSuffix,
  GuitarChord
} from '../data/chords';

interface ChordDictionaryProps {
  isOpen: boolean;
  onClose: () => void;
  initialChord?: string;
}

// Map root index to white/black keys for piano (14 white keys span 2 octaves)
// 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B, etc.
const PIANO_KEYS_METADATA = [
  { isBlack: false, label: 'C', leftOffset: 0 },
  { isBlack: true, label: 'C#', leftOffset: 6 },
  { isBlack: false, label: 'D', leftOffset: 10 },
  { isBlack: true, label: 'D#', leftOffset: 17 },
  { isBlack: false, label: 'E', leftOffset: 20 },
  { isBlack: false, label: 'F', leftOffset: 30 },
  { isBlack: true, label: 'F#', leftOffset: 35 },
  { isBlack: false, label: 'G', leftOffset: 40 },
  { isBlack: true, label: 'G#', leftOffset: 46 },
  { isBlack: false, label: 'A', leftOffset: 50 },
  { isBlack: true, label: 'A#', leftOffset: 57 },
  { isBlack: false, label: 'B', leftOffset: 60 },
  
  { isBlack: false, label: 'C', leftOffset: 70 },
  { isBlack: true, label: 'C#', leftOffset: 76 },
  { isBlack: false, label: 'D', leftOffset: 80 },
  { isBlack: true, label: 'D#', leftOffset: 87 },
  { isBlack: false, label: 'E', leftOffset: 90 },
  { isBlack: false, label: 'F', leftOffset: 100 },
  { isBlack: true, label: 'F#', leftOffset: 105 },
  { isBlack: false, label: 'G', leftOffset: 110 },
  { isBlack: true, label: 'G#', leftOffset: 116 },
  { isBlack: false, label: 'A', leftOffset: 120 },
  { isBlack: true, label: 'A#', leftOffset: 127 },
  { isBlack: false, label: 'B', leftOffset: 130 },
];

function parseChord(chordStr: string): { root: RootType; suffix: ChordTypeSuffix } {
  let root: RootType = 'C';
  let rest = chordStr.trim();
  
  if (rest.startsWith('C#') || rest.startsWith('Db')) { root = 'C#'; rest = rest.substring(2); }
  else if (rest.startsWith('D#') || rest.startsWith('Eb')) { root = 'D#'; rest = rest.substring(2); }
  else if (rest.startsWith('F#') || rest.startsWith('Gb')) { root = 'F#'; rest = rest.substring(2); }
  else if (rest.startsWith('G#') || rest.startsWith('Ab')) { root = 'G#'; rest = rest.substring(2); }
  else if (rest.startsWith('A#') || rest.startsWith('Bb')) { root = 'A#'; rest = rest.substring(2); }
  else if (rest.startsWith('C')) { root = 'C'; rest = rest.substring(1); }
  else if (rest.startsWith('D')) { root = 'D'; rest = rest.substring(1); }
  else if (rest.startsWith('E')) { root = 'E'; rest = rest.substring(1); }
  else if (rest.startsWith('F')) { root = 'F'; rest = rest.substring(1); }
  else if (rest.startsWith('G')) { root = 'G'; rest = rest.substring(1); }
  else if (rest.startsWith('A')) { root = 'A'; rest = rest.substring(1); }
  else if (rest.startsWith('B')) { root = 'B'; rest = rest.substring(1); }
  
  // Standardize suffixes
  let suffix: ChordTypeSuffix = '';
  if (rest === 'm' || rest === 'min' || rest.startsWith('m/')) suffix = 'm';
  else if (rest === '7' || rest === 'dom7') suffix = '7';
  else if (rest === '7M' || rest === 'maj7' || rest === 'M7' || rest === 'maj') suffix = '7M';
  else if (rest === 'add9' || rest === '9' || rest === '2' || rest === 'add2') suffix = 'add9';
  else if (rest === 'sus4' || rest === 'sus') suffix = 'sus4';
  else if (rest.includes('m')) suffix = 'm';
  else if (rest.includes('7')) suffix = '7';
  
  return { root, suffix };
}

export const ChordDictionary: React.FC<ChordDictionaryProps> = ({ isOpen, onClose, initialChord }) => {
  const [instrument, setInstrument] = useState<'guitar' | 'keyboard'>('guitar');
  const [selectedRoot, setSelectedRoot] = useState<RootType>('C');
  const [selectedType, setSelectedType] = useState<ChordTypeSuffix>('');

  // Update selected chord when initialChord changes
  useEffect(() => {
    if (initialChord) {
      const { root, suffix } = parseChord(initialChord);
      setSelectedRoot(root);
      setSelectedType(suffix);
    }
  }, [initialChord, isOpen]);

  if (!isOpen) return null;

  const currentChordName = `${selectedRoot}${CHORD_TYPES.find(t => t.id === selectedType)?.suffix || ''}`;
  const guitarChord: GuitarChord = GUITAR_CHORD_DB[selectedRoot][selectedType] || {
    frets: [-1, -1, -1, -1, -1, -1],
    baseFret: 1
  };

  // Keyboard math
  const rootOffset = ROOT_OFFSETS[selectedRoot] || 0;
  const keyOffsets = TYPE_OFFSETS[selectedType] || [0, 4, 7];
  const activeKeys = keyOffsets.map(offset => (rootOffset + offset) % 24);

  // Render Guitar SVG Diagram
  const renderGuitarSVG = () => {
    const width = 220;
    const height = 250;
    const paddingLeft = 40;
    const paddingTop = 40;
    const gridWidth = 140;
    const gridHeight = 160;
    
    const numStrings = 6;
    const numFrets = 5;
    
    const stringSpacing = gridWidth / (numStrings - 1);
    const fretSpacing = gridHeight / numFrets;

    const strings = Array.from({ length: numStrings });
    const frets = Array.from({ length: numFrets + 1 });

    return (
      <svg width={width} height={height} className="mx-auto overflow-visible select-none">
        {/* Draw Frets (horizontal lines) */}
        {frets.map((_, i) => {
          const y = paddingTop + i * fretSpacing;
          const isNut = i === 0 && guitarChord.baseFret === 1;
          return (
            <line 
              key={`fret-${i}`}
              x1={paddingLeft} 
              y1={y} 
              x2={paddingLeft + gridWidth} 
              y2={y} 
              stroke={isNut ? "#1e293b" : "#cbd5e1"} 
              strokeWidth={isNut ? 6 : 1.5}
            />
          );
        })}

        {/* Draw Strings (vertical lines) */}
        {strings.map((_, i) => {
          const x = paddingLeft + i * stringSpacing;
          return (
            <line 
              key={`string-${i}`}
              x1={x} 
              y1={paddingTop} 
              x2={x} 
              y2={paddingTop + gridHeight} 
              stroke="#64748b" 
              strokeWidth={1 + (5 - i) * 0.3} // thicker low E, thinner high e
            />
          );
        })}

        {/* Base Fret Label */}
        {guitarChord.baseFret > 1 && (
          <text 
            x={10} 
            y={paddingTop + fretSpacing/2 + 4} 
            className="text-xs font-black fill-slate-500 font-sans"
          >
            {guitarChord.baseFret}ª
          </text>
        )}

        {/* Muted (X) or Open (O) indicators at the top */}
        {guitarChord.frets.map((fret, stringIdx) => {
          const x = paddingLeft + stringIdx * stringSpacing;
          const y = paddingTop - 12;

          if (fret === -1) {
            return (
              <g key={`indicator-${stringIdx}`}>
                <line x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} stroke="#ef4444" strokeWidth={2} />
                <line x1={x + 4} y1={y - 4} x2={x - 4} y2={y + 4} stroke="#ef4444" strokeWidth={2} />
              </g>
            );
          } else if (fret === 0) {
            return (
              <circle 
                key={`indicator-${stringIdx}`}
                cx={x} 
                cy={y} 
                r={4} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth={2} 
              />
            );
          }
          return null;
        })}

        {/* Barre Draw */}
        {guitarChord.barre && (
          (() => {
            const fretRelative = guitarChord.barre.fret;
            const y = paddingTop + (fretRelative - 0.5) * fretSpacing;
            const x1 = paddingLeft + guitarChord.barre.startString * stringSpacing;
            const x2 = paddingLeft + guitarChord.barre.endString * stringSpacing;
            return (
              <rect 
                x={x1 - 6} 
                y={y - 6} 
                width={x2 - x1 + 12} 
                height={12} 
                rx={6} 
                fill="#3b82f6" 
                className="opacity-90 shadow-sm"
              />
            );
          })()
        )}

        {/* Finger Dots */}
        {guitarChord.frets.map((fret, stringIdx) => {
          if (fret <= 0) return null;
          
          const fretRelative = fret - guitarChord.baseFret + 1;
          if (fretRelative < 1 || fretRelative > 5) return null; // out of diagram view
          
          const x = paddingLeft + stringIdx * stringSpacing;
          const y = paddingTop + (fretRelative - 0.5) * fretSpacing;
          const fingerLabel = guitarChord.fingers?.[stringIdx] || '';

          // Skip if this is covered by a barre and has no label or is finger 1
          if (guitarChord.barre && 
              fret === guitarChord.barre.fret && 
              stringIdx >= guitarChord.barre.startString && 
              stringIdx <= guitarChord.barre.endString && 
              fingerLabel === '1') {
            return null;
          }

          return (
            <g key={`dot-${stringIdx}`}>
              <circle 
                cx={x} 
                cy={y} 
                r={10} 
                fill="#2563eb" 
                className="stroke-white stroke-2 shadow-sm"
              />
              {fingerLabel && (
                <text 
                  x={x} 
                  y={y + 3.5} 
                  textAnchor="middle" 
                  className="text-[10px] font-black fill-white font-sans"
                >
                  {fingerLabel}
                </text>
              )}
            </g>
          );
        })}

        {/* Barre Label (show finger 1 over barre center) */}
        {guitarChord.barre && (
          (() => {
            const fretRelative = guitarChord.barre.fret;
            const y = paddingTop + (fretRelative - 0.5) * fretSpacing;
            const x1 = paddingLeft + guitarChord.barre.startString * stringSpacing;
            const x2 = paddingLeft + guitarChord.barre.endString * stringSpacing;
            const xCenter = (x1 + x2) / 2;
            return (
              <text 
                x={xCenter} 
                y={y + 3.5} 
                textAnchor="middle" 
                className="text-[10px] font-black fill-white font-sans"
              >
                1
              </text>
            );
          })()
        )}
      </svg>
    );
  };

  // Render Piano Keys
  const renderKeyboard = () => {
    // 14 white keys total (covering 2 octaves starting from C)
    const whiteKeysCount = 14;
    const keyWidth = 7.14; // Percentage width for 14 keys (100 / 14)

    // Helper arrays
    const keysIndices = Array.from({ length: 24 }); // 24 keys inside 2 octaves

    // Let's separate white and black keys to render white first (underneath) and black on top.
    const whiteKeys = PIANO_KEYS_METADATA.filter(k => !k.isBlack);
    const blackKeys = PIANO_KEYS_METADATA.filter(k => k.isBlack);

    return (
      <div className="w-full bg-slate-950 p-4 md:p-6 rounded-3xl border border-slate-800 shadow-inner">
        <div className="relative h-44 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
          {/* White keys first */}
          {whiteKeys.map((meta, index) => {
            // Find absolute key index (0 to 23) in our 2 octaves
            const absoluteIdx = PIANO_KEYS_METADATA.indexOf(meta);
            const isActive = activeKeys.includes(absoluteIdx);

            return (
              <div
                key={`white-${index}`}
                style={{
                  left: `${(index * 100) / whiteKeysCount}%`,
                  width: `${100 / whiteKeysCount}%`
                }}
                className={`absolute top-0 bottom-0 border-r border-slate-300 flex flex-col justify-end pb-3 items-center transition-all ${
                  isActive 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg z-10' 
                    : 'bg-white hover:bg-slate-100 text-slate-400'
                }`}
              >
                <span className="text-[9px] font-bold tracking-tighter">{meta.label}</span>
                {isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse mt-1" />}
              </div>
            );
          })}

          {/* Black keys overlaid */}
          {blackKeys.map((meta, index) => {
            const absoluteIdx = PIANO_KEYS_METADATA.indexOf(meta);
            const isActive = activeKeys.includes(absoluteIdx);

            // Positioning is tricky; white key width is (100 / 14) %
            // Left offset depends on key sequence
            const whiteKeyWidth = 100 / whiteKeysCount;
            // Let's compute left position as: (leftOffsetValue * whiteKeyWidth) / 10
            // Since we defined leftOffset out of 10 inside metadata, let's use it directly!
            const leftPos = (meta.leftOffset * whiteKeyWidth) / 10;

            return (
              <div
                key={`black-${index}`}
                style={{
                  left: `${leftPos}%`,
                  width: `${whiteKeyWidth * 0.65}%`,
                  height: '60%'
                }}
                className={`absolute top-0 rounded-b-lg border border-slate-950 flex flex-col justify-end pb-1.5 items-center z-20 shadow-md transition-all ${
                  isActive 
                    ? 'bg-blue-500 border-blue-400 text-white' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[7px] font-extrabold tracking-tighter scale-90">{meta.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1" />}
              </div>
            );
          })}
        </div>
        
        {/* Active notes helper */}
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {activeKeys.map((keyIdx) => {
            const meta = PIANO_KEYS_METADATA[keyIdx];
            return (
              <span 
                key={`pill-${keyIdx}`} 
                className="bg-blue-600/10 text-blue-400 border border-blue-500/20 text-xs font-black px-2.5 py-1 rounded-lg"
              >
                {meta.label}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-slate-100">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <Music size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Dicionário de Acordes</h3>
              <p className="text-xs text-slate-500 font-medium">Guia interativo para violão/guitarra e teclado.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Instrument Selector */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto shadow-inner">
            <button
              onClick={() => setInstrument('guitar')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                instrument === 'guitar' 
                  ? 'bg-white text-slate-800 shadow-md' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Music size={14} /> Violão / Guitarra
            </button>
            <button
              onClick={() => setInstrument('keyboard')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                instrument === 'keyboard' 
                  ? 'bg-white text-slate-800 shadow-md' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={14} /> Teclado / Piano
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Chord Selectors */}
            <div className="space-y-4">
              {/* Root selector */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Nota Fundamental</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {ROOT_NAMES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRoot(r)}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                        selectedRoot === r
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100 scale-[1.03]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type selector */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Variação / Tipo</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CHORD_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`py-3 px-3 rounded-xl text-xs font-bold text-left transition-all flex justify-between items-center ${
                        selectedType === t.id
                          ? 'bg-blue-50 border-2 border-blue-600 text-blue-700'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-2 border-transparent'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className="font-mono text-[10px] font-black uppercase text-blue-600 bg-white shadow-sm px-1.5 py-0.5 rounded-md border border-slate-100">
                        {t.suffix || 'M'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chord Diagram Display */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[260px] shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Visualização</span>
              <h4 className="text-3xl font-serif font-black text-blue-600 mb-6">{currentChordName}</h4>

              {instrument === 'guitar' ? (
                renderGuitarSVG()
              ) : (
                renderKeyboard()
              )}
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] font-semibold text-slate-400 shrink-0">
          Dica: No violão, os números 1 a 4 indicam os dedos da mão esquerda (Indicador, Médio, Anelar, Mínimo).
        </div>
      </div>
    </div>
  );
};
