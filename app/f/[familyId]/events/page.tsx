"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Event, Task } from "@/types";
import { getEvents, getTasks, createEvent, deleteEvent } from "@/lib/firestore";

interface EventWithProgress extends Event {
  total: number;
  completed: number;
}

export default function EventsPage() {
  const params = useParams<{ familyId: string }>();
  const familyId = params.familyId;

  const [events, setEvents] = useState<EventWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const evs = await getEvents(familyId);
    const withProgress = await Promise.all(
      evs.map(async (ev) => {
        const tasks: Task[] = await getTasks(ev.id);
        return {
          ...ev,
          total: tasks.length,
          completed: tasks.filter((t) => t.completed).length,
        };
      })
    );
    setEvents(withProgress);
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await createEvent(familyId, { title: title.trim(), description });
    setTitle("");
    setDescription("");
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleDelete(ev: EventWithProgress) {
    if (!confirm(`「${ev.title}」を削除しますか？\n関連するタスクは手動で削除してください。`)) return;
    await deleteEvent(ev.id);
    load();
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">イベント</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          追加
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">イベントがありません</p>
          <p className="text-gray-400 text-sm mt-1">「追加」ボタンから作成してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => {
            const pct = ev.total === 0 ? 0 : Math.round((ev.completed / ev.total) * 100);
            return (
              <div key={ev.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-start justify-between">
                  <Link
                    href={`/f/${familyId}/events/${ev.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="font-semibold text-gray-800 text-base">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{ev.description}</p>
                    )}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>進捗</span>
                        <span>{ev.completed} / {ev.total} タスク ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDelete(ev)}
                    className="ml-3 text-gray-400 hover:text-red-500 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800">イベントを追加</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">イベント名 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 戸建購入、車購入"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="補足情報など"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors"
              >
                {saving ? "作成中..." : "作成する"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
