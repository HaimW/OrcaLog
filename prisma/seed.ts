import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ROOT_EMAIL = "yafim.sh@gmail.com";

async function main() {
  // Always ensure root email is in the admin list, preserving any others
  const existing = await prisma.appConfig.findUnique({ where: { id: "singleton" } });
  const existingEmails: string[] = existing ? JSON.parse(existing.adminEmails) : [];
  const adminEmails = Array.from(new Set([ROOT_EMAIL, ...existingEmails]));

  await prisma.appConfig.upsert({
    where: { id: "singleton" },
    update: { adminEmails: JSON.stringify(adminEmails) },
    create: { id: "singleton", adminEmails: JSON.stringify(adminEmails), whatsappGroupLink: "" },
  });

  // Promote root user to admin if they already registered
  const rootUser = await prisma.user.findUnique({ where: { email: ROOT_EMAIL } });
  if (rootUser && rootUser.role !== "admin") {
    await prisma.user.update({ where: { email: ROOT_EMAIL }, data: { role: "admin" } });
    console.log(`Promoted ${ROOT_EMAIL} to admin`);
  }

  console.log("Seeded AppConfig");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
