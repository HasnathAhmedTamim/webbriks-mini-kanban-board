"use client";

import { FormEvent, useEffect, useState } from "react";
import { useDeleteTask, useUpdateTask } from "@/hooks/useBoards";
import { notify } from "@/lib/notify";
import type { Task } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type TaskModalProps = {
  open: boolean;
  boardId: string;
  task: Task | null;
  onClose: () => void;
};

export function TaskModal({ open, boardId, task, onClose }: TaskModalProps) {
  const updateTask = useUpdateTask(boardId);
  const deleteTask = useDeleteTask(boardId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    }
  }, [task]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!task) return;
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        title: title.trim(),
        description: description.trim() || null,
      });
      notify.success("Changes saved.");
      onClose();
    } catch (error) {
      notify.error(error, "We couldn’t save your changes.");
    }
  }

  return (
    <Modal
      open={open}
      title="Edit task"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="danger"
            type="button"
            loading={deleteTask.isPending}
            onClick={async () => {
              if (!task) return;
              if (!window.confirm("Delete this task?")) return;
              try {
                await deleteTask.mutateAsync(task.id);
                notify.success("Task deleted.");
                onClose();
              } catch (error) {
                notify.error(error, "We couldn’t delete that task.");
              }
            }}
          >
            Delete
          </Button>
          <Button form="edit-task-form" type="submit" loading={updateTask.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form id="edit-task-form" onSubmit={onSubmit} className="space-y-3">
        <Input
          label="Title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--ink)]">Details</span>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
          />
        </label>
      </form>
    </Modal>
  );
}
