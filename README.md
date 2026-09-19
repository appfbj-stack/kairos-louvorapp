
# LouvorApp PWA 🎵

Plataforma PWA para gestão de ministérios de louvor, integrada com Google Gemini AI.

## 🌐 Configuração de Produção (Vercel)

Para que as funcionalidades de IA (Reflexões, Formatação de Letras) funcionem após o deploy, você **precisa** configurar a chave de API:

1. **Obtenha sua Chave:**
   - Acesse [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Crie uma nova API Key (gratuita para uso moderado).

2. **Configure na Vercel:**
   - No dashboard da Vercel, acesse seu projeto.
   - Vá em **Settings** > **Environment Variables**.
   - Adicione uma nova variável:
     - **Key:** `API_KEY`
     - **Value:** `(cole a chave que você gerou)`
   - Clique em **Save**.
   - **Importante:** Você precisará fazer um novo Deploy (ou Redeploy) para que a Vercel injete essa chave no sistema.

## 🚀 Como subir para o GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

## ✨ Funcionalidades
- **IA Generativa:** Cria reflexões baseadas no setlist e formata letras automaticamente.
- **Offline:** Funciona mesmo sem internet após o primeiro acesso.
- **Gestão de Escala:** Confirmação de presença em tempo real.
