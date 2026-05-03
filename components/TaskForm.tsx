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
  const initialDateMode = editTask?.scheduledAt ? "scheduledAt" : editTask?.dueDate ? "dueDate" : "none";
  const [dateMode, setDateMode] = useState<"none" | "dueDate" | "scheduledAt">(initialDateMode);
  const [dueDate, setDueDate] = useState(editTask?.dueDate?.slice(0, 10) ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    editTask?.scheduledAt ? editTask.scheduledAt.slice(0, 16) : ""
  );
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
        dueDate: dateMode === "dueDate" ? (dueDate || null) : null,
        scheduledAt: dateMode === "scheduledAt" ? (scheduledAt ? new Date(scheduledAt).toISOString() : null) : null,
        memo,
      });
    } else {
      await createTask({
        eventId,
        title: title.trim(),
        assignee: isShared ? members[0] : assignee,
        isShared,
        dueDate: dateMode === "dueDate" ? (dueDate || null) : null,
        scheduledAt: dateMode === "scheduledAt" ? (scheduledAt ? new Date(scheduledAt).toISOString() : null) : null,
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
            <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ display: "block" }}>
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
              {members.map((m) => {
                const active = !isShared && assignee === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setIsShared(false); setAssignee(m); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      active
                        ? "border-indigo-400 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md ring-2 ring-indigo-300 ring-offset-1"
                        : "border-gray-200 bg-white text-gray-500 hover:border-indigo-200 hover:bg-indigo-50"
                    }`}
                  >
                    {active && (
                      <svg width={13} height={13} fill="currentColor" viewBox="0 0 20 20" style={{ display: "block", flexShrink: 0 }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {m}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsShared(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isShared
                    ? "border-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md ring-2 ring-emerald-300 ring-offset-1"
                    : "border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                {isShared && (
                  <svg width={13} height={13} fill="currentColor" viewBox="0 0 20 20" style={{ display: "block", flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                どちらでも
              </button>
            </div>
            {isShared && (
              <p className="text-xs text-emerald-600 mt-1.5">パパ・ママどちらが完了してもOKです</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">日程（任意）</label>
            <div className="flex gap-1.5 mb-2">
              {(["none", "dueDate", "scheduledAt"] as const).map((mode) => {
                const labels = { none: "なし", dueDate: "期限", scheduledAt: "予定日時" };
                const active = dateMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDateMode(mode)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? mode === "dueDate"
                          ? "border-orange-300 bg-orange-50 text-orange-600"
                          : mode === "scheduledAt"
                          ? "border-blue-300 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-gray-100 text-gray-600"
                        : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {labels[mode]}
                  </button>
                );
              })}
            </div>
            {dateMode === "dueDate" && (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-colors"
              />
            )}
            {dateMode === "scheduledAt" && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-colors"
              />
            )}
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
            className="btn-lift w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 shadow-sm shadow-indigo-200"
          >
            {loading ? "保存中..." : editTask ? "更新する" : "追加する"}
          </button>
        </form>
      </div>
    </div>
  );
}
