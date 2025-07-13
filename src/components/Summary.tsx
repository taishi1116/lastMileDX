'use client';

import { useEffect, useState } from 'react';
import { CourseSummary } from '@/types/delivery';

export default function Summary() {
  const [summaryData, setSummaryData] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/summary');
      if (response.ok) {
        const data = await response.json();
        setSummaryData(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSales = summaryData.reduce((sum, course) => sum + Number(course.total_sales), 0);
  const totalDeliveries = summaryData.reduce((sum, course) => sum + course.delivery_count, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">コース別サマリー</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">総コース数</p>
          <p className="text-2xl font-bold text-blue-600">{summaryData.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">総配送件数</p>
          <p className="text-2xl font-bold text-green-600">{totalDeliveries}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">総売上</p>
          <p className="text-2xl font-bold text-purple-600">¥{totalSales.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">コース番号</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">配送件数</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">売上合計</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">平均売上</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {summaryData.map((course) => {
              const avgSales = Number(course.total_sales) / course.delivery_count;
              return (
                <tr key={course.course_number} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {course.course_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {course.delivery_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    ¥{Number(course.total_sales).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    ¥{avgSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}