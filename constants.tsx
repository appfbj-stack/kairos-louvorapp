
import { User, UserRole, Event, EventType, Song, Notice, PresenceStatus } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'André Silva', email: 'andre@igreja.com', role: UserRole.LEADER, function: 'Líder / Violão', instrument: 'Violão', phone: '(11) 98888-7777' },
  { id: '2', name: 'Juliana Costa', email: 'ju@igreja.com', role: UserRole.MEMBER, function: 'Voz / Backing', instrument: 'Voz', phone: '(11) 97777-6666' },
  { id: '3', name: 'Ricardo Santos', email: 'ricardo@igreja.com', role: UserRole.MEMBER, function: 'Bateria', instrument: 'Bateria', phone: '(11) 96666-5555' },
  { id: '4', name: 'Mariana Lima', email: 'mari@igreja.com', role: UserRole.MEMBER, function: 'Teclado', instrument: 'Teclado', phone: '(11) 95555-4444' },
];

export const MOCK_SONGS: Song[] = [
  {
    id: 's4',
    title: 'Yeshua',
    artist: 'Heloisa Rosa',
    key: 'D',
    lyrics: `[Intro]
[D]      [A]      [Bm]      [G]

[Verso 1]
[D]No princípio era o [A]Verbo
E o Verbo se [Bm]fez carne
[G]E habitou entre [D]nós
Vimos a Sua [A]glória
[Bm]Glória do [G]Unigênito
Do [D]Pai, cheio de [A]graça e [Bm]verdade [G]

[Refrão]
[D]Yeshua, [A]Yeshua
[Bm]Yeshua, [G]Yeshua
[D]O Cordeiro de [A]Deus
Que [Bm]tira o pecado do [G]mundo

[Verso 2]
[D]A luz brilha nas [A]trevas
E as trevas não [Bm]compreenderam
[G]Mas os que O [D]receberam
Filhos de [A]Deus se [Bm]chamaram [G]

[Ponte]
[D]      [A]      [Bm]      [G]
[D]      [A]      [Bm]      [G]

[Final]
[D]Yeshua, [A]Yeshua
[Bm]Yeshua, [G]Yeshua`,
    arrangement: `## Intro (8 compassos)
- Piano solo com arpejo em D
- Entrada progressiva: baixo e bateria entram no 4° compasso
- Teclado: pad de Dm9 (mais escuro, profético)

## Verso 1
- Voz principal (Mariana) - dinâmica mp
- Piano guiando a harmonia
- Bateria: apenas caixa no 2 e 4
- Guitarra: off

## Refrão
- Todos os instrumentos juntos
- Bateria: bumbo no 1 e 3, caixa no 2 e 4
- Baixo: tônicas em D e A
- Guitarra: clean com reverb longo
- Backing vocal: harmônia em terça acima
- Congregação pode entrar do segundo refrão em diante

## Verso 2
- Mesma dinâmica do Verso 1
- Adicionar flauta/violino se tiver
- Crescendo até a Ponte

## Ponte
- Grande tensão - reduzir pra voz + teclado
- Bateria: tom toms crescente
- Teclado: riff de Dm11 com delay
- Subir dinâmico gradual pra clímax no Final

## Final
- Repetir refrão 2x em dinâmica ff
- Última palavra cantada em fermata
- Encerrar com acorde de Dm (mais sombrio) ou D (resolução)`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 's5',
    title: 'Faz Chover',
    artist: 'Marcus Salles',
    key: 'C',
    lyrics: `[Intro]
[C]      [G]      [Am]      [F]

[Verso 1]
[C]Senhor, o Teu [G]povo
[Am]Humilha-se ao Teu [F]trono
[C]Pra Te [G]adorar
[Am]Pra Te [F]buscar

[Refrão]
[Faz chover, [G]faz chover
[Am]Senhor, [F]faz chover
[C]Sobre o Teu [G]povo
[Am]Que quer Te [F]adorar

[Verso 2]
[C]Aviva a Tua [G]obra
[Am]Manifesta o Teu [F]poder
[C]Sobre toda a [G]terra
[Am]Que o Teu nome é [F]grandioso

[Ponte]
[C]      [G]      [Am]      [F]
[C]      [G]      [Am]      [F]

[Final]
[C]Faz chover, [G]faz chover
[Am]Sobre nós, [F]Senhor]`,
    arrangement: `## Intro (4 compassos)
- Bateria com caixa no 2 e 4 (timbre worship moderno)
- Teclado: pad Cm9
- Guitarra: clean com chorus
- Entrada da voz no 5° compasso

## Verso 1
- Voz principal (André) com dinâmica mf
- Bateria: groove pop worship com bumbo no 1 e 3
- Baixo: caminhar harmônico (root + 5)
- Teclado: pad + piano acústico
- Guitarra: base com capotraste na 3

## Refrão
- Sobe a dinâmica (mp → mf)
- Bateria: adicionar surdo aberto no 1
- Backing vocal: dobrar a melodia na oitava
- Bateria: groove cheio com hi-hat aberto

## Verso 2
- Adicionar cantor de apoio (Juliana)
- Aumentar o reverb da voz
- Teclado: mais presente (subir volume)

## Ponte
- Reduzir tudo: só voz + violão
- Crescendo dinâmico gradual
- Voltar com tudo no último "Faz chover"

## Final
- Toda igreja cantando
- Repetir 4x com modulação (C → D → E → F)
- Encerrar com acappella no último "Senhor"`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 's6',
    title: 'Teus Sonhos',
    artist: 'Deigma Marques',
    key: 'G',
    lyrics: `[Intro]
[G]      [D]      [Em]      [C]

[Verso 1]
[G]Se os teus sonhos [D]caírem
[Em]Não desanime [C]não
[G]Eu, o Senhor, [D]teus sonhos
[Em]Quero restaurar [C]em suas mãos

[Refrão]
[G]Toma a tua [D]alma
[Em]E lança nas [C]minhas mãos
[G]Eu sou o Deus [D]que pode
[Em]Tocar o teu [C]coração

[Verso 2]
[G]Se as tuas lágrimas [D]caírem
[Em]Eu as recolho [C]em um balde
[G]E no meu livro [D]conta cada uma
[Em]Porque Eu te amo, [C]meu filho`,
    arrangement: `## Intro (4 compassos)
- Apenas violão dedilhado
- Entrada da voz no 3° compasso
- Dinâmica pp (muito suave)

## Verso 1
- Voz principal (Juliana) - bem intimista
- Violão dedilhado continua
- Entrada sutil de teclado no 4° compasso
- Bateria: apenas caixa com vassourinha
- Dinâmica mp

## Refrão
- Adicionar banda toda
- Bateria: bumbo no 1 e 3, caixa no 2 e 4
- Guitarra: clean com overdrive leve
- Baixo: tônicas em G e D
- Teclado: pad + piano
- Dinâmica mf

## Verso 2
- Voltar pra dinâmica mp
- Só violão + voz
- Adicionar Backing vocal na 2° metade (Mariana)
- Crescendo até o final

## Final (se repetir)
- Repetir última estrofe 2x
- Encerrar com resolução em G maior
- Deixar a congregação cantar a última frase (acappella final)`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 's7',
    title: 'Lindo És',
    artist: 'João Marcos',
    key: 'G',
    lyrics: `[Intro]
[G]      [D/F#]      [Em]      [C]

[Verso 1]
[G]Lindo és, [D/F#]lindo és
[Em]Lindo és, [C]Jesus
[G]Lindo és, [D/F#]lindo és
[Em]Lindo és, [C]Jesus

[Refrão]
[G]Toda [D/F#]a terra
[Em]Te louva, [C]Senhor
[G]Toda [D/F#]a terra
[Em]Te louva, [C]Senhor

[Verso 2]
[G]Poderoso, [D/F#]poderoso
[Em]Poderoso, [C]Jesus
[G]Poderoso, [D/F#]poderoso
[Em]Poderoso, [C]Jesus

[Ponte]
[G]      [Em]      [C]      [D]
[G]      [Em]      [C]      [D]`,
    arrangement: `## Intro (4 compassos)
- Banda toda já começa
- Bateria: groove worship moderno
- Teclado: pad + piano
- Guitarra: clean
- Baixo: caminhar

## Verso 1
- Vocal principal (André) - chamar e responder com a igreja
- Guitarra: base ritmada
- Teclado: pad + piano
- Dinâmica mf

## Refrão
- Toda igreja junto
- Bateria: aumentar dinâmica
- Backing vocal: 3 vozes (Mariana, Juliana, Ricardo)
- Bateria: adicionar crash no 1

## Verso 2
- Mesma estrutura
- Instrumentos reduzem no "Poderoso, poderoso"
- Volta com tudo no "Lindo és, lindo és"

## Ponte
- Clímax - dinâmica ff
- Guitarra: distorção leve
- Bateria: tom toms crescendo
- Teclado: synth pad com filtro wah

## Final
- Repetir Refrão 2x
- Última palavra cantada em acappella
- Encerrar com "Lindo és" sussurrado`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  },
  {
    id: 's1',
    title: 'A Casa é Sua',
    artist: 'Casa Worship',
    key: 'A',
    lyrics: `[Intro]
[A]      [F#m]
Vem oh Deus, e [D]toma o Teu [A]lugar
[A]      [F#m]
Sentado no trono, nós [D]queremos Te [A]adorar

[Verso 1]
[A]Vem oh Deus, e [F#m]toma o Teu [D]lugar
[A]      [F#m]
A nossa esperança está em [D]Ti, em mais [A]ninguém

[Refrão]
[A]      [F#m]
Pois a casa é Sua, nós [D]deixamos a porta [A]aberta
Pode entrar, pode morar, [F#m]Jesus
[D]Pois a casa é Sua, nós [A]deixamos a porta [E]aberta
Pode entrar, pode morar, [D]Jesus

[Ponte]
[A]O meu amado é o [F#m]mais belo entre [D]milhares e [A]milhares
O meu amado é o [F#m]mais belo entre [D]milhares e [A]milhares`,
    arrangement: `## Intro (8 compassos)
- Só violão dedilhado em A
- Bateria: caixa no 2 e 4 apenas
- Teclado: pad sustain em A/F#m

## Verso 1
- Voz principal (Mariana) entra no 4º compasso
- Teclado: pad discreto
- Bateria: virada sutil a cada 4 compassos
- Guitarra: off (entra no refrão)

## Refrão
- Todos os instrumentos
- Bateria: bumbo no 1 e 3, caixa no 2 e 4
- Guitarra: base com palm mute
- Backing vocal harmonizando na segunda metade

## Ponte
- Reduzir para voz + violão
- Teclado: riff ascendente em A
- Subir dinâmico gradualmente para o refrão final

## Final
- Última repetição do refrão em dinâmica forte
- Encerrar com fermata no A
- Congregação canta a última frase`,
    youtubeUrl: 'https://www.youtube.com/watch?v=R1OIsm_r9A0',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 's2',
    title: 'Lugar Secreto',
    artist: 'Gabriela Rocha',
    key: 'E',
    lyrics: `[Intro]
[E]      [B]      [C#m]      [A]

[Verso 1]
[E]Tu és tudo o que eu [B]mais quero
O meu [C#m]fôlego, a minha [A]vida
[E]Tu és tudo o que eu [B]mais quero
Eu não [C#m]posso viver sem [A]Ti

[Refrão]
[A]      [B]      [E]
Eu quero ir mais fundo
[A]      [B]      [C#m]
Leva-me a Teu lugar [B]secreto
[A]Aos Teus [B]pés me [E]rendo
Pois a [C#m]Tua glória eu [B]quero [E]ver

[Bridge]
[E]      [B]      [C#m]      [A]      [E]      [B]      [C#m]      [A]`,
    arrangement: `## Intro (8 compassos)
- Piano solo com arpejo em E
- Entrada progressiva dos instrumentos

## Verso 1
- Voz principal (Juliana) em dinâmica mp
- Apenas piano guiando
- Bateria entra apenas no refrão

## Refrão
- Bateria: groove pop worship
- Baixo: tônicas em E e A
- Guitarra: clean com delay

## Bridge
- Ad-libs vocais
- Aumentar intensidade dinamica`,
    youtubeUrl: 'https://www.youtube.com/watch?v=Yp69j1_Eubk'
  },
  {
    id: 's3',
    title: 'Bondade de Deus',
    artist: 'Isaias Saad',
    key: 'G',
    lyrics: `[Intro]
[G]      [C]      [G]      [D]

[Verso 1]
[G]Te amo Deus, Tua [C]graça nunca [G]falha
[D]Todos os dias, em [C]Tuas mãos eu [G]estou
[G]Desde o momento em que eu [C]acordo
[D]Até eu me [C]deitar
[G]Eu cantarei da [D]bondade de [G]Deus

[Refrão]
[G]Toda a minha [C]vida Tu tens sido [G]fiel
[D]Toda a minha [C]vida Tu tens sido [G]tão, tão bom
[G]Com todo o [C]fôlego que eu tenho
[D]Eu cantarei da [C]bondade de [G]Deus`,
    arrangement: `## Intro (4 compassos)
- Violão dedilhado + voz
- Toda a equipe entra no verso 1

## Verso 1
- Dinâmica suave
- Mariana na voz principal
- Backing vocal: Juliana (terça acima)

## Refrão
- Crescendo
- Bateria: bumbo no 1 e 3
- Guitarra: strumming aberto
- Congregação pode entrar no 2º refrão

## Final
- Modulação para A
- Repetir refrão 2x em dinâmica ff
- Encerrar com acorde de A em sustain`,
    youtubeUrl: 'https://www.youtube.com/watch?v=Xh0YqVn_W18',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
];

export const generateMockEvents = (): Event[] => {
  const events: Event[] = [];
  const today = new Date();
  
  let idCounter = 1;
  // Generate events for the last 365 days + 30 days in the future
  for (let i = -365; i <= 30; i++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + i);
    
    const dayOfWeek = currentDay.getDay(); // 0 = Sunday, 4 = Thursday
    const year = currentDay.getFullYear();
    const month = String(currentDay.getMonth() + 1).padStart(2, '0');
    const date = String(currentDay.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${date}`;
    
    if (dayOfWeek === 0) { // Sunday
      const scale = [
        { userId: '1', userName: 'André Silva', function: 'Líder / Violão', status: (i > 0) ? PresenceStatus.PENDING : (Math.random() > 0.08 ? PresenceStatus.CONFIRMED : PresenceStatus.DECLINED) },
        { userId: '2', userName: 'Juliana Costa', function: 'Voz Principal', status: (i > 0) ? PresenceStatus.PENDING : (Math.random() > 0.15 ? PresenceStatus.CONFIRMED : PresenceStatus.DECLINED) },
        { userId: '3', userName: 'Ricardo Santos', function: 'Bateria', status: (i > 0) ? PresenceStatus.PENDING : (Math.random() > 0.25 ? PresenceStatus.CONFIRMED : PresenceStatus.DECLINED) },
        { userId: '4', userName: 'Mariana Lima', function: 'Teclado', status: (i > 0) ? PresenceStatus.PENDING : (Math.random() > 0.12 ? PresenceStatus.CONFIRMED : PresenceStatus.DECLINED) },
      ];
      
      events.push({
        id: `gen_e_${idCounter++}`,
        title: 'Culto de Domingo',
        type: EventType.SERVICE,
        date: dateStr,
        time: '19:00',
        location: 'Santuário Principal',
        observations: 'Chegar com 40min de antecedência para oração.',
        scale
      });
    } else if (dayOfWeek === 4 && currentDay.getDate() % 2 === 0) { // Every second Thursday
      const scale = [
        { userId: '1', userName: 'André Silva', function: 'Líder / Violão', status: (i > 0) ? PresenceStatus.PENDING : (Math.random() > 0.05 ? PresenceStatus.CONFIRMED : PresenceStatus.DECLINED) },
        { userId: '2', userName: 'Juliana Costa', function: 'Voz / Backing', status: (i > 0) ? PresenceStatus.PENDING : (Math.random() > 0.2 ? PresenceStatus.CONFIRMED : PresenceStatus.DECLINED) },
        { userId: '3', userName: 'Ricardo Santos', function: 'Bateria', status: (i > 0) ? PresenceStatus.PENDING : (Math.random() > 0.3 ? PresenceStatus.CONFIRMED : PresenceStatus.DECLINED) },
        { userId: '4', userName: 'Mariana Lima', function: 'Teclado', status: (i > 0) ? PresenceStatus.PENDING : (Math.random() > 0.15 ? PresenceStatus.CONFIRMED : PresenceStatus.DECLINED) },
      ];
      
      events.push({
        id: `gen_e_${idCounter++}`,
        title: 'Ensaio Geral',
        type: EventType.REHEARSAL,
        date: dateStr,
        time: '20:00',
        location: 'Sala de Música',
        observations: 'Foco no repertório do mês e transições de arranjo.',
        scale
      });
    }
  }
  
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_EVENTS: Event[] = generateMockEvents();

export const MOCK_NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Novo Repertório de Julho',
    content: 'Olá pessoal, as novas músicas para o mês de julho já estão disponíveis na aba de Repertório. Vamos estudar cada uma com dedicação, focando especialmente nas dinâmicas de voz e transições instrumentais. Deus abençoe!',
    date: '2024-06-15',
    isPinned: true,
    authorName: 'André Silva'
  },
  {
    id: 'n2',
    title: 'Consagração de Sábado',
    content: 'Teremos um momento de oração e jejum neste sábado às 08h.',
    date: '2024-06-18',
    isPinned: false,
    authorName: 'André Silva'
  }
];
