import React, { useRef, useState } from 'react';
import { Music, Eye, EyeOff, Plus, X, Wand2 } from 'lucide-react';
import { ROOT_NAMES, CHORD_TYPES, RootType, ChordTypeSuffix } from '../data/chords';
import { ChordProRenderer } from './ChordProRenderer';
import { GeminiService } from '../services/geminiService';

interface ChordProEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Tom atual da música (exibido no banner do editor) */
  currentKey?: string;
  /** Callback opcional quando o tom oficial é referenciado */
  className?: string;
  /** Placeholder do textarea */
  placeholder?: string;
}

/**
 * Combina root + tipo para formar o acorde completo, ex.: "C", "Am", "G7", "F#sus4".
 */
function buildChordName(root: RootType, type: ChordTypeSuffix): string {
  return `${root}${type}`;
}

const SECTIONS = [
  { label: 'Intro',  icon: '🎬' },
  { label: 'Verso 1', icon: '1️⃣' },
  { label: 'Refrão', icon: '🎵' },
  { label: 'Verso 2', icon: '2️⃣' },
  { label: 'Ponte',  icon: '🌉' },
  { label: 'Bridge', icon: '🌁' },
  { label: 'Final',  icon: '🏁' },
];

/**
 * Editor de letras no formato ChordPro, com:
 * - Toolbar com 72 acordes (12 raízes × 6 tipos) — clicar insere [Acorde] no cursor
 * - Botões de seção (Intro/Verso/Refrão/Ponte/Final) que inserem marcadores
 * - Toggle de visualização: mostra preview lado a lado com o textarea
 * - Botão "Adicionar Cifra na Linha" que insere [C] no início da linha atual
 */
export const ChordProEditor: React.FC<ChordProEditorProps> = ({
  value,
  onChange,
  currentKey,
  className = '',
  placeholder = 'Cole aqui a letra. Ex.:\n[C]Te amo Deus, [G]Tua graça nunca falha\n[Am]Todos os dias, [F]em Tuas mãos eu estou',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showChordPalette, setShowChordPalette] = useState(true);
  const [aiBusy, setAiBusy] = useState(false);

  /**
   * Insere texto na posição do cursor (ou substitui seleção) e reposiciona o cursor.
   */
  const insertAtCursor = (text: string, cursorOffset?: number) => {
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + text);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = before + text + after;
    onChange(newValue);

    // Reposiciona o cursor após o texto inserido
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + (cursorOffset ?? text.length);
      ta.setSelectionRange(pos, pos);
    });
  };

  const handleInsertChord = (chord: string) => {
    // Detecta se estamos no início de uma linha ou após um espaço — insere [X] direto.
    // Caso contrário, prefixa com espaço.
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + `[${chord}]`);
      return;
    }
    const pos = ta.selectionStart;
    const charBefore = pos > 0 ? value[pos - 1] : '';
    const prefix = charBefore === '' || charBefore === '\n' || charBefore === ' ' ? '' : ' ';
    insertAtCursor(`${prefix}[${chord}]`, prefix.length + chord.length + 2);
  };

  const handleInsertSection = (section: string) => {
    // Garante que a seção comece em nova linha, com linha em branco antes
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + `\n[${section}]\n`);
      return;
    }
    const pos = ta.selectionStart;
    const before = value.substring(0, pos);
    const after = value.substring(pos);
    const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
    const needsBlankLine = before.length > 0 && !before.endsWith('\n\n');
    const lead = needsBlankLine ? (needsLeadingNewline ? '\n\n' : '\n') : '';
    const text = `${lead}[${section}]\n`;
    onChange(before + text + after);
    requestAnimationFrame(() => {
      ta.focus();
      const newPos = pos + text.length;
      ta.setSelectionRange(newPos, newPos);
    });
  };

  const handleAddChordAtLineStart = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    // Encontra o início da linha atual
    const before = value.substring(0, pos);
    const lastNewline = before.lastIndexOf('\n');
    const lineStart = lastNewline + 1;
    onChange(value.substring(0, lineStart) + '[]' + value.substring(lineStart));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart + 1, lineStart + 1);
    });
  };

  const handleAIFormat = async () => {
    if (!value || aiBusy) return;
    setAiBusy(true);
    try {
      const gemini = GeminiService.getInstance();
      const formatted = await gemini.formatLyrics(value);
      onChange(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar superior */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-wrap items-center gap-2 shadow-sm">
        <button
          type="button"
          onClick={() => setShowChordPalette(s => !s)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
            showChordPalette
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="Mostrar/ocultar paleta de cifras"
        >
          <Music size={14} /> Paleta de Cifras
        </button>

        <button
          type="button"
          onClick={handleAddChordAtLineStart}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Inserir colchetes [] no início da linha para digitar a cifra manualmente"
        >
          <Plus size={14} /> Cifra na linha
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <div className="flex flex-wrap items-center gap-1.5">
          {SECTIONS.map(s => (
            <button
              key={s.label}
              type="button"
              onClick={() => handleInsertSection(s.label)}
              className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              title={`Inserir marcador [${s.label}]`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={handleAIFormat}
          disabled={aiBusy || !value}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-40"
        >
          {aiBusy ? (
            <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wand2 size={14} />
          )}
          Organizar com IA
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          {currentKey && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-200">
              Tom: {currentKey}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowPreview(s => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              showPreview
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Mostrar/ocultar preview renderizado"
          >
            {showPreview ? <Eye size={14} /> : <EyeOff size={14} />} Preview
          </button>
        </div>
      </div>

      {/* Paleta de cifras (colapsável) */}
      {showChordPalette && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Music size={12} /> Paleta — Clique para inserir [Acorde] no cursor
          </div>
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <table className="text-xs border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="w-12"></th>
                  {CHORD_TYPES.map(t => (
                    <th
                      key={t.id}
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 text-center"
                      title={t.label}
                    >
                      {t.suffix || 'Maior'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROOT_NAMES.map(root => (
                  <tr key={root}>
                    <th className="text-[11px] font-black text-slate-700 pr-2 text-right">{root}</th>
                    {CHORD_TYPES.map(type => {
                      const chord = buildChordName(root, type.id);
                      return (
                        <td key={type.id}>
                          <button
                            type="button"
                            onClick={() => handleInsertChord(chord)}
                            className="min-w-[3rem] px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs transition-colors border border-slate-200 hover:border-blue-600 active:scale-95"
                            title={`Inserir [${chord}]`}
                          >
                            {chord}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor + Preview */}
      <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            ✏️ Editar (formato ChordPro)
          </label>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={16}
            className="w-full px-5 py-4 bg-slate-900 text-emerald-300 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm leading-relaxed resize-none font-mono placeholder:text-slate-600"
            style={{ fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace' }}
          />
          <div className="text-[10px] text-slate-400 px-1 leading-relaxed">
            <strong className="text-slate-600">Dica:</strong> use <code className="bg-slate-100 px-1 rounded">[C]</code> para inserir uma cifra,
            ou clique no botão <em>Paleta de Cifras</em> acima. Use os botões de seção para criar
            marcadores como <code className="bg-slate-100 px-1 rounded">[Verso 1]</code>.
          </div>
        </div>

        {showPreview && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Eye size={12} /> Preview (como o músico vê)
            </label>
            <div className="min-h-[24rem] px-5 py-4 bg-white border border-slate-200 rounded-2xl overflow-x-auto">
              <ChordProRenderer source={value} fontSize="0.9rem" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChordProEditor;
