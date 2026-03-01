"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getFamily, updateFamilySettings } from "@/lib/firestore";

export default function SettingsPage() {
  const params = useParams<{ familyId: string }>();
  const familyId = params.familyId;

  const [notifyDaysBefore, setNotifyDaysBefore] = useState(3);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const family = await getFamily(familyId);
    if (family) setNotifyDaysBefore(family.notifyDaysBefore ?? 3);
  }, [familyId]);

  useEffect(() => {
    load();
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

  async function handleSave() {
    setSaving(true);
    await updateFamilySettings(familyId, { notifyDaysBefore });
    setSaving(false);
    alert("設定を保存しました");
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

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>

      {/* Family Link */}
      <section className="bg-white rounded-xl shadow-sm border p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-1">家族リンク</h2>
        <p className="text-xs text-gray-500 mb-3">
          このリンクを共有すると、同じデータを見ることができます
        </p>
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-600 break-all mb-3 font-mono">
          {familyUrl}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {copied ? "コピーしました！" : "リンクをコピー"}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            共有
          </button>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="bg-white rounded-xl shadow-sm border p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-1">通知設定</h2>
        <p className="text-xs text-gray-500 mb-4">期限の何日前に通知するか設定できます</p>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700">期限の</label>
          <select
            value={notifyDaysBefore}
            onChange={(e) => setNotifyDaysBefore(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {[1, 2, 3, 5, 7, 14].map((d) => (
              <option key={d} value={d}>{d}日前</option>
            ))}
          </select>
          <label className="text-sm text-gray-700">に通知</label>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </section>

      {/* App Info */}
      <section className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold text-gray-800 mb-3">アプリ情報</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>バージョン</span>
            <span className="text-gray-400">1.0.0</span>
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
