
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Switch } from '@repo/ui/switch';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { UserCheck, Tag } from 'lucide-react';

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
  useDeleteSocialMediaTemplateMutation,
  useGetAdminMarketingDashboardQuery,
  useGetSuperDataQuery
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
  smsCount?: number;
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
  const { data: superData = [] } = useGetSuperDataQuery(undefined);
  
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
  
  const {
    data: marketingDashboardResponse,
    isLoading: isLoadingDashboard,
    refetch: refetchDashboard
  } = useGetAdminMarketingDashboardQuery(undefined);
  
  // Cast the data to proper types since we know the shape from the API
  const smsPackages = Array.isArray(smsPackagesData) ? smsPackagesData as SmsPackage[] : [];
  const smsTemplates = Array.isArray(smsTemplatesData) ? smsTemplatesData as SmsTemplate[] : [];
  const marketingTickets: MarketingTicket[] = []; // Placeholder as requested
  const dashboardData = marketingDashboardResponse?.data || {};
  const purchaseHistory: PurchaseHistory[] = dashboardData.purchaseHistory || [];
  const activeCampaigns: ActiveCampaign[] = dashboardData.activeCampaigns || [];
  const metrics = dashboardData.metrics || {
    totalMarketingRevenue: 0,
    smsSentCount: 0,
    activeCampaignsCount: 0,
    openTicketsCount: 0
  };
  
  const popularPackages = smsPackages.filter((pkg: SmsPackage) => pkg.isPopular);
  const socialMediaTemplateCategories = Array.isArray(superData)
    ? superData
        .filter((item: any) => item.type === 'socialMediaTemplateType')
        .map((item: any) => item.name)
        .filter(Boolean)
    : [];
  
  // Ensure socialMediaTemplates is always an array
  const socialMediaTemplates = Array.isArray(socialMediaTemplatesResponse?.data) 
    ? socialMediaTemplatesResponse.data 
    : Array.isArray(socialMediaTemplatesResponse)
      ? socialMediaTemplatesResponse
      : [];
  
  // Alias for backward compatibility
  const socialPosts = socialMediaTemplates;

  const [activeTab, setActiveTab] = useState("sms_templates");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

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
  const [isViewPurchaseDetailsOpen, setIsViewPurchaseDetailsOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseHistory | null>(null);

  const handleViewPurchase = (purchase: PurchaseHistory) => {
    setSelectedPurchase(purchase);
    setIsViewPurchaseDetailsOpen(true);
  };

  // Real data state for Marketing Tickets tab
  const [realTickets, setRealTickets] = useState<any[]>([]);
  const [realPackages, setRealPackages] = useState<any[]>([]);
  const [realAgents, setRealAgents] = useState<any[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [ticketSubTab, setTicketSubTab] = useState("active_tickets");

  // Real Ticket Detail & Edit State
  const [viewRealTicket, setViewRealTicket] = useState<any | null>(null);
  const [isRealTicketOpen, setIsRealTicketOpen] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    status: "Pending",
    agentId: "",
    adminNotes: ""
  });

  // Real Package Form State
  const [isRealPkgOpen, setIsRealPkgOpen] = useState(false);
  const [pkgEditTarget, setPkgEditTarget] = useState<any | null>(null);
  const [pkgForm, setPkgForm] = useState({
    name: "",
    price: 0,
    description: "",
    featuresString: "",
    platforms: [] as string[],
    isActive: true
  });

  // Real Agent Form State
  const [isRealAgtOpen, setIsRealAgtOpen] = useState(false);
  const [agtEditTarget, setAgtEditTarget] = useState<any | null>(null);
  const [agtForm, setAgtForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialtiesString: "",
    isActive: true
  });

  // Real Delete State
  const [realDeleteTarget, setRealDeleteTarget] = useState<{ id: string; type: "package" | "agent" } | null>(null);
  const [isRealDeleteOpen, setIsRealDeleteOpen] = useState(false);
  const [isRealDeleting, setIsRealDeleting] = useState(false);

  // Fetch functions
  const fetchRealData = useCallback(async () => {
    setIsLoadingRealData(true);
    try {
      const [resTkt, resPkg, resAgt] = await Promise.all([
        fetch("/api/admin/Marketing/tickets"),
        fetch("/api/admin/Marketing/packages"),
        fetch("/api/admin/Marketing/agents")
      ]);
      
      if (resTkt.ok) {
        const data = await resTkt.json();
        setRealTickets(data.data || []);
      }
      if (resPkg.ok) {
        const data = await resPkg.json();
        setRealPackages(data.data || []);
      }
      if (resAgt.ok) {
        const data = await resAgt.json();
        setRealAgents(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch ticket dashboard data:", err);
    } finally {
      setIsLoadingRealData(false);
    }
  }, []);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  // Handle Ticket actions
  const handleViewRealTicket = (ticket: any) => {
    setViewRealTicket(ticket);
    setTicketForm({
      status: ticket.status,
      agentId: ticket.agentId?._id || "none",
      adminNotes: ticket.adminNotes || ""
    });
    setIsRealTicketOpen(true);
  };

  const handleUpdateRealTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewRealTicket) return;
    setTicketSubmitting(true);
    try {
      const payload = {
        id: viewRealTicket._id,
        status: ticketForm.status,
        agentId: ticketForm.agentId === "none" ? "" : ticketForm.agentId,
        adminNotes: ticketForm.adminNotes
      };

      const res = await fetch("/api/admin/Marketing/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Ticket updated successfully.");
        setIsRealTicketOpen(false);
        fetchRealData();
      } else {
        throw new Error(data.message || "Failed to update ticket.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Handle Package CRUD
  const handleOpenRealPkg = (pkg: any | null = null) => {
    if (pkg) {
      setPkgEditTarget(pkg);
      setPkgForm({
        name: pkg.name,
        price: pkg.price,
        description: pkg.description || "",
        featuresString: (pkg.features || []).join(", "),
        platforms: pkg.platforms || [],
        isActive: pkg.isActive
      });
    } else {
      setPkgEditTarget(null);
      setPkgForm({
        name: "",
        price: 0,
        description: "",
        featuresString: "",
        platforms: [],
        isActive: true
      });
    }
    setIsRealPkgOpen(true);
  };

  const handleRealPkgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgForm.name || pkgForm.price === undefined) {
      toast.error("Please fill required fields.");
      return;
    }

    const payload = {
      name: pkgForm.name,
      price: Number(pkgForm.price),
      description: pkgForm.description,
      features: pkgForm.featuresString.split(",").map(f => f.trim()).filter(Boolean),
      platforms: pkgForm.platforms,
      isActive: pkgForm.isActive
    };

    try {
      let res;
      if (pkgEditTarget) {
        res = await fetch(`/api/admin/Marketing/packages?id=${pkgEditTarget._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/admin/Marketing/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(pkgEditTarget ? "Package updated successfully" : "Package created successfully");
        setIsRealPkgOpen(false);
        fetchRealData();
      } else {
        throw new Error(data.message || "Failed to save package");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save package.");
    }
  };

  // Handle Agent CRUD
  const handleOpenRealAgt = (agt: any | null = null) => {
    if (agt) {
      setAgtEditTarget(agt);
      setAgtForm({
        name: agt.name,
        email: agt.email,
        phone: agt.phone || "",
        specialtiesString: (agt.specialties || []).join(", "),
        isActive: agt.isActive
      });
    } else {
      setAgtEditTarget(null);
      setAgtForm({
        name: "",
        email: "",
        phone: "",
        specialtiesString: "",
        isActive: true
      });
    }
    setIsRealAgtOpen(true);
  };

  const handleRealAgtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agtForm.name || !agtForm.email) {
      toast.error("Name and Email are required.");
      return;
    }

    const payload = {
      name: agtForm.name,
      email: agtForm.email,
      phone: agtForm.phone,
      specialties: agtForm.specialtiesString.split(",").map(s => s.trim()).filter(Boolean),
      isActive: agtForm.isActive
    };

    try {
      let res;
      if (agtEditTarget) {
        res = await fetch(`/api/admin/Marketing/agents?id=${agtEditTarget._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/admin/Marketing/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(agtEditTarget ? "Agent updated successfully" : "Agent created successfully");
        setIsRealAgtOpen(false);
        fetchRealData();
      } else {
        throw new Error(data.message || "Failed to save agent");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save agent.");
    }
  };

  const handleRealDeleteClick = (id: string, type: "package" | "agent") => {
    setRealDeleteTarget({ id, type });
    setIsRealDeleteOpen(true);
  };

  const handleConfirmRealDelete = async () => {
    if (!realDeleteTarget) return;
    setIsRealDeleting(true);
    try {
      const url = `/api/admin/Marketing/${realDeleteTarget.type === "package" ? "packages" : "agents"}?id=${realDeleteTarget.id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${realDeleteTarget.type === "package" ? "Package" : "Agent"} deleted successfully.`);
        setIsRealDeleteOpen(false);
        setRealDeleteTarget(null);
        fetchRealData();
      } else {
        throw new Error(data.message || "Failed to delete.");
      }
    } catch (err: any) {
      toast.error(err.message || "Delete failed.");
    } finally {
      setIsRealDeleting(false);
    }
  };


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
    const isEdit = isEditSocialMediaTemplateMode && (selectedSocialMediaTemplate?.id || selectedSocialMediaTemplate?._id);
    try {
      if (isEdit) {
        const id = selectedSocialMediaTemplate._id || selectedSocialMediaTemplate.id;
        // Build a fresh FormData so RTK Query sends it correctly as multipart
        const updateFormData = new FormData();
        formData.forEach((value, key) => updateFormData.append(key, value));
        await updateSocialMediaTemplate({ id, data: updateFormData }).unwrap();
      } else {
        // For creates, send the FormData directly
        await createSocialMediaTemplate(formData).unwrap();
      }

      toast.success(`Template ${isEdit ? 'updated' : 'created'} successfully`);
      setIsSocialMediaTemplateFormOpen(false);
      setSelectedSocialMediaTemplate(null);
      refetchSocialMediaTemplates();
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || 'Failed to save template';
      console.error('Failed to save social media template:', error);
      toast.error(msg);
      // Re-throw so the form's own error handler is also aware
      throw error;
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

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Marketing Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{metrics.totalMarketingRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From all package sales</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.smsSentCount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From all SMS campaigns</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.activeCampaignsCount}</div>
                    <p className="text-xs text-muted-foreground">Across all marketing types</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                      {realTickets.length > 0 ? realTickets.filter(t => t.status !== "Resolved" && t.status !== "Closed").length : metrics.openTicketsCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Awaiting resolution</p>
                </CardContent>
            </Card>
        </div>


       <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                                            {template.imageUrl ? (
                                                <div className="h-20 w-20 rounded-md overflow-hidden border bg-gray-50">
                                                    <img
                                                        src={template.imageUrl}
                                                        alt={template.title || 'Template preview'}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback: try relative path in case URL port differs
                                                            const target = e.currentTarget;
                                                            if (!target.dataset.fallback && target.src.startsWith('http')) {
                                                                target.dataset.fallback = '1';
                                                                try {
                                                                    const u = new URL(target.src);
                                                                    target.src = u.pathname;
                                                                } catch { /* leave broken */ }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs text-center">No image</span>
                                                </div>
                                            )}
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
          <Tabs value={ticketSubTab} onValueChange={setTicketSubTab} className="space-y-4">
            <TabsList className="bg-slate-100 p-1 rounded-xl w-fit">
              <TabsTrigger value="active_tickets" className="rounded-lg gap-2">
                <Ticket className="w-4 h-4" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="manage_packages" className="rounded-lg gap-2">
                <Tag className="w-4 h-4" />
                Packages
              </TabsTrigger>
              <TabsTrigger value="manage_agents" className="rounded-lg gap-2">
                <UserCheck className="w-4 h-4" />
                Marketing Agents
              </TabsTrigger>
            </TabsList>

            {/* Active Tickets Sub-Tab */}
            <TabsContent value="active_tickets">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Marketing Requests</CardTitle>
                  <CardDescription>View, assign, and update status of vendor marketing tickets.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRealData ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : realTickets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No marketing requests found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto no-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Salon / Vendor</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Assigned Agent</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {realTickets.map((t) => (
                            <TableRow key={t._id}>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-sm">{t.salonName}</p>
                                  <p className="text-xs text-muted-foreground">{t.contactName}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {t.packageId?.name || "Custom Plan"}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">{t.subject}</TableCell>
                              <TableCell className="text-slate-500 font-medium">
                                {t.agentId?.name || <span className="text-amber-500 text-xs font-semibold">Unassigned</span>}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "N/A"}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                  t.status === "Pending" ? "bg-amber-100 text-amber-800 border-amber-200" :
                                  t.status === "Assigned" ? "bg-blue-100 text-blue-800 border-blue-200" :
                                  t.status === "In Progress" ? "bg-indigo-100 text-indigo-800 border-indigo-200" :
                                  t.status === "Resolved" ? "bg-green-100 text-green-800 border-green-200" :
                                  "bg-slate-100 text-slate-800 border-slate-200"
                                }`}>
                                  {t.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleViewRealTicket(t)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configure Packages Sub-Tab */}
            <TabsContent value="manage_packages">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>Marketing Packages</CardTitle>
                    <CardDescription>Manage structured pricing options available for vendors.</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenRealPkg()} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Package
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingRealData ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : realPackages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No packages created. Add one to get started.
                    </div>
                  ) : (
                    <div className="overflow-x-auto no-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Package Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Platforms</TableHead>
                            <TableHead>Features</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {realPackages.map((pkg) => (
                            <TableRow key={pkg._id}>
                              <TableCell className="font-semibold">{pkg.name}</TableCell>
                              <TableCell className="font-semibold text-slate-800">₹{pkg.price}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {(pkg.platforms || []).length === 0 ? (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  ) : (
                                    (pkg.platforms || []).map((p: string) => {
                                      const icons: Record<string, string> = {
                                        "Instagram": "📸",
                                        "Facebook": "👥",
                                        "YouTube": "▶️",
                                        "Twitter/X": "🐦",
                                        "LinkedIn": "💼",
                                        "WhatsApp": "💬"
                                      };
                                      return (
                                        <span key={p} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-xs font-medium text-slate-700">
                                          {icons[p] || ""} {p}
                                        </span>
                                      );
                                    })
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs text-xs text-muted-foreground truncate">
                                {pkg.features.join(" • ")}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pkg.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}`}>
                                  {pkg.isActive ? "Active" : "Inactive"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenRealPkg(pkg)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleRealDeleteClick(pkg._id, "package")}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configure Agents Sub-Tab */}
            <TabsContent value="manage_agents">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>Marketing Agents / Specialists</CardTitle>
                    <CardDescription>Assign specific specialists to vendor requests.</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenRealAgt()} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Agent
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingRealData ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : realAgents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No agents created yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto no-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Agent Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Specialties</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {realAgents.map((agt) => (
                            <TableRow key={agt._id}>
                              <TableCell className="font-semibold">{agt.name}</TableCell>
                              <TableCell>{agt.email}</TableCell>
                              <TableCell>{agt.phone || "—"}</TableCell>
                              <TableCell className="max-w-xs text-xs text-muted-foreground truncate">
                                {agt.specialties.join(", ")}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${agt.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}`}>
                                  {agt.isActive ? "Active" : "Inactive"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenRealAgt(agt)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleRealDeleteClick(agt._id, "agent")}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                                        <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                                        <TableCell>{purchase.vendorName}</TableCell>
                                        <TableCell>
                                            <div>{purchase.item}</div>
                                            <div className="text-[10px] text-muted-foreground">{purchase.smsCount?.toLocaleString()} SMS</div>
                                        </TableCell>
                                        <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                        <TableCell>₹{Number(purchase.amount || 0).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                purchase.status === 'Active' || purchase.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                purchase.status === 'Expired' ? 'bg-red-100 text-red-800' :
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
                                                    onClick={() => handleViewPurchase(purchase)}
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
                                        <TableCell>₹{Number(campaign.budget || 0).toFixed(2)}</TableCell>
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
        <DialogContent className="sm:max-w-7xl w-full flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 shrink-0 border-b">
            <DialogTitle>
              {isEditSocialMediaTemplateMode ? 'Edit Social Media Template' : 'Create New Social Media Template'}
            </DialogTitle>
            <DialogDescription>
              {isEditSocialMediaTemplateMode ? 'Update the social media template details.' : 'Fill in the details to create a new social media template.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4 pt-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
            <SocialMediaTemplateForm
              key={selectedSocialMediaTemplate?._id || selectedSocialMediaTemplate?.id || 'new'}
              initialData={selectedSocialMediaTemplate}
              categoryOptions={socialMediaTemplateCategories}
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
      
      {/* View Purchase Details Dialog */}
      <Dialog open={isViewPurchaseDetailsOpen} onOpenChange={setIsViewPurchaseDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>
              Detailed information for invoice {selectedPurchase?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                <span className="text-sm font-semibold">Invoice #</span>
                <span className="col-span-3 text-sm">{selectedPurchase.invoiceNumber}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                <span className="text-sm font-semibold">Vendor</span>
                <span className="col-span-3 text-sm">{selectedPurchase.vendorName}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                <span className="text-sm font-semibold">Item</span>
                <span className="col-span-3 text-sm">
                  <div>{selectedPurchase.item}</div>
                  <div className="text-xs text-muted-foreground">{selectedPurchase.smsCount?.toLocaleString()} SMS</div>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                <span className="text-sm font-semibold">Date</span>
                <span className="col-span-3 text-sm">{new Date(selectedPurchase.date).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                <span className="text-sm font-semibold">Amount</span>
                <span className="col-span-3 text-sm font-medium text-green-600">₹{Number(selectedPurchase.amount || 0).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                <span className="text-sm font-semibold">Status</span>
                <span className="col-span-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedPurchase.status === 'Active' || selectedPurchase.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    selectedPurchase.status === 'Expired' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedPurchase.status}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-semibold">Payment</span>
                <span className="col-span-3 text-sm">{selectedPurchase.paymentMethod}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewPurchaseDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Real Ticket Details & Action Dialog */}
      <Dialog open={isRealTicketOpen} onOpenChange={setIsRealTicketOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Marketing Request</DialogTitle>
            <DialogDescription>Assign agents, update ticket status, and add response notes.</DialogDescription>
          </DialogHeader>
          {viewRealTicket && (
            <form onSubmit={handleUpdateRealTicket} className="space-y-4">
              {/* Request Summary */}
              <div className="bg-slate-50 border rounded-xl p-3.5 space-y-2 text-sm text-slate-700">
                <div>
                  <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-wider">Vendor / Salon</span>
                  <span className="font-medium text-slate-800">{viewRealTicket.salonName} ({viewRealTicket.contactName})</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-wider">Contact Details</span>
                  <span className="font-medium text-slate-600">{viewRealTicket.email} | {viewRealTicket.phone}</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-wider">Requested Package</span>
                  <span className="font-medium text-slate-800">{viewRealTicket.packageId?.name || "Custom Plan"} (₹{viewRealTicket.packageId?.price || 0})</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-wider">Subject</span>
                  <span className="font-medium text-slate-800 text-base">{viewRealTicket.subject}</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-wider">Description</span>
                  <div className="mt-1 bg-white border rounded-lg p-2.5 max-h-32 overflow-y-auto whitespace-pre-wrap text-xs text-slate-600">
                    {viewRealTicket.description}
                  </div>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <Label htmlFor="real_status" className="font-semibold">Update Status</Label>
                <Select
                  value={ticketForm.status}
                  onValueChange={(val) => setTicketForm(prev => ({ ...prev, status: val as any }))}
                >
                  <SelectTrigger id="real_status">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assign Agent Select */}
              <div className="space-y-1.5">
                <Label htmlFor="real_assignAgent" className="font-semibold">Assign Marketing Agent</Label>
                <Select
                  value={ticketForm.agentId}
                  onValueChange={(val) => setTicketForm(prev => ({ ...prev, agentId: val }))}
                >
                  <SelectTrigger id="real_assignAgent">
                    <SelectValue placeholder="Select Agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {realAgents.filter(a => a.isActive).map((agt) => (
                      <SelectItem key={agt._id} value={agt._id}>
                        {agt.name} ({agt.specialties.slice(0, 2).join(", ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="real_adminNotes" className="font-semibold">Admin Update Notes / Reply</Label>
                <Textarea
                  id="real_adminNotes"
                  placeholder="Provide progress updates or list deliverables for the vendor..."
                  value={ticketForm.adminNotes}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                  rows={3}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsRealTicketOpen(false)} disabled={ticketSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={ticketSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {ticketSubmitting ? "Saving..." : "Save Updates"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Package Form Dialog */}
      <Dialog open={isRealPkgOpen} onOpenChange={setIsRealPkgOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{pkgEditTarget ? "Edit Package" : "Create Package"}</DialogTitle>
            <DialogDescription>Setup pricing tier for marketing services.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRealPkgSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="real_pkgName" className="font-semibold">Package Name <span className="text-destructive">*</span></Label>
              <Input
                id="real_pkgName"
                placeholder="e.g. Bronze Poster Package"
                value={pkgForm.name}
                onChange={(e) => setPkgForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="real_pkgPrice" className="font-semibold">Price (₹) <span className="text-destructive">*</span></Label>
              <Input
                id="real_pkgPrice"
                type="number"
                placeholder="e.g. 1500"
                value={pkgForm.price}
                onChange={(e) => setPkgForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="real_pkgDesc" className="font-semibold">Description</Label>
              <Textarea
                id="real_pkgDesc"
                placeholder="Brief summary of this package..."
                value={pkgForm.description}
                onChange={(e) => setPkgForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="real_pkgFeatures" className="font-semibold">Features (Comma separated)</Label>
              <Input
                id="real_pkgFeatures"
                placeholder="e.g. 5 custom posters, ad optimization, reels setup"
                value={pkgForm.featuresString}
                onChange={(e) => setPkgForm(prev => ({ ...prev, featuresString: e.target.value }))}
              />
            </div>

            {/* Social Media Platforms */}
            <div className="space-y-2">
              <Label className="font-semibold">Social Media Platforms</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "pkg_instagram", label: "Instagram", icon: "📸", value: "Instagram", color: "border-pink-200 bg-pink-50 text-pink-700" },
                  { id: "pkg_facebook", label: "Facebook", icon: "👥", value: "Facebook", color: "border-blue-200 bg-blue-50 text-blue-700" },
                  { id: "pkg_youtube", label: "YouTube", icon: "▶️", value: "YouTube", color: "border-red-200 bg-red-50 text-red-700" },
                  { id: "pkg_twitter", label: "Twitter/X", icon: "🐦", value: "Twitter/X", color: "border-slate-200 bg-slate-50 text-slate-700" },
                  { id: "pkg_linkedin", label: "LinkedIn", icon: "💼", value: "LinkedIn", color: "border-blue-200 bg-blue-50 text-blue-800" },
                  { id: "pkg_whatsapp", label: "WhatsApp", icon: "💬", value: "WhatsApp", color: "border-green-200 bg-green-50 text-green-700" },
                ].map((platform) => {
                  const isSelected = pkgForm.platforms.includes(platform.value);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        setPkgForm(prev => ({
                          ...prev,
                          platforms: isSelected
                            ? prev.platforms.filter(p => p !== platform.value)
                            : [...prev.platforms, platform.value]
                        }));
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? `${platform.color} border-current shadow-sm`
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-base leading-none">{platform.icon}</span>
                      <span>{platform.label}</span>
                      {isSelected && <span className="ml-auto text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
              {pkgForm.platforms.length === 0 && (
                <p className="text-xs text-muted-foreground">Select at least one platform this package covers.</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm font-semibold">Package Active Status</span>
              <Switch
                checked={pkgForm.isActive}
                onCheckedChange={(val) => setPkgForm(prev => ({ ...prev, isActive: val }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRealPkgOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Package
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Agent Form Dialog */}
      <Dialog open={isRealAgtOpen} onOpenChange={setIsRealAgtOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{agtEditTarget ? "Edit Agent" : "Create Agent"}</DialogTitle>
            <DialogDescription>Setup marketing specialist details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRealAgtSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="real_agtName" className="font-semibold">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="real_agtName"
                placeholder="e.g. Sunita Nair"
                value={agtForm.name}
                onChange={(e) => setAgtForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="real_agtEmail" className="font-semibold">Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="real_agtEmail"
                type="email"
                placeholder="e.g. sunita@glowvita.com"
                value={agtForm.email}
                onChange={(e) => setAgtForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="real_agtPhone" className="font-semibold">Phone Number</Label>
              <Input
                id="real_agtPhone"
                placeholder="e.g. 9876543210"
                value={agtForm.phone}
                onChange={(e) => setAgtForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="real_agtSpecialties" className="font-semibold">Specialties (Comma separated)</Label>
              <Input
                id="real_agtSpecialties"
                placeholder="e.g. Ads management, Graphic design, SEO"
                value={agtForm.specialtiesString}
                onChange={(e) => setAgtForm(prev => ({ ...prev, specialtiesString: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm font-semibold">Agent Active Status</span>
              <Switch
                checked={agtForm.isActive}
                onCheckedChange={(val) => setAgtForm(prev => ({ ...prev, isActive: val }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRealAgtOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Agent
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isRealDeleteOpen} onOpenChange={setIsRealDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the selected {realDeleteTarget?.type}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRealDeleteOpen(false)} disabled={isRealDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRealDelete} disabled={isRealDeleting}>
              {isRealDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
