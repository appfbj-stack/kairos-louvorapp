# syntax=docker/dockerfile:1
# ============================================================
# Kairos LouvorApp - Dockerfile multi-stage
# Stage 1: builder (gera frontend + bundle do servidor)
# Stage 2: runner  (imagem final enxuta)
# Banco: PostgreSQL (kairos-shared-pg do Dokploy)
# ============================================================

FROM node:22-alpine AS builder
WORKDIR /app

# Dependências de sistema pro Prisma gerar o client
RUN apk add --no-cache openssl libc6-compat

# Copia manifesto de deps primeiro (cache de camadas)
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci 2>&1 || npm install

# Gera o Prisma Client antes de copiar o resto (cache de camadas)
RUN npx prisma generate

# Copia o código-fonte
COPY . .

# Build do frontend (Vite) + bundle do backend (esbuild) via npm run build
RUN npm run build

# ============================================================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Dependências runtime (openssl pro Prisma, curl pro healthcheck)
RUN apk add --no-cache openssl libc6-compat curl tini

# Copia package.json para o install de runtime deps
COPY package.json package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/index.html ./index.html
COPY --from=builder /app/metadata.json ./metadata.json

# Não rodar como root — usa o user `node` da imagem oficial
RUN chown -R node:node /app
USER node

# Healthcheck (consulta a API real)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

EXPOSE 3000

# tini = init correto pra sinais e processos zumbis
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx prisma generate && npx prisma db push --skip-generate 2>/dev/null || npx prisma db push; node dist/server.cjs"]
