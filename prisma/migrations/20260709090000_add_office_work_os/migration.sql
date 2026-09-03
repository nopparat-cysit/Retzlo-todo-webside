CREATE TABLE "OfficeAgent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accent" TEXT NOT NULL DEFAULT 'LAVENDER',
    "systemPrompt" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OfficeAgent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OfficeThread" ("id" TEXT NOT NULL,"projectId" TEXT NOT NULL,"agentId" TEXT NOT NULL,"title" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'ACTIVE',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "OfficeThread_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfficeMessage" ("id" TEXT NOT NULL,"projectId" TEXT NOT NULL,"threadId" TEXT NOT NULL,"agentId" TEXT NOT NULL,"authorType" TEXT NOT NULL,"authorId" TEXT,"content" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "OfficeMessage_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfficeTask" ("id" TEXT NOT NULL,"projectId" TEXT NOT NULL,"agentId" TEXT NOT NULL,"threadId" TEXT,"title" TEXT NOT NULL,"description" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'QUEUED',"result" TEXT,"createdById" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "OfficeTask_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfficeReport" ("id" TEXT NOT NULL,"projectId" TEXT NOT NULL,"agentId" TEXT NOT NULL,"threadId" TEXT,"taskId" TEXT,"title" TEXT NOT NULL,"summary" TEXT NOT NULL,"content" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "OfficeReport_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfficeRoutine" ("id" TEXT NOT NULL,"projectId" TEXT NOT NULL,"agentId" TEXT NOT NULL,"title" TEXT NOT NULL,"prompt" TEXT NOT NULL,"scheduleLabel" TEXT NOT NULL,"timeOfDay" TEXT,"enabled" BOOLEAN NOT NULL DEFAULT true,"lastRunAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "OfficeRoutine_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfficeAgentDocument" ("id" TEXT NOT NULL,"agentId" TEXT NOT NULL,"type" TEXT NOT NULL,"title" TEXT NOT NULL,"content" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "OfficeAgentDocument_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfficeAgentSkill" ("id" TEXT NOT NULL,"agentId" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT NOT NULL,"trigger" TEXT NOT NULL,"content" TEXT NOT NULL,"version" INTEGER NOT NULL DEFAULT 1,"enabled" BOOLEAN NOT NULL DEFAULT true,"approvedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "OfficeAgentSkill_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfficeAgentDiaryEntry" ("id" TEXT NOT NULL,"projectId" TEXT NOT NULL,"agentId" TEXT NOT NULL,"threadId" TEXT,"taskId" TEXT,"entryDate" TIMESTAMP(3) NOT NULL,"content" TEXT NOT NULL,"tags" JSONB,"visibility" TEXT NOT NULL DEFAULT 'PROJECT',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "OfficeAgentDiaryEntry_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OfficeAgentMemory" ("id" TEXT NOT NULL,"projectId" TEXT NOT NULL,"agentId" TEXT NOT NULL,"kind" TEXT NOT NULL,"title" TEXT NOT NULL,"content" TEXT NOT NULL,"approvedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "OfficeAgentMemory_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "OfficeAgent_projectId_key_key" ON "OfficeAgent"("projectId", "key");
CREATE INDEX "OfficeAgent_projectId_idx" ON "OfficeAgent"("projectId");
CREATE INDEX "OfficeThread_projectId_updatedAt_idx" ON "OfficeThread"("projectId", "updatedAt");
CREATE INDEX "OfficeThread_agentId_updatedAt_idx" ON "OfficeThread"("agentId", "updatedAt");
CREATE INDEX "OfficeMessage_projectId_createdAt_idx" ON "OfficeMessage"("projectId", "createdAt");
CREATE INDEX "OfficeMessage_threadId_createdAt_idx" ON "OfficeMessage"("threadId", "createdAt");
CREATE INDEX "OfficeTask_projectId_status_idx" ON "OfficeTask"("projectId", "status");
CREATE INDEX "OfficeTask_agentId_updatedAt_idx" ON "OfficeTask"("agentId", "updatedAt");
CREATE INDEX "OfficeReport_projectId_createdAt_idx" ON "OfficeReport"("projectId", "createdAt");
CREATE INDEX "OfficeReport_agentId_createdAt_idx" ON "OfficeReport"("agentId", "createdAt");
CREATE INDEX "OfficeRoutine_projectId_enabled_idx" ON "OfficeRoutine"("projectId", "enabled");
CREATE INDEX "OfficeRoutine_agentId_idx" ON "OfficeRoutine"("agentId");
CREATE INDEX "OfficeAgentDocument_agentId_type_idx" ON "OfficeAgentDocument"("agentId", "type");
CREATE INDEX "OfficeAgentSkill_agentId_enabled_idx" ON "OfficeAgentSkill"("agentId", "enabled");
CREATE INDEX "OfficeAgentDiaryEntry_projectId_entryDate_idx" ON "OfficeAgentDiaryEntry"("projectId", "entryDate");
CREATE INDEX "OfficeAgentDiaryEntry_agentId_entryDate_idx" ON "OfficeAgentDiaryEntry"("agentId", "entryDate");
CREATE INDEX "OfficeAgentMemory_projectId_kind_idx" ON "OfficeAgentMemory"("projectId", "kind");
CREATE INDEX "OfficeAgentMemory_agentId_kind_idx" ON "OfficeAgentMemory"("agentId", "kind");

ALTER TABLE "OfficeAgent" ADD CONSTRAINT "OfficeAgent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeThread" ADD CONSTRAINT "OfficeThread_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeThread" ADD CONSTRAINT "OfficeThread_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OfficeAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeMessage" ADD CONSTRAINT "OfficeMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeMessage" ADD CONSTRAINT "OfficeMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "OfficeThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeMessage" ADD CONSTRAINT "OfficeMessage_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OfficeAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeTask" ADD CONSTRAINT "OfficeTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeTask" ADD CONSTRAINT "OfficeTask_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OfficeAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeTask" ADD CONSTRAINT "OfficeTask_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "OfficeThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OfficeReport" ADD CONSTRAINT "OfficeReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeReport" ADD CONSTRAINT "OfficeReport_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OfficeAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeReport" ADD CONSTRAINT "OfficeReport_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "OfficeThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OfficeReport" ADD CONSTRAINT "OfficeReport_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OfficeTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OfficeRoutine" ADD CONSTRAINT "OfficeRoutine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeRoutine" ADD CONSTRAINT "OfficeRoutine_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OfficeAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeAgentDocument" ADD CONSTRAINT "OfficeAgentDocument_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OfficeAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeAgentSkill" ADD CONSTRAINT "OfficeAgentSkill_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OfficeAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeAgentDiaryEntry" ADD CONSTRAINT "OfficeAgentDiaryEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeAgentDiaryEntry" ADD CONSTRAINT "OfficeAgentDiaryEntry_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OfficeAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeAgentDiaryEntry" ADD CONSTRAINT "OfficeAgentDiaryEntry_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "OfficeThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OfficeAgentDiaryEntry" ADD CONSTRAINT "OfficeAgentDiaryEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OfficeTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OfficeAgentMemory" ADD CONSTRAINT "OfficeAgentMemory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficeAgentMemory" ADD CONSTRAINT "OfficeAgentMemory_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "OfficeAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;