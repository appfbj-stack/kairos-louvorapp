// prisma.config.ts
// Configuração Prisma 7 com driver adapter para Postgres
import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    initShadowDb: "",
  },
  adapter: async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL não definida");
    }
    return new PrismaPg({ connectionString });
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://kairos_louvorapp_user:L0uv0r@kA!r0s_2026_X9pTqW@kairos-shared-pg:5432/kairos_louvorapp_db",
  },
});
