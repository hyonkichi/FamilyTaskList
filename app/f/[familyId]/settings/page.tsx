"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getFamily, updateFamilySettings } from "@/lib/firestore";
import { useFamilyContext } from "@/lib/FamilyContext";

export default function SettingsPage() {
  const params = useParams<{ familyId: string }>();
  const familyId = params.familyId;
  const { refresh } = useFamilyContext();

  const [member1, setMember1] = useState("パパ");
  const [member2, setMember2] = useState("ママ");
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(3);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  const load = useCallback(async () => {
    const family = await getFamily(familyId);
    if (family) {
      setMember1(family.member1 ?? "パパ");
      setMember2(family.member2 ?? "ママ");
      setNotifyDaysBefore(family.notifyDaysBefore ?? 3);
    }
  }, [familyId]);

  useEffect(() => {
    load();
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, [load]);

  const familyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${familyId}`
      : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(familyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: "家族タスク管理",
        text: "家族用のタスク管理アプリです",
        url: familyUrl,
      });
    } else {
      handleCopy();
    }
  }

  async function handleSave() {
    setSaving(true);
    await updateFamilySettings(familyId, {
      member1: member1.trim() || "パパ",
      member2: member2.trim() || "ママ",
      notifyDaysBefore,
    });
    await refresh();
    setSaving(false);
    alert("設定を保存しました");
  }

  async function handleRequestNotification() {
    if (!("Notification" in window)) {
      alert("このブラウザは通知をサポートしていません");
      return;
    }
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === "granted") {
      new Notification("📋 通知を有効にしました", {
        body: "期限が近いタスクをお知らせします",
        icon: "/icon-192.png",
      });
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>

      {/* Member Names */}
      <section className="bg-white rounded-2xl card-shadow p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-1">メンバー名</h2>
        <p className="text-xs text-gray-400 mb-4">
          家族のメンバー名を変更できます
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">メンバー1</label>
            <input
              type="text"
              value={member1}
              onChange={(e) => setMember1(e.target.value)}
              maxLength={10}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors"
              placeholder="例: パパ"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">メンバー2</label>
            <input
              type="text"
              value={member2}
              onChange={(e) => setMember2(e.target.value)}
              maxLength={10}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors"
              placeholder="例: ママ"
            />
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="bg-white rounded-2xl card-shadow p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-1">通知設定</h2>
        <p className="text-xs text-gray-400 mb-4">期限の何日前に通知するか設定できます</p>

        {/* Notification permission */}
        {"Notification" in (typeof window !== "undefined" ? window : {}) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">ブラウザ通知</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {notifPermission === "granted"
                  ? "✅ 通知が有効です"
                  : notifPermission === "denied"
                  ? "❌ 通知がブロックされています"
                  : "通知は許可されていません"}
              </p>
            </div>
            {notifPermission !== "granted" && notifPermission !== "denied" && (
              <button
                onClick={handleRequestNotification}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-indigo-600 hover:to-violet-600 transition-all"
              >
                許可する
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700">期限の</label>
          <select
            value={notifyDaysBefore}
            onChange={(e) => setNotifyDaysBefore(Number(e.target.value))}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors"
          >
            {[1, 2, 3, 5, 7, 14].map((d) => (
              <option key={d} value={d}>{d}日前</option>
            ))}
          </select>
          <label className="text-sm text-gray-700">に通知</label>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-lift w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40 shadow-sm shadow-indigo-200 mb-4"
      >
        {saving ? "保存中..." : "設定を保存する"}
      </button>

      {/* Family Link */}
      <section className="bg-white rounded-2xl card-shadow p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-1">家族リンク</h2>
        <p className="text-xs text-gray-400 mb-3">
          このリンクを共有すると、同じデータを見ることができます
        </p>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-500 break-all mb-3 font-mono border border-gray-100">
          {familyUrl}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {copied ? "コピーしました！" : "リンクをコピー"}
          </button>
          <button
            onClick={handleShare}
            className="btn-lift flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-sm font-semibold"
          >
            共有
          </button>
        </div>
      </section>

      {/* App Info */}
      <section className="bg-white rounded-2xl card-shadow p-5">
        <h2 className="font-bold text-gray-900 mb-3">アプリ情報</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>バージョン</span>
            <span className="text-gray-400">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>家族ID</span>
            <span className="text-gray-400 font-mono text-xs">{familyId}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
