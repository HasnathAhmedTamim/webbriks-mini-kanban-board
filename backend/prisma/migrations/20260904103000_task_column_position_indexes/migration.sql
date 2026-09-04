-- Composite indexes for ordered column/task queries
DROP INDEX IF EXISTS "Column_boardId_idx";
DROP INDEX IF EXISTS "Task_columnId_idx";

CREATE INDEX "Column_boardId_position_idx" ON "Column"("boardId", "position");
CREATE INDEX "Task_columnId_position_idx" ON "Task"("columnId", "position");
