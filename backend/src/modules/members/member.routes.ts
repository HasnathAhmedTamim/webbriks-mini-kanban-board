import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { memberController } from "./member.controller";

const router = Router({ mergeParams: true });

router.post("/", asyncHandler(memberController.add));
router.delete("/:userId", asyncHandler(memberController.remove));

export default router;
