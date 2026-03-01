export type Assignee = "奈" | "旦";

export interface Task {
  id: string;
  eventId: string;
  title: string;
  assignee: Assignee;
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
}
