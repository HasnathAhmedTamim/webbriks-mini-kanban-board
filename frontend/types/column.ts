import type { Task } from "./task";

export type Column = {
  id: string;
  boardId: string;
  name: string;
  position: number;
  tasks: Task[];
};
