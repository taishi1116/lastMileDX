'use client';

import { useState } from 'react';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`CSVファイルが正常にアップロードされました。${data.count}件のデータを登録しました。`);
        
        setMessage('住所のジオコーディングを開始します...');
        const geocodeResponse = await fetch('/api/geocode', {
          method: 'POST',
        });
        
        const geocodeData = await geocodeResponse.json();
        setMessage(`アップロード完了。${geocodeData.updated}/${geocodeData.total}件の住所をジオコーディングしました。`);
        
        onUploadSuccess();
      } else {
        setMessage(`エラー: ${data.error}`);
      }
    } catch (error) {
      setMessage('アップロード中にエラーが発生しました。');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">CSVファイルアップロード</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          必須カラム: course_number, customer_name, customer_code, address, sales
        </p>
      </div>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-50"
      />

      {isUploading && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('エラー') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}