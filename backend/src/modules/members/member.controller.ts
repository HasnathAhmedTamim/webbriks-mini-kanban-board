import { Request, Response } from "express";
import { success } from "../../utils/response";
import { MESSAGES } from "../../utils/messages";
import { memberService } from "./member.service";

export const memberController = {
  add: async (req: Request, res: Response) => {
    const data = await memberService.add(req.params.boardId, req.user!.id, req.body);
    return success(res, data, MESSAGES.MEMBER_ADDED, 201);
  },

  remove: async (req: Request, res: Response) => {
    const data = await memberService.remove(
      req.params.boardId,
      req.user!.id,
      req.params.userId
    );
    return success(res, data, MESSAGES.MEMBER_REMOVED);
  },
};
