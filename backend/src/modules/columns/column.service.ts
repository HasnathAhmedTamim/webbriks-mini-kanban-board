import { prisma } from "../../lib/prisma";
import { assertBoardAccess, assertColumnAccess } from "../../utils/boardAccess";
import { createColumnSchema, updateColumnSchema } from "./column.validation";

export const columnService = {
  async create(boardId: string, userId: string, input: unknown) {
    await assertBoardAccess(boardId, userId);
    const data = createColumnSchema.parse(input);

    const count = await prisma.column.count({ where: { boardId } });

    return prisma.column.create({
      data: {
        boardId,
        name: data.name,
        position: count,
      },
      include: { tasks: { orderBy: { position: "asc" } } },
    });
  },

  async update(columnId: string, userId: string, input: unknown) {
    await assertColumnAccess(columnId, userId);
    const data = updateColumnSchema.parse(input);

    return prisma.column.update({
      where: { id: columnId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.position !== undefined ? { position: data.position } : {}),
      },
      include: { tasks: { orderBy: { position: "asc" } } },
    });
  },

  async remove(columnId: string, userId: string) {
    const { column } = await assertColumnAccess(columnId, userId);

    await prisma.$transaction(async (tx) => {
      await tx.column.delete({ where: { id: columnId } });

      const remaining = await tx.column.findMany({
        where: { boardId: column.boardId },
        orderBy: { position: "asc" },
      });

      await Promise.all(
        remaining.map((col, index) =>
          tx.column.update({
            where: { id: col.id },
            data: { position: index },
          })
        )
      );
    });

    return { id: columnId };
  },
};
