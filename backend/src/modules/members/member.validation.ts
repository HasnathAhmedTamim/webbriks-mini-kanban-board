import { z } from "zod";

export const addMemberSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});
