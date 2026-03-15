export type Assignee = string; // 動的メンバー名（設定で変更可能）

export interface Task {
  id: string;
  eventId: string;
  title: string;
  assignee: Assignee;
  isShared?: boolean; // true = パパ・ママどちらでもOK（先に完了した方がやればOK）
  requestedAt?: string | null; // お願い！した日時
  requestedBy?: string | null; // お願い！した人
  dueDate: string | null; // ISO date string
  completed: boolean;
  completedAt: string | null;
  memo: string;
  source: "manual" | "gmail" | "ai";
  createdAt: string;
}

export interface Event {
  id: string;
  familyId: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Family {
  id: string;
  createdAt: string;
  notifyDaysBefore: number;
  member1: string; // デフォルト "パパ"
  member2: string; // デフォルト "ママ"
}
