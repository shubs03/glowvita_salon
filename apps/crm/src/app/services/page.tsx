
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Edit, Trash2, Search, DollarSign, Tag, Star, BarChart2, Eye, MoreVertical, X, UploadCloud, Users, CheckSquare, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Checkbox } from '@repo/ui/checkbox';
import { Switch } from '@repo/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Badge } from '@repo/ui/badge';
import { useGetCategoriesQuery, useCreateCategoryMutation, useGetServicesQuery, useCreateServiceMutation, useDeleteServiceMutation, useUpdateServiceMutation } from '@repo/store/api';
import Image from 'next/image';
import { Skeleton } from '@repo/ui/skeleton';
import { Pagination } from '@repo/ui/pagination';

type Service = {
  _id: string;
  id: string;
  name: string;
  category: { name: string };
  price: number;
  discountedPrice?: number;
  duration: number; // in minutes
  description: string;
  image: string;
  gender: 'men' | 'women' | 'unisex';
  staff: string[];
  commission: boolean;
  homeService: { available: boolean; charges?: number };
  weddingService: { available: boolean; charges?: number };
  bookingInterval: number;
  tax: { enabled: boolean; type: 'percentage' | 'fixed'; value?: number };
  onlineBooking: boolean;
  status: 'active' | 'inactive';
};

const mockStaff = ['Jane Doe', 'John Smith', 'Emily White'];

