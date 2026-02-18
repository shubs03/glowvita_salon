
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
// Import UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { SmsPackageForm } from "@/components/SmsPackageForm";
import { SmsTemplateForm } from "@/components/SmsTemplateForm";
import SocialMediaTemplateForm from "@/components/SocialMediaTemplateForm";
import { Button } from "@repo/ui/button";
import { toast } from 'sonner';
import { Plus, Eye, Edit, Trash2, Ticket, CheckCircle, XCircle, DollarSign, MessageSquare, Megaphone, AlertCircle, Send, Users, Calendar, Power } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';

// Import RTK Query hooks and types from the store
import { 
  useGetSmsTemplatesQuery,
  useCreateSmsTemplateMutation,
  useUpdateSmsTemplateMutation,
  useDeleteSmsTemplateMutation,
  useGetSmsPackagesQuery,
  useCreateSmsPackageMutation,
  useUpdateSmsPackageMutation,
  useDeleteSmsPackageMutation,
  useGetSocialMediaTemplatesQuery,
  useCreateSocialMediaTemplateMutation,
  useUpdateSocialMediaTemplateMutation,
  useDeleteSocialMediaTemplateMutation
} from '../../../../../packages/store/src/services/api';

// TODO: Add SMS package endpoints to the API service
// For now, we'll use template endpoints as a temporary solution

// Base interface with common fields
interface BaseEntity {
  id: string;
  _id?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: any; // Allow additional properties
}

interface SmsPackage extends BaseEntity {
  name: string;
  description: string;
  smsCount: number;
  price: number;
  validityDays: number;
  isPopular: boolean;
  features: string[];
}

interface SmsTemplate extends BaseEntity {
  id: string;
  name: string;
  content: string;
  type: string;
  status: string;
  price?: number; // Added to fix the price property error
}

// Type guard functions
function isSmsPackage(item: any): item is SmsPackage {
  return item && 'smsCount' in item && 'validityDays' in item;
}

function isSmsTemplate(item: any): item is SmsTemplate {
  return item && 'content' in item && 'type' in item;
}

function isSocialMediaPost(item: any): item is SocialMediaPost {
  return item && 'platform' in item && 'scheduledDate' in item;
}

function isMarketingTicket(item: any): item is MarketingTicket {
  return item && 'requestDate' in item && 'service' in item;
}

function isPurchaseHistory(item: any): item is PurchaseHistory {
  return item && 'item' in item && 'amount' in item;
}

function isActiveCampaign(item: any): item is ActiveCampaign {
  return item && 'campaignType' in item && 'budget' in item;
}

// Import selectors
const selectAllSmsPackages = (state: any) => state.marketing?.smsPackages || [];
const selectPopularSmsPackages = (state: any) => 
  (state.marketing?.smsPackages || []).filter((pkg: any) => pkg.isPopular);

