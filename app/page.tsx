"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const familyId = nanoid(8);
    router.replace(`/f/${familyId}/setup`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🏠</span>
        </div>
        <p className="text-gray-500 text-sm">準備中...</p>
      </div>
    </div>
  );
}
