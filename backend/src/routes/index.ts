import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import boardRoutes from "../modules/boards/board.routes";
import { boardColumnRouter, columnRouter } from "../modules/columns/column.routes";
import { columnTaskRouter, taskRouter } from "../modules/tasks/task.routes";
import userRoutes from "../modules/users/user.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/boards", boardRoutes);
router.use("/boards/:boardId/columns", boardColumnRouter);
router.use("/columns", columnRouter);
router.use("/columns/:columnId/tasks", columnTaskRouter);
router.use("/tasks", taskRouter);

export default router;