// Additional types for the marketing module
type SocialMediaPost = {
  id: string;
  title: string;
  platform: string;
  price: number;
  description: string;
  image?: string;
  status: string;
  scheduledDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type MarketingTicket = {
  id: string;
  vendorName: string;
  requestDate: string;
  service: string;
  status: string;
  priority: string;
  assignedTo: string;
  lastUpdated: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type PurchaseHistory = {
  id: string;
  vendorName: string;
  item: string;
  date: string;
  amount: number;
  status: string;
  paymentMethod: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
};

type ActiveCampaign = {
  id: string;
  vendorName: string;
  salonName: string;
  contact: string;
  email: string;
  campaignType: string;
  startDate: string;
  endDate: string;
  status: string | boolean;
  budget: number;
  [key: string]: any; // For additional metrics
  createdAt: string;
  updatedAt: string;
};

type ModalDataType = SmsTemplate | SmsPackage | SocialMediaPost | MarketingTicket | PurchaseHistory | ActiveCampaign | Record<string, unknown> | null;

export default function PlatformMarketingPage() {
  // Fetch SMS packages and templates
  const { data: smsPackagesData = [], isLoading: isLoadingPackages } = useGetSmsPackagesQuery(undefined);
  const { data: smsTemplatesData = [], isLoading: isLoadingTemplates, refetch: refetchTemplates } = useGetSmsTemplatesQuery(undefined);
  
  const [createSmsPackage] = useCreateSmsPackageMutation();
  const [updateSmsPackage] = useUpdateSmsPackageMutation();
  const [deleteSmsPackage] = useDeleteSmsPackageMutation();
  
  const [createSmsTemplate] = useCreateSmsTemplateMutation();
  const [updateSmsTemplate] = useUpdateSmsTemplateMutation();
  const [deleteSmsTemplate] = useDeleteSmsTemplateMutation();

  const [createSocialMediaTemplate, { isLoading: isCreatingSocialTemplate }] = 
    useCreateSocialMediaTemplateMutation();
  
  const [
    updateSocialMediaTemplate,
    { isLoading: isUpdatingSocialTemplate }
  ] = useUpdateSocialMediaTemplateMutation();
  
  const [
    deleteSocialMediaTemplate,
    { isLoading: isDeletingSocialTemplate }
  ] = useDeleteSocialMediaTemplateMutation();
  
  const { 
    data: socialMediaTemplatesResponse, 
    isLoading: isLoadingSocialTemplates,
    refetch: refetchSocialMediaTemplates 
  } = useGetSocialMediaTemplatesQuery(undefined);
  
  // Cast the data to proper types since we know the shape from the API
  const smsPackages = Array.isArray(smsPackagesData) ? smsPackagesData as SmsPackage[] : [];
  const smsTemplates = Array.isArray(smsTemplatesData) ? smsTemplatesData as SmsTemplate[] : [];
  const marketingTickets: MarketingTicket[] = [];
  const purchaseHistory: PurchaseHistory[] = [];
  const activeCampaigns: ActiveCampaign[] = [];
  const popularPackages = smsPackages.filter((pkg: SmsPackage) => pkg.isPopular);
  
  // Ensure socialMediaTemplates is always an array
  const socialMediaTemplates = Array.isArray(socialMediaTemplatesResponse?.data) 
    ? socialMediaTemplatesResponse.data 
    : Array.isArray(socialMediaTemplatesResponse)
      ? socialMediaTemplatesResponse
      : [];
  
  // Alias for backward compatibility
  const socialPosts = socialMediaTemplates;

  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Partial<SmsPackage> | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Partial<SmsTemplate> | null>(null);
  const [isDeleteTemplateModalOpen, setIsDeleteTemplateModalOpen] = useState(false);
  const [isEditTemplateMode, setIsEditTemplateMode] = useState(false);
  const [isSocialMediaTemplateFormOpen, setIsSocialMediaTemplateFormOpen] = useState(false);
  const [isEditSocialMediaTemplateMode, setIsEditSocialMediaTemplateMode] = useState(false);
  const [selectedSocialMediaTemplate, setSelectedSocialMediaTemplate] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);


  // Social media templates are automatically fetched by the useGetSocialMediaTemplatesQuery hook

  const handleDeleteClick = (pkg: SmsPackage) => {
    setSelectedPackage(pkg);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPackage) return;
    
    try {
      const id = selectedPackage._id || selectedPackage.id;
      if (!id) {
        throw new Error('No package ID found');
      }
      await deleteSmsPackage(id).unwrap();
      toast.success('Package deleted successfully');
    } catch (error) {
      console.error('Failed to delete package:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedPackage(null);
    }
  };

  const handleOpenPackageForm = useCallback((pkg: Partial<SmsPackage> | null = null) => {
    setSelectedPackage(pkg ? { ...pkg } : null);
    setIsEditMode(!!pkg);
    setIsPackageFormOpen(true);
  }, []);

  const handlePackageSubmit = useCallback(async (formData: Partial<SmsPackage>) => {
    try {
      // Validate required fields
      if (!formData.name || !formData.smsCount || formData.price === undefined || !formData.validityDays) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Convert to complete SmsPackage object
      const packageData: SmsPackage = {
        name: formData.name,
        description: formData.description || '',
        smsCount: formData.smsCount,
        price: formData.price,
        validityDays: formData.validityDays,
        isPopular: formData.isPopular || false,
        features: formData.features || [],
        id: formData.id || formData._id || '',
        _id: formData._id || formData.id,
        createdAt: formData.createdAt,
        updatedAt: formData.updatedAt
      };

      if (isEditMode && selectedPackage) {
        const id = selectedPackage._id || selectedPackage.id;
        if (id) {
          await updateSmsPackage({ ...packageData, id }).unwrap();
          toast.success('Package updated successfully');
        }
      } else {
        await createSmsPackage(packageData).unwrap();
        toast.success('Package created successfully');
      }
      setIsPackageFormOpen(false);
      setSelectedPackage(null);
    } catch (error: any) {
      console.error('Failed to save package:', error);
    }
  }, [isEditMode, selectedPackage, createSmsPackage, updateSmsPackage]);

  const handleOpenTemplateForm = (template: Partial<SmsTemplate> | null = null) => {
    setSelectedTemplate(template ? { ...template } : null);
    setIsEditTemplateMode(!!template);
    setIsTemplateFormOpen(true);
  };

  const handleTemplateSubmit = async (formData: SmsTemplate) => {
    try {
      if (isEditTemplateMode && (selectedTemplate?.id || selectedTemplate?._id)) {
        const id = selectedTemplate.id || selectedTemplate._id || '';
        await updateSmsTemplate({ ...formData, id }).unwrap();
        toast.success('Template updated successfully');
      } else {
        await createSmsTemplate(formData).unwrap();
        toast.success('Template created successfully');
      }
      setIsTemplateFormOpen(false);
      setSelectedTemplate(null);
      // Force refetch templates
      refetchTemplates();
    } catch (error: any) {
      console.error('Failed to save template:', error);
    }
  };

  const handleOpenSocialMediaTemplateForm = (template: any = null) => {
    setSelectedSocialMediaTemplate(template);
    setIsEditSocialMediaTemplateMode(!!template);
    setIsSocialMediaTemplateFormOpen(true);
  };

  const handleUpdateSocialMediaTemplate = async (updatedTemplate: any) => {
    try {
      const id = updatedTemplate.id || updatedTemplate._id;
      if (!id) {
        console.error('Template ID is required for update');
        return;
      }
      await updateSocialMediaTemplate({ id, ...updatedTemplate }).unwrap();
      refetchSocialMediaTemplates();
    } catch (err) {
      console.error('Failed to update template:', err);
    }
  };

  const handleSocialMediaTemplateSubmit = async (formData: FormData) => {
    try {
      const isEdit = isEditSocialMediaTemplateMode && (selectedSocialMediaTemplate?.id || selectedSocialMediaTemplate?._id);
      
      if (isEdit) {
        // For updates, we need to send the ID in the query params and the data in the body
        await updateSocialMediaTemplate({ 
          id: selectedSocialMediaTemplate._id || selectedSocialMediaTemplate.id, 
          ...Object.fromEntries(formData.entries()) 
        }).unwrap();
      } else {
        // For creates, send the FormData directly
        await createSocialMediaTemplate(formData).unwrap();
      }

      toast.success(`Template ${isEdit ? 'updated' : 'created'} successfully`);
      setIsSocialMediaTemplateFormOpen(false);
      setSelectedSocialMediaTemplate(null);
      refetchSocialMediaTemplates();
    } catch (error: any) {
      console.error('Failed to save social media template:', error);
    }
  };
  
  const handleDeleteSocialMediaTemplate = async () => {
    if (!itemToDelete || !itemToDelete.id) return;
    
    try {
      await deleteSocialMediaTemplate(itemToDelete.id).unwrap();
      toast.success('Template deleted successfully');
      refetchSocialMediaTemplates();
    } catch (error: any) {
      console.error('Failed to delete social media template:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };


  const handleDeleteTemplateClick = (template: SmsTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteTemplateModalOpen(true);
  };

  const handleConfirmDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      const id = selectedTemplate._id || selectedTemplate.id;
      if (!id) {
        throw new Error('No template ID found');
      }
      await deleteSmsTemplate(id).unwrap();
      toast.success('Template deleted successfully');
      refetchTemplates();
    } catch (error: any) {
      console.error('Failed to delete template:', error);
    } finally {
      setIsDeleteTemplateModalOpen(false);
      setSelectedTemplate(null);
    }
  };

  const viewDetails = (data: Record<string, unknown> | null) => {
    if (!data) return null;
    
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b pb-1">
            <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
            <span>{value !== null && value !== undefined ? String(value) : 'N/A'}</span>
          </div>
        ))}
      </div>
    );
  };


  // Data is automatically fetched by RTK Query hooks

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Platform Marketing</h1>
      <div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Marketing Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹6,000</div>
                    <p className="text-xs text-muted-foreground">From all package sales</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,250</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeCampaigns?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all marketing types</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{marketingTickets?.filter(t => t.status === 'Pending').length || 0}</div>
                    <p className="text-xs text-muted-foreground">Awaiting resolution</p>
                </CardContent>
            </Card>
        </div>


       <Tabs defaultValue="sms_templates">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="sms_templates">SMS Templates</TabsTrigger>
            <TabsTrigger value="sms_packages">SMS Packages</TabsTrigger>
            <TabsTrigger value="social_media">Social Media Template</TabsTrigger>
            <TabsTrigger value="marketing_tickets">Marketing Tickets</TabsTrigger>
            <TabsTrigger value="purchase_history">Purchase History</TabsTrigger>
            <TabsTrigger value="active_campaigns">Active Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="sms_templates" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>SMS Templates</CardTitle>
                            <CardDescription>Manage predefined SMS templates for vendors.</CardDescription>
                        </div>
                            <Button onClick={() => handleOpenTemplateForm()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Template
                            </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Template ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {smsTemplates?.map((t, index) => (
                                    <TableRow key={t.id || t._id}>
                                        <TableCell>{`TMP${String(index + 1).padStart(3, '0')}`}</TableCell>
                                        <TableCell>{t.name}</TableCell>
                                        <TableCell>{t.type}</TableCell>
                                        <TableCell>₹{t.price }</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                t.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleOpenTemplateForm(t)}
                                                    title="Edit template"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive/80"
                                                    onClick={() => handleDeleteTemplateClick(t)}
                                                    title="Delete template"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!smsTemplates || smsTemplates.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                            No SMS templates found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="sms_packages" className="mt-4">
            <Card>
                <CardHeader>
                     <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>SMS Packages</CardTitle>
                            <CardDescription>Create and manage bulk SMS packages for vendors.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenPackageForm()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Package
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>SMS Count</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {smsPackages.map((pkg: SmsPackage) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell>
                                            {pkg.name}
                                            {pkg.isPopular && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{pkg.smsCount.toLocaleString()}</TableCell>
                                        <TableCell>₹{pkg.price.toFixed(2)}</TableCell>
                                        <TableCell>{pkg.validityDays} days</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenPackageForm(pkg)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                                <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(pkg)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="social_media" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Social Media Templates</CardTitle>
                            <CardDescription>Manage your social media marketing templates.</CardDescription>
                        </div>
                        <Button 
                            onClick={() => handleOpenSocialMediaTemplateForm()}
                            disabled={isCreatingSocialTemplate || isUpdatingSocialTemplate}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {isCreatingSocialTemplate || isUpdatingSocialTemplate ? 'Saving...' : 'Create Template'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingSocialTemplates ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto no-scrollbar">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Post Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Availability</TableHead>
                                        <TableHead>Images</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {socialMediaTemplates?.map((template: any) => (
                                        <TableRow key={template.id || template._id}>
                                            <TableCell className="font-medium">
                                            {template.title || 'Untitled'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize">{template.category || 'Uncategorized'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                {template.availableFor || 'admin'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {(() => {
                                                const imageSrc = template.imageUrl;
                                                
                                                if (imageSrc) {
                                                    const isBase64 = imageSrc.startsWith('data:image');
                                                    const src = isBase64 ? imageSrc : imageSrc.startsWith('http') || imageSrc.startsWith('/') ? imageSrc : `${process.env.NEXT_PUBLIC_API_URL || ''}/uploads/${imageSrc}`;
                                                        
                                                    return (
                                                        <div className="h-20 w-20 rounded-md overflow-hidden border">
                                                            <img 
                                                                src={src}
                                                                alt={template.title || 'Post image'} 
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    );
                                                }
                                                
                                                return (
                                                    <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs text-center">No image</span>
                                                    </div>
                                                );
                                            })()}
                                        </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleOpenSocialMediaTemplateForm(template)}
                                                        disabled={isDeletingSocialTemplate}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-destructive hover:text-destructive/80"
                                                        onClick={() => {
                                                            setItemToDelete({ id: template._id, name: template.title });
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        disabled={isDeletingSocialTemplate}
                                                        title="Delete template"
                                                    >
                                                        {isDeletingSocialTemplate ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!socialMediaTemplates || socialMediaTemplates.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                                No social media templates found. Create one to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="marketing_tickets" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Marketing Tickets</CardTitle>
                            <CardDescription>View and manage marketing support tickets.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket ID</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {marketingTickets?.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>{ticket.id}</TableCell>
                                        <TableCell>{ticket.vendorName}</TableCell>
                                        <TableCell>{ticket.service}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                ticket.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                ticket.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                                ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {ticket.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell>{ticket.assignedTo}</TableCell>
                                        <TableCell>{new Date(ticket.lastUpdated).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!marketingTickets || marketingTickets.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                                            No marketing tickets found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="purchase_history" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Purchase History</CardTitle>
                            <CardDescription>View history of all marketing-related purchases.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseHistory?.map((purchase) => (
                                    <TableRow key={purchase.id}>
                                        <TableCell>{purchase.invoiceNumber}</TableCell>
                                        <TableCell>{purchase.vendorName}</TableCell>
                                        <TableCell>{purchase.item}</TableCell>
                                        <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                        <TableCell>₹{(purchase.amount / 100).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                purchase.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {purchase.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{purchase.paymentMethod}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!purchaseHistory || purchaseHistory.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                                            No purchase history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="active_campaigns" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Active Campaigns</CardTitle>
                            <CardDescription>View and manage all active marketing campaigns.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign ID</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Budget</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Performance</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeCampaigns?.map((campaign) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell>{campaign.id}</TableCell>
                                        <TableCell>{campaign.vendorName}</TableCell>
                                        <TableCell>{campaign.campaignType}</TableCell>
                                        <TableCell>
                                            {new Date(campaign.startDate).toLocaleDateString()} - 
                                            {new Date(campaign.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>₹{(campaign.budget / 100).toFixed(2)}</TableCell>
                                        <td>
                                            <div className="flex items-center">
                                                <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                                    campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                                                }`}></span>
                                                {campaign.status}
                                            </div>
                                        </td>
                                        <td>
                                            {campaign.campaignType === 'Social Media' ? (
                                                <div className="text-sm">
                                                    <div>Impressions: {campaign.impressions?.toLocaleString() || 'N/A'}</div>
                                                    <div>CTR: {campaign.ctr || '0'}%</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <div>Sent: {campaign.messagesSent?.toLocaleString() || '0'}</div>
                                                    <div>Open Rate: {campaign.openRate || '0'}%</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </TableRow>
                                ))}
                                {(!activeCampaigns || activeCampaigns.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                                            No active campaigns found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      {/* SMS Template Form Dialog */}
      <SmsTemplateForm
        isOpen={isTemplateFormOpen}
        onClose={() => setIsTemplateFormOpen(false)}
        templateData={selectedTemplate || {}}
        isEditMode={isEditTemplateMode}
        onSubmit={handleTemplateSubmit}
      />
      
      {/* SMS Package Form Dialog */}
      <SmsPackageForm
        key={`package-form-${isPackageFormOpen ? 'open' : 'closed'}`}
        isOpen={isPackageFormOpen}
        onClose={() => {
          setIsPackageFormOpen(false);
          setSelectedPackage(null);
        }}
        packageData={selectedPackage || undefined}
        isEditMode={isEditMode}
        onSubmit={handlePackageSubmit}
      />

      {/* Social Media Template Form Dialog */}
      <Dialog open={isSocialMediaTemplateFormOpen} onOpenChange={setIsSocialMediaTemplateFormOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {isEditSocialMediaTemplateMode ? 'Edit Social Media Template' : 'Create New Social Media Template'}
            </DialogTitle>
            <DialogDescription>
              {isEditSocialMediaTemplateMode ? 'Update the social media template details.' : 'Fill in the details to create a new social media template.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden min-h-0">
            <SocialMediaTemplateForm
              initialData={selectedSocialMediaTemplate}
              onSubmit={handleSocialMediaTemplateSubmit}
              onCancel={() => {
                setIsSocialMediaTemplateFormOpen(false);
                setSelectedSocialMediaTemplate(null);
              }}
              isSubmitting={isCreatingSocialTemplate || isUpdatingSocialTemplate}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Package Confirmation Modal */}
      <Dialog open={isDeleteModalOpen && !!selectedPackage} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the package "{selectedPackage?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Template Confirmation Modal */}
      <Dialog open={isDeleteTemplateModalOpen && !!selectedTemplate} onOpenChange={setIsDeleteTemplateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template "{selectedTemplate?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTemplateModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteTemplate}>Delete Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Delete Social Media Template Confirmation Modal */}
      <Dialog open={isDeleteModalOpen && !!itemToDelete} onOpenChange={() => setIsDeleteModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template "{itemToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSocialMediaTemplate} disabled={isDeletingSocialTemplate}>
                {isDeletingSocialTemplate ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
