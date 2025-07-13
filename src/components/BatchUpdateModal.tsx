'use client';

import { useState } from 'react';
import { DeliveryPoint } from '@/types/delivery';

interface BatchUpdateModalProps {
  selectedPoints: DeliveryPoint[];
  onClose: () => void;
  onUpdate: (courseNumber: string) => Promise<void>;
}

export default function BatchUpdateModal({ selectedPoints, onClose, onUpdate }: BatchUpdateModalProps) {
  const [courseNumber, setCourseNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!courseNumber) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(courseNumber);
      onClose();
    } catch (error) {
      console.error('Batch update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">コース番号一括変更</h2>
        
        <p className="mb-4 text-gray-600">
          選択された{selectedPoints.length}件の配送先のコース番号を変更します。
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            新しいコース番号
          </label>
          <input
            type="text"
            value={courseNumber}
            onChange={(e) => setCourseNumber(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="例: 1, 2, A..."
            autoFocus
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={isUpdating}
          >
            キャンセル
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!courseNumber || isUpdating}
          >
            {isUpdating ? '更新中...' : '更新'}
          </button>
        </div>
      </div>
    </div>
  );
}