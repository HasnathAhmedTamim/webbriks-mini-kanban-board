"use client";

import { FormEvent, useState } from "react";
import { useRemoveMember, useShareBoard } from "@/hooks/useBoards";
import { notify } from "@/lib/notify";
import type { BoardDetail } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type ShareBoardModalProps = {
  open: boolean;
  onClose: () => void;
  board: BoardDetail;
  isOwner: boolean;
};

export function ShareBoardModal({ open, onClose, board, isOwner }: ShareBoardModalProps) {
  const shareBoard = useShareBoard(board.id);
  const removeMember = useRemoveMember(board.id);
  const [email, setEmail] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isOwner) return;
    try {
      await shareBoard.mutateAsync(email.trim().toLowerCase());
      notify.success("Member added successfully");
      setEmail("");
    } catch (error) {
      notify.error(error, "We couldn’t add that person. Make sure they’re registered.");
    }
  }

  return (
    <Modal open={open} title="Share this board" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Invite someone by the email they used to sign up.
        </p>

        <ul className="space-y-2 rounded-lg border border-[var(--line)] p-3">
          {board.members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                  {member.user.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-[var(--ink)]">{member.user.name}</p>
                  <p className="text-[var(--muted)]">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">{member.role}</span>
                {isOwner && member.role !== "OWNER" ? (
                  <Button
                    variant="ghost"
                    type="button"
                    className="px-2 py-1 text-[var(--danger)]"
                    loading={removeMember.isPending}
                    onClick={async () => {
                      try {
                        await removeMember.mutateAsync(member.userId);
                        notify.success("Access removed.");
                      } catch (error) {
                        notify.error(error, "We couldn’t remove that member.");
                      }
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {isOwner ? (
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              label="Teammate email"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
            />
            <Button type="submit" loading={shareBoard.isPending} className="w-full">
              Add to board
            </Button>
          </form>
        ) : (
          <p className="text-sm text-[var(--muted)]">Only the owner can invite people.</p>
        )}
      </div>
    </Modal>
  );
}
