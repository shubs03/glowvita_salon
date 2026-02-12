
'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetSubscriptionPlansQuery, useCreateSubscriptionPlanMutation, useUpdateSubscriptionPlanMutation, useDeleteSubscriptionPlanMutation, useGetVendorsQuery, useGetSuppliersQuery, useGetDoctorsQuery, useRenewPlanMutation } from '@repo/store/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Pagination } from '@repo/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Skeleton } from '@repo/ui/skeleton';
import { Edit2, Plus, Trash2, Eye, Calendar, Users, FileText, BadgeCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Switch } from '@repo/ui/switch';
import { toast } from 'sonner';

type Plan = {
  _id: string;
  name: string;
  duration: number;
  durationType: string;
  price: number;
  discountedPrice?: number;
  isAvailableForPurchase: boolean;
  status?: boolean;
  features: string[];
  userType: ('vendor' | 'supplier' | 'doctor')[];
  isFeatured?: boolean;
};

type Subscription = {
  id: string;
  subscriberId: string;
  subscriberName: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
  history?: Array<{
    plan: { _id: string; name: string };
    status: string;
    startDate: string;
    endDate: string;
  }>;
  userType?: 'vendor' | 'supplier' | 'doctor';
};

type VendorSubPlan = { _id: string; name?: string } | string | undefined;
type VendorItem = {
  _id: string;
  businessName?: string;
  subscription?: {
    plan?: VendorSubPlan;
    startDate?: string;
    endDate?: string;
    status?: string;
  };
};

