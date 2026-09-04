import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
});

export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1),
  targetPosition: z.number().int().min(0),
});
