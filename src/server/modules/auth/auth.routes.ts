/**
 * auth.routes.ts
 *
 * Rotas de autenticação:
 *   - POST /api/auth/login             → login de tenant user (leader/member) ou SUPER_ADMIN
 *   - POST /api/auth/signup-tenant    → auto-signup (cria tenant pendente + admin inicial)
 *   - POST /api/auth/refresh          → emite novo token a partir do refresh cookie
 *   - GET  /api/auth/me               → retorna usuário logado
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';
import expressRateLimit from 'express-rate-limit';

const router = Router();

// ── Rate limit no login (anti brute-force) ────────────────────
const loginLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Muitas tentativas. Tente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Schemas de validação ───────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  tenantName: z.string().min(2),
  tenantSlug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen'),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
    }
    const { email, password } = parsed.data;

    // 1) Tenta SUPER_ADMIN primeiro (escopo global — login separado)
    const sa = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), role: 'SUPER_ADMIN', deletedAt: null },
      include: { tenant: true },
    });
    if (sa && sa.passwordHash) {
      const ok = await bcrypt.compare(password, sa.passwordHash);
      if (!ok) {
        return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
      }
      const token = jwt.sign(
        {
          userId: sa.id,
          tenantId: sa.tenantId,
          role: sa.role,
          name: sa.name,
          email: sa.email,
        },
        env.JWT_SECRET,
        { expiresIn: '30d' },
      );
      return res.json({
        success: true,
        token,
        user: { id: sa.id, name: sa.name, email: sa.email, role: sa.role, tenantId: sa.tenantId },
        scope: 'SUPER_ADMIN',
      });
    }

    // 2) Tenta tenant user
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: { tenant: true },
    });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }
    if (!user.active) {
      return res
        .status(403)
        .json({ success: false, error: 'Usuário desativado. Contate o líder.' });
    }
    if (user.tenant.subscriptionStatus === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        error: `Igreja bloqueada: ${user.tenant.motivoBloqueio || 'Contate o suporte.'}`,
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: '30d' },
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        tenantSlug: user.tenant.slug,
      },
      scope: 'TENANT',
    });
  }),
);

// ── POST /api/auth/signup-tenant ─────────────────────────────
router.post(
  '/signup-tenant',
  loginLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, error: parsed.error.issues[0]?.message || 'Dados inválidos' });
    }
    const { tenantName, tenantSlug, adminName, adminEmail, adminPassword } = parsed.data;

    // Verifica se slug já existe
    const slugExists = await prisma.tenant.findUnique({
      where: { slug: tenantSlug.toLowerCase() },
    });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        error: 'Esse slug já está em uso. Escolha outro identificador.',
      });
    }

    // Verifica se email já está cadastrado
    const emailExists = await prisma.user.findFirst({
      where: { email: adminEmail.toLowerCase() },
    });
    if (emailExists) {
      return res
        .status(400)
        .json({ success: false, error: 'Esse e-mail já está cadastrado em outra igreja.' });
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName.trim(),
          slug: tenantSlug.toLowerCase(),
          subscriptionStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
      });

      const admin = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: adminName.trim(),
          email: adminEmail.toLowerCase().trim(),
          passwordHash,
          role: 'LEADER',
          function: 'Líder / Multi-instrumentista',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          superAdminId: admin.id, // SELF até o super admin aprovar
          superAdminEmail: admin.email,
          action: 'TENANT_SELF_CREATED',
          targetId: tenant.id,
          details: { source: 'signup-tenant', tenantName, tenantSlug },
        },
      });

      return { tenant, admin };
    });

    const token = jwt.sign(
      {
        userId: result.admin.id,
        tenantId: result.tenant.id,
        role: result.admin.role,
        name: result.admin.name,
        email: result.admin.email,
      },
      env.JWT_SECRET,
      { expiresIn: '30d' },
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: result.admin.id,
        name: result.admin.name,
        email: result.admin.email,
        role: result.admin.role,
        tenantId: result.tenant.id,
        tenantName: result.tenant.name,
        tenantSlug: result.tenant.slug,
      },
      scope: 'TENANT',
    });
  }),
);

// ── GET /api/auth/me ──────────────────────────────────────────
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { tenant: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        function: user.function,
        instrument: user.instrument,
        active: user.active,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        tenantSlug: user.tenant.slug,
      },
    });
  }),
);

export default router;
