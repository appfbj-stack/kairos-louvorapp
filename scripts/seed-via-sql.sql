-- Seed inicial Kairos Louvor via SQL direto
-- Senha: Louvor@2026 (bcrypt cost 12)
-- Hash gerado em: 2026-09-19

-- 1) Tenant raiz
INSERT INTO "Tenant" (id, name, slug, "subscriptionStatus", "subscriptionEndsAt", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Kairos (Root)',
  'root',
  'ACTIVE',
  '2099-12-31 23:59:59',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- 2) SUPER ADMIN — Pastor Fernando Borges
INSERT INTO "User" (id, "tenantId", name, email, "passwordHash", role, function, "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Pastor Fernando Borges',
  'fernandojaborges@gmail.com',
  '$2a$12$45z0SAq4cUggMKUHXbg8FO2a3ViiQ8xqvYFhv/MYEK8b/4EohGzOC',
  'SUPER_ADMIN',
  'Administrador Global',
  NOW(),
  NOW()
)
ON CONFLICT ("tenantId", email) DO NOTHING;

-- 3) Tenant demo + líder
INSERT INTO "Tenant" (id, name, slug, "subscriptionStatus", "trialEndsAt", "subscriptionEndsAt", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Igreja Local',
  'igreja-local',
  'ACTIVE',
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "User" (id, "tenantId", name, email, "passwordHash", role, function, "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000002',
  'Líder de Louvor',
  'lider@igreja-local.com',
  '$2a$12$45z0SAq4cUggMKUHXbg8FO2a3ViiQ8xqvYFhv/MYEK8b/4EohGzOC',
  'LEADER',
  'Líder de Louvor',
  NOW(),
  NOW()
)
ON CONFLICT ("tenantId", email) DO NOTHING;

-- 4) Audit log
INSERT INTO "AuditLog" (id, "superAdminId", "superAdminEmail", action, details, "createdAt")
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000010',
  'fernandojaborges@gmail.com',
  'SEED_INITIAL',
  '{"note": "Seed inicial via SQL direto", "method": "docker psql"}'::jsonb,
  NOW()
);

-- Resumo
SELECT
  (SELECT COUNT(*) FROM "Tenant") AS total_tenants,
  (SELECT COUNT(*) FROM "User") AS total_users,
  (SELECT COUNT(*) FROM "AuditLog") AS total_audits;
