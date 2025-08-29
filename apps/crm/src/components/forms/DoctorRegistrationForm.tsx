
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';
import { useCreateDoctorMutation, useGetSuperDataQuery } from '@repo/store/api';
import { Label } from '@repo/ui/label';
import { Checkbox } from '@repo/ui/checkbox';
import { Skeleton } from '@repo/ui/skeleton';
import { CheckCircle, Stethoscope, User, HeartPulse, Brain, Bone, Baby, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@repo/ui/cn';

const StepIndicator = ({ currentStep, setStep }) => {
    const steps = [
        { id: 1, name: 'Role', icon: User },
        { id: 2, name: 'Specialty', icon: Stethoscope },
        { id: 3, name: 'Disease Focus', icon: HeartPulse },
        { id: 4, name: 'Basic Details', icon: User },
    ];
    
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "flex-1" : "")}>
                        <div className="flex items-center">
                            <button 
                                onClick={() => step.id < currentStep && setStep(step.id)}
                                className={cn(
                                    "flex items-center text-sm font-medium",
                                    step.id < currentStep ? "cursor-pointer" : "cursor-default"
                                )}
                                disabled={step.id >= currentStep}
                            >
                                <span className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                                    currentStep > step.id ? "bg-primary hover:bg-primary/90 text-white" :
                                    currentStep === step.id ? "border-2 border-primary bg-primary/10 text-primary" :
                                    "border-2 border-gray-300 bg-background text-muted-foreground"
                                )}>
                                    {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                </span>
                                <span className={cn(
                                    "ml-3 hidden font-medium text-muted-foreground md:inline",
                                    currentStep >= step.id && "text-foreground"
                                )}>
                                    {step.name}
                                </span>
                            </button>
                            {stepIdx !== steps.length - 1 && (
                                <div className="absolute right-0 top-4 -z-10 hidden h-0.5 w-full bg-gray-200 md:block" aria-hidden="true" />
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export function DoctorRegistrationForm({ onSuccess }) {
  const { data: dropdownData = [], isLoading: isLoadingDropdowns } = useGetSuperDataQuery(undefined);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    doctorType: '',
    specialties: [],
    diseases: [],
    experience: '0',
    clinicName: 'N/A',
    clinicAddress: 'N/A',
    state: 'N/A',
    city: 'N/A',
    pincode: '000000',
    registrationNumber: 'TEMP-REG-12345',
    physicalConsultationStartTime: '00:00',
    physicalConsultationEndTime: '00:00',
    assistantName: 'N/A',
    assistantContact: '0000000000',
    doctorAvailability: 'Online',
    workingWithHospital: false,
    videoConsultation: false,
  });

  const [step, setStep] = useState(1);
  const [createDoctor, { isLoading }] = useCreateDoctorMutation();
  
  // Use a static array for the doctor types
  const doctorTypes = [
    { name: "Physician", description: "Specializes in non-surgical medical care." },
    { name: "Surgeon", description: "Specializes in surgical procedures." }
  ];

  const allSpecialties = useMemo(() => dropdownData.filter(d => d.type === 'specialization'), [dropdownData]);
  const allDiseases = useMemo(() => dropdownData.filter(d => d.type === 'disease'), [dropdownData]);

  const filteredSpecialties = useMemo(() => {
    return formData.doctorType ? allSpecialties.filter(s => s.doctorType === formData.doctorType) : [];
  }, [allSpecialties, formData.doctorType]);

  const filteredDiseases = useMemo(() => {
    const diseaseMap = new Map();
    if (formData.specialties.length > 0) {
      const selectedSpecialtyIds = formData.specialties;
      
      allDiseases.forEach(disease => {
        if (selectedSpecialtyIds.includes(disease.parentId)) {
          const specialty = allSpecialties.find(s => s._id === disease.parentId);
          if (specialty) {
            if (!diseaseMap.has(specialty.name)) {
              diseaseMap.set(specialty.name, []);
            }
            diseaseMap.get(specialty.name).push(disease);
          }
        }
      });
    }
    return Array.from(diseaseMap.entries());
  }, [allDiseases, allSpecialties, formData.specialties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorTypeChange = (typeName: string) => {
    setFormData(prev => ({ ...prev, doctorType: typeName, specialties: [], diseases: [] }));
  };

  const handleSpecialtyChange = (specId: string) => {
    setFormData(prev => {
      const newSpecialties = prev.specialties.includes(specId)
        ? prev.specialties.filter(id => id !== specId)
        : [...prev.specialties, specId];
      
      const validDiseases = prev.diseases.filter(diseaseId => {
        const disease = allDiseases.find(d => d._id === diseaseId);
        return newSpecialties.includes(disease?.parentId);
      });

      return { ...prev, specialties: newSpecialties, diseases: validDiseases };
    });
  };

  const handleDiseaseChange = (diseaseId: string) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.includes(diseaseId)
        ? prev.diseases.filter(id => id !== diseaseId)
        : [...prev.diseases, diseaseId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    const specialtyNames = formData.specialties.map(id => allSpecialties.find(s => s._id === id)?.name).filter(Boolean);
    const diseaseNames = formData.diseases.map(id => allDiseases.find(d => d._id === id)?.name).filter(Boolean);
    
    const submissionData = {
      ...formData,
      specialties: specialtyNames,
      diseases: diseaseNames,
    };
    
    try {
      await createDoctor(submissionData).unwrap();
      toast.success("Doctor registration submitted successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  const nextStep = () => {
    if(step === 1 && !formData.doctorType) return toast.error("Please select a role.");
    if(step === 2 && formData.specialties.length === 0) return toast.error("Please select at least one specialty.");
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Doctor Registration</CardTitle>
        <CardDescription>Join our platform as a healthcare professional.</CardDescription>
        <div className="pt-4">
          <StepIndicator currentStep={step} setStep={setStep} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <h3 className="font-semibold text-lg text-center">What describes you best?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {doctorTypes.map(type => (
                  <Card
                    key={type.name}
                    onClick={() => handleDoctorTypeChange(type.name)}
                    className={cn(
                      "cursor-pointer transition-all duration-200 text-center p-6",
                      formData.doctorType === type.name 
                        ? "border-primary ring-2 ring-primary bg-primary/5" 
                        : "hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <div className="text-primary mb-3">
                      {type.name === 'Physician' ? <HeartPulse className="h-10 w-10 mx-auto" /> : <Stethoscope className="h-10 w-10 mx-auto" />}
                    </div>
                    <h4 className="font-bold text-lg">{type.name}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <h3 className="font-semibold text-lg text-center">Select your specialty/specialties</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {isLoadingDropdowns ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />) : (
                  filteredSpecialties.map(spec => (
                    <div
                      key={spec._id}
                      onClick={() => handleSpecialtyChange(spec._id)}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-200",
                        formData.specialties.includes(spec._id)
                          ? "border-primary ring-2 ring-primary bg-primary/5"
                          : "hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <Bone className="h-8 w-8 text-primary mb-2" />
                      <span className="font-medium text-sm">{spec.name}</span>
                    </div>
                  ))
                 )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <h3 className="font-semibold text-lg text-center">Which diseases do you specialize in?</h3>
              {filteredDiseases.length > 0 ? filteredDiseases.map(([specialtyName, diseases]) => (
                <div key={specialtyName}>
                  <h4 className="font-semibold mb-2">{specialtyName}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border p-4 rounded-md">
                    {diseases.map(disease => (
                      <div key={disease._id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={disease._id}
                          checked={formData.diseases.includes(disease._id)}
                          onCheckedChange={(checked) => handleDiseaseChange(disease._id, !!checked)}
                        />
                        <Label htmlFor={disease._id} className="text-sm font-normal">{disease.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground">No diseases found for selected specialties. You can add them later.</p>
              )}
            </div>
          )}

          {step === 4 && (
             <div className="space-y-4 animate-in fade-in-50 duration-500 max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg text-center">Finally, a few basic details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="name" placeholder="Full Name" onChange={handleChange} required />
                <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} required />
                <Input name="experience" type="number" placeholder="Years of Experience" onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t mt-8">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 4 && (
              <Button type="button" onClick={nextStep}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 4 && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```,
  </change>
  <change>
    <file>/apps/admin/src/app/dropdown-management/page.tsx</file>
    <content><![CDATA[
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
  doctorType?: 'Physician' | 'Surgeon';
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

const HierarchicalManager = ({ title, description, topLevelType, childTypes, data, onUpdate, isLoading }: { title: string; description: string; topLevelType: string; childTypes: { type: string, name: string, parentType: string }[]; data: DropdownItem[]; onUpdate: (item: Partial<DropdownItem>, action: 'add' | 'edit' | 'delete') => void; isLoading: boolean; }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<DropdownItem> | null>(null);
    const [modalConfig, setModalConfig] = useState<{ type: string; parentId?: string; parentName?: string; action: 'add' | 'edit' }>({ type: topLevelType, action: 'add' });
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const topLevelItems = useMemo(() => data.filter(item => item.type === topLevelType), [data, topLevelType]);

    const getChildren = (parentId: string, childType: string) => {
        return data.filter(item => item.type === childType && item.parentId === parentId);
    }
    
    const handleOpenModal = (action: 'add' | 'edit', type: string, item?: Partial<DropdownItem>, parentId?: string, parentName?: string) => {
        setCurrentItem(item || null);
        setModalConfig({ type, parentId, parentName, action });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

        let doctorType;
        if (modalConfig.type === 'specialization') {
            doctorType = (form.elements.namedItem('doctorType') as HTMLSelectElement).value as DropdownItem['doctorType'];
        }
        
        const itemData: Partial<DropdownItem> = {
            _id: currentItem?._id,
            name,
            description,
            type: modalConfig.type,
            parentId: modalConfig.parentId,
            ...(doctorType && { doctorType }), // Add doctorType if it exists
        };

        await onUpdate(itemData, modalConfig.action);
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleDeleteClick = (item: DropdownItem) => {
        setCurrentItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (currentItem?._id) {
            onUpdate({ _id: currentItem._id }, 'delete');
        }
        setIsDeleteModalOpen(false);
        setCurrentItem(null);
    };

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const renderItem = (item: DropdownItem, level: number, parentName?: string) => {
        const childConfig = childTypes.find(c => c.parentType === item.type);
        const children = childConfig ? getChildren(item._id, childConfig.type) : [];
        const isExpanded = expandedItems[item._id];

        return (
            <div key={item._id}>
                <div className="flex items-center gap-2 py-2 pr-2" style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}>
                    <button onClick={() => toggleExpand(item._id)} className="p-1" disabled={!childConfig}>
                       {childConfig ? (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <div className="w-4 h-4"></div>}
                    </button>
                    <span className="flex-grow font-medium">{item.name}</span>
                    {childConfig && (
                        <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleOpenModal('add', childConfig.type, undefined, item._id, item.name)}>
                            <Plus className="mr-1 h-3 w-3" /> Add {childConfig.name}
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenModal('edit', item.type, item, item.parentId, parentName)}>
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteClick(item)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
                {isExpanded && childConfig && (
                    <div className="border-l-2 ml-4 pl-2">
                         {children.length > 0 ? children.map(child => renderItem(child, level + 1, item.name)) : <div className="pl-4 text-sm text-muted-foreground py-1">No {childConfig.name}s added yet.</div>}
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
            <CardContent className="border rounded-md max-h-[500px] overflow-y-auto">
                {isLoading ? <div className="text-center p-4">Loading...</div> :
                 topLevelItems.length === 0 ? <div className="text-center p-8 text-muted-foreground">No {topLevelType.replace(/([A-Z])/g, ' $1').trim()}s found.</div> :
                 topLevelItems.map(item => renderItem(item, 0))}
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
                           {modalConfig.type === 'specialization' && (
                                <div className="space-y-2">
                                    <Label htmlFor="doctorType">Doctor Type</Label>
                                    <Select name="doctorType" defaultValue={(currentItem as any)?.doctorType || ''} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Doctor Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Physician">Physician</SelectItem>
                                            <SelectItem value="Surgeon">Surgeon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {(modalConfig.type === 'specialization' || modalConfig.type === 'disease') && modalConfig.parentId && (
                                 <div className="space-y-2">
                                    <Label>Parent</Label>
                                    <Input value={modalConfig.parentName} readOnly disabled />
                                 </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name">{modalConfig.type.replace(/([A-Z])/g, ' $1').trim()} Name</Label>
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
                            Are you sure you want to delete "{(currentItem as DropdownItem)?.name}"? Deleting a parent may affect its children. This action cannot be undone.
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
                        childTypes={[
                            {type: 'state', name: 'State', parentType: 'country'}, 
                            {type: 'city', name: 'City', parentType: 'state'}
                        ]}
                        data={data}
                        onUpdate={handleUpdate}
                        isLoading={isLoading}
                    />
                </TabsContent>
                 <TabsContent value="doctors">
                    <div className="space-y-8">
                      <HierarchicalManager 
                          title="Doctor Specialization Management"
                          description="Manage doctor types, their specializations, and associated diseases."
                          topLevelType="doctorType"
                          childTypes={[
                            {type: 'specialization', name: 'Specialization', parentType: 'doctorType'}, 
                            {type: 'disease', name: 'Disease', parentType: 'specialization'}
                          ]}
                          data={data}
                          onUpdate={handleUpdate}
                          isLoading={isLoading}
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

const ProductCategoryManager = () => {
    const { data: productCategoriesData = [], isLoading, refetch } = useGetAdminProductCategoriesQuery();
    const [createCategory] = useCreateAdminProductCategoryMutation();
    const [updateCategory] = useUpdateAdminProductCategoryMutation();
    const [deleteCategory] = useDeleteAdminProductCategoryMutation();
    
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
                await updateCategory({
                    id: currentCategory._id,
                    name: formData.name.trim(),
                    description: formData.description.trim()
                }).unwrap();
                toast.success('Category updated successfully');
            } else {
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
```,
  </change>
  <change>
    <file>/packages/lib/src/models/admin/SuperData.model.js</file>
    <content><![CDATA[
import mongoose from "mongoose";

const superDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'specialization',
      'faqCategory',
      'designation',
      'smsType',
      'socialPlatform',
      'bank',
      'documentType',
      'country',
      'state',
      'city',
      'doctorType',
      'disease'
    ],
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperData',
    default: null,
  },
  // Additional fields for location hierarchy if needed, although parentId can handle it
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperData',
    default: null,
  },
  stateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperData',
    default: null,
  },
   doctorType: { // For 'specialization' type
    type: String,
    enum: ['Physician', 'Surgeon'],
    required: function() { return this.type === 'specialization'; }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

superDataSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const SuperDataModel = mongoose.models.SuperData || mongoose.model("SuperData", superDataSchema);

export default SuperDataModel;

    