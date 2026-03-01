import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Task, Event, Family } from "@/types";

// ---- Family ----

export async function createFamily(familyId: string): Promise<void> {
  const family: Family = {
    id: familyId,
    createdAt: new Date().toISOString(),
    notifyDaysBefore: 3,
  };
  await setDoc(doc(db, "families", familyId), family);
}

export async function getFamily(familyId: string): Promise<Family | null> {
  const snap = await getDoc(doc(db, "families", familyId));
  return snap.exists() ? (snap.data() as Family) : null;
}

export async function updateFamilySettings(
  familyId: string,
  data: Partial<Family>
): Promise<void> {
  await updateDoc(doc(db, "families", familyId), data);
}

// ---- Events ----

export async function getEvents(familyId: string): Promise<Event[]> {
  // orderBy を使わず where のみ → 複合インデックス不要、JS側でソート
  const q = query(
    collection(db, "events"),
    where("familyId", "==", familyId)
  );
  const snap = await getDocs(q);
  const events = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event));
  // 新しい順にJS側でソート
  return events.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createEvent(
  familyId: string,
  data: Omit<Event, "id" | "familyId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "events"), {
    ...data,
    familyId,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await deleteDoc(doc(db, "events", eventId));
}

// ---- Tasks ----

export async function getTasks(eventId: string): Promise<Task[]> {
  // orderBy を使わず where のみ → 複合インデックス不要、JS側でソート
  const q = query(
    collection(db, "tasks"),
    where("eventId", "==", eventId)
  );
  const snap = await getDocs(q);
  const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
  // 古い順にJS側でソート
  return tasks.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function getTasksByFamily(familyId: string): Promise<Task[]> {
  const events = await getEvents(familyId);
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.id);
  const chunks: string[][] = [];
  for (let i = 0; i < eventIds.length; i += 10) {
    chunks.push(eventIds.slice(i, i + 10));
  }

  const tasks: Task[] = [];
  for (const chunk of chunks) {
    const q = query(
      collection(db, "tasks"),
      where("eventId", "in", chunk)
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => tasks.push({ id: d.id, ...d.data() } as Task));
  }
  return tasks;
}

export async function createTask(
  data: Omit<Task, "id" | "createdAt" | "completed" | "completedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "tasks"), {
    ...data,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateTask(
  taskId: string,
  data: Partial<Task>
): Promise<void> {
  await updateDoc(doc(db, "tasks", taskId), data);
}

export async function toggleTask(task: Task): Promise<void> {
  await updateDoc(doc(db, "tasks", task.id), {
    completed: !task.completed,
    completedAt: !task.completed ? new Date().toISOString() : null,
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, "tasks", taskId));
}
