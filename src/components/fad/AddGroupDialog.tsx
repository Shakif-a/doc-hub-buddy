import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AddGroupDialogProps {
  isOpen: boolean;
  newGroupName: string;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onCreateGroup: () => void;
}

export const AddGroupDialog: React.FC<AddGroupDialogProps> = ({
  isOpen,
  newGroupName,
  loading,
  onOpenChange,
  onNameChange,
  onCreateGroup,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onCreateGroup()}
          />
          <div className="flex gap-2">
            <Button onClick={onCreateGroup} disabled={loading || !newGroupName.trim()}>
              Create Group
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};