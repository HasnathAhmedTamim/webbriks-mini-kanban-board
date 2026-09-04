import type { User } from "./auth";

export type BoardRole = "OWNER" | "MEMBER";

export type BoardMember = {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  user: User;
};
