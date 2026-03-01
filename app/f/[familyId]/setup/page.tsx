"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createFamily, getFamily } from "@/lib/firestore";

export default function SetupPage() {
  const params = useParams<{ familyId: string }>();
  const familyId = params.familyId;
  const router = useRouter();
  const [creating, setCreating] = useState(true);

  useEffect(() => {
    async function init() {
      const existing = await getFamily(familyId);
      if (existing) {
        // Family already exists, go to main page
        router.replace(`/f/${familyId}`);
        return;
      }
      await createFamily(familyId);
      router.replace(`/f/${familyId}`);
    }
    init().catch(() => setCreating(false));
  }, [familyId, router]);

  if (!creating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-2">接続エラーが発生しました</p>
          <p className="text-gray-500 text-sm">Firebase の設定を確認してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-2xl">🏠</span>
        </div>
        <p className="text-gray-600 font-medium">家族スペースを作成中...</p>
      </div>
    </div>
  );
}
