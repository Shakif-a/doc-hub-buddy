import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { FileCard } from './FileCard';
import { FileUpload } from './FileUpload';

interface Group {
  id: string;
  name: string;
  created_at: string;
  display_order: number;
}

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

interface GroupCardProps {
  group: Group;
  documents: Document[];
  selectedFile: File | null;
  uploadingGroupId: string;
  loading: boolean;
  isAdmin: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onFileSelect: (file: File, groupId: string) => void;
  onUpload: (groupId: string) => void;
  onCancelUpload: () => void;
  onDownloadFile: (document: Document) => void;
  onViewFile: (document: Document) => void;
  onDeleteFile: (document: Document) => void;
  onDeleteGroup: (groupId: string) => void;
  onMoveGroupUp: (groupId: string) => void;
  onMoveGroupDown: (groupId: string) => void;
  onMoveDocumentUp: (documentId: string) => void;
  onMoveDocumentDown: (documentId: string) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  documents,
  selectedFile,
  uploadingGroupId,
  loading,
  isAdmin,
  canMoveUp,
  canMoveDown,
  onFileSelect,
  onUpload,
  onCancelUpload,
  onDownloadFile,
  onViewFile,
  onDeleteFile,
  onDeleteGroup,
  onMoveGroupUp,
  onMoveGroupDown,
  onMoveDocumentUp,
  onMoveDocumentDown,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{group.name}</CardTitle>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onMoveGroupUp(group.id)}
                disabled={!canMoveUp}
                className="h-6 w-6 p-0"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onMoveGroupDown(group.id)}
                disabled={!canMoveDown}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
              {isAdmin && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDeleteGroup(group.id)}
                  disabled={documents.length > 0 || loading}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  title={documents.length > 0 ? "Group must be empty to delete" : "Delete group"}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <FileUpload
            groupId={group.id}
            selectedFile={selectedFile}
            uploadingGroupId={uploadingGroupId}
            loading={loading}
            onFileSelect={onFileSelect}
            onUpload={onUpload}
            onCancel={onCancelUpload}
          />
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-muted-foreground">No documents in this group yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document, index) => (
              <FileCard
                key={document.id}
                document={document}
                isAdmin={isAdmin}
                onDownload={onDownloadFile}
                onView={onViewFile}
                onDelete={onDeleteFile}
                onMoveUp={onMoveDocumentUp}
                onMoveDown={onMoveDocumentDown}
                canMoveUp={index > 0}
                canMoveDown={index < documents.length - 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};