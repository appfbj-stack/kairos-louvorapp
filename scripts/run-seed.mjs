// scripts/run-seed.mjs
// Roda seed dentro do container via docker exec.
// Uso: node /app/scripts/run-seed.mjs
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definida");
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const adminHash = await bcrypt.hash("Louvor@2026", 12);
const leaderHash = adminHash;

async function main() {
  console.log("🌱 Iniciando seed Kairos Louvor...");

  // 1) Tenant raiz
  const rootTenant = await prisma.tenant.upsert({
    where: { slug: "root" },
    update: {},
    create: {
      name: "Kairos (Root)",
      slug: "root",
      subscriptionStatus: "ACTIVE",
      subscriptionEndsAt: new Date("2099-12-31"),
    },
  });
  console.log(`✅ Tenant raiz: ${rootTenant.name} (${rootTenant.slug})`);

  // 2) SUPER ADMIN — Fernando
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
  console.log(`✅ SUPER_ADMIN: ${superAdmin.email} (senha: Louvor@2026)`);

  // 3) Tenant demo + líder
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: "igreja-local" },
    update: {},
    create: {
      name: "Igreja Local",
      slug: "igreja-local",
      subscriptionStatus: "ACTIVE",
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`✅ Tenant demo: ${demoTenant.name} (${demoTenant.slug})`);

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

  // 4) Audit log
  await prisma.auditLog.create({
    data: {
      superAdminId: superAdmin.id,
      superAdminEmail: superAdmin.email,
      action: "SEED_INITIAL",
      details: {
        note: "Seed inicial via docker exec",
        rootTenantId: rootTenant.id,
        demoTenantId: demoTenant.id,
      },
    },
  });
  console.log("✅ Audit log registrado");

  console.log("\n🎉 Seed concluído!");
  console.log("\n📋 Credenciais:");
  console.log("   SUPER_ADMIN: fernandojaborges@gmail.com / Louvor@2026");
  console.log("   TENANT LEADER: lider@igreja-local.com / Louvor@2026");
}

await main();
await prisma.$disconnect();
