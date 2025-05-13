'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { splitTextIntoChunks } from '@/utils/text-processor'
import { preloadedDocuments, preloadedDocumentChunks, getAllPreloadedChunks } from '@/utils/preloaded-documents'
import { DocumentInfo } from '@/services/openrouter-api'

interface ProcessedFile {
  id: string;
  name: string;
  chunks: string[];
  selected: boolean;
  pageCount: number;
}

interface PreloadedDocument {
  id: string;
  name: string;
  description: string;
  chunkCount: number;
  pageCount: number;
  selected?: boolean;
}

interface ClientFileProcessorProps {
  onProcessedFilesChange: (
    selectedChunks: string[], 
    documentInfo: DocumentInfo[]
  ) => void;
}

const MAX_FILES = 5;

export default function ClientFileProcessor({ onProcessedFilesChange }: ClientFileProcessorProps) {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [preloadedDocs, setPreloadedDocs] = useState<PreloadedDocument[]>([]);

  // Initialize preloaded documents on component mount
  useEffect(() => {
    // Initialize preloaded documents with selected = true
    setPreloadedDocs(
      preloadedDocuments.map(doc => ({
        ...doc,
        selected: true
      }))
    );
    
    // Update parent component with preloaded chunks
    const initialPreloaded = preloadedDocuments.map(doc => ({ ...doc, selected: true }));
    updateSelectedChunks([], initialPreloaded);
  }, []);

  // Update the parent component with chunks from selected files whenever selection changes
  const updateSelectedChunks = useCallback((files: ProcessedFile[], preloadedSelections: PreloadedDocument[]) => {
    // Get chunks from uploaded files
    const uploadedChunks = files
      .filter(file => file.selected)
      .flatMap(file => file.chunks);
    
    // Prepare document information for selected uploaded files
    const uploadedDocInfo: DocumentInfo[] = files
      .filter(file => file.selected)
      .map(file => ({
        id: file.id,
        name: file.name,
        type: 'user-uploaded',
        pageCount: file.pageCount
      }));
    
    // Get chunks from selected preloaded documents
    const selectedPreloadedDocs = preloadedSelections.filter(doc => doc.selected);
    
    // Prepare document information for selected preloaded documents
    const preloadedDocInfo: DocumentInfo[] = selectedPreloadedDocs.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: 'preloaded',
      pageCount: doc.pageCount
    }));
    
    let preloadedChunks: string[] = [];
    
    if (selectedPreloadedDocs.length > 0) {
      // Get specific chunks for each selected preloaded document
      preloadedChunks = getAllPreloadedChunks(selectedPreloadedDocs.map(doc => doc.id));
    }
    
    // Combine both sources
    const allSelectedChunks = [...uploadedChunks, ...preloadedChunks];
    const allDocInfo = [...uploadedDocInfo, ...preloadedDocInfo];
    
    console.log(`Sending ${allSelectedChunks.length} chunks from ${allDocInfo.length} documents`);
    console.log('Document info:', allDocInfo.map(doc => doc.name).join(', '));
    
    onProcessedFilesChange(allSelectedChunks, allDocInfo);
  }, [onProcessedFilesChange]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isProcessing) return;
    
    if (processedFiles.length + acceptedFiles.length > MAX_FILES) {
      setError(`Chỉ có thể tải lên tối đa ${MAX_FILES} tài liệu. Vui lòng xóa bớt tài liệu hiện tại.`);
      return;
    }

    setError(null);
    
    // Filter to only allow PDFs
    const pdfFiles = acceptedFiles.filter(file => file.type.includes('pdf'));
    
    if (pdfFiles.length === 0) {
      setError('Chỉ hỗ trợ file PDF. Vui lòng tải lên file định dạng PDF.');
      return;
    }
    
    // Process each PDF file
    for (const file of pdfFiles) {
      setIsProcessing(true);
      setProcessingFile(file.name);
      setProgress(0);
      
      try {
        console.log('Processing PDF file:', file.name, 'Size:', Math.round(file.size / 1024), 'KB');
        
        // Process PDF using PDF.js
        const { text, pageCount } = await extractTextFromPdf(file, (p) => setProgress(p));
        
        if (!text || text.trim().length === 0) {
          console.error('No text extracted from PDF:', file.name);
          throw new Error(`Không thể trích xuất văn bản từ tài liệu "${file.name}"`);
        }
        
        console.log(`Successfully extracted ${text.length} characters from PDF (${pageCount} pages)`);
        
        // Split into chunks for processing
        const textChunks = splitTextIntoChunks(text, 1000, 200);
        
        if (!textChunks || textChunks.length === 0) {
          console.error('Failed to split text into chunks:', file.name);
          throw new Error(`Không thể phân tách văn bản thành các phần từ tài liệu "${file.name}"`);
        }
        
        console.log(`Created ${textChunks.length} text chunks from ${file.name}`);
        console.log('Sample text from first chunk:', textChunks[0].substring(0, 100) + '...');
        
        // Add the processed file
        const newFile: ProcessedFile = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          name: file.name,
          chunks: textChunks,
          selected: true, // Selected by default
          pageCount
        };
        
        setProcessedFiles(prev => {
          const updatedFiles = [...prev, newFile];
          // Update selected chunks in the parent component
          updateSelectedChunks(updatedFiles, preloadedDocs);
          return updatedFiles;
        });
        
      } catch (err) {
        console.error('Error processing file:', err);
        setError(err instanceof Error ? err.message : 'Xử lý tài liệu thất bại');
      } finally {
        setIsProcessing(false);
        setProcessingFile(null);
      }
    }
  }, [isProcessing, processedFiles.length, updateSelectedChunks, preloadedDocs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: MAX_FILES,
    disabled: isProcessing
  });

  // Toggle file selection
  const toggleFileSelection = (id: string) => {
    setProcessedFiles(prevFiles => {
      const updatedFiles = prevFiles.map(file => 
        file.id === id ? { ...file, selected: !file.selected } : file
      );
      
      // Update selected chunks in the parent component
      updateSelectedChunks(updatedFiles, preloadedDocs);
      
      // Trigger MathJax rendering after selection changes (if available)
      setTimeout(() => {
        if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
          try {
            console.log('Re-running MathJax typeset after file selection change');
            (window as any).MathJax.typesetPromise();
          } catch (err) {
            console.error('Error running MathJax typeset:', err);
          }
        }
      }, 100);
      
      return updatedFiles;
    });
  };

  // Remove a file
  const removeFile = (id: string) => {
    setProcessedFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file.id !== id);
      
      // Update selected chunks in the parent component
      updateSelectedChunks(updatedFiles, preloadedDocs);
      
      // Trigger MathJax rendering after file removal (if available)
      setTimeout(() => {
        if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
          try {
            console.log('Re-running MathJax typeset after file removal');
            (window as any).MathJax.typesetPromise();
          } catch (err) {
            console.error('Error running MathJax typeset:', err);
          }
        }
      }, 100);
      
      return updatedFiles;
    });
  };
  
  // Toggle preloaded document selection
  const togglePreloadedSelection = (id: string) => {
    setPreloadedDocs(prevDocs => {
      const updatedDocs = prevDocs.map(doc => 
        doc.id === id ? { ...doc, selected: !doc.selected } : doc
      );
      
      // Update selected chunks in the parent component
      updateSelectedChunks(processedFiles, updatedDocs);
      
      // Trigger MathJax rendering after selection changes (if available)
      setTimeout(() => {
        if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
          try {
            console.log('Re-running MathJax typeset after preloaded doc selection change');
            (window as any).MathJax.typesetPromise();
          } catch (err) {
            console.error('Error running MathJax typeset:', err);
          }
        }
      }, 100);
      
      return updatedDocs;
    });
  };
  
  // Extract text from PDF using PDF.js
  const extractTextFromPdf = async (file: File, progressCallback: (progress: number) => void): Promise<{text: string, pageCount: number}> => {
    // Load PDF.js script if needed
    if (!(window as any).pdfjsLib) {
      await loadPdfJsScript();
    }
    
    const pdfjsLib = (window as any).pdfjsLib;
    
    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const numPages = pdf.numPages;
      let fullText = '';
      
      console.log(`PDF loaded successfully. Processing ${numPages} pages...`);
      
      // Process each page
      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Extract text from page
          const pageText = textContent.items
            .filter((item: any) => item.str !== undefined)
            .map((item: any) => item.str)
            .join(' ');
            
          fullText += pageText + '\n\n';
          
          console.log(`Processed page ${i}/${numPages}, text length: ${pageText.length} chars`);
          
          // Update progress
          progressCallback(Math.round((i / numPages) * 100));
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          // Continue with next page
        }
      }
      
      // Check if we got any text content
      if (fullText.trim().length === 0) {
        console.log('No text extracted using standard method, trying fallback extraction...');
        // If no text was extracted, the PDF might be scanned or have other issues
        // We can attempt a different approach here
        fullText = await fallbackPdfExtraction(pdf, numPages, progressCallback);
      }
      
      console.log(`Total extracted text length: ${fullText.length} characters`);
      return { text: fullText, pageCount: numPages };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Lỗi khi trích xuất văn bản từ PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Fallback extraction method for challenging PDFs
  const fallbackPdfExtraction = async (
    pdf: any, 
    numPages: number, 
    progressCallback: (progress: number) => void
  ): Promise<string> => {
    let fullText = '';
    
    // Try to extract text using the canvas rendering method
    const pdfjsLib = (window as any).pdfjsLib;
    
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        
        // Get viewport and prepare canvas
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          console.error('Could not get canvas context');
          continue;
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render the page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // For now, just add a placeholder
        fullText += `[Content from page ${i} - image rendering not fully implemented]\n\n`;
        
        // Update progress
        progressCallback(Math.round((i / numPages) * 100));
      } catch (pageError) {
        console.error(`Error in fallback processing for page ${i}:`, pageError);
      }
    }
    
    return fullText;
  };
  
  // Load PDF.js script from CDN
  const loadPdfJsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if PDF.js is already loaded
      if ((window as any).pdfjsLib) {
        console.log('PDF.js is already loaded');
        resolve();
        return;
      }

      console.log('Loading PDF.js library...');
      
      // Define PDF.js version for consistent loading
      const PDFJS_VERSION = '3.4.120';
      
      // Load PDF.js library
      const script = document.createElement('script');
      script.src = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.js`;
      script.async = true;
      
      // Set a timeout in case the script loading hangs
      const timeout = setTimeout(() => {
        if (!(window as any).pdfjsLib) {
          console.error('PDF.js library loading timed out');
          reject(new Error('Tải thư viện PDF.js quá thời gian. Vui lòng thử lại.'));
        }
      }, 10000); // 10 seconds timeout
      
      script.onload = () => {
        clearTimeout(timeout);
        console.log('PDF.js library loaded successfully');
        
        // Set worker source
        try {
          const pdfjsLib = (window as any).pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;
          console.log('PDF.js library and worker loaded successfully');
          resolve();
        } catch (workerError) {
          console.error('Error setting PDF.js worker:', workerError);
          reject(new Error(`Không thể thiết lập PDF.js worker: ${workerError instanceof Error ? workerError.message : 'Unknown error'}`));
        }
      };
      
      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Failed to load PDF.js library:', error);
        reject(new Error('Không thể tải thư viện PDF.js. Vui lòng kiểm tra kết nối mạng và thử lại.'));
      };
      
      // Add to document head
      document.head.appendChild(script);
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-semibold">Tài liệu tham khảo</h2>
      
      {/* Preloaded Documents Section */}
      <div className="border rounded-lg divide-y">
        <div className="p-3 bg-gray-50 font-medium">
          Tài liệu học tập ({preloadedDocs.filter(d => d.selected).length}/{preloadedDocs.length} được chọn)
        </div>
        
        {preloadedDocs.map(doc => (
          <div key={doc.id} className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`doc-${doc.id}`}
                checked={doc.selected}
                onChange={() => togglePreloadedSelection(doc.id)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor={`doc-${doc.id}`} className="flex items-center cursor-pointer">
                <span className="mr-2">📚</span>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.pageCount} trang, {doc.chunkCount} phần nội dung</p>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
      
      {/* Upload area */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Thả file PDF ở đây...</p>
        ) : (
          <div>
            <p>Kéo và thả file PDF vào đây, hoặc click để chọn file</p>
            <p className="text-sm text-gray-500 mt-1">Chỉ hỗ trợ file PDF (tối đa {MAX_FILES} file)</p>
            <p className="text-xs text-gray-500 mt-1 italic">Ghi chú: AI đã được train sẵn với một số tài liệu Lý thuyết Thông tin</p>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded">
          {error}
        </div>
      )}
      
      {/* Current processing file */}
      {isProcessing && processingFile && (
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <p className="text-blue-700 mb-1">Đang xử lý file: {processingFile}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
            <p className="text-xs text-gray-600 mt-1">Xử lý: {progress}%</p>
          </div>
        </div>
      )}
      
      {/* List of processed files with checkboxes */}
      {processedFiles.length > 0 && (
        <div className="border rounded-lg divide-y">
          <div className="p-3 bg-gray-50 font-medium">
            Tài liệu đã tải lên ({processedFiles.filter(f => f.selected).length}/{processedFiles.length} được chọn)
          </div>
          
          {processedFiles.map(file => (
            <div key={file.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`file-${file.id}`}
                  checked={file.selected}
                  onChange={() => toggleFileSelection(file.id)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor={`file-${file.id}`} className="flex items-center cursor-pointer">
                  <span className="mr-2">📄</span>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.pageCount} trang, {file.chunks.length} phần nội dung</p>
                  </div>
                </label>
              </div>
              
              <button
                onClick={() => removeFile(file.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Xóa tài liệu"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 