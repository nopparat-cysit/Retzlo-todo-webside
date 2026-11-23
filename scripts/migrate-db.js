const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log("Starting raw SQL database migration over PgBouncer...");

  const sqlStatements = [
    // 1. Add fields to existing tables
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "globalCoins" INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "zenGarden" JSONB;`,
    `ALTER TABLE "ProjectMember" ADD COLUMN IF NOT EXISTS "coins" INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "coinName" TEXT NOT NULL DEFAULT 'Project Coin';`,
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "coinSymbol" TEXT NOT NULL DEFAULT '🪙';`,
    `ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "rewardCoins" INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "privateCoins" JSONB;`,
    `ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "stickers" JSONB;`,

    // 2. Create Reward table
    `CREATE TABLE IF NOT EXISTS "Reward" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "image" TEXT,
        "price" INTEGER NOT NULL,
        "hasQuantity" BOOLEAN NOT NULL DEFAULT false,
        "quantity" INTEGER,
        "duration" TEXT,
        "projectId" TEXT,
        "creatorId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
    );`,

    // 3. Create Redemption table
    `CREATE TABLE IF NOT EXISTS "Redemption" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "rewardId" TEXT NOT NULL,
        "projectId" TEXT,
        "cost" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "rejectionReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Redemption_pkey" PRIMARY KEY ("id")
    );`,

    // 4. Create Notification table
    `CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "projectId" TEXT,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
    );`,

    // 5. Create Cassette table [NEW]
    `CREATE TABLE IF NOT EXISTS "Cassette" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "tapeColor" TEXT NOT NULL DEFAULT 'DEFAULT',
        "tracks" JSONB NOT NULL,
        "projectId" TEXT,
        "creatorId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Cassette_pkey" PRIMARY KEY ("id")
    );`,

    // 6. Create UserPet table [NEW]
    `CREATE TABLE IF NOT EXISTS "UserPet" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL DEFAULT 'Lofi Cat',
        "type" TEXT NOT NULL DEFAULT 'CAT',
        "blanketColor" TEXT NOT NULL DEFAULT 'indigo',
        "level" INTEGER NOT NULL DEFAULT 1,
        "lastFedAt" TIMESTAMP(3),
        "coinsSpent" INTEGER NOT NULL DEFAULT 0,
        "toysUnlocked" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UserPet_pkey" PRIMARY KEY ("id")
    );`,

    // 7. Create CoffeeBrew table [NEW]
    `CREATE TABLE IF NOT EXISTS "CoffeeBrew" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "brewType" TEXT NOT NULL,
        "diaryNotes" TEXT NOT NULL,
        "buffExpiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CoffeeBrew_pkey" PRIMARY KEY ("id")
    );`
  ];

  for (const sql of sqlStatements) {
    try {
      const summary = sql.replace(/\s+/g, ' ').substring(0, 75);
      console.log(`Executing: ${summary}...`);
      await prisma.$executeRawUnsafe(sql);
      console.log("  -> Success!");
    } catch (err) {
      if (err.message.includes("already exists") || err.message.includes("already exist")) {
        console.log("  -> Already exists, skipping.");
      } else {
        console.warn(`  -> Warning: ${err.message}`);
      }
    }
  }

  // 8. Create Indexes and Keys
  const indexes = [
    `CREATE INDEX IF NOT EXISTS "Reward_projectId_idx" ON "Reward"("projectId");`,
    `CREATE INDEX IF NOT EXISTS "Reward_creatorId_idx" ON "Reward"("creatorId");`,
    `CREATE INDEX IF NOT EXISTS "Redemption_userId_idx" ON "Redemption"("userId");`,
    `CREATE INDEX IF NOT EXISTS "Redemption_rewardId_idx" ON "Redemption"("rewardId");`,
    `CREATE INDEX IF NOT EXISTS "Redemption_projectId_idx" ON "Redemption"("projectId");`,
    `CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");`,
    `CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");`,
    `CREATE INDEX IF NOT EXISTS "Cassette_projectId_idx" ON "Cassette"("projectId");`,
    `CREATE INDEX IF NOT EXISTS "Cassette_creatorId_idx" ON "Cassette"("creatorId");`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "UserPet_userId_key" ON "UserPet"("userId");`,
    `CREATE INDEX IF NOT EXISTS "CoffeeBrew_userId_idx" ON "CoffeeBrew"("userId");`
  ];

  for (const sql of indexes) {
    try {
      const summary = sql.replace(/\s+/g, ' ').substring(0, 75);
      console.log(`Creating Index: ${summary}...`);
      await prisma.$executeRawUnsafe(sql);
      console.log("  -> Success!");
    } catch (err) {
      console.log("  -> Already exists/Skipped.");
    }
  }

  // 9. Create Constraints
  const constraints = [
    `ALTER TABLE "Reward" ADD CONSTRAINT "Reward_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "Reward" ADD CONSTRAINT "Reward_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "Cassette" ADD CONSTRAINT "Cassette_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "Cassette" ADD CONSTRAINT "Cassette_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "UserPet" ADD CONSTRAINT "UserPet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "CoffeeBrew" ADD CONSTRAINT "CoffeeBrew_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
  ];

  for (const sql of constraints) {
    try {
      const summary = sql.replace(/\s+/g, ' ').substring(0, 75);
      console.log(`Adding Constraint: ${summary}...`);
      await prisma.$executeRawUnsafe(sql);
      console.log("  -> Success!");
    } catch (err) {
      console.log("  -> Already exists/Skipped constraint.");
    }
  }

  console.log("\nDatabase structure migration finished successfully!");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
