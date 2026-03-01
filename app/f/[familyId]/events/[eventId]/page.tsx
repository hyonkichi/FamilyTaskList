"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Task, Event } from "@/types";
import { getTasks, getEvents } from "@/lib/firestore";
import { sortTasksByDueDate } from "@/lib/utils";
import { useFamilyContext } from "@/lib/FamilyContext";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";

export default function EventDetailPage() {
  const params = useParams<{ familyId: string; eventId: string }>();
  const { familyId, eventId } = params;
  const { members } = useFamilyContext();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string>("全員");

  const load = useCallback(async () => {
    const [allTasks, allEvents] = await Promise.all([
      getTasks(eventId),
      getEvents(familyId),
    ]);
    setTasks(allTasks);
    setEvent(allEvents.find((e) => e.id === eventId) ?? null);
    setLoading(false);
  }, [eventId, familyId]);

  useEffect(() => {
    load();
  }, [load]);

  const filterOptions = ["全員", ...members];
  const filtered =
    filterAssignee === "全員" ? tasks : tasks.filter((t) => t.assignee === filterAssignee);
  const incomplete = sortTasksByDueDate(filtered.filter((t) => !t.completed));
  const completed = sortTasksByDueDate(filtered.filter((t) => t.completed));
  const pct = tasks.length === 0 ? 0 : Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/f/${familyId}/events`} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-800 flex-1 truncate">
          {event?.title ?? "イベント詳細"}
        </h1>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>全体進捗</span>
          <span>{tasks.filter((t) => t.completed).length} / {tasks.length} 完了 ({pct}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-500 h-2.5 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Filter + Add */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {filterOptions.map((a) => (
            <button
              key={a}
              onClick={() => setFilterAssignee(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterAssignee === a
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          タスク追加
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-gray-500 font-medium">タスクがありません</p>
          <p className="text-gray-400 text-sm mt-1">「タスク追加」ボタンから追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incomplete.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onRefresh={load}
              onEdit={setEditTask}
            />
          ))}
          {completed.length > 0 && (
            <>
              <p className="text-xs text-gray-400 pt-2 font-medium">完了済み</p>
              {completed.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onRefresh={load}
                  onEdit={setEditTask}
                />
              ))}
            </>
          )}
        </div>
      )}

      {showForm && (
        <TaskForm
          eventId={eventId}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}
      {editTask && (
        <TaskForm
          eventId={eventId}
          editTask={editTask}
          onClose={() => setEditTask(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