export default function SubscriptionManagementPage() {
  const token = useSelector((state: any) => state.adminAuth?.token);
  const { data: plans = [], isLoading, error, refetch } = useGetSubscriptionPlansQuery(undefined);
  const { data: vendors = [], isLoading: vendorsLoading, refetch: refetchVendors } = useGetVendorsQuery(undefined);
  const { data: suppliers = [], isLoading: suppliersLoading, refetch: refetchSuppliers } = useGetSuppliersQuery(undefined);
  const { data: doctors = [], isLoading: doctorsLoading, refetch: refetchDoctors } = useGetDoctorsQuery(undefined);
  const [createNewPlan] = useCreateSubscriptionPlanMutation();
  const [updateExistingPlan] = useUpdateSubscriptionPlanMutation();
  const [deletePlan] = useDeleteSubscriptionPlanMutation();

  // Derived subscribers from vendors, suppliers, and doctors (live data)
  const subscribers: Subscription[] = [
    ...(Array.isArray(vendors) ? vendors : []).map((v: any) => {
      const plan = v.subscription?.plan;
      const planName = typeof plan === 'object' && plan !== null ? (plan as any).name : undefined;
      return {
        id: v._id,
        subscriberId: v._id,
        subscriberName: v.businessName || 'Vendor',
        planName: planName || (typeof plan === 'string' ? plan : '-'),
        startDate: v.subscription?.startDate || '',
        endDate: v.subscription?.endDate || '',
        status: v.subscription?.status || 'Pending',
        history: (v.subscription as any)?.history || [],
        userType: 'vendor' as const
      };
    }),
    ...(Array.isArray(suppliers) ? suppliers : []).map((s: any) => {
      const plan = s.subscription?.plan;
      const planName = typeof plan === 'object' && plan !== null ? (plan as any).name : undefined;
      return {
        id: s._id,
        subscriberId: s._id,
        subscriberName: s.shopName || (s.firstName + ' ' + s.lastName) || 'Supplier',
        planName: planName || (typeof plan === 'string' ? plan : '-'),
        startDate: s.subscription?.startDate || '',
        endDate: s.subscription?.endDate || '',
        status: s.subscription?.status || 'Pending',
        history: (s.subscription as any)?.history || [],
        userType: 'supplier' as const
      };
    }),
    ...(Array.isArray(doctors) ? doctors : []).map((d: any) => {
      const plan = d.subscription?.plan;
      const planName = typeof plan === 'object' && plan !== null ? (plan as any).name : undefined;
      return {
        id: d._id,
        subscriberId: d._id,
        subscriberName: d.clinicName ? `${d.name} (${d.clinicName})` : d.name || 'Doctor',
        planName: planName || (typeof plan === 'string' ? plan : '-'),
        startDate: d.subscription?.startDate || '',
        endDate: d.subscription?.endDate || '',
        status: d.subscription?.status || 'Pending',
        history: (d.subscription as any)?.history || [],
        userType: 'doctor' as const
      };
    })
  ];

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedRenewalPlan, setSelectedRenewalPlan] = useState<Plan | null>(null);
  const [isRenewingManual, setIsRenewingManual] = useState(false);
  const [renewPlan, { isLoading: isRenewing }] = useRenewPlanMutation(); // Keep for type safety or remove usage if verified

  const [planForm, setPlanForm] = useState({
    name: '',
    duration: '1',
    durationType: 'months',
    price: '',
    discountedPrice: '',
    isAvailableForPurchase: true,
    features: [] as string[],
    userTypes: [] as ('vendor' | 'supplier' | 'doctor')[],
    isFeatured: false,
    planType: 'regular',
    status: 'Active'
  });

  // Pagination state
  const [currentPlanPage, setCurrentPlanPage] = useState(1);
  const [currentSubPage, setCurrentSubPage] = useState(1);
  const [planItemsPerPage, setPlanItemsPerPage] = useState<number>(5); // Explicit number type
  const [subItemsPerPage, setSubItemsPerPage] = useState<number>(5); // Explicit number type

  const durationTypeOptions = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'duration') {
      const numValue = Number(value);
      if (numValue > 99) return;
    }
    setPlanForm((prev) => ({
      ...prev,
      [field]: field === 'isAvailableForPurchase' ? value === 'true' : value,
    }));
  };

  const handleOpenPlanModal = (type: 'add' | 'edit', plan?: Plan) => {
    setModalType(type);
    setSelectedPlan(plan || null);

    if (type === 'edit' && plan) {
      setPlanForm({
        name: plan.name,
        duration: plan.duration.toString(),
        durationType: plan.durationType,
        price: plan.price.toString(),
        discountedPrice: plan.discountedPrice?.toString() || '',
        isAvailableForPurchase: plan.isAvailableForPurchase ?? true,
        features: plan.features || [],
        userTypes: plan.userType || [],
        isFeatured: plan.isFeatured || false,
        planType: 'regular',
        status: 'Active'
      });
    } else {
      setPlanForm({
        name: '',
        duration: '1',
        durationType: 'months',
        price: '',
        discountedPrice: '',
        isAvailableForPurchase: true,
        features: [],
        userTypes: [],
        isFeatured: false,
        planType: 'regular',
        status: 'Active'
      });
    }

    setIsPlanModalOpen(true);
  };

  const handleOpenSubModal = (type: 'edit' | 'view', sub: Subscription) => {
    setModalType(type);
    setSelectedSubscription(sub);
    setIsSubModalOpen(true);
  };

  const handleDeleteClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedPlan) {
      try {
        await deletePlan(selectedPlan._id).unwrap();
        toast.success('Plan deleted successfully!');
        setIsDeleteModalOpen(false);
        setSelectedPlan(null);
        refetch();
      } catch (error) {
        console.error('Error deleting plan:', error);
        toast.error(`Error deleting plan: ${(error as any).data?.message || 'Unknown error'}`);
      } finally {
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const planData = {
        name: planForm.name,
        duration: parseInt(planForm.duration) || 1,
        durationType: planForm.durationType,
        price: planForm.planType === 'trial' ? 0 : (planForm.price ? parseFloat(planForm.price) : 0),
        discountedPrice: planForm.planType === 'trial' ? 0 : (planForm.discountedPrice ? parseFloat(planForm.discountedPrice) : undefined),
        isAvailableForPurchase: planForm.isAvailableForPurchase,
        status: planForm.status,
        features: planForm.features || [],
        userTypes: planForm.userTypes,
        planType: planForm.planType,
        isFeatured: planForm.isFeatured
      };

      if (modalType === 'add') {
        await createNewPlan(planData).unwrap();
        toast.success('Plan created successfully!');
      } else if (selectedPlan) {
        await updateExistingPlan({ _id: selectedPlan._id, ...planData }).unwrap();
        toast.success('Plan updated successfully!');
      }

      setPlanForm({
        name: '',
        duration: '1',
        durationType: 'months',
        price: '',
        discountedPrice: '',
        isAvailableForPurchase: true,
        features: [],
        userTypes: [],
        isFeatured: false,
        planType: 'regular',
        status: 'Active'
      });

      setIsPlanModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(`Error saving plan: ${(error as any).data?.message || 'Unknown error'}`);
    }
  };

  const handleOpenRenewModal = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setSelectedRenewalPlan(null);
    setIsRenewModalOpen(true);
  };

  const handleRenewSubscription = async () => {
    if (!selectedSubscription || !selectedRenewalPlan) {
      toast.error('Please select a plan to renew');
      return;
    }

    try {
      setIsRenewingManual(true);
      // Use relative path to avoid port issues in dev
      const response = await fetch('/api/admin/subscription-renewal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}` // Ensure auth if needed
        },
        body: JSON.stringify({
          // vendorId param name is kept for backward compat if needed, but we prefer generic naming
          // However, the backend reads `vendorId || userId`
          userId: selectedSubscription.subscriberId,
          userType: selectedSubscription.userType,
          planId: selectedRenewalPlan._id,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Subscription renewed successfully!');
        setIsRenewModalOpen(false);
        setSelectedSubscription(null);
        setSelectedRenewalPlan(null);
        refetchVendors();
        refetchSuppliers();
        refetchDoctors();
      } else {
        throw new Error(data.message || 'Failed to renew subscription');
      }
    } catch (error: any) {
      console.error('Error renewing subscription:', error);
      toast.error(error.message || 'Failed to renew subscription');
    } finally {
      setIsRenewingManual(false);
    }
  };


  // Active count derived from live data
  const activeSubscribersCount = subscribers.filter((s) => s.status === 'Active').length;
  const expiredSubscribersCount = subscribers.filter((s) => s.status === 'Expired').length;

  // Pagination logic with safeguards
  const totalPlanPages = Math.ceil(plans.length / (planItemsPerPage || 1)) || 1;
  const totalSubPages = Math.ceil(subscribers.length / (subItemsPerPage || 1)) || 1;

  const paginatedPlans = plans.slice(
    (currentPlanPage - 1) * planItemsPerPage,
    currentPlanPage * planItemsPerPage
  );

  const paginatedSubscriptions = subscribers.slice(
    (currentSubPage - 1) * subItemsPerPage,
    currentSubPage * subItemsPerPage
  );

  // Handlers for items per page change with validation
  const handlePlanItemsPerPageChange = (items: number) => {
    const validItems = Math.max(1, Number(items) || 5); // Fallback to 5 if invalid
    setPlanItemsPerPage(validItems);
    setCurrentPlanPage(1); // Reset to first page
  };

  const handleSubItemsPerPageChange = (items: number) => {
    const validItems = Math.max(1, Number(items) || 5); // Fallback to 5 if invalid
    setSubItemsPerPage(validItems);
    setCurrentSubPage(1); // Reset to first page
  };

  if (isLoading || vendorsLoading || suppliersLoading || doctorsLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-56 mb-6" />

        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-36 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="mb-6">
          <div className="grid w-full grid-cols-2 max-w-md">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>

        {/* Main content skeleton */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto no-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(8)].map((_, i) => (
                      <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          {j === 7 ? (
                            <div className="flex gap-1">
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          ) : (
                            <Skeleton className="h-4 w-20" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) return <div>Error: {(error as any).status || 'An error occurred'}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Subscription Management</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
            <p className="text-xs text-muted-foreground">Available subscription plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
            <p className="text-xs text-muted-foreground">Across all plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubscribersCount}</div>
            <p className="text-xs text-muted-foreground">Currently active plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Subscriptions</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredSubscribersCount}</div>
            <p className="text-xs text-muted-foreground">With expired status</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231</div>
            <p className="text-xs text-muted-foreground">From all subscriptions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="subscribers">Subscriber List</TabsTrigger>
          <TabsTrigger value="plans">Manage Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>View and manage all active and inactive user subscriptions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscriber Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No subscriptions available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSubscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.subscriberName}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium 
                              ${sub.userType === 'vendor' ? 'bg-blue-100 text-blue-800' :
                                sub.userType === 'supplier' ? 'bg-purple-100 text-purple-800' :
                                  'bg-teal-100 text-teal-800'}`}>
                              {sub.userType ? sub.userType.charAt(0).toUpperCase() + sub.userType.slice(1) : '-'}
                            </span>
                          </TableCell>
                          <TableCell>{sub.planName}</TableCell>
                          <TableCell>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{sub.status}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenSubModal('view', sub)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleOpenRenewModal(sub)}
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span className="sr-only">Renew</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                currentPage={currentSubPage}
                totalPages={totalSubPages}
                onPageChange={(page) => setCurrentSubPage(page)}
                onItemsPerPageChange={handleSubItemsPerPageChange}
                itemsPerPage={subItemsPerPage}
                totalItems={subscribers.length} // Added for "Showing X to Y of Z"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manage Subscription Plans</CardTitle>
                  <CardDescription>Create, edit, and delete subscription plans.</CardDescription>
                </div>
                <Button onClick={() => handleOpenPlanModal('add')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discounted Price</TableHead>
                      <TableHead>Visible to Users</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPlans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No plans available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPlans.map((plan: Plan) => (
                        <TableRow key={plan._id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>
                            {plan.duration} {plan.durationType}
                          </TableCell>
                          <TableCell>₹{plan.price}</TableCell>
                          <TableCell>{plan.discountedPrice ? `₹${plan.discountedPrice}` : '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={plan.isAvailableForPurchase !== false}
                                onCheckedChange={async (checked) => {
                                  try {
                                    await updateExistingPlan({
                                      _id: plan._id,
                                      name: plan.name,
                                      duration: plan.duration,
                                      durationType: plan.durationType,
                                      price: plan.price,
                                      status: plan.status,
                                      features: plan.features,
                                      userTypes: plan.userType,
                                      planType: (plan as any).planType, // Cast to handle potential type mismatch
                                      isAvailableForPurchase: checked
                                    }).unwrap();
                                    toast.success(`Plan is now ${checked ? 'visible' : 'hidden'} to users`);
                                    refetch(); // Ensure UI refreshes
                                  } catch (err) {
                                    console.error('Failed to toggle visibility', err);
                                    toast.error('Failed to update plan visibility');
                                  }
                                }}
                              />
                              <span className="text-xs text-muted-foreground">
                                {plan.isAvailableForPurchase !== false ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenPlanModal('edit', plan)}
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteClick(plan)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                currentPage={currentPlanPage}
                totalPages={totalPlanPages}
                onPageChange={(page) => setCurrentPlanPage(page)}
                onItemsPerPageChange={handlePlanItemsPerPageChange}
                itemsPerPage={planItemsPerPage}
                totalItems={plans.length} // Added for "Showing X to Y of Z"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalType === 'edit' ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
            <DialogDescription>
              {modalType === 'edit' ? 'Update the details for this plan.' : 'Enter the details for the new plan.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePlan}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Plan Name
                </Label>
                <Input
                  id="name"
                  value={planForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="col-span-3"
                  placeholder="Enter plan name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Duration</Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    value={planForm.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-[100px]"
                    placeholder="e.g., 30"
                    min="1"
                    max="99"
                  />
                  <Select
                    value={planForm.durationType}
                    onValueChange={(value) => handleInputChange('durationType', value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price (₹)
                </Label>
                <Input
                  id="price"
                  type="text"
                  value={planForm.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="col-span-3"
                  placeholder="Enter price (e.g., 999 or 999.99)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountedPrice" className="text-right">
                  Discounted Price (₹)
                  <span className="text-xs text-gray-500 block">(Optional)</span>
                </Label>
                <Input
                  id="discountedPrice"
                  type="text"
                  value={planForm.discountedPrice}
                  onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                  className="col-span-3"
                  placeholder="Enter discounted price (optional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Available for Purchase</Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="purchase-yes"
                      name="purchase-availability"
                      checked={planForm.isAvailableForPurchase}
                      onChange={() => handleInputChange('isAvailableForPurchase', 'true')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="purchase-yes" className="ml-2">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <input
                      type="radio"
                      id="purchase-no"
                      name="purchase-availability"
                      checked={!planForm.isAvailableForPurchase}
                      onChange={() => handleInputChange('isAvailableForPurchase', 'false')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="purchase-no" className="ml-2">No</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsPlanModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubModalOpen} onOpenChange={setIsSubModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              View complete subscription information and history for {selectedSubscription?.subscriberName}
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-6 py-4">
              {/* Current Plan Section */}
              <div className="rounded-lg border bg-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Current Plan</h3>
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${selectedSubscription.status === 'Active'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : selectedSubscription.status === 'Expired'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }
                  `}>
                    {selectedSubscription.status || 'Unknown'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Subscriber Name</Label>
                    <p className="font-medium">{selectedSubscription.subscriberName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Plan Name</Label>
                    <p className="font-medium">{selectedSubscription.planName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <p className="font-medium">
                      {selectedSubscription.startDate
                        ? new Date(selectedSubscription.startDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <p className="font-medium">
                      {selectedSubscription.endDate
                        ? new Date(selectedSubscription.endDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Days Remaining/Expired */}
                {selectedSubscription.endDate && (
                  <div className="pt-2 border-t">
                    {(() => {
                      const now = new Date();
                      const end = new Date(selectedSubscription.endDate);
                      const diffTime = end.getTime() - now.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      if (diffDays > 0) {
                        return (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-green-600">{diffDays} days</span> remaining
                          </p>
                        );
                      } else if (diffDays === 0) {
                        return (
                          <p className="text-sm text-orange-600 font-semibold">
                            Expires today
                          </p>
                        );
                      } else {
                        return (
                          <p className="text-sm text-muted-foreground">
                            Expired <span className="font-semibold text-red-600">{Math.abs(diffDays)} days ago</span>
                          </p>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>

              {/* Subscription History Section */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Subscription History
                </h3>

                {selectedSubscription.history && selectedSubscription.history.length > 0 ? (
                  <div className="space-y-3">
                    {/* Timeline */}
                    <div className="relative space-y-4 pl-6 border-l-2 border-muted">
                      {selectedSubscription.history.map((historyItem, index) => (
                        <div key={index} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[1.6rem] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>

                          {/* History card */}
                          <div className="bg-muted/30 rounded-lg p-3 border">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">
                                  {typeof historyItem.plan === 'object' && historyItem.plan !== null
                                    ? historyItem.plan.name
                                    : 'Unknown Plan'}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>
                                    {historyItem.startDate
                                      ? new Date(historyItem.startDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                      : 'N/A'}
                                  </span>
                                  <span>→</span>
                                  <span>
                                    {historyItem.endDate
                                      ? new Date(historyItem.endDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                      : 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div
                                className={`
                                  px-2 py-0.5 rounded-full text-xs font-semibold
                                  ${historyItem.status === 'Active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                  }
                                `}
                              >
                                {historyItem.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 border">
                    <p className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      No subscription history available yet
                    </p>
                    <p className="mt-2 text-xs">
                      Current plan: <span className="font-semibold">{selectedSubscription.planName || 'N/A'}</span>
                      {selectedSubscription.startDate && (
                        <span>
                          {' '}
                          (since{' '}
                          {new Date(selectedSubscription.startDate).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric',
                          })}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsSubModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the plan "{selectedPlan?.name}"? This action cannot be undone.
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

      {/* Renew Subscription Dialog */}
      <Dialog open={isRenewModalOpen} onOpenChange={setIsRenewModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
            <DialogDescription>
              Select a plan to renew subscription for {selectedSubscription?.subscriberName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {plans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No plans available
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan: Plan) => (
                  <div
                    key={plan._id}
                    onClick={() => setSelectedRenewalPlan(plan)}
                    className={`
                      cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-lg
                      ${selectedRenewalPlan?._id === plan._id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-2 mb-1">
                        <span className="text-3xl font-bold">₹{plan.discountedPrice || plan.price}</span>
                        {plan.discountedPrice && (
                          <span className="text-sm text-muted-foreground line-through">₹{plan.price}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        per {plan.duration} {plan.durationType}
                      </p>
                    </div>
                    <ul className="space-y-2 mt-4">
                      {plan.features?.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features?.length > 4 && (
                        <li className="text-xs text-muted-foreground">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRenewSubscription}
              disabled={!selectedRenewalPlan || isRenewingManual}
              className="min-w-[120px]"
            >
              {isRenewingManual ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Renewing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Renew Now
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
