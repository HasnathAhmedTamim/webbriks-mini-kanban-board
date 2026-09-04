import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { userController } from "./user.controller";

const router = Router();

router.get("/me", authenticate, asyncHandler(userController.me));

export default router;
