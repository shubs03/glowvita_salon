
'use client';

import { useState, useEffect } from 'react';
import { useGetSubscriptionPlansQuery, useCreateSubscriptionPlanMutation, useUpdateSubscriptionPlanMutation, useDeleteSubscriptionPlanMutation } from '@repo/store/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Pagination } from '@repo/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Edit2, Plus, Trash2, Eye, Calendar, Users, FileText, BadgeCheck } from 'lucide-react';
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
};

export default function SubscriptionManagementPage() {
  const { data: plans = [], isLoading, error, refetch } = useGetSubscriptionPlansQuery(undefined);
  const [createNewPlan] = useCreateSubscriptionPlanMutation();
  const [updateExistingPlan] = useUpdateSubscriptionPlanMutation();
  const [deletePlan] = useDeleteSubscriptionPlanMutation();

  const subscriptionsData = [
    {
      id: 'sub_1',
      subscriberId: 'CUST-101',
      subscriberName: 'Alice Johnson',
      planName: 'Pro Yearly',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      status: 'Active',
    },
    {
      id: 'sub_2',
      subscriberId: 'CUST-102',
      subscriberName: 'Bob Williams',
      planName: 'Basic Monthly',
      startDate: '2024-08-01',
      endDate: '2024-09-01',
      status: 'Active',
    },
    {
      id: 'sub_3',
      subscriberId: 'CUST-103',
      subscriberName: 'Charlie Brown',
      planName: 'Basic Monthly',
      startDate: '2024-07-20',
      endDate: '2024-08-20',
      status: 'Inactive',
    },
  ];

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const [planForm, setPlanForm] = useState({
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
      });
    } else {
      setPlanForm({
        name: '',
        duration: '1',
        durationType: 'months',
        price: '',
        discountedPrice: '',
        isAvailableForPurchase: true,
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
      });

      setIsPlanModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(`Error saving plan: ${(error as any).data?.message || 'Unknown error'}`);
    }
  };

  const [activeSubscriptions, setActiveSubscriptions] = useState(
    subscriptionsData.reduce((acc, sub) => {
      acc[sub.id] = sub.status === 'Active';
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleToggleStatus = (subId: string) => {
    setActiveSubscriptions((prev) => ({
      ...prev,
      [subId]: !prev[subId],
    }));
  };

  // Pagination logic with safeguards
  const totalPlanPages = Math.ceil(plans.length / (planItemsPerPage || 1)) || 1;
  const totalSubPages = Math.ceil(subscriptionsData.length / (subItemsPerPage || 1)) || 1;

  const paginatedPlans = plans.slice(
    (currentPlanPage - 1) * planItemsPerPage,
    currentPlanPage * planItemsPerPage
  );

  const paginatedSubscriptions = subscriptionsData.slice(
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Subscription Management</h1>

      {isLoading && <p>Loading plans...</p>}
      {error && <p>Error: {(error as any).status || 'An error occurred'}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
            <div className="text-2xl font-bold">{subscriptionsData.length}</div>
            <p className="text-xs text-muted-foreground">Across all plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(activeSubscriptions).filter(Boolean).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active plans</p>
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
                        <TableCell colSpan={6} className="text-center">
                          No subscriptions available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSubscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.subscriberName}</TableCell>
                          <TableCell>{sub.planName}</TableCell>
                          <TableCell>{sub.startDate}</TableCell>
                          <TableCell>{sub.endDate}</TableCell>
                          <TableCell>
                            <Switch
                              checked={activeSubscriptions[sub.id]}
                              onCheckedChange={() => handleToggleStatus(sub.id)}
                              aria-label={`Toggle subscription for ${sub.subscriberName}`}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenSubModal('view', sub)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenSubModal('edit', sub)}>
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
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
                totalItems={subscriptionsData.length} // Added for "Showing X to Y of Z"
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
                      <TableHead>Available</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPlans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No plans available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPlans.map((plan) => (
                        <TableRow key={plan._id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>
                            {plan.duration} {plan.durationType}
                          </TableCell>
                          <TableCell>₹{plan.price}</TableCell>
                          <TableCell>{plan.discountedPrice ? `₹${plan.discountedPrice}` : '-'}</TableCell>
                          <TableCell>{plan.isAvailableForPurchase ? 'Yes' : 'No'}</TableCell>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalType === 'edit' ? 'Edit Subscription' : 'Subscription Details'}</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Subscriber Name</Label>
                <Input value={selectedSubscription.subscriberName} readOnly={modalType === 'view'} />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Input value={selectedSubscription.planName} readOnly={modalType === 'view'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={selectedSubscription.startDate} readOnly={modalType === 'view'} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={selectedSubscription.endDate} readOnly={modalType === 'view'} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Status</Label>
                <p>{activeSubscriptions[selectedSubscription.id] ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsSubModalOpen(false)}>
              Close
            </Button>
            {modalType === 'edit' && <Button type="submit">Save Changes</Button>}
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
    </div>
  );
}
