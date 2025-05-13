'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { splitTextIntoChunks } from '@/utils/text-processor'

interface FileUploaderProps {
  onProcessed: (textChunks: string[]) => void
}

export default function FileUploader({ onProcessed }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return;
    
    // Check if the file type is supported
    const fileType = selectedFile?.type || '';
    
    if (!fileType.includes('pdf') && 
        !fileType.includes('image/') && 
        !fileType.includes('msword') && 
        !fileType.includes('officedocument.wordprocessingml')) {
      setError('Vui lòng tải lên file PDF, ảnh, hoặc tài liệu Word')
      return
    }
    
    setFile(selectedFile)
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  })

  const processFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)
    
    try {
      console.log('Processing file:', file.name, 'Type:', file.type);
      
      const formData = new FormData()
      formData.append('file', file)
      
      // Use the fetch API with absolute URL path to ensure correct routing
      console.log('Sending file to API endpoint');
      const apiUrl = `/api/process-pdf`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      })
      
      // First get the response text to avoid reading the stream twice
      const responseText = await response.text();
      console.log('Response status:', response.status, response.statusText);
      
      // Log headers in a safe way that works with TypeScript
      const headerObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headerObj[key] = value;
      });
      console.log('Response headers:', headerObj);
      
      // Log the first part of the response for debugging
      console.log('Response beginning:', responseText.substring(0, 200));
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('API response parsed as JSON successfully');
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        console.error('Raw response first 500 chars:', responseText.substring(0, 500));
        // Check if it's an HTML response (typically an error page)
        if (responseText.toLowerCase().includes('<!doctype html>') || responseText.toLowerCase().includes('<html')) {
          throw new Error(`Lỗi máy chủ: API trả về trang HTML thay vì JSON. Có thể là lỗi định tuyến hoặc lỗi máy chủ.`);
        } else {
          throw new Error(`Lỗi máy chủ: Phản hồi không hợp lệ. Không thể xử lý dữ liệu JSON.`);
        }
      }
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || `Lỗi máy chủ: ${response.status} ${response.statusText}`);
      }
      
      // Make sure we have text data
      if (!data.text) {
        console.error('No text data in response');
        throw new Error('Không thể trích xuất nội dung từ tài liệu');
      }
      
      // Split the extracted text into chunks safely
      try {
        console.log('Splitting text into chunks');
        const textChunks = splitTextIntoChunks(data.text || '', 1000, 200);
        
        // Make sure we have at least one chunk
        if (!textChunks || textChunks.length === 0) {
          console.error('No text chunks created');
          throw new Error('Không thể phân tách văn bản thành các phần');
        }
        
        console.log(`Created ${textChunks.length} text chunks`);
        
        // Call the callback with the processed chunks
        onProcessed(textChunks);
      } catch (chunkError) {
        console.error('Error splitting text into chunks:', chunkError);
        throw new Error('Lỗi khi xử lý văn bản');
      }
    } catch (err) {
      console.error('Error processing file:', err)
      setError(err instanceof Error ? err.message : 'Xử lý tài liệu thất bại')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Get file type icon
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image/')) return '🖼️';
    if (fileType.includes('msword') || fileType.includes('officedocument.wordprocessingml')) return '📝';
    return '📁';
  }

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-semibold">Tải lên tài liệu</h2>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Thả file ở đây...</p>
        ) : (
          <div>
            <p>Kéo và thả file vào đây, hoặc click để chọn file</p>
            <p className="text-sm text-gray-500 mt-1">Hỗ trợ: PDF, hình ảnh, và tài liệu Word</p>
          </div>
        )}
      </div>
      
      {file && (
        <div className="bg-gray-200 p-2 rounded flex items-center">
          <span className="mr-2">{getFileIcon(file.type)}</span>
          <p className="truncate">{file.name}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={processFile}
        disabled={!file || isProcessing}
        className={`py-2 px-4 rounded font-medium ${
          !file || isProcessing
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isProcessing ? 'Đang xử lý...' : 'Xử lý tài liệu'}
      </button>
    </div>
  )
} 