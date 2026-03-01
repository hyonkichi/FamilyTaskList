"use client";

import { useEffect } from "react";
import { useFamilyContext } from "@/lib/FamilyContext";
import { getTasksByFamily } from "@/lib/firestore";

export default function NotificationChecker({ familyId }: { familyId: string }) {
  const { notifyDaysBefore } = useFamilyContext();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    // 1日1回だけチェック
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("notif_check_date");
    if (lastCheck === today) return;

    async function checkUpcoming() {
      try {
        const tasks = await getTasksByFamily(familyId);
        const now = new Date();
        const upcoming = tasks.filter((t) => {
          if (t.completed || !t.dueDate) return false;
          const due = new Date(t.dueDate);
          const diffDays = Math.ceil(
            (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return diffDays >= 0 && diffDays <= notifyDaysBefore;
        });

        for (const task of upcoming) {
          const due = new Date(task.dueDate!);
          const diffDays = Math.ceil(
            (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          const dayText = diffDays === 0 ? "今日" : `${diffDays}日後`;
          new Notification("📋 期限が近いタスクがあります", {
            body: `「${task.title}」の期限は${dayText}です（担当: ${task.assignee}）`,
            icon: "/icon-192.png",
          });
        }

        localStorage.setItem("notif_check_date", today);
      } catch {
        // 通知エラーは無視
      }
    }

    checkUpcoming();
  }, [familyId, notifyDaysBefore]);

  return null;
}
