import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FolderPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GroupCard } from './fad/GroupCard';
import { AddGroupDialog } from './fad/AddGroupDialog';

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
      .order('display_order', { ascending: true });
    
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
      .order('display_order', { ascending: true });
    
    if (error) {
      toast({ title: "Error fetching documents", description: error.message, variant: "destructive" });
    } else {
      setDocuments(data || []);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    
    setLoading(true);
    const maxOrder = Math.max(...groups.map(g => g.display_order), 0);
    
    const { data, error } = await supabase
      .from('groups')
      .insert([{ 
        name: newGroupName.trim(),
        display_order: maxOrder + 1
      }])
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
    
    // Get max order for this group
    const groupDocs = documents.filter(d => d.group_id === groupId);
    const maxOrder = Math.max(...groupDocs.map(d => d.display_order), 0);
    
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
        file_size: selectedFile.size,
        display_order: maxOrder + 1
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

  const moveGroupUp = async (groupId: string) => {
    const currentIndex = groups.findIndex(g => g.id === groupId);
    if (currentIndex <= 0) return;

    const currentGroup = groups[currentIndex];
    const previousGroup = groups[currentIndex - 1];

    // Swap display orders
    await supabase.from('groups').update({ display_order: previousGroup.display_order }).eq('id', currentGroup.id);
    await supabase.from('groups').update({ display_order: currentGroup.display_order }).eq('id', previousGroup.id);

    fetchGroups();
  };

  const moveGroupDown = async (groupId: string) => {
    const currentIndex = groups.findIndex(g => g.id === groupId);
    if (currentIndex >= groups.length - 1) return;

    const currentGroup = groups[currentIndex];
    const nextGroup = groups[currentIndex + 1];

    // Swap display orders
    await supabase.from('groups').update({ display_order: nextGroup.display_order }).eq('id', currentGroup.id);
    await supabase.from('groups').update({ display_order: currentGroup.display_order }).eq('id', nextGroup.id);

    fetchGroups();
  };

  const moveDocumentUp = async (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const groupDocs = documents.filter(d => d.group_id === document.group_id).sort((a, b) => a.display_order - b.display_order);
    const currentIndex = groupDocs.findIndex(d => d.id === documentId);
    
    if (currentIndex <= 0) return;

    const currentDoc = groupDocs[currentIndex];
    const previousDoc = groupDocs[currentIndex - 1];

    // Swap display orders
    await supabase.from('documents').update({ display_order: previousDoc.display_order }).eq('id', currentDoc.id);
    await supabase.from('documents').update({ display_order: currentDoc.display_order }).eq('id', previousDoc.id);

    fetchDocuments();
  };

  const moveDocumentDown = async (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const groupDocs = documents.filter(d => d.group_id === document.group_id).sort((a, b) => a.display_order - b.display_order);
    const currentIndex = groupDocs.findIndex(d => d.id === documentId);
    
    if (currentIndex >= groupDocs.length - 1) return;

    const currentDoc = groupDocs[currentIndex];
    const nextDoc = groupDocs[currentIndex + 1];

    // Swap display orders
    await supabase.from('documents').update({ display_order: nextDoc.display_order }).eq('id', currentDoc.id);
    await supabase.from('documents').update({ display_order: currentDoc.display_order }).eq('id', nextDoc.id);

    fetchDocuments();
  };

  const handleFileSelect = (file: File, groupId: string) => {
    setSelectedFile(file);
    setUploadingGroupId(groupId);
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setUploadingGroupId('');
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

        <AddGroupDialog
          isOpen={showAddGroup}
          newGroupName={newGroupName}
          loading={loading}
          onOpenChange={setShowAddGroup}
          onNameChange={setNewGroupName}
          onCreateGroup={createGroup}
        />

        {/* Groups and Documents */}
        <div className="space-y-6">
          {groups.map((group, index) => {
            const groupDocuments = documents
              .filter(doc => doc.group_id === group.id)
              .sort((a, b) => a.display_order - b.display_order);
            
            return (
              <GroupCard
                key={group.id}
                group={group}
                documents={groupDocuments}
                selectedFile={selectedFile}
                uploadingGroupId={uploadingGroupId}
                loading={loading}
                canMoveUp={index > 0}
                canMoveDown={index < groups.length - 1}
                onFileSelect={handleFileSelect}
                onUpload={uploadFile}
                onCancelUpload={handleCancelUpload}
                onDownloadFile={downloadFile}
                onViewFile={viewFile}
                onMoveGroupUp={moveGroupUp}
                onMoveGroupDown={moveGroupDown}
                onMoveDocumentUp={moveDocumentUp}
                onMoveDocumentDown={moveDocumentDown}
              />
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