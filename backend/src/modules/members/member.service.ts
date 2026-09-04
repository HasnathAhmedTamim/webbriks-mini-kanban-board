import { BoardRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { assertBoardAccess } from "../../utils/boardAccess";
import { MESSAGES } from "../../utils/messages";
import { addMemberSchema } from "./member.validation";

export const memberService = {
  async add(boardId: string, requesterId: string, input: unknown) {
    await assertBoardAccess(boardId, requesterId, { requireOwner: true });
    const data = addMemberSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError(404, MESSAGES.USER_NOT_FOUND);
    }

    if (user.id === requesterId) {
      throw new AppError(409, MESSAGES.MEMBER_EXISTS);
    }

    const existing = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId, userId: user.id },
      },
    });

    if (existing) {
      throw new AppError(409, MESSAGES.MEMBER_EXISTS);
    }

    return prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
        role: BoardRole.MEMBER,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async remove(boardId: string, requesterId: string, targetUserId: string) {
    const { board, isOwner } = await assertBoardAccess(boardId, requesterId, {
      requireOwner: true,
    });

    if (targetUserId === board.ownerId) {
      throw new AppError(400, MESSAGES.CANNOT_REMOVE_OWNER);
    }

    if (!isOwner) {
      throw new AppError(403, MESSAGES.OWNER_ONLY);
    }

    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId, userId: targetUserId },
      },
    });

    if (!membership) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    await prisma.boardMember.delete({
      where: { id: membership.id },
    });

    return { boardId, userId: targetUserId };
  },
};
