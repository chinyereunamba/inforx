'use client';

import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Upload, FileText, Image, FileType, CheckCircle, X, Loader2 } from 'lucide-react';

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  isLoading: boolean;
}

const acceptedFileTypes = {
  'image/jpeg': { icon: Image, label: 'JPEG Image' },
  'image/png': { icon: Image, label: 'PNG Image' },
  'application/pdf': { icon: FileText, label: 'PDF Document' },
  'text/plain': { icon: FileType, label: 'Text File' },
};

export default function FileUploadZone({ onFileUpload, uploadedFile, isLoading }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Animate upload progress
  useEffect(() => {
    if (uploadedFile && uploadProgress < 100) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [uploadedFile, uploadProgress]);

  // Animate progress bar
  useEffect(() => {
    if (progressRef.current && uploadProgress > 0) {
      gsap.to(progressRef.current, {
        width: `${uploadProgress}%`,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [uploadProgress]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (!Object.keys(acceptedFileTypes).includes(file.type)) {
      alert('Please upload a valid file type (JPEG, PNG, PDF, or TXT)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setUploadProgress(0);
    onFileUpload(file);

    // Animate upload zone on successful file selection
    gsap.fromTo(
      uploadZoneRef.current,
      { scale: 1 },
      { scale: 1.02, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }
    );
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadProgress(0);
    onFileUpload(null as any);
  };

  const getFileIcon = (fileType: string) => {
    const fileInfo = acceptedFileTypes[fileType as keyof typeof acceptedFileTypes];
    if (fileInfo) {
      const IconComponent = fileInfo.icon;
      return <IconComponent className="w-8 h-8" />;
    }
    return <FileType className="w-8 h-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (uploadedFile) {
    return (
      <div className="border-2 border-gray-200 rounded-lg p-6 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-green-600">
              {uploadProgress === 100 ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <div className="relative">
                  {getFileIcon(uploadedFile.type)}
                  {uploadProgress < 100 && (
                    <Loader2 className="w-4 h-4 absolute -top-1 -right-1 animate-spin text-blue-600" />
                  )}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{uploadedFile.name}</h3>
              <p className="text-sm text-gray-600">
                {formatFileSize(uploadedFile.size)} • {acceptedFileTypes[uploadedFile.type as keyof typeof acceptedFileTypes]?.label || 'Unknown type'}
              </p>
              {uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      ref={progressRef}
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={clearFile}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
            aria-label="Remove file"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={uploadZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
        isDragOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
      }`}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload medical document"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,.txt"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isLoading}
        aria-describedby="file-upload-description"
      />
      
      <div className="flex flex-col items-center">
        <div className={`mb-4 transition-colors duration-200 ${
          isDragOver ? 'text-blue-600' : 'text-gray-400'
        }`}>
          <Upload className="w-12 h-12 mx-auto" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isDragOver ? 'Drop your file here' : 'Upload Medical Document'}
        </h3>
        
        <p id="file-upload-description" className="text-gray-600 mb-4">
          Drag and drop your file here, or click to browse
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center text-sm text-gray-500">
          <span className="px-2 py-1 bg-gray-100 rounded">JPEG</span>
          <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
          <span className="px-2 py-1 bg-gray-100 rounded">PDF</span>
          <span className="px-2 py-1 bg-gray-100 rounded">TXT</span>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</p>
      </div>
    </div>
  );
}