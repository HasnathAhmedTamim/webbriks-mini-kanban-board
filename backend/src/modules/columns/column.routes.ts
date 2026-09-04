import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { columnController } from "./column.controller";

const boardColumnRouter = Router({ mergeParams: true });
boardColumnRouter.use(authenticate);
boardColumnRouter.post("/", asyncHandler(columnController.create));

const columnRouter = Router();
columnRouter.use(authenticate);
columnRouter.patch("/:id", asyncHandler(columnController.update));
columnRouter.delete("/:id", asyncHandler(columnController.remove));

export { boardColumnRouter, columnRouter };
