import { Request, Response } from "express";
import { success } from "../../utils/response";
import { MESSAGES } from "../../utils/messages";
import { boardService } from "./board.service";

export const boardController = {
  list: async (req: Request, res: Response) => {
    const data = await boardService.list(req.user!.id);
    return success(res, data);
  },

  getById: async (req: Request, res: Response) => {
    const data = await boardService.getById(req.params.id, req.user!.id);
    return success(res, data);
  },

  create: async (req: Request, res: Response) => {
    const data = await boardService.create(req.user!.id, req.body);
    return success(res, data, MESSAGES.BOARD_CREATED, 201);
  },

  update: async (req: Request, res: Response) => {
    const data = await boardService.update(req.params.id, req.user!.id, req.body);
    return success(res, data, MESSAGES.BOARD_UPDATED);
  },

  remove: async (req: Request, res: Response) => {
    const data = await boardService.remove(req.params.id, req.user!.id);
    return success(res, data, MESSAGES.BOARD_DELETED);
  },
};
