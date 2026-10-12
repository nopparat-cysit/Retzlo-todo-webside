import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const target = process.argv[2]?.trim();

  if (!target) {
    console.log("\n📌 Usage: node scripts/set-admin.mjs <email_or_username>\n");
    console.log("Current Users in Database:");
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, name: true, globalRole: true },
      orderBy: { createdAt: "desc" },
      take: 15
    });
    console.table(users);
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: target, mode: "insensitive" } },
        { username: { equals: target, mode: "insensitive" } }
      ]
    }
  });

  if (!user) {
    console.error(`❌ User not found with identifier: "${target}"`);
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { globalRole: "ADMIN" }
  });

  console.log(`\n🎉 Success! User "${updated.email}" (${updated.name || updated.username || "Admin"}) has been promoted to SUPER ADMIN!`);
  console.log(`URL to access: /admin-vault-9f8e\n`);
}

main()
  .catch((e) => {
    console.error("Error setting admin role:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
