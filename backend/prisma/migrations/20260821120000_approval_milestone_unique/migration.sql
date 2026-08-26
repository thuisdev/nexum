-- Keep the earliest approval if a milestone was paid more than once.
DELETE FROM "Approval" AS duplicate
USING "Approval" AS kept
WHERE duplicate."milestoneId" = kept."milestoneId"
  AND (
    duplicate."approvedAt" > kept."approvedAt"
    OR (
      duplicate."approvedAt" = kept."approvedAt"
      AND duplicate."id" > kept."id"
    )
  );

CREATE UNIQUE INDEX "Approval_milestoneId_key" ON "Approval"("milestoneId");
