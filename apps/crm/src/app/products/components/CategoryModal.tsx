import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Button } from '@repo/ui/button';
import { Loader2 } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  newCategory: { name: string; description: string };
  setNewCategory: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
}

const CategoryModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  newCategory,
  setNewCategory
}: CategoryModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category Name</Label>
            <Input 
              placeholder="Enter category name" 
              value={newCategory.name} 
              onChange={(e) => setNewCategory(prev => ({...prev, name: e.target.value}))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea 
              placeholder="Enter category description" 
              value={newCategory.description} 
              onChange={(e) => setNewCategory(prev => ({...prev, description: e.target.value}))}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="secondary" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;