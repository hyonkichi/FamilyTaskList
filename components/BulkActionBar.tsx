"use client";

import { useState } from "react";

interface Props {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearAll: () => void;
  onBulkComplete: () => void;
  onBulkDateChange: (date: string | null) => void;
  onCancel: () => void;
}

export default function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearAll,
  onBulkComplete,
  onBulkDateChange,
  onCancel,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState("");
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <>
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              期限を一括変更（{selectedCount}件）
            </h3>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onBulkDateChange(null);
                  setShowDatePicker(false);
                  setDate("");
                }}
                className="flex-1 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                期限なしにする
              </button>
              <button
                onClick={() => {
                  if (date) {
                    onBulkDateChange(date);
                    setShowDatePicker(false);
                    setDate("");
                  }
                }}
                disabled={!date}
                className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 text-white disabled:opacity-40 transition-all"
              >
                変更する
              </button>
            </div>
            <button
              onClick={() => setShowDatePicker(false)}
              className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-2 w-full max-w-lg">
          <span className="text-white text-sm font-semibold flex-shrink-0">
            {selectedCount}件選択
          </span>
          <button
            onClick={allSelected ? onClearAll : onSelectAll}
            className="text-xs text-indigo-300 hover:text-indigo-100 flex-shrink-0 transition-colors"
          >
            {allSelected ? "全解除" : "全選択"}
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setShowDatePicker(true)}
            disabled={selectedCount === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-40 transition-colors flex-shrink-0"
          >
            日付変更
          </button>
          <button
            onClick={onBulkComplete}
            disabled={selectedCount === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 text-white disabled:opacity-40 hover:from-indigo-600 hover:to-violet-600 transition-all flex-shrink-0"
          >
            一括完了
          </button>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-1 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
