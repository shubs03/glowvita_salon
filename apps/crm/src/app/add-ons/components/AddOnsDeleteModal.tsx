import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";

interface AddOn {
  _id: string;
  name: string;
}

interface AddOnsDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  addonToDelete: AddOn | null;
  isProcessing: boolean;
}

const AddOnsDeleteModal = ({
  isOpen,
  onClose,
  onDelete,
  addonToDelete,
  isProcessing
}: AddOnsDeleteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the add-on "{addonToDelete?.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={onDelete} 
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOnsDeleteModal;