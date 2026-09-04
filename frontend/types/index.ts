export type { User, AuthResponse } from "./auth";
export type { BoardRole, BoardMember } from "./member";
export type { Task } from "./task";
export type { Column } from "./column";
export type { BoardSummary, BoardDetail } from "./board";

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
