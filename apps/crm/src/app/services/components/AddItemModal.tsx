import { useState } from "react";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Plus } from "lucide-react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
} from "@repo/store/api";
import { toast } from 'sonner';

// Interface definitions
interface Category {
  _id: string;
  name: string;
}

interface Service {
  _id: string;
  name: string;
  category?: {
    _id: string;
    name?: string;
  };
  categoryName?: string;
  price?: number;
  discountedPrice?: number;
  duration?: number;
  description?: string;
  gender?: string;
  staff?: string[];
  commission?: boolean;
  homeService?: { available: boolean; charges: number | null };
  weddingService?: { available: boolean; charges: number | null };
  bookingInterval?: number;
  tax?: { enabled: boolean; type: string; value: number | null };
  onlineBooking?: boolean;
  image?: string;
  serviceImage?: string;
  status?: string;
  addOns?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: any) => void;
  itemType: string;
  categoryId?: string;
}

const AddItemModal = ({ isOpen, onClose, onItemCreated, itemType, categoryId }: AddItemModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    image?: string;
    submit?: string;
  }>({});

  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [createService, { isLoading: isCreatingService }] = useCreateServiceMutation();

  const { data: categories = [] } = useGetCategoriesQuery(undefined);
  const { data: allServices = [] } = useGetServicesQuery(undefined);

  const isLoading = isCreatingCategory || isCreatingService;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setErrors(prev => ({ ...prev, image: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!image) {
      newErrors.image = `${itemType} image is required`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      let newItem;
      if (itemType === "Category") {
        // Check for duplicate category name
        const isDuplicate = categories.some(
          (cat: Category) => cat.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicate) {
          setErrors({ name: "A category with this name already exists" });
          return;
        }

        newItem = await createCategory({ name, description, image }).unwrap();
      } else if (itemType === "Service" && categoryId) {
        // Check for duplicate service name in the same category
        const isDuplicate = allServices.some(
          (service: Service) =>
            service.name.toLowerCase() === name.trim().toLowerCase() &&
            service.category?._id === categoryId
        );

        if (isDuplicate) {
          setErrors({ name: "A service with this name already exists in this category" });
          return;
        }

        newItem = await createService({ name, description, category: categoryId, image }).unwrap();
      } else {
        throw new Error("Invalid item type or missing categoryId");
      }
      setName("");
      setDescription("");
      setImage("");
      setErrors({});
      onItemCreated(newItem);
      onClose();
    } catch (error: any) {
      console.error(`Failed to create ${itemType}`, error);
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || `Failed to create ${itemType}`;
      setErrors({ submit: errorMessage });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Create New {itemType}
          </DialogTitle>
          <DialogDescription>
            Add a new {itemType.toLowerCase()} to your list.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 -mt-2">
          <div className="space-y-4 py-2 pr-1">
            <div className="space-y-2">
              <Label htmlFor={`new-${itemType}-name`}>{itemType} Name</Label>
              <Input
                id={`new-${itemType}-name`}
                placeholder={`e.g., Hair Styling`}
                value={name}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  setName(val);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                className={errors.name ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`new-${itemType}-description`}>Description</Label>
              <Textarea
                id={`new-${itemType}-description`}
                placeholder="A brief description."
                value={description}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\s\.,!\?']+/g, "");
                  setDescription(val);
                  if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                }}
                className={errors.description ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">{itemType} Image</Label>
              <Input
                id="image"
                type="file"
                onChange={handleImageChange}
                className={errors.image ? "border-red-500 text-red-500" : ""}
                disabled={isLoading}
              />
              {errors.image && (
                <p className="text-xs text-red-500">{errors.image}</p>
              )}
            </div>
            {errors.submit && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{errors.submit}</p>
            )}
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;