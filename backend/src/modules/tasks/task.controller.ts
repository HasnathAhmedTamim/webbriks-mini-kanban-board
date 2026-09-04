import { Request, Response } from "express";
import { success } from "../../utils/response";
import { MESSAGES } from "../../utils/messages";
import { taskService } from "./task.service";

export const taskController = {
  create: async (req: Request, res: Response) => {
    const data = await taskService.create(req.params.columnId, req.user!.id, req.body);
    return success(res, data, MESSAGES.TASK_CREATED, 201);
  },

  update: async (req: Request, res: Response) => {
    const data = await taskService.update(req.params.id, req.user!.id, req.body);
    return success(res, data, MESSAGES.TASK_UPDATED);
  },

  remove: async (req: Request, res: Response) => {
    const data = await taskService.remove(req.params.id, req.user!.id);
    return success(res, data, MESSAGES.TASK_DELETED);
  },

  move: async (req: Request, res: Response) => {
    const data = await taskService.move(req.params.id, req.user!.id, req.body);
    return success(res, data, MESSAGES.TASK_MOVED);
  },
};
