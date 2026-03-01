"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Task } from "@/types";
import { getTasksByFamily, getEvents } from "@/lib/firestore";
import { useFamilyContext } from "@/lib/FamilyContext";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

export default function CalendarPage() {
  const params = useParams<{ familyId: string }>();
  const { familyId } = params;
  const { member1, member2 } = useFamilyContext();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [allTasks, allEvents] = await Promise.all([
      getTasksByFamily(familyId),
      getEvents(familyId),
    ]);
    setTasks(allTasks);
    setEvents(allEvents.map((e) => ({ id: e.id, title: e.title })));
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Build task map: day -> incomplete tasks with dueDate in this month
  const tasksByDay: Record<number, Task[]> = {};
  for (const task of tasks) {
    if (!task.dueDate || task.completed) continue;
    const d = new Date(task.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(task);
    }
  }

  const selectedTasks = selectedDay ? (tasksByDay[selectedDay] ?? []) : [];
  const getEventTitle = (eventId: string) =>
    events.find((e) => e.id === eventId)?.title ?? "";

  const totalTasksThisMonth = Object.values(tasksByDay).flat().length;
  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">カレンダー</h1>
        {totalTasksThisMonth > 0 && (
          <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {totalTasksThisMonth}件の期限
          </span>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl shadow-sm border px-4 py-3">
        <button
          onClick={prevMonth}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="font-semibold text-gray-800">
          {year}年{month + 1}月
        </span>
        <button
          onClick={nextMonth}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-medium py-1 ${
                i === 0
                  ? "text-red-400"
                  : i === 6
                  ? "text-blue-400"
                  : "text-gray-500"
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayTasks = tasksByDay[day] ?? [];
            const colIndex = (i + firstDay) % 7;
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === day;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`flex flex-col items-center py-1 rounded-lg transition-all ${
                  isSelected
                    ? "bg-indigo-50 ring-2 ring-indigo-400"
                    : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium ${
                    isToday
                      ? "bg-indigo-600 text-white"
                      : colIndex === 0
                      ? "text-red-500"
                      : colIndex === 6
                      ? "text-blue-500"
                      : "text-gray-700"
                  }`}
                >
                  {day}
                </span>
                {/* Task dots */}
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[28px]">
                    {dayTasks.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.assignee === member1 ? "bg-pink-400" : "bg-blue-400"
                        }`}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-gray-400 leading-none">
                        +
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" />
          <span className="text-xs text-gray-500">{member1}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
          <span className="text-xs text-gray-500">{member2}</span>
        </div>
      </div>

      {/* Selected day task list */}
      {selectedDay !== null && (
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">
            {month + 1}月{selectedDay}日のタスク
          </h2>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              この日のタスクはありません
            </p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-2 border-b last:border-b-0"
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.assignee === member1
                        ? "bg-pink-400"
                        : "bg-blue-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getEventTitle(task.eventId)} · {task.assignee}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
