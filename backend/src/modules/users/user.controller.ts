import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { success } from "../../utils/response";

export const userController = {
  me: async (req: Request, res: Response) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return success(res, user);
  },
};
