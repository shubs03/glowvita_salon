
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

interface DropdownItem {
  id: string;
  name: string;
  description: string;
}

interface ManageableList {
  title: string;
  description: string;
  items: DropdownItem[];
}

const initialData: Record<string, ManageableList> = {
  specializations: {
    title: "Doctor Specializations",
    description: "Manage the list of specializations for doctors.",
    items: [
      { id: 'spec_1', name: 'Dermatologist', description: 'Specializes in skin, hair, and nails.' },
      { id: 'spec_2', name: 'Trichologist', description: 'Specializes in the health of hair and scalp.' },
      { id: 'spec_3', name: 'Aesthetic Dermatologist', description: 'Focuses on cosmetic procedures.' },
    ],
  },
  faqCategories: {
    title: "FAQ Categories",
    description: "Manage categories for organizing FAQs.",
    items: [
      { id: 'faq_1', name: 'Booking', description: 'Questions related to booking appointments.' },
      { id: 'faq_2', name: 'Payments', description: 'Questions related to payments and refunds.' },
      { id: 'faq_3', name: 'Account', description: 'Questions related to user accounts.' },
    ],
  },
  serviceCategories: {
    title: "Salon Service Categories",
    description: "Define categories for various salon services.",
    items: [
      { id: 'sc_1', name: 'Hair Styling', description: 'All services related to hair.' },
      { id: 'sc_2', name: 'Nail Art', description: 'All services for nail care and design.' },
      { id: 'sc_3', name: 'Skincare', description: 'Facials, treatments, and other skin services.' },
    ]
  },
  designations: {
    title: "Admin Designations",
    description: "Manage the list of available staff designations.",
    items: [
      { id: 'des_1', name: 'Administrator', description: 'Top-level administrative role.' },
      { id: 'des_2', name: 'Support Staff', description: 'Handles customer and vendor support.' },
      { id: 'des_3', name: 'Content Editor', description: 'Manages website and app content.' },
    ],
  },
  smsTypes: {
      title: "SMS Template Types",
      description: "Manage types for SMS templates.",
      items: [
          { id: 'sms_1', name: 'Promotional', description: 'For marketing and special offers.' },
          { id: 'sms_2', name: 'Transactional', description: 'For notifications and alerts.' },
      ]
  },
  socialPlatforms: {
      title: "Social Media Platforms",
      description: "Manage platforms for social posts.",
      items: [
          { id: 'social_1', name: 'Instagram', description: 'Photo and video sharing.' },
          { id: 'social_2', name: 'Facebook', description: 'General social networking.' },
          { id: 'social_3', name: 'LinkedIn', description: 'Professional networking.' },
      ]
  }
};

const DropdownManager = ({ list, onUpdate }: { list: ManageableList; onUpdate: (items: DropdownItem[]) => void; }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<DropdownItem | null>(null);

  const handleOpenModal = (item: DropdownItem | null = null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

    if (currentItem) {
      // Edit existing item
      onUpdate(list.items.map(item => item.id === currentItem.id ? { ...item, name, description } : item));
    } else {
      // Add new item
      onUpdate([...list.items, { id: `new_${Date.now()}`, name, description }]);
    }
    setIsModalOpen(false);
    setCurrentItem(null);
  };
  
  const handleDeleteClick = (item: DropdownItem) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentItem) {
      onUpdate(list.items.filter(item => item.id !== currentItem.id));
    }
    setIsDeleteModalOpen(false);
    setCurrentItem(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{list.title}</CardTitle>
            <CardDescription>{list.description}</CardDescription>
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
              {list.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(item)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {list.items.length === 0 && (
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
                            {currentItem ? `Editing "${currentItem.name}".` : `Add a new item to "${list.title}".`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={currentItem?.name || ''} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={currentItem?.description || ''} required />
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
  const [data, setData] = useState(initialData);

  const handleUpdate = (key: string, updatedItems: DropdownItem[]) => {
    setData(prevData => ({
      ...prevData,
      [key]: {
        ...prevData[key],
        items: updatedItems
      }
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Dropdown Management</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
            <div className="space-y-8">
                <DropdownManager list={data.specializations} onUpdate={(items) => handleUpdate('specializations', items)} />
                <DropdownManager list={data.faqCategories} onUpdate={(items) => handleUpdate('faqCategories', items)} />
                <DropdownManager list={data.serviceCategories} onUpdate={(items) => handleUpdate('serviceCategories', items)} />
            </div>
        </TabsContent>
        
        <TabsContent value="admin">
            <div className="space-y-8">
                <DropdownManager list={data.designations} onUpdate={(items) => handleUpdate('designations', items)} />
            </div>
        </TabsContent>
        
        <TabsContent value="marketing">
             <div className="space-y-8">
                <DropdownManager list={data.smsTypes} onUpdate={(items) => handleUpdate('smsTypes', items)} />
                <DropdownManager list={data.socialPlatforms} onUpdate={(items) => handleUpdate('socialPlatforms', items)} />
            </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
