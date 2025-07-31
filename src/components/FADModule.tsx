import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FolderPlus, Upload, Download, Eye, FileText, Image, FileSpreadsheet, Presentation, File, FileType } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Group {
  id: string;
  name: string;
  created_at: string;
}

interface Document {
  id: string;
  group_id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

const FADModule = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingGroupId, setUploadingGroupId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchDocuments();
  }, []);

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      toast({ title: "Error fetching groups", description: error.message, variant: "destructive" });
    } else {
      setGroups(data || []);
    }
  };

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      toast({ title: "Error fetching documents", description: error.message, variant: "destructive" });
    } else {
      setDocuments(data || []);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('groups')
      .insert([{ name: newGroupName.trim() }])
      .select();

    if (error) {
      toast({ title: "Error creating group", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Group created successfully" });
      setNewGroupName('');
      setShowAddGroup(false);
      fetchGroups();
    }
    setLoading(false);
  };

  const uploadFile = async (groupId: string) => {
    if (!selectedFile) return;

    setLoading(true);
    const fileName = `${Date.now()}-${selectedFile.name}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, selectedFile);

    if (uploadError) {
      toast({ title: "Error uploading file", description: uploadError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Save document record
    const { error: dbError } = await supabase
      .from('documents')
      .insert([{
        group_id: groupId,
        name: selectedFile.name,
        file_path: fileName,
        file_type: selectedFile.type,
        file_size: selectedFile.size
      }]);

    if (dbError) {
      toast({ title: "Error saving document", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "File uploaded successfully" });
      setSelectedFile(null);
      setUploadingGroupId('');
      fetchDocuments();
    }
    setLoading(false);
  };

  const downloadFile = async (document: Document) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(document.file_path);

    if (error) {
      toast({ title: "Error downloading file", description: error.message, variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewFile = async (document: Document) => {
    const { data } = await supabase.storage
      .from('documents')
      .getPublicUrl(document.file_path);

    window.open(data.publicUrl, '_blank');
  };

  const getFileIcon = (fileType: string, fileName: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Frequently Accessed Documents</h1>
          <Button
            onClick={() => setShowAddGroup(true)}
            className="flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            Add Group
          </Button>
        </div>

        {/* Add Group Dialog */}
        <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createGroup()}
              />
              <div className="flex gap-2">
                <Button onClick={createGroup} disabled={loading || !newGroupName.trim()}>
                  Create Group
                </Button>
                <Button variant="outline" onClick={() => setShowAddGroup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Groups and Documents */}
        <div className="space-y-6">
          {groups.map((group) => {
            const groupDocuments = documents.filter(doc => doc.group_id === group.id);
            
            return (
              <Card key={group.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id={`file-${group.id}`}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx,.pptx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            setUploadingGroupId(group.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => document.getElementById(`file-${group.id}`)?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload File
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedFile && uploadingGroupId === group.id && (
                    <div className="mb-4 p-4 border rounded-lg bg-muted">
                      <div className="flex justify-between items-center">
                        <span>Selected: {selectedFile.name}</span>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => uploadFile(group.id)} disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedFile(null);
                            setUploadingGroupId('');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {groupDocuments.length === 0 ? (
                    <p className="text-muted-foreground">No documents in this group yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupDocuments.map((document) => (
                        <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 w-full">
                              <Button size="sm" variant="outline" onClick={() => viewFile(document)} className="flex-1">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => downloadFile(document)} className="flex-1">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No groups created yet.</p>
            <Button onClick={() => setShowAddGroup(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FADModule;