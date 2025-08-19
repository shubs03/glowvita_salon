
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Edit, Trash2, MoreVertical, Search, Clock, DollarSign, Tag, Image as ImageIcon, Star, BarChart2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';

type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // in minutes
  description: string;
  image: string;
};

const mockServices: Service[] = [
  { id: 'SRV-001', name: 'Deluxe Haircut', category: 'Hair Styling', price: 75, duration: 60, description: 'A premium haircut experience with wash, cut, and style.', image: 'https://placehold.co/400x400.png' },
  { id: 'SRV-002', name: 'Gel Manicure', category: 'Nail Care', price: 55, duration: 45, description: 'Long-lasting gel polish with detailed nail care.', image: 'https://placehold.co/400x400.png' },
  { id: 'SRV-003', name: 'Deep Cleansing Facial', category: 'Skincare', price: 120, duration: 75, description: 'A rejuvenating facial to cleanse and refresh your skin.', image: 'https://placehold.co/400x400.png' },
  { id: 'SRV-004', name: 'Balayage Color', category: 'Hair Coloring', price: 250, duration: 180, description: 'Natural-looking, sun-kissed hair color.', image: 'https://placehold.co/400x400.png' },
];

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>(mockServices);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [modalType, setModalType] = useState<'add' | 'edit'>('add');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (type: 'add' | 'edit', service?: Service) => {
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map(service => (
                    <Card key={service.id} className="flex flex-col">
                        <CardHeader className="p-0">
                             <div className="relative aspect-video">
                                <img src={service.image} alt={service.name} className="w-full h-full object-cover rounded-t-lg" />
                                <div className="absolute top-2 right-2">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/70 hover:bg-background">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenModal('edit', service)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(service)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow flex flex-col">
                           <div className="flex-grow">
                             <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
                             <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
                           </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                <span className="inline-flex items-center bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
                                    <Tag className="mr-1.5 h-3 w-3" /> {service.category}
                                </span>
                                <span className="inline-flex items-center bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
                                    <DollarSign className="mr-1.5 h-3 w-3" /> {service.price.toFixed(2)}
                                </span>
                                <span className="inline-flex items-center bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
                                    <Clock className="mr-1.5 h-3 w-3" /> {service.duration} mins
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

             <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{modalType === 'add' ? 'Add New Service' : 'Edit Service'}</DialogTitle>
                        <DialogDescription>
                            {modalType === 'add' ? 'Enter details for the new service.' : `Editing service: ${selectedService?.name}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Service Name</Label>
                            <Input id="name" defaultValue={selectedService?.name || ''} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" defaultValue={selectedService?.category || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input id="price" type="number" defaultValue={selectedService?.price || ''} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input id="duration" type="number" defaultValue={selectedService?.duration || ''} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" defaultValue={selectedService?.description || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">Image</Label>
                             <div className="flex items-center gap-4">
                                {selectedService?.image && <img src={selectedService.image} alt="preview" className="h-16 w-16 rounded-md object-cover"/>}
                                <Input id="image" type="file" className="flex-1"/>
                             </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button>Save</Button>
                    </DialogFooter>
                </DialogContent>
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
