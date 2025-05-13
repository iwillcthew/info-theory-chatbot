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
      const formData = new FormData()
      formData.append('file', file)
      
      // Use the fetch API to send the data to our API endpoint
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData
      })
      
      // First check if we got JSON response
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError)
        // If server returned non-JSON response (like HTML error page)
        const text = await response.text()
        throw new Error(`Lỗi máy chủ: Phản hồi không hợp lệ (${text.substring(0, 100)}...)`)
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Lỗi máy chủ: ${response.status} ${response.statusText}`)
      }
      
      // Make sure we have text data
      if (!data.text) {
        throw new Error('Không thể trích xuất nội dung từ tài liệu')
      }
      
      // Split the extracted text into chunks safely
      try {
        const textChunks = splitTextIntoChunks(data.text || '', 1000, 200)
        
        // Make sure we have at least one chunk
        if (!textChunks || textChunks.length === 0) {
          throw new Error('Không thể phân tách văn bản thành các phần')
        }
        
        // Call the callback with the processed chunks
        onProcessed(textChunks)
      } catch (chunkError) {
        console.error('Error splitting text into chunks:', chunkError)
        throw new Error('Lỗi khi xử lý văn bản')
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