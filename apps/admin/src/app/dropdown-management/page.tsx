
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Edit, Trash2, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { toast } from 'sonner';
import {
  useGetSuperDataQuery,
  useCreateSuperDataItemMutation,
  useUpdateSuperDataItemMutation,
  useDeleteSuperDataItemMutation,
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
  const [currentItem, setCurrentItem] = useState<DropdownItem | null>(null);

  const handleOpenModal = (item: DropdownItem | null = null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement)?.value;
    const link = (form.elements.namedItem('link') as HTMLInputElement)?.value;


    const action = currentItem ? 'edit' : 'add';
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
                    {type === 'socialPlatform' ? (
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
                <DialogTitle>{currentItem ? 'Edit' : 'Add'} Item</DialogTitle>
                <DialogDescription>
                  {currentItem ? `Editing "${currentItem.name}".` : `Add a new item to "${listTitle}".`}
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
    const { data = [], isLoading, isError } = useGetSuperDataQuery();
    const [createItem] = useCreateSuperDataItemMutation();
    const [updateItem] = useUpdateSuperDataItemMutation();
    const [deleteItem] = useDeleteSuperDataItemMutation();


    const handleUpdate = async (item: Partial<DropdownItem>, action: 'add' | 'edit' | 'delete') => {
        try {
            if (action === 'add') {
                await createItem(item).unwrap();
                toast.success('Item added successfully');
            } else if (action === 'edit') {
                await updateItem({ id: item._id, ...item }).unwrap();
                toast.success('Item updated successfully');
            } else if (action === 'delete') {
                await deleteItem({ id: item._id }).unwrap();
                toast.success('Item deleted successfully');
            }
        } catch (error) {
            toast.error(`Failed to ${action} item.`);
            console.error(`API call failed for ${action}:`, error);
        }
    };

    const LocationManager = () => {
        const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
        const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [modalConfig, setModalConfig] = useState<{ type: 'country' | 'state' | 'city', parentId?: string | null }>({ type: 'country' });
        
        const countries = data.filter(item => item.type === 'country') as DropdownItem[];
        const states = data.filter(item => item.type === 'state' && item.parentId === selectedCountryId) as DropdownItem[];
        const cities = data.filter(item => item.type === 'city' && item.parentId === selectedStateId) as DropdownItem[];

        const handleOpenModal = (type: 'country' | 'state' | 'city', parentId?: string | null) => {
            setModalConfig({ type, parentId });
            setIsModalOpen(true);
        };
    
        const handleLocationSave = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const itemData: Partial<DropdownItem> = {
                name,
                type: modalConfig.type,
                parentId: modalConfig.parentId,
            };
            await handleUpdate(itemData, 'add');
            setIsModalOpen(false);
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Location Management</CardTitle>
                    <CardDescription>Manage countries, states, and cities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border p-4 rounded-md space-y-2">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Countries</h4>
                                <Button size="sm" onClick={() => handleOpenModal('country')}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-1">
                                {countries.map(country => (
                                    <div key={country._id} onClick={() => { setSelectedCountryId(country._id); setSelectedStateId(null); }}
                                        className={`p-2 rounded-md cursor-pointer ${selectedCountryId === country._id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}>
                                        {country.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border p-4 rounded-md space-y-2">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">States</h4>
                                <Button size="sm" disabled={!selectedCountryId} onClick={() => handleOpenModal('state', selectedCountryId)}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-1">
                                {states.map(state => (
                                    <div key={state._id} onClick={() => setSelectedStateId(state._id)}
                                        className={`p-2 rounded-md cursor-pointer ${selectedStateId === state._id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}>
                                        {state.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border p-4 rounded-md space-y-2">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Cities</h4>
                                <Button size="sm" disabled={!selectedStateId} onClick={() => handleOpenModal('city', selectedStateId)}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-1">
                                {cities.map(city => (
                                    <div key={city._id} className="p-2 rounded-md">
                                        {city.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-md">
                         <form onSubmit={handleLocationSave}>
                            <DialogHeader>
                                <DialogTitle>Add New {modalConfig.type}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <Label htmlFor="name">{modalConfig.type.charAt(0).toUpperCase() + modalConfig.type.slice(1)} Name</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Card>
        );
    };

    const ServiceCategoryManager = () => {
        const serviceCategories = useMemo(() => data.filter(item => item.type === 'serviceCategory'), [data]);
        const services = useMemo(() => data.filter(item => item.type === 'service'), [data]);
    
        const handleServiceAssignment = async (categoryId: string, serviceId: string) => {
            const serviceToUpdate = services.find(s => s._id === serviceId);
            if (serviceToUpdate) {
                await handleUpdate({ ...serviceToUpdate, parentId: categoryId }, 'edit');
            }
        };
    
        const handleServiceUnassignment = async (serviceId: string) => {
            const serviceToUpdate = services.find(s => s._id === serviceId);
            if (serviceToUpdate) {
                await handleUpdate({ ...serviceToUpdate, parentId: undefined }, 'edit');
            }
        };

        const servicesByCategory = useMemo(() => {
            const assignedServices = new Set<string>();
            const mapping = serviceCategories.reduce((acc, category) => {
                const assigned = services.filter(s => s.parentId === category._id);
                assigned.forEach(s => assignedServices.add(s._id));
                acc[category._id] = assigned;
                return acc;
            }, {} as Record<string, DropdownItem[]>);
            const unassignedServices = services.filter(s => !assignedServices.has(s._id));
            return { mapping, unassignedServices };
        }, [serviceCategories, services]);
    
        return (
          <Card>
              <CardHeader>
                  <CardTitle>Services by Category</CardTitle>
                  <CardDescription>Assign services to different categories.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      {serviceCategories.map(category => (
                          <div key={category._id} className="border p-4 rounded-lg">
                              <h4 className="font-bold mb-2">{category.name}</h4>
                              <div className="mb-2">
                                  <Select onValueChange={(serviceId) => handleServiceAssignment(category._id, serviceId)}>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Add a service to this category..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                          {servicesByCategory.unassignedServices.map(service => (
                                              <SelectItem key={service._id} value={service._id}>
                                                  {service.name}
                                              </SelectItem>
                                          ))}
                                          {servicesByCategory.unassignedServices.length === 0 && <p className='p-2 text-sm text-muted-foreground'>No unassigned services</p>}
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                  {servicesByCategory.mapping[category._id]?.map(service => (
                                      <Badge key={service._id} variant="secondary">
                                          {service.name}
                                          <button onClick={() => handleServiceUnassignment(service._id)} className="ml-2 rounded-full hover:bg-muted-foreground/20">
                                            <Trash2 className="h-3 w-3"/>
                                          </button>
                                      </Badge>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>
        );
    };

    if (isError) {
        return <div className="p-8 text-center text-destructive">Error fetching data. Please try again.</div>;
    }

    const dropdownTypes = [
        { key: 'specialization', title: 'Doctor Specializations', description: 'Manage the list of specializations for doctors.', tab: 'general' },
        { key: 'faqCategory', title: 'FAQ Categories', description: 'Manage categories for organizing FAQs.', tab: 'general' },
        { key: 'bank', title: 'Bank Names', description: 'Manage a list of supported banks.', tab: 'general' },
        { key: 'documentType', title: 'Document Types', description: 'Manage types of documents required for verification.', tab: 'general' },
        { key: 'serviceCategory', title: 'Salon Service Categories', description: 'Define categories for various salon services.', tab: 'services' },
        { key: 'service', title: 'Salon Services', description: 'Manage individual salon services.', tab: 'services' },
        { key: 'designation', title: 'Admin Designations', description: 'Manage the list of available staff designations.', tab: 'admin' },
        { key: 'smsType', title: 'SMS Template Types', description: 'Manage types for SMS templates.', tab: 'marketing' },
        { key: 'socialPlatform', title: 'Social Media Platforms', description: 'Manage platforms for social posts.', tab: 'marketing' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Dropdowns</h1>
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 max-w-4xl mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                    <TabsTrigger value="marketing">Marketing</TabsTrigger>
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
                        {dropdownTypes.filter(d => d.tab === 'services').map(d => (
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
                        <ServiceCategoryManager />
                    </div>
                </TabsContent>
                <TabsContent value="locations">
                    <LocationManager />
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
            </Tabs>
        </div>
    );
}
