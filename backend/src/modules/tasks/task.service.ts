import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { assertColumnAccess, assertTaskAccess } from "../../utils/boardAccess";
import { MESSAGES } from "../../utils/messages";
import { createTaskSchema, moveTaskSchema, updateTaskSchema } from "./task.validation";

const reindexTasks = async (
  tx: Prisma.TransactionClient,
  columnId: string,
  orderedIds: string[]
) => {
  await Promise.all(
    orderedIds.map((id, index) =>
      tx.task.update({
        where: { id },
        data: { columnId, position: index },
      })
    )
  );
};

export const taskService = {
  async create(columnId: string, userId: string, input: unknown) {
    await assertColumnAccess(columnId, userId);
    const data = createTaskSchema.parse(input);

    const count = await prisma.task.count({ where: { columnId } });

    return prisma.task.create({
      data: {
        columnId,
        title: data.title,
        description: data.description,
        position: count,
      },
    });
  },

  async update(taskId: string, userId: string, input: unknown) {
    await assertTaskAccess(taskId, userId);
    const data = updateTaskSchema.parse(input);

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
    });
  },

  async remove(taskId: string, userId: string) {
    const { task } = await assertTaskAccess(taskId, userId);

    await prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id: taskId } });

      const remaining = await tx.task.findMany({
        where: { columnId: task.columnId },
        orderBy: { position: "asc" },
      });

      await reindexTasks(
        tx,
        task.columnId,
        remaining.map((t) => t.id)
      );
    });

    return { id: taskId };
  },

  async move(taskId: string, userId: string, input: unknown) {
    const { task } = await assertTaskAccess(taskId, userId);
    const data = moveTaskSchema.parse(input);

    const targetColumn = await prisma.column.findUnique({
      where: { id: data.targetColumnId },
    });

    if (!targetColumn) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (targetColumn.boardId !== task.column.boardId) {
      throw new AppError(403, MESSAGES.FORBIDDEN);
    }

    await assertColumnAccess(data.targetColumnId, userId);

    return prisma.$transaction(async (tx) => {
      const sourceColumnId = task.columnId;
      const targetColumnId = data.targetColumnId;
      const dest = Math.max(0, data.targetPosition);

      const sourceTasks = await tx.task.findMany({
        where: { columnId: sourceColumnId },
        orderBy: { position: "asc" },
      });

      // Same column: remove then insert at final index, then reindex 0..n-1.
      if (sourceColumnId === targetColumnId) {
        const currentIndex = sourceTasks.findIndex((t) => t.id === taskId);
        if (currentIndex < 0) {
          throw new AppError(404, MESSAGES.NOT_FOUND);
        }

        const orderedIds = sourceTasks.map((t) => t.id).filter((id) => id !== taskId);
        const clamped = Math.min(dest, orderedIds.length);

        // No-op only when the final index is unchanged.
        if (currentIndex === clamped) {
          return task;
        }

        orderedIds.splice(clamped, 0, taskId);
        await reindexTasks(tx, sourceColumnId, orderedIds);
        return tx.task.findUniqueOrThrow({ where: { id: taskId } });
      }

      const targetTasks = await tx.task.findMany({
        where: { columnId: targetColumnId },
        orderBy: { position: "asc" },
      });

      const sourceIds = sourceTasks.map((t) => t.id).filter((id) => id !== taskId);
      const targetIds = targetTasks.map((t) => t.id);
      const clamped = Math.min(dest, targetIds.length);
      targetIds.splice(clamped, 0, taskId);

      await reindexTasks(tx, sourceColumnId, sourceIds);
      await reindexTasks(tx, targetColumnId, targetIds);

      return tx.task.findUniqueOrThrow({ where: { id: taskId } });
    });
  },
};
