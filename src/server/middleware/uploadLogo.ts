/**
 * uploadLogo.ts — middleware de upload de logo do tenant
 * Salva em /app/logos/<tenantId>.<ext> e retorna { filename, url, size, mimetype }
 */
import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const LOGO_DIR = process.env.UPLOAD_DIR
  ? path.join(process.env.UPLOAD_DIR, "logos")
  : path.join(process.cwd(), "uploads", "logos");

// Garante que diretório existe
if (!fs.existsSync(LOGO_DIR)) {
  fs.mkdirSync(LOGO_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, LOGO_DIR),
  filename: (req: Request, file, cb) => {
    const tenantId = req.params.id;
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    cb(null, `${tenantId}${ext}`);
  },
});

const ALLOWED_MIMETYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export const uploadLogoMiddleware = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo não permitido: ${file.mimetype}. Use PNG, JPG, WEBP ou SVG.`));
    }
  },
}).single("logo");

export { LOGO_DIR };
