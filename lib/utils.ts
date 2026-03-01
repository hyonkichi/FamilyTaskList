export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "期限なし";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDueDateColor(dateStr: string | null, completed: boolean): string {
  if (completed) return "text-gray-400";
  if (!dateStr) return "text-gray-500";
  const days = getDaysUntil(dateStr);
  if (days === null) return "text-gray-500";
  if (days < 0) return "text-red-600 font-semibold";
  if (days <= 3) return "text-orange-500 font-semibold";
  if (days <= 7) return "text-yellow-600";
  return "text-gray-500";
}

export function sortTasksByDueDate(tasks: import("@/types").Task[]): import("@/types").Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}
