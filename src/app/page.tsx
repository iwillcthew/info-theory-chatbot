'use client'

import { useState, useEffect } from 'react'
import ChatInterface from '@/components/ChatInterface'
import ClientFileProcessor from '@/components/ClientFileProcessor'
import { DocumentInfo } from '@/services/openrouter-api'

export default function Home() {
  const [selectedChunks, setSelectedChunks] = useState<string[]>([])
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo[]>([])
  
  const handleProcessedFilesChange = (chunks: string[], docInfo: DocumentInfo[]) => {
    console.log(`Page: Received ${chunks.length} document chunks from processor`);
    console.log(`Page: Received info for ${docInfo.length} documents:`, docInfo.map(d => d.name).join(', '));
    setSelectedChunks(chunks);
    setDocumentInfo(docInfo);
  };
  
  useEffect(() => {
    console.log(`Page: Selected chunks updated, now has ${selectedChunks.length} chunks from ${documentInfo.length} documents`);
  }, [selectedChunks, documentInfo]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Trợ lý Lý thuyết Thông tin</h1>
        <p className="text-sm mt-1">Ứng dụng chat thông minh sử dụng các mô hình AI hàng đầu</p>
      </header>
      
      <div className="flex flex-1 p-4">
        <div className="w-1/4 bg-gray-100 rounded-lg mr-4 p-4">
          <div className="bg-yellow-100 p-3 mb-4 rounded-lg border border-yellow-300">
            <h3 className="font-semibold text-yellow-800">Hướng dẫn sử dụng</h3>
            <ol className="list-decimal pl-5 text-sm mt-2 text-yellow-700 space-y-1">
              <li><b>Hỏi đáp:</b> Tìm hiểu kiến thức Lý thuyết Thông tin nhanh chóng.</li>
              <li><b>Luyện tập:</b> Làm bài tập trắc nghiệm để củng cố kiến thức.</li>
              <li><b>Tài liệu:</b> Chọn hoặc bỏ chọn tài liệu để AI trả lời dựa trên nội dung được chọn.</li>
              <li><b>Tra cứu:</b> Xem tóm tắt công thức và tài liệu học tập qua các nút chức năng.</li>
            </ol>
          </div>
          
          <ClientFileProcessor onProcessedFilesChange={handleProcessedFilesChange} />
        </div>
        
        {/* Main chat interface */}
        <div className="w-3/4 bg-white p-4 rounded-lg shadow">
          <ChatInterface 
            initialTextChunks={selectedChunks} 
            documentInfo={documentInfo}
          />
        </div>
      </div>
    </div>
  )
} 