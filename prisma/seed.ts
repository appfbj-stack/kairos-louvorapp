// Prisma Seed — Kairos Louvor (Multi-tenant)
// Cria: 1 SUPER_ADMIN (Fernando) + tenant raiz "Igreja Local" + líder exemplo
// Rode com: npx tsx prisma/seed.ts

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definida");
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed Kairos Louvor...");

  // ============================================================
  // 1) Tenant raiz (para o SUPER_ADMIN ficar ancorado)
  // ============================================================
  const rootTenant = await prisma.tenant.upsert({
    where: { slug: "root" },
    update: {},
    create: {
      name: "Kairos (Root)",
      slug: "root",
      subscriptionStatus: "ACTIVE",
      trialEndsAt: null,
      subscriptionEndsAt: new Date("2099-12-31"),
    },
  });
  console.log(`✅ Tenant raiz: ${rootTenant.name} (slug=${rootTenant.slug})`);

  // ============================================================
  // 2) SUPER ADMIN — Fernando Borges (acesso total, sem tenant)
  // tenantId aponta pro tenant raiz só pra satisfazer FK
  // ============================================================
  const adminHash = await bcrypt.hash("Louvor@2026", 12);
  const superAdmin = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: rootTenant.id, email: "fernandojaborges@gmail.com" },
    },
    update: {},
    create: {
      tenantId: rootTenant.id,
      name: "Pastor Fernando Borges",
      email: "fernandojaborges@gmail.com",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      function: "Administrador Global",
    },
  });
  console.log(`✅ SUPER_ADMIN criado: ${superAdmin.email}`);
  console.log(`   Senha inicial: Louvor@2026 (TROCAR no primeiro login!)`);

  // ============================================================
  // 3) Tenant demo — Igreja Local (pra Pastor ter onde logar como tenant)
  // ============================================================
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: "igreja-local" },
    update: {},
    create: {
      name: "Igreja Local",
      slug: "igreja-local",
      subscriptionStatus: "ACTIVE",
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30d
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`✅ Tenant demo: ${demoTenant.name} (slug=${demoTenant.slug})`);

  // Líder da Igreja Local
  const leaderHash = await bcrypt.hash("Louvor@2026", 12);
  const leader = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: demoTenant.id, email: "lider@igreja-local.com" },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      name: "Líder de Louvor",
      email: "lider@igreja-local.com",
      passwordHash: leaderHash,
      role: "LEADER",
      function: "Líder de Louvor",
    },
  });
  console.log(`✅ Líder demo: ${leader.email} (senha: Louvor@2026)`);

  // ============================================================
  // 4) Audit log inicial
  // ============================================================
  await prisma.auditLog.create({
    data: {
      superAdminId: superAdmin.id,
      superAdminEmail: superAdmin.email,
      action: "SEED_INITIAL",
      details: {
        note: "Seed inicial do Kairos Louvor",
        rootTenantId: rootTenant.id,
        demoTenantId: demoTenant.id,
      },
    },
  });
  console.log("✅ Audit log registrado");

  console.log("\n🎉 Seed concluído!");
  console.log("\n📋 Credenciais:");
  console.log("   SUPER_ADMIN: fernandojaborges@gmail.com / Louvor@2026");
  console.log("   TENANT LEADER (Igreja Local): lider@igreja-local.com / Louvor@2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
