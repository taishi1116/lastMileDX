'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from '@/components/FileUpload';
import BatchUpdateModal from '@/components/BatchUpdateModal';
import Summary from '@/components/Summary';
import { DeliveryPoint } from '@/types/delivery';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<DeliveryPoint[]>([]);
  const [showBatchUpdate, setShowBatchUpdate] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'summary'>('map');
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  useEffect(() => {
    fetchDeliveryPoints();
  }, []);

  const fetchDeliveryPoints = async () => {
    try {
      const response = await fetch('/api/delivery-points');
      if (response.ok) {
        const data = await response.json();
        setDeliveryPoints(data);
      }
    } catch (error) {
      console.error('Error fetching delivery points:', error);
    }
  };

  const handleUpdateCourse = async (id: number, courseNumber: string) => {
    try {
      const response = await fetch('/api/delivery-points', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, course_number: courseNumber }),
      });

      if (response.ok) {
        await fetchDeliveryPoints();
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleBatchUpdate = async (courseNumber: string) => {
    const ids = selectedPoints.map(p => p.id).filter(Boolean) as number[];
    
    try {
      const response = await fetch('/api/delivery-points/batch-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, course_number: courseNumber }),
      });

      if (response.ok) {
        await fetchDeliveryPoints();
        setSelectedPoints([]);
      }
    } catch (error) {
      console.error('Error batch updating:', error);
    }
  };

  const handleDownloadCSV = (courseNumber?: string) => {
    const url = courseNumber 
      ? `/api/download-csv?course=${courseNumber}`
      : '/api/download-csv';
    
    window.open(url, '_blank');
  };

  const uniqueCourses = Array.from(new Set(deliveryPoints.map(p => p.course_number))).sort();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">野菜配送ルート管理システム</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <FileUpload onUploadSuccess={fetchDeliveryPoints} />
        </div>

        <div className="mb-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('map')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'map'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                マップ画面
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                サマリー確認
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'map' && (
          <>
            <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-medium">CSV ダウンロード:</h3>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="border rounded px-3 py-1"
                  >
                    <option value="">全コース</option>
                    {uniqueCourses.map(course => (
                      <option key={course} value={course}>
                        コース {course}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDownloadCSV(selectedCourse)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    ダウンロード
                  </button>
                </div>
                
                {selectedPoints.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedPoints.length}件選択中
                    </span>
                    <button
                      onClick={() => setShowBatchUpdate(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      一括コース変更
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md" style={{ height: '600px' }}>
              <Map
                deliveryPoints={deliveryPoints}
                onUpdateCourse={handleUpdateCourse}
                onSelectPoints={setSelectedPoints}
              />
            </div>
          </>
        )}

        {activeTab === 'summary' && (
          <Summary />
        )}

        {showBatchUpdate && (
          <BatchUpdateModal
            selectedPoints={selectedPoints}
            onClose={() => setShowBatchUpdate(false)}
            onUpdate={handleBatchUpdate}
          />
        )}
      </main>
    </div>
  );
}