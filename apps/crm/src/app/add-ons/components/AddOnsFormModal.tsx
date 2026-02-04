import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Checkbox } from "@repo/ui/checkbox";
import { toast } from 'sonner';

interface AddOn {
  _id?: string;
  name: string;
  price: string;
  duration: string;
  status: string;
  services: string[];
}

interface Service {
  _id: string;
  name: string;
}

interface AddOn {
  _id?: string;
  name: string;
  price: string;
  duration: string;
  status: string;
  services: string[];
}

interface Service {
  _id: string;
  name: string;
}

interface AddOnsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAddOn: AddOn | null;
  formData: AddOn;
  setFormData: React.Dispatch<React.SetStateAction<AddOn>>;
  services: Service[];
  onSave: () => void;
  isProcessing: boolean;
  modalType: 'add' | 'edit' | 'view';
}

const AddOnsFormModal = ({
  isOpen,
  onClose,
  editingAddOn,
  formData,
  setFormData,
  services,
  onSave,
  isProcessing,
  modalType
}: AddOnsFormModalProps) => {
  const handleSave = () => {
    if (formData.services.length === 0) {
      toast.error("Please select at least one service for this add-on");
      return;
    }
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{modalType === "add" ? "Add New Add-On" : modalType === "edit" ? "Edit Add-On" : "Add-On Details"}</DialogTitle>
          <DialogDescription>
            {modalType === "add" ? "Enter the details for the new add-on." : modalType === "edit" ? "Edit the add-on details." : "View the add-on details."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              className="col-span-3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={modalType === 'view'}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              className="col-span-3"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              disabled={modalType === 'view'}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Duration (min)</Label>
            <Input
              id="duration"
              type="number"
              className="col-span-3"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              disabled={modalType === 'view'}
            />
          </div>
          <div className="space-y-4">
            <Label>Mapped Services</Label>
            <div className="grid grid-cols-2 gap-4 max-h-[200px] overflow-y-auto p-2 border rounded-md">
              {services.map((service) => (
                <div key={String(service._id)} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service._id}`}
                    checked={formData.services.includes(String(service._id))}
                    onCheckedChange={(checked) => {
                      if (modalType === 'view') return;
                      const serviceId = String(service._id);
                      setFormData(prev => ({
                        ...prev,
                        services: checked
                          ? [...prev.services, serviceId]
                          : prev.services.filter(id => id !== serviceId)
                      }));
                    }}
                    disabled={modalType === 'view'}
                  />
                  <label
                    htmlFor={`service-${service._id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {service.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {modalType !== 'view' && (
            <Button onClick={handleSave} disabled={isProcessing || !formData.name}>
              {isProcessing ? "Saving..." : "Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOnsFormModal;