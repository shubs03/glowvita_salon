import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
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
      <DialogContent className="sm:max-w-md rounded-3xl border-0 bg-background/95 backdrop-blur-xl shadow-2xl">
        <div className="-mx-6 -mt-6 px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Add New Category
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category Name</Label>
            <Input 
              placeholder="Enter category name" 
              value={newCategory.name} 
              onChange={(e) => setNewCategory(prev => ({...prev, name: e.target.value}))}
              className="rounded-xl border-border/40 focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea 
              placeholder="Enter category description" 
              value={newCategory.description} 
              onChange={(e) => setNewCategory(prev => ({...prev, description: e.target.value}))}
              className="rounded-xl border-border/40 focus:border-primary/50 min-h-[80px]"
            />
          </div>
        </div>
        
        <div className="-mx-6 -mb-6 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl border-border/40 hover:border-border/60"
            >
              Cancel
            </Button>
            <Button 
              onClick={onSave} 
              disabled={isSaving}
              className="rounded-xl bg-primary hover:bg-primary/90"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Category
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;