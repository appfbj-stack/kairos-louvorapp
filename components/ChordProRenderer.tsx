import React from 'react';

/**
 * ChordProRenderer
 *
 * Recebe uma string no formato ChordPro, onde cifras são marcadas entre colchetes
 * e posicionadas exatamente acima da sílaba onde aparecem. Suporta também marcadores
 * de seção no início de linha: [Intro], [Verso 1], [Refrão], [Ponte], [Final], etc.
 *
 * Exemplo de entrada:
 *   [Intro]
 *   [C]Te amo Deus, [G]Tua graça nunca falha
 *   [Am]Todos os dias, [F]em Tuas mãos eu estou
 *
 * Saída: cada linha com cifras renderizadas como "abas" posicionadas acima da letra,
 * de forma monoespaçada (fontes de mesmo tamanho) para que tudo alinhe visualmente.
 */

interface ParsedChord {
  /** Texto do acorde, ex.: "C", "Am", "G/B" */
  chord: string;
  /** Coluna (em caracteres) onde o acorde começa dentro da linha */
  column: number;
}

interface ParsedLine {
  /** Conteúdo da linha sem as marcações de cifra, ex.: "Te amo Deus, Tua graça nunca falha" */
  text: string;
  /** Acordes posicionados nessa linha */
  chords: ParsedChord[];
  /** Marcador de seção se houver (ex.: "Intro", "Verso 1") */
  section?: string;
}

/**
 * Faz o parse de uma linha ChordPro.
 * - Remove os [...] de cifra e armazena sua posição.
 * - Detecta marcadores de seção no início ([Intro], [Verso 1], etc.) — quando a linha
 *   contém apenas um par de colchetes, é considerada seção.
 */
function parseLine(rawLine: string): ParsedLine {
  const line = rawLine;
  const chords: ParsedChord[] = [];
  let text = '';
  let column = 0;

  // Detecta seção standalone: "[Intro]", "[Verso 1]", etc.
  const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);
  if (sectionMatch) {
    return { text: '', chords: [], section: sectionMatch[1].trim() };
  }

  let i = 0;
  while (i < line.length) {
    if (line[i] === '[') {
      const end = line.indexOf(']', i);
      if (end !== -1) {
        const chord = line.substring(i + 1, end).trim();
        if (chord.length > 0 && !chord.includes('\n')) {
          chords.push({ chord, column });
        }
        i = end + 1;
        continue;
      }
    }
    text += line[i];
    column++;
    i++;
  }

  return { text, chords };
}

function parseChordPro(input: string): ParsedLine[] {
  if (!input) return [];
  // Normaliza quebras de linha (CRLF → LF)
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return normalized.split('\n').map(parseLine);
}

interface ChordProRendererProps {
  /** Conteúdo ChordPro a renderizar */
  source: string;
  /** Classes CSS adicionais para o container */
  className?: string;
  /** Tamanho da fonte em rem (padrão: 1rem) */
  fontSize?: string;
}

/**
 * Largura visual reservada para uma cifra no "trilho" superior, em "em".
 * Usada para alinhar mesmo cifras que ocupam colunas vizinhas.
 */
const CHORD_SLOT_WIDTH_EM = 1.6;

export const ChordProRenderer: React.FC<ChordProRendererProps> = ({
  source,
  className = '',
  fontSize = '1rem',
}) => {
  const lines = parseChordPro(source);

  if (lines.length === 0) {
    return (
      <div
        className={`text-slate-400 italic text-sm ${className}`}
        style={{ fontSize }}
      >
        (sem letra cadastrada)
      </div>
    );
  }

  return (
    <div
      className={`font-mono leading-relaxed text-slate-800 whitespace-pre-wrap ${className}`}
      style={{ fontSize, fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace' }}
    >
      {lines.map((line, idx) => {
        if (line.section) {
          return (
            <div
              key={idx}
              className="mt-4 mb-2 first:mt-0 font-sans font-bold text-blue-600 uppercase tracking-widest text-xs border-l-4 border-blue-500 pl-3 py-1 bg-blue-50/50 rounded-r"
              style={{ fontSize: '0.75rem' }}
            >
              {line.section}
            </div>
          );
        }

        if (line.text.trim() === '' && line.chords.length === 0) {
          return <div key={idx} className="h-3" />;
        }

        // Renderiza a linha com trilho de cifras + linha de texto
        return (
          <div key={idx} className="flex flex-col">
            {/* Trilho de cifras: renderiza um espaço "vazio" do tamanho do texto, mas com as cifras posicionadas via position:absolute */}
            <div className="relative h-5 select-none">
              {line.chords.map((c, cIdx) => (
                <span
                  key={cIdx}
                  className="absolute top-0 font-bold text-blue-600"
                  style={{
                    left: `${c.column * 0.6}em`,
                    minWidth: `${CHORD_SLOT_WIDTH_EM}em`,
                    fontSize: '0.85rem',
                  }}
                >
                  {c.chord}
                </span>
              ))}
            </div>
            {/* Linha de texto */}
            <div className="text-slate-800">{line.text || ' '}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ChordProRenderer;
