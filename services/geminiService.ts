
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  // Generates a spiritual reflection based on a list of songs.
  async generateSpiritualReflection(setlistSongs: string[]): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Com base nas seguintes músicas de louvor: ${setlistSongs.join(', ')}, gere uma breve reflexão espiritual (máximo 150 palavras) para motivar o ministério de louvor antes do culto.`,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Deus abençoe nossa ministração!";
    } catch (error) {
      console.error("Erro ao gerar reflexão:", error);
      return "Que o Espírito Santo nos guie em cada acorde.";
    }
  }

  // Transposes lyrics/chords from one key to another.
  async transposeLyrics(lyrics: string, fromKey: string, toKey: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é um músico especialista. Transponha a seguinte cifra/letra do tom ${fromKey} para o tom ${toKey}. 
        Mantenha a formatação original e identifique todos os acordes (mesmo os que estão entre colchetes ou acima da letra) e altere-os proporcionalmente. 
        Não altere a letra da música, apenas os acordes.
        
        Texto original:
        "${lyrics}"`,
        config: {
          temperature: 0.1,
        }
      });
      return response.text || lyrics;
    } catch (error) {
      console.error("Erro ao transpor letra:", error);
      return lyrics;
    }
  }

  // Formats raw lyrics into a structured layout.
  async formatLyrics(rawLyrics: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Organize a seguinte letra de música em estrofes claras (Estrofe 1, Coro, Ponte, etc). Remova cifras ou notas perdidas se houver, deixe apenas o texto limpo e bem formatado para leitura em tela de celular. Texto: "${rawLyrics}"`,
        config: {
          temperature: 0.2,
        }
      });
      return response.text || rawLyrics;
    } catch (error) {
      console.error("Erro ao formatar letra:", error);
      return rawLyrics;
    }
  }

  // Refines an announcement to be more clear and encouraging.
  async refineAnnouncement(content: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é um assistente de comunicação para ministérios de louvor. 
        Refine o seguinte aviso para que ele seja mais claro, organizado e encorajador para o time. 
        Mantenha as informações essenciais (datas, horários, locais).
        
        Aviso original:
        "${content}"`,
        config: {
          temperature: 0.5,
        }
      });
      return response.text || content;
    } catch (error) {
      console.error("Erro ao refinar aviso:", error);
      return content;
    }
  }
}
