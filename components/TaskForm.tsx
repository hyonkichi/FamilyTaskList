"use client";

import { useState } from "react";
import type { Task } from "@/types";
import { createTask, updateTask } from "@/lib/firestore";
import { useFamilyContext } from "@/lib/FamilyContext";

interface Props {
  eventId: string;
  editTask?: Task | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TaskForm({ eventId, editTask, onClose, onSaved }: Props) {
  const { members } = useFamilyContext();
  const [title, setTitle] = useState(editTask?.title ?? "");
  const [assignee, setAssignee] = useState(editTask?.assignee ?? members[0]);
  const [dueDate, setDueDate] = useState(editTask?.dueDate?.slice(0, 10) ?? "");
  const [memo, setMemo] = useState(editTask?.memo ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    if (editTask) {
      await updateTask(editTask.id, {
        title: title.trim(),
        assignee,
        dueDate: dueDate || null,
        memo,
      });
    } else {
      await createTask({
        eventId,
        title: title.trim(),
        assignee,
        dueDate: dueDate || null,
        memo,
        source: "manual",
      });
    }
    setLoading(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            {editTask ? "タスクを編集" : "タスクを追加"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タスク名 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 住民票を取得する"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
            <div className="flex gap-3">
              {members.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAssignee(m)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                    assignee === m
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">期限（任意）</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="補足情報など"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            {loading ? "保存中..." : editTask ? "更新する" : "追加する"}
          </button>
        </form>
      </div>
    </div>
  );
}
