
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Edit, Trash2, Link as LinkIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { toast } from 'sonner';
import {
  useGetSuperDataQuery,
  useCreateSuperDataItemMutation,
  useUpdateSuperDataItemMutation,
  useDeleteSuperDataItemMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetAdminProductCategoriesQuery,
  useCreateAdminProductCategoryMutation,
  useUpdateAdminProductCategoryMutation,
  useDeleteAdminProductCategoryMutation,
} from '../../../../../packages/store/src/services/api';
import { Badge } from '@repo/ui/badge';

interface DropdownItem {
  _id: string;
  name: string;
  description?: string;
  type: string;
  parentId?: string;
}

interface LocationItem extends DropdownItem {
    countryId?: string;
    stateId?: string;
}

interface ServiceCategory {
    _id: string;
    name: string;
    description?: string;
    categoryImage?: string;
}

interface Service {
    _id: string;
    name: string;
    description?: string;
    category: ServiceCategory | string;
    serviceImage?: string;
}

interface ProductCategory {
    _id: string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

const DropdownManager = ({
  listTitle,
  listDescription,
  items,
  type,
  onUpdate,
  isLoading,
}: {
  listTitle: string;
  listDescription: string;
  items: DropdownItem[];
  type: string;
  onUpdate: (item: Partial<DropdownItem>, action: 'add' | 'edit' | 'delete') => void;
  isLoading: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<DropdownItem> | null>(null);

  const handleOpenModal = (item: Partial<DropdownItem> | null = null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const descriptionInput = form.elements.namedItem('description');
    const linkInput = form.elements.namedItem('link');
    
    const description = descriptionInput ? (descriptionInput as HTMLTextAreaElement).value : undefined;
    const link = linkInput ? (linkInput as HTMLInputElement).value : undefined;

    const action = currentItem?._id ? 'edit' : 'add';
    const itemData: Partial<DropdownItem> = {
      _id: currentItem?._id,
      name,
      description: type === 'socialPlatform' ? link : description,
      type,
    };
    
    onUpdate(itemData, action);
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleDeleteClick = (item: DropdownItem) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentItem) {
      onUpdate({ _id: currentItem._id }, 'delete');
    }
    setIsDeleteModalOpen(false);
    setCurrentItem(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{listTitle}</CardTitle>
            <CardDescription>{listDescription}</CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>{type === 'socialPlatform' ? 'Profile Link' : 'Description'}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {type === 'socialPlatform' && item.description ? (
                        <a href={item.description} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            {item.description}
                        </a>
                    ) : item.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)} disabled={isLoading}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(item)} disabled={isLoading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No items found.
                  </TableCell>
                </TableRow>
              )}
               {isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{currentItem?._id ? 'Edit' : 'Add'} Item</DialogTitle>
                <DialogDescription>
                  {currentItem?._id ? `Editing "${(currentItem as DropdownItem).name}".` : `Add a new item to "${listTitle}".`}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={currentItem?.name || ''} required />
                </div>
                 <div className="space-y-2">
                    {type === 'socialPlatform' ? (
                        <>
                            <Label htmlFor="link">Profile Link</Label>
                            <Input id="link" name="link" type="url" defaultValue={currentItem?.description || ''} placeholder="https://example.com/profile"/>
                        </>
                    ) : (
                        <>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={currentItem?.description || ''} />
                        </>
                    )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Item?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{(currentItem as DropdownItem)?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const ServiceCategoryManager = () => {
    const { data: categories = [], isLoading, isError } = useGetCategoriesQuery(undefined);
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<ServiceCategory> | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    const handleOpenModal = (item: Partial<ServiceCategory> | null = null) => {
        setCurrentItem(item);
        setImageBase64(item?.categoryImage || null);
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImageBase64(null);
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

        const action = currentItem?._id ? 'edit' : 'add';
        const itemData = {
            id: currentItem?._id,
            name,
            description,
            image: imageBase64,
        };

        try {
            if (action === 'add') {
                await createCategory(itemData).unwrap();
            } else {
                await updateCategory(itemData).unwrap();
            }
            toast.success('Success', { description: `Category ${action}ed successfully.` });
            setIsModalOpen(false);
            setCurrentItem(null);
            setImageBase64(null);
        } catch (error) {
            toast.error('Error', { description: `Failed to ${action} category.` });
        }
    };

    const handleDeleteClick = (item: ServiceCategory) => {
        setCurrentItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (currentItem?._id) {
            try {
                await deleteCategory({ id: currentItem._id }).unwrap();
                toast.success('Success', { description: 'Category deleted successfully.' });
                setIsDeleteModalOpen(false);
                setCurrentItem(null);
            } catch (error) {
                toast.error('Error', { description: 'Failed to delete category.' });
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Service Categories</CardTitle>
                        <CardDescription>Manage categories for salon services.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenModal()} disabled={isLoading}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto no-scrollbar rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.description}</TableCell>
                                    <TableCell>
                                        {item.categoryImage ? (
                                            <img src={item.categoryImage} alt={item.name} className="h-12 w-12 object-cover rounded" />
                                        ) : (
                                            <span className="text-muted-foreground">No image</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)} disabled={isLoading}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(item)} disabled={isLoading}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>{currentItem?._id ? 'Edit' : 'Add'} Category</DialogTitle>
                                <DialogDescription>
                                    {currentItem?._id ? `Editing "${currentItem.name}".` : 'Add a new service category.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" defaultValue={currentItem?.name || ''} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" defaultValue={currentItem?.description || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Image</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imageBase64 && (
                                        <img src={imageBase64} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded" />
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Category?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{currentItem?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};

const ServiceManager = () => {
    const { data: services = [], isLoading, isError } = useGetServicesQuery(undefined);
    const { data: categories = [] } = useGetCategoriesQuery(undefined);
    const [createService] = useCreateServiceMutation();
    const [updateService] = useUpdateServiceMutation();
    const [deleteService] = useDeleteServiceMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Service> | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    const handleOpenModal = (item: Partial<Service> | null = null) => {
        setCurrentItem(item);
        setImageBase64(item?.serviceImage || null);
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImageBase64(null);
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
        const category = (form.elements.namedItem('category') as HTMLSelectElement).value;
        
        const action = currentItem?._id ? 'edit' : 'add';
        const itemData = {
            id: currentItem?._id,
            name,
            description,
            category,
            image: imageBase64,
        };
        
        try {
            if (action === 'add') {
                await createService(itemData).unwrap();
            } else {
                await updateService(itemData).unwrap();
            }
            toast.success('Success', { description: `Service ${action}ed successfully.` });
            setIsModalOpen(false);
            setCurrentItem(null);
            setImageBase64(null);
        } catch (error) {
            toast.error('Error', { description: `Failed to ${action} service.` });
        }
    };

    const handleDeleteClick = (item: Service) => {
        setCurrentItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (currentItem?._id) {
            try {
                await deleteService({ id: currentItem._id }).unwrap();
                toast.success('Success', { description: 'Service deleted successfully.' });
                setIsDeleteModalOpen(false);
                setCurrentItem(null);
            } catch (error) {
                toast.error('Error', { description: 'Failed to delete service.' });
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Services</CardTitle>
                        <CardDescription>Manage individual salon services.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenModal()} disabled={isLoading || categories.length === 0}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Button>
                </div>
                 {categories.length === 0 && <p className="text-sm text-yellow-600 mt-2">Please add a category first before adding services.</p>}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto no-scrollbar rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {typeof item.category === 'object' ? item.category.name : 'N/A'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{item.description}</TableCell>
                                    <TableCell>
                                        {item.serviceImage ? (
                                            <img src={item.serviceImage} alt={item.name} className="h-12 w-12 object-cover rounded" />
                                        ) : (
                                            <span className="text-muted-foreground">No image</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)} disabled={isLoading}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(item)} disabled={isLoading}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {services.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No services found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>{currentItem?._id ? 'Edit' : 'Add'} Service</DialogTitle>
                                <DialogDescription>
                                    {currentItem?._id ? `Editing "${currentItem.name}".` : 'Add a new service.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" defaultValue={currentItem?.name || ''} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select name="category" defaultValue={typeof currentItem?.category === 'object' ? currentItem?.category?._id : currentItem?.category} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" defaultValue={currentItem?.description || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Image</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imageBase64 && (
                                        <img src={imageBase64} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded" />
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Service?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{currentItem?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default function DropdownManagementPage() {
    const { data = [], isLoading, isError } = useGetSuperDataQuery(undefined);
    const [createItem] = useCreateSuperDataItemMutation();
    const [updateItem] = useUpdateSuperDataItemMutation();
    const [deleteItem] = useDeleteSuperDataItemMutation();

    const handleUpdate = async (item: Partial<DropdownItem>, action: 'add' | 'edit' | 'delete') => {
        try {
            if (action === 'add') {
                await createItem(item).unwrap();
                toast.success('Success', { description: 'Item added successfully.' });
            } else if (action === 'edit' && item._id) {
                await updateItem({ id: item._id, ...item }).unwrap();
                toast.success('Success', { description: 'Item updated successfully.' });
            } else if (action === 'delete' && item._id) {
                await deleteItem({ id: item._id }).unwrap();
                toast.success('Success', { description: 'Item deleted successfully.' });
            }
        } catch (error) {
            toast.error('Error', { description: `Failed to ${action} item.` });
            console.error(`API call failed for ${action}:`, error);
        }
    };

    const HierarchicalManager = ({ title, description, topLevelType, childTypes }: { title: string; description: string; topLevelType: string; childTypes: { type: string, name: string }[] }) => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
        const [currentItem, setCurrentItem] = useState<Partial<DropdownItem> | null>(null);
        const [modalConfig, setModalConfig] = useState<{ type: string; parentId?: string; action: 'add' | 'edit' }>({ type: topLevelType, action: 'add' });
        const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

        const topLevelItems = useMemo(() => data.filter(item => item.type === topLevelType), [data, topLevelType]);

        const getChildren = (parentId: string, childType: string) => {
            return data.filter(item => item.type === childType && item.parentId === parentId);
        }

        const handleOpenModal = (action: 'add' | 'edit', type: string, item?: Partial<DropdownItem>, parentId?: string) => {
            setCurrentItem(item || null);
            setModalConfig({ type, parentId, action });
            setIsModalOpen(true);
        };

        const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const itemData: Partial<DropdownItem> = {
                _id: currentItem?._id,
                name,
                type: modalConfig.type,
                parentId: modalConfig.parentId,
            };
            await handleUpdate(itemData, modalConfig.action);
            setIsModalOpen(false);
            setCurrentItem(null);
        };

        const handleDeleteClick = (item: DropdownItem) => {
            setCurrentItem(item);
            setIsDeleteModalOpen(true);
        };

        const handleConfirmDelete = () => {
            if (currentItem?._id) {
                handleUpdate({ _id: currentItem._id }, 'delete');
            }
            setIsDeleteModalOpen(false);
            setCurrentItem(null);
        };

        const toggleExpand = (id: string) => {
            setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
        };

        const renderItem = (item: DropdownItem, level: number) => {
            const childConfig = childTypes[level];
            const children = childConfig ? getChildren(item._id, childConfig.type) : [];
            const isExpanded = expandedItems[item._id];

            return (
                <div key={item._id}>
                    <div className="flex items-center gap-2 py-2 pr-2" style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}>
                        <button onClick={() => toggleExpand(item._id)} className="p-1" disabled={children.length === 0 && level < childTypes.length - 1}>
                            {(children.length > 0 || level < childTypes.length - 1) ? (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <div className="w-4 h-4"></div>}
                        </button>
                        <span className="flex-grow">{item.name}</span>
                        {childConfig && (
                            <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleOpenModal('add', childConfig.type, undefined, item._id)}>
                                <Plus className="mr-1 h-3 w-3" /> Add {childConfig.name}
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenModal('edit', item.type, item, item.parentId)}>
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteClick(item)}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    {isExpanded && (
                        <div className="border-l-2 ml-4 pl-2">
                             {children.length > 0 ? children.map(child => renderItem(child, level + 1)) : <div className="pl-4 text-sm text-muted-foreground py-1">No {childConfig?.name || 'items'} added yet.</div>}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenModal('add', topLevelType)}>
                            <Plus className="mr-2 h-4 w-4" /> Add {topLevelType.replace(/([A-Z])/g, ' $1').trim()}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="border rounded-md max-h-96 overflow-y-auto">
                    {topLevelItems.map(item => renderItem(item, 0))}
                </CardContent>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>
                                    {modalConfig.action === 'add' ? 'Add New' : 'Edit'} {modalConfig.type.replace(/([A-Z])/g, ' $1').trim()}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{modalConfig.type.replace(/([A-Z])/g, ' $1').trim()} Name</Label>
                                    <Input id="name" name="name" defaultValue={currentItem?.name || ''} required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Item?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{(currentItem as DropdownItem)?.name}"? Deleting a parent will also delete all its children. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Card>
        );
    };


    if (isError) {
        return <div className="p-8 text-center text-destructive">Error fetching data. Please try again.</div>;
    }

    const dropdownTypes = [
        { key: 'faqCategory', title: 'FAQ Categories', description: 'Manage categories for organizing FAQs.', tab: 'general' },
        { key: 'bank', title: 'Bank Names', description: 'Manage a list of supported banks.', tab: 'general' },
        { key: 'documentType', title: 'Document Types', description: 'Manage types of documents required for verification.', tab: 'general' },
        { key: 'designation', title: 'Admin Designations', description: 'Manage the list of available staff designations.', tab: 'admin' },
        { key: 'smsType', title: 'SMS Template Types', description: 'Manage types for SMS templates.', tab: 'marketing' },
        { key: 'socialPlatform', title: 'Social Media Platforms', description: 'Manage platforms for social posts.', tab: 'marketing' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Dropdowns</h1>
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 max-w-5xl mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="doctors">Doctors</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                    <TabsTrigger value="marketing">Marketing</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <div className="space-y-8">
                        {dropdownTypes.filter(d => d.tab === 'general').map(d => (
                            <DropdownManager
                                key={d.key}
                                listTitle={d.title}
                                listDescription={d.description}
                                items={data.filter(item => item.type === d.key)}
                                type={d.key}
                                onUpdate={handleUpdate}
                                isLoading={isLoading}
                            />
                        ))}
                    </div>
                </TabsContent>
                 <TabsContent value="services">
                    <div className="space-y-8">
                       <ServiceCategoryManager />
                       <ServiceManager />
                    </div>
                </TabsContent>
                 <TabsContent value="locations">
                    <HierarchicalManager 
                        title="Location Management"
                        description="Manage countries, states, and cities."
                        topLevelType="country"
                        childTypes={[{type: 'state', name: 'State'}, {type: 'city', name: 'City'}]}
                    />
                </TabsContent>
                 <TabsContent value="doctors">
                    <div className="space-y-8">
                      <HierarchicalManager 
                          title="Doctor Specialization Management"
                          description="Manage doctor types, their specializations, and associated diseases."
                          topLevelType="doctorType"
                          childTypes={[{type: 'specialization', name: 'Specialization'}, {type: 'disease', name: 'Disease'}]}
                      />
                    </div>
                </TabsContent>
                <TabsContent value="admin">
                    <div className="space-y-8">
                        {dropdownTypes.filter(d => d.tab === 'admin').map(d => (
                            <DropdownManager
                                key={d.key}
                                listTitle={d.title}
                                listDescription={d.description}
                                items={data.filter(item => item.type === d.key)}
                                type={d.key}
                                onUpdate={handleUpdate}
                                isLoading={isLoading}
                            />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="marketing">
                    <div className="space-y-8">
                        {dropdownTypes.filter(d => d.tab === 'marketing').map(d => (
                            <DropdownManager
                                key={d.key}
                                listTitle={d.title}
                                listDescription={d.description}
                                items={data.filter(item => item.type === d.key)}
                                type={d.key}
                                onUpdate={handleUpdate}
                                isLoading={isLoading}
                            />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="products">
                    <div className="space-y-8">
                        <ProductCategoryManager />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
// Product Category Manager Component
const ProductCategoryManager = () => {
    const { data: productCategoriesData = [], isLoading, refetch } = useGetAdminProductCategoriesQuery();
    const [createCategory] = useCreateAdminProductCategoryMutation();
    const [updateCategory] = useUpdateAdminProductCategoryMutation();
    const [deleteCategory] = useDeleteAdminProductCategoryMutation();
    
    // Ensure productCategories is always an array
    const productCategories = useMemo(() => {
        if (Array.isArray(productCategoriesData)) {
            return productCategoriesData;
        }
        if (productCategoriesData && Array.isArray(productCategoriesData.data)) {
            return productCategoriesData.data;
        }
        if (productCategoriesData && Array.isArray(productCategoriesData.productCategories)) {
            return productCategoriesData.productCategories;
        }
        return [];
    }, [productCategoriesData]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<ProductCategory | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const handleOpenModal = (category: ProductCategory | null = null) => {
        if (category) {
            setCurrentCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setCurrentCategory(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            if (currentCategory) {
                // Update existing category
                await updateCategory({
                    id: currentCategory._id,
                    name: formData.name.trim(),
                    description: formData.description.trim()
                }).unwrap();
                toast.success('Category updated successfully');
            } else {
                // Create new category
                await createCategory({
                    name: formData.name.trim(),
                    description: formData.description.trim()
                }).unwrap();
                toast.success('Category created successfully');
            }
            
            setIsModalOpen(false);
            setFormData({ name: '', description: '' });
            setCurrentCategory(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to save category');
        }
    };

    const handleDeleteClick = (category: ProductCategory) => {
        setCurrentCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!currentCategory) return;

        try {
            await deleteCategory({ id: currentCategory._id }).unwrap();
            toast.success('Category deleted successfully');
            setIsDeleteModalOpen(false);
            setCurrentCategory(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to delete category');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Product Categories</CardTitle>
                        <CardDescription>Manage product categories for your catalog</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenModal()} disabled={isLoading}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto no-scrollbar rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">
                                        Loading categories...
                                    </TableCell>
                                </TableRow>
                            ) : productCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No categories found. Create your first category.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                productCategories.map((category: ProductCategory) => (
                                    <TableRow key={category._id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {category.description || 'No description'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenModal(category)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(category)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle>
                                {currentCategory ? 'Edit Category' : 'Add New Category'}
                            </DialogTitle>
                            <DialogDescription>
                                {currentCategory ? 'Update the category details below.' : 'Create a new product category.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter category name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter category description"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {currentCategory ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{currentCategory?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
