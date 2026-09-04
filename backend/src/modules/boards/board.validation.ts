import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const updateBoardSchema = z.object({
  name: z.string().trim().min(1).max(120),
});
