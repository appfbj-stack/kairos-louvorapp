/**
 * aiService.ts — Funções de IA que as telas já usavam (transpor tom,
 * formatar letra, refinar aviso, reflexão espiritual).
 *
 * Mesma interface do antigo GeminiService, mas agora cada chamada vai
 * pro backend (/api/ai/*) e é atendida pelo MiniMax. A chave da IA fica
 * só no servidor — nunca é exposta no bundle do navegador.
 */

import { aiApi } from './api';

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /** Reflexão espiritual a partir das músicas do culto. */
  async generateSpiritualReflection(setlistSongs: string[]): Promise<string> {
    try {
      if (!setlistSongs.length) return 'Deus abençoe nossa ministração!';
      return await aiApi.reflection(setlistSongs);
    } catch (error) {
      console.error('Erro ao gerar reflexão:', error);
      return 'Que o Espírito Santo nos guie em cada acorde.';
    }
  }

  /** Transpõe a letra ChordPro de um tom para outro. */
  async transposeLyrics(lyrics: string, fromKey: string, toKey: string): Promise<string> {
    try {
      return await aiApi.transpose(lyrics, fromKey, toKey);
    } catch (error) {
      console.error('Erro ao transpor letra:', error);
      return lyrics;
    }
  }

  /** Organiza letra bagunçada em estrofes com seções rotuladas. */
  async formatLyrics(rawLyrics: string): Promise<string> {
    try {
      return await aiApi.formatLyrics(rawLyrics);
    } catch (error) {
      console.error('Erro ao formatar letra:', error);
      return rawLyrics;
    }
  }

  /** Deixa o aviso do mural mais claro e encorajador. */
  async refineAnnouncement(content: string): Promise<string> {
    try {
      return await aiApi.refineNotice(content);
    } catch (error) {
      console.error('Erro ao refinar aviso:', error);
      return content;
    }
  }
}