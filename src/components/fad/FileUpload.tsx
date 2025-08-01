import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  groupId: string;
  selectedFile: File | null;
  uploadingGroupId: string;
  loading: boolean;
  onFileSelect: (file: File, groupId: string) => void;
  onUpload: (groupId: string) => void;
  onCancel: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  groupId,
  selectedFile,
  uploadingGroupId,
  loading,
  onFileSelect,
  onUpload,
  onCancel,
}) => {
  return (
    <div className="flex gap-2">
      <input
        type="file"
        id={`file-${groupId}`}
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx,.pptx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file, groupId);
          }
        }}
      />
      <Button
        size="sm"
        onClick={() => document.getElementById(`file-${groupId}`)?.click()}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Upload File
      </Button>
      
      {selectedFile && uploadingGroupId === groupId && (
        <div className="ml-4 p-4 border rounded-lg bg-muted">
          <div className="flex justify-between items-center">
            <span>Selected: {selectedFile.name}</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onUpload(groupId)} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};