import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import superAdminRoutes from "./modules/super-admin/super-admin.routes";
import songsRoutes from "./modules/songs/songs.routes";
import eventsRoutes from "./modules/events/events.routes";
import noticesRoutes from "./modules/notices/notices.routes";
import chatRoutes from "./modules/chat/chat.routes";
import { authMiddleware } from "./middleware/auth";

async function startServer() {
  const app = express();
  const PORT = env.PORT;

  // ==========================================
  // Trust proxy — Caddy na frente adiciona X-Forwarded-For
  // Necessário pro rate-limit funcionar com IPs reais
  // ==========================================
  app.set("trust proxy", 1);

  // ==========================================
  // Helmet — headers de segurança HTTP padrão
  // ==========================================
  app.use(
    helmet({
      contentSecurityPolicy: false, // CSP fica no Caddy
      crossOriginEmbedderPolicy: false,
    })
  );

  // ==========================================
  // CORS — origens confiáveis (louvorapp.fbautomacao.space e dev)
  // ==========================================
  const ALLOWED_ORIGINS = [
    "https://louvorapp.fbautomacao.space",
    "https://www.louvorapp.fbautomacao.space",
    "https://admin.louvorapp.fbautomacao.space",
    /^https:\/\/[a-z0-9-]+\.louvorapp\.fbautomacao\.space$/, // *.louvorapp.fbautomacao.space (tenants)
    "http://localhost:3000",
    "http://localhost:3007",
    "http://localhost:3017",
    "http://localhost:5173",
  ];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // curl/webhooks sem Origin
        if (
          ALLOWED_ORIGINS.some((o) =>
            typeof o === "string" ? o === origin : o.test(origin)
          )
        ) {
          return callback(null, true);
        }
        console.warn(`[CORS] Origem bloqueada: ${origin}`);
        return callback(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    })
  );

  app.use(express.json({ limit: "2mb" }));

  // ==========================================
  // Rate limit no /api/auth/login (anti brute-force)
  // 10 tentativas a cada 15min por IP
  // ==========================================
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Muitas tentativas. Tente em 15 minutos." },
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/signup-tenant", authLimiter);

  // Rate limit global (proteção geral contra DoS)
  const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Rate limit exceeded" },
  });
  app.use("/api", globalLimiter);

  // ==========================================
  // Rotas públicas
  // ==========================================
  app.use("/api/auth", authRoutes);
  // Super Admin — autenticado, role SUPER_ADMIN
  app.use("/api/super-admin", authMiddleware, superAdminRoutes);

  // ==========================================
  // Tenant routes — autenticado (tenant vem do JWT)
  // ==========================================
  app.use("/api/songs", authMiddleware, songsRoutes);
  app.use("/api/events", authMiddleware, eventsRoutes);
  app.use("/api/notices", authMiddleware, noticesRoutes);
  app.use("/api/chat", authMiddleware, chatRoutes);

  // ==========================================
  // Health check
  // ==========================================
  app.get("/api/health", (_req, res) => {
    const dbKind = (env.DATABASE_URL || "").startsWith("postgres")
      ? "PostgreSQL"
      : "SQLite";
    res.json({
      status: "ok",
      app: "Kairos Louvor",
      db: dbKind,
      auth: "JWT",
      multiTenant: true,
      superAdmin: true,
    });
  });

  // ==========================================
  // Global error handler
  // ==========================================
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("Unhandled error:", err);
      res.status(500).json({ success: false, error: err.message || "Erro interno" });
    }
  );

  // ==========================================
  // Vite (dev) or Static (prod)
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) =>
      res.sendFile(path.join(distPath, "index.html"))
    );
  }

  app.listen(PORT, "0.0.0.0", () => {
    const dbKind = (env.DATABASE_URL || "").startsWith("postgres")
      ? "PostgreSQL"
      : "SQLite";
    console.log(`🎵 Kairos Louvor API running on http://localhost:${PORT}`);
    console.log(`   DB: ${dbKind} | Auth: JWT | Multi-tenant | Super Admin: enabled`);
  });
}

startServer();
