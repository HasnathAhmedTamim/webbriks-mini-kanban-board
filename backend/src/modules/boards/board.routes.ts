import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { boardController } from "./board.controller";
import memberRoutes from "../members/member.routes";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(boardController.list));
router.post("/", asyncHandler(boardController.create));
router.get("/:id", asyncHandler(boardController.getById));
router.patch("/:id", asyncHandler(boardController.update));
router.delete("/:id", asyncHandler(boardController.remove));
router.use("/:boardId/members", memberRoutes);

export default router;
