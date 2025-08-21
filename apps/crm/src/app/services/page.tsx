
"use client";

import { useState, useEffect } from 'react';
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
import { useGetCategoriesQuery, useCreateCategoryMutation, useGetServicesQuery } from '@repo/store/api';
import Image from 'next/image';

type Service = {
  id: string;
  name: string;
  category: string;
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

const mockServices: Service[] = [
  { id: 'SRV-001', name: 'Deluxe Haircut', category: 'Hair Styling', price: 75, discountedPrice: 65, duration: 60, description: 'A premium haircut experience with wash, cut, and style.', image: 'https://placehold.co/400x400.png', gender: 'unisex', staff: ['Jane Doe', 'John Smith'], commission: true, homeService: { available: true, charges: 20 }, weddingService: { available: false }, bookingInterval: 15, tax: { enabled: true, type: 'percentage', value: 18 }, onlineBooking: true, status: 'active' },
  { id: 'SRV-002', name: 'Gel Manicure', category: 'Nail Care', price: 55, duration: 45, description: 'Long-lasting gel polish with detailed nail care.', image: 'https://placehold.co/400x400.png', gender: 'women', staff: ['Emily White'], commission: false, homeService: { available: false }, weddingService: { available: false }, bookingInterval: 10, tax: { enabled: false, type: 'fixed', value: 0 }, onlineBooking: true, status: 'active' },
  { id: 'SRV-003', name: 'Deep Cleansing Facial', category: 'Skincare', price: 120, duration: 75, description: 'A rejuvenating facial to cleanse and refresh your skin.', image: 'https://placehold.co/400x400.png', gender: 'unisex', staff: ['Jane Doe'], commission: true, homeService: { available: false }, weddingService: { available: true, charges: 50 }, bookingInterval: 30, tax: { enabled: true, type: 'fixed', value: 10 }, onlineBooking: true, status: 'inactive' },
  { id: 'SRV-004', name: 'Balayage Color', category: 'Hair Coloring', price: 250, duration: 180, description: 'Natural-looking, sun-kissed hair color.', image: 'https://placehold.co/400x400.png', gender: 'unisex', staff: ['John Smith'], commission: true, homeService: { available: false }, weddingService: { available: true, charges: 100 }, bookingInterval: 60, tax: { enabled: true, type: 'percentage', value: 18 }, onlineBooking: false, status: 'active' },
];

const mockStaff = ['Jane Doe', 'John Smith', 'Emily White'];

const AddCategoryModal = ({isOpen, onClose, onCategoryCreated}: {isOpen: boolean, onClose: () => void, onCategoryCreated: (category: any) => void}) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [createCategory, { isLoading }] = useCreateCategoryMutation();

    const handleCreateCategory = async () => {
        if (newCategoryName.trim()) {
            try {
                const newCategory = await createCategory({ name: newCategoryName, description }).unwrap();
                setNewCategoryName('');
                setDescription('');
                onCategoryCreated(newCategory);
                onClose();
            } catch (error) {
                console.error("Failed to create category", error);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>Add a new category for your services.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="new-category">Category Name</Label>
                        <Input id="new-category" placeholder="e.g., Hair Styling" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} disabled={isLoading}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-category-description">Description</Label>
                        <Textarea id="new-category-description" placeholder="A brief description of the category." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleCreateCategory} disabled={isLoading || !newCategoryName.trim()}>
                        {isLoading ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ServiceFormModal = ({ isOpen, onClose, service, type }: { isOpen: boolean, onClose: () => void, service: Service | null, type: 'add' | 'edit' | 'view' }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery(undefined);
    const { data: allServices = [], isLoading: servicesLoading } = useGetServicesQuery(undefined);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isCreatingNewService, setIsCreatingNewService] = useState(false);

    const [formData, setFormData] = useState<Partial<Service>>(service || {});

    useEffect(() => {
        const initialData = service || {};
        setFormData(initialData);
        setActiveTab('basic');
        setIsCreatingNewService(!service);
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
        setFormData(prev => ({ ...prev, category: category?.name, name: '' })); 
        setIsCreatingNewService(false);
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
        setFormData(prev => ({ ...prev, category: newCategory.name }));
        setIsCreatingNewService(true);
    };
    
    const servicesForCategory = formData.category 
      ? allServices.filter((s: any) => s.category?.name === formData.category) 
      : [];

    const renderBasicInfoTab = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="category">Service Category</Label>
                <div className="flex gap-2">
                    <Select onValueChange={handleCategoryChange} value={categories.find((c: any) => c.name === formData.category)?._id || ''}>
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
                {isCreatingNewService || servicesForCategory.length === 0 ? (
                     <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Enter a new service name" />
                ) : (
                    <div className="flex gap-2">
                        <Select value={formData.name || ''} onValueChange={(value) => handleSelectChange('name', value)}>
                            <SelectTrigger><SelectValue placeholder="Select Service"/></SelectTrigger>
                            <SelectContent>
                                {servicesForCategory.map((s:any) => <SelectItem key={s._id} value={s.name}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingNewService(true)}>New</Button>
                    </div>
                )}
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
        <AddCategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onCategoryCreated={handleCategoryCreated} />
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
            <div className="grid gap-4 py-4">
                {/* Display all details here */}
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
            <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button>Save Service</Button>
        </DialogFooter>
    </DialogContent>
    )
};


export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>(mockServices);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (type: 'add' | 'edit' | 'view', service?: Service) => {
        setModalType(type);
        setSelectedService(service || null);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = (service: Service) => {
        setSelectedService(service);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if(selectedService) {
            setServices(services.filter(s => s.id !== selectedService.id));
        }
        setIsDeleteModalOpen(false);
        setSelectedService(null);
    };
    
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
                        <div className="text-2xl font-bold">₹125.00</div>
                        <p className="text-xs text-muted-foreground">Average across all services</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Set(services.map(s => s.category)).size}</div>
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
                                {filteredServices.map(service => (
                                    <TableRow key={service.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Image src={service.image} alt={service.name} width={40} height={40} className="h-10 w-10 rounded-md object-cover"/>
                                                <span className="font-medium">{service.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{service.category}</Badge></TableCell>
                                        <TableCell>{service.duration} mins</TableCell>
                                        <TableCell>₹{service.price.toFixed(2)}</TableCell>
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
                                ))}
                            </TableBody>
                        </Table>
                    </div>
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

    