import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { getFileIcon, formatFileSize } from './utils';

interface Document {
  id: string;
  group_id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  display_order: number;
}

interface FileCardProps {
  document: Document;
  onDownload: (document: Document) => void;
  onView: (document: Document) => void;
  onMoveUp: (documentId: string) => void;
  onMoveDown: (documentId: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  document,
  onDownload,
  onView,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const canView = document.file_type.includes('pdf') || 
                  document.file_type.includes('image') || 
                  document.name.toLowerCase().match(/\.(pdf|jpg|jpeg|png|gif|bmp|webp)$/);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center space-y-3">
        {/* File Icon Above Filename */}
        <div className="flex justify-center">
          {getFileIcon(document.file_type, document.name)}
        </div>
        
        {/* File Details */}
        <div className="w-full">
          <h4 className="font-medium truncate">{document.name}</h4>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(document.file_size)}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(document.created_at).toLocaleDateString()}
          </p>
        </div>
        
        {/* Reorder Controls */}
        <div className="flex gap-1 justify-center">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onMoveUp(document.id)}
            disabled={!canMoveUp}
            className="h-6 w-6 p-0"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onMoveDown(document.id)}
            disabled={!canMoveDown}
            className="h-6 w-6 p-0"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          {canView && (
            <Button size="sm" variant="outline" onClick={() => onView(document)} className="flex-1">
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onDownload(document)} className="flex-1">
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};