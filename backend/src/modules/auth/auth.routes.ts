import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));

export default router;
