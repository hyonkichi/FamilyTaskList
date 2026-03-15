"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Task, Event } from "@/types";
import { getTasksByFamily, getEvents, bulkUpdateTasks } from "@/lib/firestore";
import { sortTasksByDueDate } from "@/lib/utils";
import { useFamilyContext } from "@/lib/FamilyContext";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import BulkActionBar from "@/components/BulkActionBar";

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
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const otherMember = members.find((m) => m !== assignee) ?? members[1];
  const myTasks = tasks.filter((t) => t.isShared || t.assignee === assignee);
  const incompleteTasks = sortTasksByDueDate(myTasks.filter((t) => !t.completed));
  const completedTasks = sortTasksByDueDate(myTasks.filter((t) => t.completed));
  const pct = myTasks.length === 0 ? 0 : Math.round((completedTasks.length / myTasks.length) * 100);

  const getEventTitle = (eventId: string) =>
    events.find((e) => e.id === eventId)?.title ?? "";

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function handleBulkComplete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await bulkUpdateTasks(ids, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
    exitSelectMode();
    load();
  }

  async function handleBulkDateChange(date: string | null) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await bulkUpdateTasks(ids, { dueDate: date });
    exitSelectMode();
    load();
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">マイタスク</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-400 font-medium">{incompleteTasks.length}件 未完了</p>
            {!loading && myTasks.length > 0 && !selectMode && (
              <button
                onClick={() => setSelectMode(true)}
                title="選択モード"
                className="text-gray-300 hover:text-indigo-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Assignee Toggle */}
        <div className="flex bg-gray-100/80 rounded-2xl p-1 gap-1">
          {members.map((m) => (
            <button
              key={m}
              onClick={() => { setAssignee(m); exitSelectMode(); }}
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

      {/* Progress Bar */}
      {!loading && myTasks.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{assignee}の進捗</span>
            <span>{completedTasks.length} / {myTasks.length} 完了（{pct}%）</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Task Button — 選択モード中は非表示 */}
      {events.length > 0 && !selectMode && (
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
              onEdit={selectMode ? undefined : setEditTask}
              assignTo={!selectMode && !task.isShared ? otherMember : undefined}
              assignFrom={!selectMode && !task.isShared ? assignee : undefined}
              selectable={selectMode}
              selected={selectedIds.has(task.id)}
              onSelect={toggleSelect}
            />
          ))}

          {!selectMode && completedTasks.length > 0 && (
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

          {!selectMode && showCompleted &&
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

      {/* Bulk Action Bar */}
      {selectMode && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={incompleteTasks.length}
          onSelectAll={() => setSelectedIds(new Set(incompleteTasks.map((t) => t.id)))}
          onClearAll={() => setSelectedIds(new Set())}
          onBulkComplete={handleBulkComplete}
          onBulkDateChange={handleBulkDateChange}
          onCancel={exitSelectMode}
        />
      )}
    </div>
  );
}
