import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { taskController } from "./task.controller";

const columnTaskRouter = Router({ mergeParams: true });
columnTaskRouter.use(authenticate);
columnTaskRouter.post("/", asyncHandler(taskController.create));

const taskRouter = Router();
taskRouter.use(authenticate);
taskRouter.patch("/:id/move", asyncHandler(taskController.move));
taskRouter.patch("/:id", asyncHandler(taskController.update));
taskRouter.delete("/:id", asyncHandler(taskController.remove));

export { columnTaskRouter, taskRouter };
