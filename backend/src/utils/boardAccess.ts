import { BoardRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { MESSAGES } from "../utils/messages";

export const assertBoardAccess = async (
  boardId: string,
  userId: string,
  options?: { requireOwner?: boolean }
) => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: {
        where: { userId },
        take: 1,
      },
    },
  });

  if (!board) {
    throw new AppError(404, MESSAGES.NOT_FOUND);
  }

  const membership = board.members[0];
  const isOwner = board.ownerId === userId;
  const hasAccess = isOwner || Boolean(membership);

  if (!hasAccess) {
    throw new AppError(403, MESSAGES.FORBIDDEN);
  }

  if (options?.requireOwner && !isOwner) {
    throw new AppError(403, MESSAGES.OWNER_ONLY);
  }

  const role: BoardRole = isOwner
    ? BoardRole.OWNER
    : membership?.role ?? BoardRole.MEMBER;

  return { board, role, isOwner };
};

export const assertColumnAccess = async (columnId: string, userId: string) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });

  if (!column) {
    throw new AppError(404, MESSAGES.NOT_FOUND);
  }

  const access = await assertBoardAccess(column.boardId, userId);
  return { column, ...access };
};

export const assertTaskAccess = async (taskId: string, userId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      column: {
        include: { board: true },
      },
    },
  });

  if (!task) {
    throw new AppError(404, MESSAGES.NOT_FOUND);
  }

  const access = await assertBoardAccess(task.column.boardId, userId);
  return { task, ...access };
};
