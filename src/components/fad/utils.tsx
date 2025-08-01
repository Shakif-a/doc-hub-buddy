import React from 'react';
import { FileText, Image, FileSpreadsheet, Presentation, File, FileType } from 'lucide-react';

export const getFileIcon = (fileType: string, fileName: string) => {
  const lowerFileName = fileName.toLowerCase();
  
  // PDF files - Red icon
  if (fileType.includes('pdf') || lowerFileName.endsWith('.pdf')) {
    return <FileText className="w-12 h-12 text-red-500" />;
  }
  
  // DOCX files - Blue icon
  if (fileType.includes('wordprocessingml') || lowerFileName.endsWith('.docx')) {
    return <FileText className="w-12 h-12 text-blue-500" />;
  }
  
  // TXT files - Gray icon
  if (fileType.includes('text/plain') || lowerFileName.endsWith('.txt')) {
    return <FileType className="w-12 h-12 text-gray-500" />;
  }
  
  // XLSX files - Green icon
  if (fileType.includes('spreadsheetml') || fileType.includes('excel') || lowerFileName.endsWith('.xlsx')) {
    return <FileSpreadsheet className="w-12 h-12 text-green-500" />;
  }
  
  // PPTX files - Orange icon
  if (fileType.includes('presentationml') || fileType.includes('powerpoint') || lowerFileName.endsWith('.pptx')) {
    return <Presentation className="w-12 h-12 text-orange-500" />;
  }
  
  // Image files - Purple icon
  if (fileType.includes('image') || lowerFileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
    return <Image className="w-12 h-12 text-purple-500" />;
  }
  
  // Generic files - Default icon
  return <File className="w-12 h-12 text-muted-foreground" />;
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};