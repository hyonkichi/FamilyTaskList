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

        // 期限近日タスクの通知
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

        // お願い！依頼通知（前回チェック以降に届いた依頼を検出）
        const lastRequestCheck = localStorage.getItem("last_request_check");
        const lastRequestTime = lastRequestCheck ? parseInt(lastRequestCheck, 10) : 0;
        const newRequests = tasks.filter((t) => {
          if (t.completed || !t.requestedAt) return false;
          return new Date(t.requestedAt).getTime() > lastRequestTime;
        });
        for (const task of newRequests) {
          new Notification("🙏 タスクの依頼が届きました", {
            body: `${task.requestedBy}から「${task.title}」のお願いが届いています（担当: ${task.assignee}）`,
            icon: "/icon-192.png",
          });
        }
        localStorage.setItem("last_request_check", String(now.getTime()));

        localStorage.setItem("notif_check_date", today);
      } catch {
        // 通知エラーは無視
      }
    }

    checkUpcoming();
  }, [familyId, notifyDaysBefore]);

  return null;
}
