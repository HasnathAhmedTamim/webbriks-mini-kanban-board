import { BoardRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { assertBoardAccess } from "../../utils/boardAccess";
import { createBoardSchema, updateBoardSchema } from "./board.validation";

const boardInclude = {
  owner: { select: { id: true, name: true, email: true } },
  members: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  columns: {
    orderBy: { position: "asc" as const },
    include: {
      tasks: {
        orderBy: { position: "asc" as const },
      },
    },
  },
};

export const boardService = {
  async list(userId: string) {
    const boards = await prisma.board.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          take: 4,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        columns: {
          select: {
            _count: { select: { tasks: true } },
          },
        },
        _count: { select: { members: true, columns: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return boards.map((board) => {
      const taskCount = board.columns.reduce((sum, col) => sum + col._count.tasks, 0);
      const { columns, ...rest } = board;
      return {
        ...rest,
        _count: {
          ...board._count,
          tasks: taskCount,
        },
      };
    });
  },

  async getById(boardId: string, userId: string) {
    await assertBoardAccess(boardId, userId);
    return prisma.board.findUniqueOrThrow({
      where: { id: boardId },
      include: boardInclude,
    });
  },

  async create(userId: string, input: unknown) {
    const data = createBoardSchema.parse(input);

    return prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          name: data.name,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: BoardRole.OWNER,
            },
          },
          columns: {
            create: [
              { name: "To Do", position: 0 },
              { name: "In Progress", position: 1 },
              { name: "Done", position: 2 },
            ],
          },
        },
        include: boardInclude,
      });

      return board;
    });
  },

  async update(boardId: string, userId: string, input: unknown) {
    await assertBoardAccess(boardId, userId, { requireOwner: true });
    const data = updateBoardSchema.parse(input);

    return prisma.board.update({
      where: { id: boardId },
      data: { name: data.name },
      include: boardInclude,
    });
  },

  async remove(boardId: string, userId: string) {
    await assertBoardAccess(boardId, userId, { requireOwner: true });
    await prisma.board.delete({ where: { id: boardId } });
    return { id: boardId };
  },
};
