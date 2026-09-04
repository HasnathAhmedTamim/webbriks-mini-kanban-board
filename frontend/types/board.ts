import type { User } from "./auth";
import type { BoardMember } from "./member";
import type { Column } from "./column";

export type BoardSummary = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: User;
  members?: BoardMember[];
  _count?: { members: number; columns: number; tasks?: number };
};

export type BoardDetail = BoardSummary & {
  members: BoardMember[];
  columns: Column[];
};
