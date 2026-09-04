import { Request, Response } from "express";
import { success } from "../../utils/response";
import { MESSAGES } from "../../utils/messages";
import { columnService } from "./column.service";

export const columnController = {
  create: async (req: Request, res: Response) => {
    const data = await columnService.create(req.params.boardId, req.user!.id, req.body);
    return success(res, data, MESSAGES.COLUMN_CREATED, 201);
  },

  update: async (req: Request, res: Response) => {
    const data = await columnService.update(req.params.id, req.user!.id, req.body);
    return success(res, data, MESSAGES.COLUMN_UPDATED);
  },

  remove: async (req: Request, res: Response) => {
    const data = await columnService.remove(req.params.id, req.user!.id);
    return success(res, data, MESSAGES.COLUMN_DELETED);
  },
};
