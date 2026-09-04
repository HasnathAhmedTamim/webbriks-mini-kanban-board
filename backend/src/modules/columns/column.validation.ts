import { z } from "zod";

export const createColumnSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const updateColumnSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  position: z.number().int().min(0).optional(),
});
