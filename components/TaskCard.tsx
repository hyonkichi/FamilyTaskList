"use client";

import { useState } from "react";
import type { Task } from "@/types";
import { toggleTask, deleteTask } from "@/lib/firestore";
import { formatDate, getDueDateColor } from "@/lib/utils";

interface Props {
  task: Task;
  showEvent?: boolean;
  eventTitle?: string;
  onRefresh: () => void;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({ task, showEvent, eventTitle, onRefresh, onEdit }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleTask(task);
    onRefresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`「${task.title}」を削除しますか？`)) return;
    await deleteTask(task.id);
    onRefresh();
  }

  const dueDateColor = getDueDateColor(task.dueDate, task.completed);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-4 flex items-start gap-3 transition-opacity ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? "bg-indigo-500 border-indigo-500 text-white"
            : "border-gray-300 hover:border-indigo-400"
        }`}
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
          {task.title}
        </p>
        {showEvent && eventTitle && (
          <p className="text-xs text-indigo-500 mt-0.5">{eventTitle}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {task.assignee}
          </span>
          <span className={`text-xs ${dueDateColor}`}>
            {formatDate(task.dueDate)}
          </span>
        </div>
        {task.memo && (
          <p className="text-xs text-gray-500 mt-1 truncate">{task.memo}</p>
        )}
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-indigo-500 p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
