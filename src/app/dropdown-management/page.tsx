
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';

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
}: {
  listTitle: string;
  listDescription: string;
  items: DropdownItem[];
  type: string;
  onUpdate: (item: DropdownItem, action: 'add' | 'edit' | 'delete') => void;
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
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

    const action = currentItem ? 'edit' : 'add';
    const itemData: DropdownItem = {
      ...currentItem,
      _id: currentItem?._id || `new_${Date.now()}`,
      name,
      description,
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
      onUpdate(currentItem, 'delete');
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
          <Button onClick={() => handleOpenModal()}>
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
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No items found.
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={currentItem?.description || ''} />
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
  const [data, setData] = useState<DropdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/super-data');
      if (response.ok) {
        const items = await response.json();
        setData(items);
      }
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (item: DropdownItem, action: 'add' | 'edit' | 'delete') => {
    let response;
    try {
      if (action === 'add') {
        response = await fetch('/api/super-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      } else if (action === 'edit') {
        response = await fetch('/api/super-data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item._id, ...item }),
        });
      } else if (action === 'delete') {
        response = await fetch('/api/super-data', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item._id }),
        });
      }

      if (response && response.ok) {
        fetchData(); // Refetch data to update the UI
      } else {
        console.error("Failed to update item:", await response?.text());
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  const LocationManager = () => {
    const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
    const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

    const countries = data.filter(item => item.type === 'country') as LocationItem[];
    const states = data.filter(item => item.type === 'state' && item.parentId === selectedCountryId) as LocationItem[];
    const cities = data.filter(item => item.type === 'city' && item.parentId === selectedStateId) as LocationItem[];

    // This is a simplified version. A full implementation would need its own set of modals and state management.
    return (
        <Card>
            <CardHeader>
                <CardTitle>Location Management</CardTitle>
                <CardDescription>Manage countries, states, and cities.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Countries */}
                    <div className="border p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">Countries</h4>
                            <Button size="sm"><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="space-y-1">
                            {countries.map(country => (
                                <div key={country._id} onClick={() => setSelectedCountryId(country._id)}
                                     className={`p-2 rounded-md cursor-pointer ${selectedCountryId === country._id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}>
                                    {country.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* States */}
                    <div className="border p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">States</h4>
                            <Button size="sm" disabled={!selectedCountryId}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="space-y-1">
                            {states.map(state => (
                                <div key={state._id} onClick={() => setSelectedStateId(state._id)}
                                     className={`p-2 rounded-md cursor-pointer ${selectedStateId === state._id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}>
                                    {state.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cities */}
                    <div className="border p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">Cities</h4>
                            <Button size="sm" disabled={!selectedStateId}><Plus className="h-4 w-4" /></Button>
                        </div>
                         <div className="space-y-1">
                            {cities.map(city => (
                                <div key={city._id} className="p-2 rounded-md">
                                    {city.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  };

  const ServiceCategoryManager = () => {
    const serviceCategories = data.filter(item => item.type === 'serviceCategory');
    const services = data.filter(item => item.type === 'service');
    // Simplified view
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
                              <Select>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Add a service to this category..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {services.map(service => (
                                          <SelectItem key={service._id} value={service.name}>
                                              {service.name}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                              {/* This needs more complex logic to show assigned services */}
                              <p>Assigned services will appear here.</p>
                          </div>
                      </div>
                  ))}
              </div>
          </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
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
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
