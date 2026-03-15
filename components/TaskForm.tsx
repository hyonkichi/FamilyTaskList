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
  const [isShared, setIsShared] = useState(editTask?.isShared ?? false);
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
        assignee: isShared ? members[0] : assignee,
        isShared,
        dueDate: dueDate || null,
        memo,
      });
    } else {
      await createTask({
        eventId,
        title: title.trim(),
        assignee: isShared ? members[0] : assignee,
        isShared,
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl shadow-indigo-100/50">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {editTask ? "タスクを編集" : "タスクを追加"}
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">タスク名 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 住民票を取得する"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">担当者</label>
            <div className="flex gap-2">
              {members.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setIsShared(false); setAssignee(m); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    !isShared && assignee === m
                      ? "border-transparent bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm"
                      : "border-gray-100 bg-gray-50 text-gray-500 hover:border-indigo-200"
                  }`}
                >
                  {m}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsShared(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  isShared
                    ? "border-transparent bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-emerald-200"
                }`}
              >
                どちらでも
              </button>
            </div>
            {isShared && (
              <p className="text-xs text-emerald-600 mt-1.5">パパ・ママどちらが完了してもOKです</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">期限（任意）</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">メモ（任意）</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="補足情報など"
              rows={3}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:from-indigo-600 hover:to-violet-600 transition-all shadow-sm shadow-indigo-200"
          >
            {loading ? "保存中..." : editTask ? "更新する" : "追加する"}
          </button>
        </form>
      </div>
    </div>
  );
}
