import React, { useRef, useState } from 'react';
import { ListChecks, Eye, EyeOff, Plus, Mic, Guitar, Piano, Drum } from 'lucide-react';

/**
 * ArrangementEditor
 *
 * Editor de notas ministeriais (arranjo) com sintaxe leve em markdown.
 * Suporta seções prefixadas com "##" e bullet points.
 *
 * Exemplo:
 *   ## Intro (8 compassos)
 *   - Só violão dedilhado
 *   - Bateria só com caixa
 *
 *   ## Verso 1
 *   - Voz principal entra no 4º compasso
 *   - Teclado: pad suave
 *   - Guitarra: off
 *
 *   ## Refrão
 *   - Todos os instrumentos
 *   - Bateria: bumbo no 1 e 3
 *   - Dinâmica forte
 *
 *   ## Ponte
 *   - Reduzir pra voz + violão
 *   - Subir dinâmico gradualmente
 */

interface ArrangementEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface ParsedSection {
  title: string;
  bullets: string[];
}

function parseArrangement(input: string): ParsedSection[] {
  if (!input) return [];
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { title: line.substring(3).trim(), bullets: [] };
    } else if (line.startsWith('- ')) {
      if (!current) {
        current = { title: 'Notas', bullets: [] };
      }
      current.bullets.push(line.substring(2).trim());
    } else if (line === '' && current) {
      // linha em branco: ignora
    } else if (line.length > 0) {
      // linha solta: trata como bullet sem prefixo
      if (!current) {
        current = { title: 'Notas', bullets: [] };
      }
      current.bullets.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

/** Parser exportado para reuso em outras telas (ex.: visualização no Repertoire) */
export { parseArrangement };

const SECTION_TEMPLATES = [
  { title: 'Intro (8 compassos)', icon: Mic, bullets: ['Violão dedilhado', 'Bateria: apenas caixa no 2 e 4', 'Teclado: pad suave em sustain'] },
  { title: 'Verso 1', icon: Mic, bullets: ['Voz principal entra no 4º compasso', 'Teclado: pad discreto', 'Bateria: virada sutil a cada 4 compassos'] },
  { title: 'Refrão', icon: Guitar, bullets: ['Todos os instrumentos', 'Bateria: bumbo no 1 e 3, caixa no 2 e 4', 'Guitarra: base com palm mute no início', 'Crescendo até o final'] },
  { title: 'Verso 2', icon: Mic, bullets: ['Mesma dinâmica do Verso 1', 'Adicionar backing vocal na segunda metade'] },
  { title: 'Ponte', icon: Piano, bullets: ['Reduzir para voz + violão', 'Teclado: riff no piano', 'Subir dinâmico gradualmente para o refrão final'] },
  { title: 'Final', icon: Drum, bullets: ['Última repetição do refrão em dinâmica forte', 'Encerrar com fermata no acorde final', 'Deixar a congregação cantar a última frase'] },
];

export const ArrangementEditor: React.FC<ArrangementEditorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [showPreview, setShowPreview] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertTemplate = (template: typeof SECTION_TEMPLATES[number]) => {
    const block = `\n## ${template.title}\n${template.bullets.map(b => `- ${b}`).join('\n')}\n`;
    onChange(value + block);
  };

  const handleInsertSection = (title: string) => {
    const ta = textareaRef.current;
    const block = `\n## ${title}\n- `;
    if (!ta) {
      onChange(value + block);
      return;
    }
    const pos = ta.selectionStart;
    const before = value.substring(0, pos);
    const after = value.substring(pos);
    const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
    const lead = needsLeadingNewline ? '\n\n' : '';
    const newValue = before + lead + block + after;
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      const cursorPos = pos + lead.length + block.length;
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleInsertBullet = () => {
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + '\n- ');
      return;
    }
    const pos = ta.selectionStart;
    const before = value.substring(0, pos);
    const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
    const lead = needsLeadingNewline ? '\n' : '';
    const newValue = before + lead + '- ' + value.substring(pos);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(pos + lead.length + 2, pos + lead.length + 2);
    });
  };

  const sections = parseArrangement(value);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-wrap items-center gap-2 shadow-sm">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <ListChecks size={12} /> Arranjo / Notas Ministeriais
        </span>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <div className="flex flex-wrap items-center gap-1.5">
          {SECTION_TEMPLATES.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.title}
                type="button"
                onClick={() => handleInsertSection(t.title)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                title={`Inserir seção "${t.title}"`}
              >
                <Icon size={11} /> {t.title}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={handleInsertBullet}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <Plus size={11} /> Bullet
        </button>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setShowPreview(s => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              showPreview
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {showPreview ? <Eye size={14} /> : <EyeOff size={14} />} Preview
          </button>
        </div>
      </div>

      {/* Templates pré-prontos */}
      {sections.length === 0 && value.trim() === '' && (
        <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4">
          <div className="text-xs font-bold text-blue-700 mb-2">💡 Comece rápido com um template:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SECTION_TEMPLATES.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.title}
                  type="button"
                  onClick={() => handleInsertTemplate(t)}
                  className="text-left p-3 bg-white border border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-700 mb-1">
                    <Icon size={14} className="text-blue-600" /> {t.title}
                  </div>
                  <div className="text-[11px] text-slate-500">{t.bullets[0]}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Editor + Preview */}
      <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            ✏️ Editar Arranjo
          </label>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={'## Intro (8 compassos)\n- Violão dedilhado\n- Bateria: apenas caixa no 2 e 4\n\n## Verso 1\n- Voz principal entra no 4º compasso\n- Teclado: pad suave'}
            rows={12}
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm leading-relaxed resize-none text-slate-700"
          />
          <div className="text-[10px] text-slate-400 px-1 leading-relaxed">
            <strong className="text-slate-600">Sintaxe:</strong> use <code className="bg-slate-100 px-1 rounded">## Título da Seção</code> para criar uma nova seção
            e <code className="bg-slate-100 px-1 rounded">- item</code> para adicionar bullet points com instruções.
          </div>
        </div>

        {showPreview && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Eye size={12} /> Preview do Arranjo
            </label>
            <div className="min-h-[18rem] px-5 py-4 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl">
              {sections.length === 0 ? (
                <div className="text-slate-400 italic text-sm">Nenhuma seção cadastrada ainda.</div>
              ) : (
                <div className="space-y-4">
                  {sections.map((s, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4 py-1">
                      <div className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-1.5">
                        {s.title}
                      </div>
                      <ul className="space-y-1">
                        {s.bullets.map((b, bidx) => (
                          <li key={bidx} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-blue-500 mt-0.5">▸</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArrangementEditor;
