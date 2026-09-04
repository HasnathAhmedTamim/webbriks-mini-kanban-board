"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";

type TaskCardProps = {
  task: Task;
  onOpen: (task: Task) => void;
};

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className={`w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 text-left transition ${
        isDragging
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "hover:border-[var(--accent)]"
      }`}
      onClick={() => onOpen(task)}
      {...attributes}
      {...listeners}
    >
      <p className="font-medium text-[var(--ink)]">{task.title}</p>
      {task.description ? (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
          {task.description}
        </p>
      ) : null}
    </button>
  );
}
