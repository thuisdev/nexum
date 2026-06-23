-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "invitedFreelancerId" TEXT;

-- CreateIndex
CREATE INDEX "Project_invitedFreelancerId_idx" ON "Project"("invitedFreelancerId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_invitedFreelancerId_fkey" FOREIGN KEY ("invitedFreelancerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
