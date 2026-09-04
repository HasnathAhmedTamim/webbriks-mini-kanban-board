import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import { AppError } from "../../utils/AppError";
import { MESSAGES } from "../../utils/messages";
import { loginSchema, registerSchema } from "./auth.validation";

const sanitizeUser = (user: { id: string; name: string; email: string; createdAt: Date }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export const authService = {
  async register(input: unknown) {
    const data = registerSchema.parse(input);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(409, MESSAGES.USER_EXISTS);
    }

    const password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    return {
      user: sanitizeUser(user),
      token,
    };
  },

  async login(input: unknown) {
    const data = loginSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    const token = signToken({ userId: user.id, email: user.email });

    return {
      user: sanitizeUser(user),
      token,
    };
  },
};
