-- CreateIndex
CREATE INDEX "Project_arbiterId_idx" ON "Project"("arbiterId");

-- CreateIndex
CREATE INDEX "Submission_milestoneId_idx" ON "Submission"("milestoneId");

-- CreateIndex
CREATE INDEX "Submission_submittedBy_idx" ON "Submission"("submittedBy");

-- CreateIndex
CREATE INDEX "Approval_approvedBy_idx" ON "Approval"("approvedBy");

-- CreateIndex
CREATE INDEX "Dispute_milestoneId_idx" ON "Dispute"("milestoneId");

-- CreateIndex
CREATE INDEX "Dispute_raisedBy_idx" ON "Dispute"("raisedBy");

-- CreateIndex
CREATE INDEX "Dispute_arbiterId_idx" ON "Dispute"("arbiterId");

-- CreateIndex
CREATE INDEX "Notification_projectId_idx" ON "Notification"("projectId");

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_idx" ON "ActivityLog"("actorId");

-- CreateIndex
CREATE INDEX "Review_authorId_idx" ON "Review"("authorId");

-- CreateIndex
CREATE INDEX "Review_subjectId_idx" ON "Review"("subjectId");
