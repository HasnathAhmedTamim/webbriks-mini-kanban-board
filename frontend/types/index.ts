export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type BoardRole = "OWNER" | "MEMBER";

export type BoardMember = {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  user: User;
};

export type Task = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type Column = {
  id: string;
  boardId: string;
  name: string;
  position: number;
  tasks: Task[];
};

export type BoardSummary = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: User;
  _count?: { members: number; columns: number };
};

export type BoardDetail = BoardSummary & {
  members: BoardMember[];
  columns: Column[];
};

export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
};
