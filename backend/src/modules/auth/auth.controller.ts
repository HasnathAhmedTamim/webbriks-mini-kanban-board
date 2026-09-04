import { Request, Response } from "express";
import { success } from "../../utils/response";
import { MESSAGES } from "../../utils/messages";
import { authService } from "./auth.service";

export const authController = {
  register: async (req: Request, res: Response) => {
    const data = await authService.register(req.body);
    return success(res, data, MESSAGES.USER_REGISTERED, 201);
  },

  login: async (req: Request, res: Response) => {
    const data = await authService.login(req.body);
    return success(res, data, MESSAGES.LOGIN_SUCCESS);
  },
};