const AddItemModal = ({
  isOpen,
  onClose,
  onItemCreated,
  itemType,
  categoryId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: any) => void;
  itemType: 'Category' | 'Service';
  categoryId?: string;
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
    const [createService, { isLoading: isCreatingService }] = useCreateServiceMutation();
    
    const isLoading = isCreatingCategory || isCreatingService;

    const handleCreate = async () => {
        if (name.trim()) {
            try {
                let newItem;
                if (itemType === 'Category') {
                    newItem = await createCategory({ name, description }).unwrap();
                } else if (itemType === 'Service' && categoryId) {
                    newItem = await createService({ name, description, category: categoryId }).unwrap();
                }
                setName('');
                setDescription('');
                onItemCreated(newItem);
                onClose();
            } catch (error) {
                console.error(`Failed to create ${itemType}`, error);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New {itemType}</DialogTitle>
                    <DialogDescription>Add a new {itemType.toLowerCase()} to your list.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor={`new-${itemType}-name`}>{itemType} Name</Label>
                        <Input id={`new-${itemType}-name`} placeholder={`e.g., Hair Styling`} value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor={`new-${itemType}-description`}>Description</Label>
                        <Textarea id={`new-${itemType}-description`} placeholder="A brief description." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isLoading || !name.trim()}>
                        {isLoading ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ServiceFormModal = ({ isOpen, onClose, service, type }: { isOpen: boolean, onClose: () => void, service: Service | null, type: 'add' | 'edit' | 'view' }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useGetCategoriesQuery(undefined);
    const { data: allServices = [], isLoading: servicesLoading, refetch: refetchServices } = useGetServicesQuery(undefined);
    
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

    const [formData, setFormData] = useState<Partial<Service>>(service || {});
    
    useEffect(() => {
        const initialData = service || {};
        setFormData(initialData);
        setActiveTab('basic');
    }, [service, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSelectChange = (name: string, value: string | string[]) => {
      setFormData(prev => ({...prev, [name]: value}));
    };

    const handleCategoryChange = (categoryId: string) => {
        const category = categories.find((c: any) => c._id === categoryId);
        setFormData(prev => ({ ...prev, category: category, name: '' })); 
    };

    const handleCheckboxChange = (name: string, id: string, checked: boolean) => {
        const currentValues = formData[name as keyof Service] as string[] || [];
        const newValues = checked ? [...currentValues, id] : currentValues.filter(val => val !== id);
        setFormData(prev => ({...prev, [name]: newValues}));
    }

    const handleNestedChange = (parent: keyof Service, child: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent] as object),
                [child]: value
            }
        }));
    };

    const handleCategoryCreated = (newCategory: any) => {
        refetchCategories();
        // Automatically select the new category
        setFormData(prev => ({ ...prev, category: newCategory }));
    };
    
    const handleServiceCreated = (newService: any) => {
        refetchServices();
        // Automatically select the new service
        setFormData(prev => ({ ...prev, name: newService.name }));
    };

    const servicesForCategory = formData.category 
      ? allServices.filter((s: any) => s.category?._id === (formData.category as any)?._id) 
      : [];
      
    const selectedCategoryId = (formData.category as any)?._id;


    const renderBasicInfoTab = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="category">Service Category</Label>
                <div className="flex gap-2">
                    <Select onValueChange={handleCategoryChange} value={selectedCategoryId || ''}>
                        <SelectTrigger><SelectValue placeholder="Select Category"/></SelectTrigger>
                        <SelectContent>
                            {categoriesLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : categories.map((cat:any) => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsCategoryModalOpen(true)}><Plus className="h-4 w-4"/></Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <div className="flex gap-2">
                    <Select value={formData.name || ''} onValueChange={(value) => handleSelectChange('name', value)} disabled={!formData.category}>
                        <SelectTrigger><SelectValue placeholder={formData.category ? "Select Service" : "Select Category First"}/></SelectTrigger>
                        <SelectContent>
                            {servicesLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : servicesForCategory.map((s:any) => <SelectItem key={s._id} value={s.name}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsServiceModalOpen(true)} disabled={!formData.category}><Plus className="h-4 w-4"/></Button>
                </div>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="e.g., A premium haircut experience..." />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" name="price" type="number" placeholder="e.g., 500" value={formData.price} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
                <Input id="discountedPrice" name="discountedPrice" type="number" placeholder="e.g., 450" value={formData.discountedPrice} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" name="duration" type="number" placeholder="e.g., 60" value={formData.duration} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender || 'unisex'} onValueChange={(value) => handleSelectChange('gender', value)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unisex">Unisex</SelectItem>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="image">Service Image</Label>
            <Input id="image" type="file" />
        </div>
    </div>
    );

    const renderAdvancedTab = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label>Staff</Label>
            <div className="p-4 border rounded-md max-h-48 overflow-y-auto space-y-2">
            <div className="flex items-center space-x-2">
                <Checkbox id="staff-all" checked={formData.staff?.length === mockStaff.length} onCheckedChange={(checked) => handleSelectChange('staff', checked ? mockStaff : [])}/>
                <Label htmlFor="staff-all" className="font-semibold">Select All Staff</Label>
            </div>
            {mockStaff.map(staff => (
                <div key={staff} className="flex items-center space-x-2">
                <Checkbox id={`staff-${staff}`} checked={formData.staff?.includes(staff)} onCheckedChange={(checked) => handleCheckboxChange('staff', staff, checked as boolean)} />
                <Label htmlFor={`staff-${staff}`}>{staff}</Label>
                </div>
            ))}
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <Switch id="commission" checked={formData.commission} onCheckedChange={(checked) => handleSelectChange('commission', checked as any)} />
            <Label htmlFor="commission">Enable Staff Commission</Label>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-md space-y-2">
            <div className="flex items-center space-x-2">
                <Switch id="home-service" checked={formData.homeService?.available} onCheckedChange={(checked) => handleNestedChange('homeService', 'available', checked)}/>
                <Label htmlFor="home-service">Home Service</Label>
            </div>
            {formData.homeService?.available && <Input placeholder="Additional Charges (₹)" type="number" value={formData.homeService.charges} onChange={(e) => handleNestedChange('homeService', 'charges', Number(e.target.value))} />}
            </div>
            <div className="p-4 border rounded-md space-y-2">
            <div className="flex items-center space-x-2">
                <Switch id="wedding-service" checked={formData.weddingService?.available} onCheckedChange={(checked) => handleNestedChange('weddingService', 'available', checked)}/>
                <Label htmlFor="wedding-service">Wedding Service</Label>
            </div>
            {formData.weddingService?.available && <Input placeholder="Additional Charges (₹)" type="number" value={formData.weddingService.charges} onChange={(e) => handleNestedChange('weddingService', 'charges', Number(e.target.value))}/>}
            </div>
        </div>
    </div>
    );

    const renderBookingTab = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="bookingInterval">Booking Interval</Label>
            <Select value={String(formData.bookingInterval)} onValueChange={(value) => handleSelectChange('bookingInterval', value)}>
                <SelectTrigger><SelectValue placeholder="Select interval" /></SelectTrigger>
                <SelectContent>
                    {[5,10,15,20,25,30,45,60,90,120].map(i => <SelectItem key={i} value={String(i)}>{i} minutes</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center space-x-2">
            <Switch id="tax-enabled" checked={formData.tax?.enabled} onCheckedChange={(checked) => handleNestedChange('tax', 'enabled', checked)} />
            <Label htmlFor="tax-enabled">Enable Service Tax</Label>
        </div>
        {formData.tax?.enabled && (
            <div className="grid grid-cols-2 gap-4">
                <Select value={formData.tax.type} onValueChange={(value) => handleNestedChange('tax', 'type', value)}>
                    <SelectTrigger><SelectValue placeholder="Select tax type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                </Select>
                <Input type="number" placeholder="Tax Value" value={formData.tax.value} onChange={(e) => handleNestedChange('tax', 'value', Number(e.target.value))}/>
            </div>
        )}
        <div className="flex items-center space-x-2">
            <Switch id="onlineBooking" checked={formData.onlineBooking} onCheckedChange={(checked) => handleSelectChange('onlineBooking', checked as any)} />
            <Label htmlFor="onlineBooking">Enable Online Booking</Label>
        </div>
    </div>
    );

    if (type === 'view') {
    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{service?.name}</DialogTitle>
                <DialogDescription>{service?.description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-semibold">Category:</span> {service?.category?.name || 'N/A'}</div>
                  <div><span className="font-semibold">Price:</span> ₹{service?.price.toFixed(2)}</div>
                  <div><span className="font-semibold">Duration:</span> {service?.duration} mins</div>
                  <div><span className="font-semibold">Gender:</span> {service?.gender}</div>
                  <div><span className="font-semibold">Status:</span> {service?.status}</div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </DialogFooter>
        </DialogContent>
    );
    }

    return (
    <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
            <DialogTitle>{type === 'add' ? 'Add New Service' : 'Edit Service'}</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="advanced" disabled={!formData.name}>Advanced</TabsTrigger>
                <TabsTrigger value="booking" disabled={!formData.name}>Booking & Tax</TabsTrigger>
            </TabsList>
            <div className="py-4 flex-grow overflow-y-auto">
                <TabsContent value="basic">{renderBasicInfoTab()}</TabsContent>
                <TabsContent value="advanced">{renderAdvancedTab()}</TabsContent>
                <TabsContent value="booking">{renderBookingTab()}</TabsContent>
            </div>
        </Tabs>
        <AddItemModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onItemCreated={handleCategoryCreated} itemType="Category" />
        <AddItemModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onItemCreated={handleServiceCreated} itemType="Service" categoryId={selectedCategoryId} />
            <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button>Save Service</Button>
        </DialogFooter>
    </DialogContent>
    )
};


export default function ServicesPage() {
    const { data: services = [], isLoading, isError, refetch } = useGetServicesQuery(undefined);
    const [deleteService] = useDeleteServiceMutation();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = useMemo(() => {
        return services.filter((service: Service) => 
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (service.category && service.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [services, searchTerm]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredServices.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

    const handleOpenModal = (type: 'add' | 'edit' | 'view', service?: Service) => {
        setModalType(type);
        setSelectedService(service || null);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = (service: Service) => {
        setSelectedService(service);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if(selectedService) {
            await deleteService({ id: selectedService._id }).unwrap();
        }
        setIsDeleteModalOpen(false);
        setSelectedService(null);
    };
    
    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
                <Skeleton className="h-12 w-full" />
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center">
                <h3 className="text-lg font-semibold text-destructive">Failed to load services</h3>
                <p className="text-muted-foreground">Please try again later.</p>
                <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{services.length}</div>
                        <p className="text-xs text-muted-foreground">Total services offered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Deluxe Haircut</div>
                        <p className="text-xs text-muted-foreground">Top-selling service</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Service Price</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{ (services.reduce((acc: number, s: Service) => acc + s.price, 0) / services.length || 0).toFixed(2) }</div>
                        <p className="text-xs text-muted-foreground">Average across all services</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Set(services.map((s: Service) => s.category?.name)).size}</div>
                        <p className="text-xs text-muted-foreground">Unique service categories</p>
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Service Management</h1>
                    <p className="text-muted-foreground">Manage the services your salon offers.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder="Search services..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => handleOpenModal('add')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.length > 0 ? currentItems.map((service: Service) => (
                                    <TableRow key={service._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Image src={service.image || "https://placehold.co/40x40.png"} alt={service.name} width={40} height={40} className="h-10 w-10 rounded-md object-cover"/>
                                                <span className="font-medium">{service.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{service.category?.name || 'Uncategorized'}</Badge></TableCell>
                                        <TableCell>{service.duration} mins</TableCell>
                                        <TableCell>₹{service.price?.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>{service.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleOpenModal('view', service)}><Eye className="mr-2 h-4 w-4"/> View</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleOpenModal('edit', service)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(service)}><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                            No services found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredServices.length > 0 && (
                        <div className="p-4 border-t">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={setItemsPerPage}
                                totalItems={filteredServices.length}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <ServiceFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} service={selectedService} type={modalType} />
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Service?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
