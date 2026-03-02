"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Task, Event } from "@/types";
import { getTasksByFamily, getEvents } from "@/lib/firestore";
import { sortTasksByDueDate } from "@/lib/utils";
import { useFamilyContext } from "@/lib/FamilyContext";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";

export default function MyTasksPage() {
  const params = useParams<{ familyId: string }>();
  const familyId = params.familyId;
  const { members } = useFamilyContext();

  const [assignee, setAssignee] = useState(members[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [addEventId, setAddEventId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // membersがFirestoreから読み込まれたとき担当者を更新
  useEffect(() => {
    setAssignee(members[0]);
  }, [members]);

  const load = useCallback(async () => {
    const [allTasks, allEvents] = await Promise.all([
      getTasksByFamily(familyId),
      getEvents(familyId),
    ]);
    setTasks(allTasks);
    setEvents(allEvents);
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  const myTasks = tasks.filter((t) => t.assignee === assignee);
  const incompleteTasks = sortTasksByDueDate(myTasks.filter((t) => !t.completed));
  const completedTasks = sortTasksByDueDate(myTasks.filter((t) => t.completed));

  const getEventTitle = (eventId: string) =>
    events.find((e) => e.id === eventId)?.title ?? "";

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">マイタスク</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">{incompleteTasks.length}件 未完了</p>
        </div>
        {/* Assignee Toggle */}
        <div className="flex bg-gray-100/80 rounded-2xl p-1 gap-1">
          {members.map((m) => (
            <button
              key={m}
              onClick={() => setAssignee(m)}
              className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                assignee === m
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Button */}
      {events.length > 0 && (
        <div className="mb-4">
          <select
            onChange={(e) => {
              if (e.target.value) setAddEventId(e.target.value);
              e.target.value = "";
            }}
            className="w-full border border-indigo-100 bg-indigo-50/60 text-indigo-600 rounded-2xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors"
            defaultValue=""
          >
            <option value="" disabled>＋ タスクを追加（イベントを選択）</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : incompleteTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-gray-500 font-medium">タスクがありません</p>
          <p className="text-gray-400 text-sm mt-1">
            イベントを作成してタスクを追加しましょう
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {incompleteTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showEvent
              eventTitle={getEventTitle(task.eventId)}
              onRefresh={load}
              onEdit={setEditTask}
            />
          ))}

          {completedTasks.length > 0 && (
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full py-2 text-xs font-medium text-gray-400 flex items-center gap-2 justify-center hover:text-gray-600 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showCompleted ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              完了済み {completedTasks.length}件
            </button>
          )}

          {showCompleted &&
            completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showEvent
                eventTitle={getEventTitle(task.eventId)}
                onRefresh={load}
                onEdit={setEditTask}
              />
            ))}
        </div>
      )}

      {/* Task Form Modal */}
      {addEventId && (
        <TaskForm
          eventId={addEventId}
          onClose={() => setAddEventId(null)}
          onSaved={load}
        />
      )}
      {editTask && (
        <TaskForm
          eventId={editTask.eventId}
          editTask={editTask}
          onClose={() => setEditTask(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
