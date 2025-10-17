'use client';

import { useState } from 'react';
import { CreateCampaignModal } from './CreateCampaignModal';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { MessageSquare, Package, FileText, Plus } from 'lucide-react';
import { useAppSelector } from '@repo/store/hooks';
import { useGetCrmSmsPackagesQuery, useGetCrmCampaignsQuery, usePurchaseSmsPackageMutation } from '@repo/store/services/api';
import { toast } from 'sonner';

type SMSPackage = {
  _id: string;
  name: string;
  smsCount: number;
  price: number;
  validityDays: number;
  description: string;
  isPopular?: boolean;
  features?: string[];
  status: string;
};

type Campaign = {
  _id: string;
  name: string;
  type: string[];
  templateId?: string;
  content: string;
  status: string;
  vendorId: string;
  createdBy: string;
  targetAudience: string;
  scheduledDate: string;
  budget: number;
  metrics: {
    messagesSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
  createdAt: string;
  updatedAt: string;
};

export default function MessageBlastPage() {
  const [activeTab, setActiveTab] = useState('packages');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [purchaseSmsPackage, { isLoading: isPurchasing }] = usePurchaseSmsPackageMutation();
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);

  // Get CRM authentication state
  const { isAuthenticated, token, user } = useAppSelector((state: any) => ({
    isAuthenticated: state.crmAuth.isCrmAuthenticated,
    token: state.crmAuth.token,
    user: state.crmAuth.user
  }));
  
  // Debug authentication state
  console.log('Auth state - isAuthenticated:', isAuthenticated, 'token:', token, 'user:', user);
  
  // Fetch CRM SMS packages
  const {
    data: packagesResponse,
    isLoading,
    isError,
    error: fetchError,
    refetch: refetchPackages
  } = useGetCrmSmsPackagesQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true
  });
  
  // Fetch CRM campaigns
  const {
    data: campaignsResponse,
    isLoading: isLoadingCampaigns,
    isError: isErrorCampaigns,
    error: fetchCampaignsError,
    refetch: refetchCampaigns
  } = useGetCrmCampaignsQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true
  });
  
  // Extract packages from the response
  const smsPackages = packagesResponse?.data || [];
  
  // Extract campaigns from the response
  const campaigns = campaignsResponse?.data || [];
  
  // Debug API response
  console.log('CRM SMS Packages Response:', { packagesResponse, packages: smsPackages, isLoading, isError, fetchError });
  console.log('CRM Campaigns Response:', { campaignsResponse, campaigns, isLoadingCampaigns, isErrorCampaigns, fetchCampaignsError });
  
  const error = isError ? 'Failed to load SMS packages. Please try again.' : null;

  const handlePurchasePackage = async (packageId: string) => {
    // Validate authentication
    if (!isAuthenticated) {
      toast.error('Please log in to purchase SMS packages');
      return;
    }
    
    // Validate packageId
    if (!packageId) {
      toast.error('Invalid package selection');
      return;
    }
    
    console.log('Attempting to purchase package:', packageId);
    console.log('User object:', user);
    console.log('User ID:', user?._id);
    console.log('Vendor ID:', user?.vendorId);
    
    // Set the specific package as purchasing
    setPurchasingPackageId(packageId);
    
    try {
      console.log('Sending purchase request with packageId:', packageId);
      const result: any = await purchaseSmsPackage({ packageId }).unwrap();
      console.log('Purchase response:', result);
      
      if (result.success) {
        // Show success message
        toast.success(`${result.message} New SMS Balance: ${result.data.newBalance}`);
        // Refresh packages to update any UI that depends on balance
        refetchPackages();
      } else {
        toast.error(result.message || 'Failed to purchase package');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to purchase package. Please try again.';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 400) {
        errorMessage = 'Invalid request. Please check the package details.';
      } else if (error?.status === 404) {
        errorMessage = 'Package not found. Please refresh and try again.';
      } else if (error?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = 'Error purchasing SMS package. Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      // Reset the purchasing state
      setPurchasingPackageId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Message Blast</h1>
        <p className="text-muted-foreground">Send bulk messages to your customers</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            SMS Packages
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Campaign
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          {!isAuthenticated ? (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
              <div className="p-6 text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <p className="font-medium">Authentication Required</p>
                </div>
                <p className="text-sm">Please log in to load SMS packages.</p>
              </div>
            </Card>
          ) : isLoading ? (
            <Card className="border-primary/20">
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading SMS packages...</p>
                </div>
              </div>
            </Card>
          ) : error ? (
            <Card className="border-destructive/20 bg-destructive/5">
              <div className="p-6 text-destructive">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-destructive"></div>
                  <p className="font-medium">Error Loading SMS Packages</p>
                </div>
                <p className="text-sm mb-3">{(fetchError as any)?.data?.message || error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => refetchPackages()}
                >
                  Retry
                </Button>
              </div>
            </Card>
          ) : smsPackages?.length === 0 ? (
            <Card className="border-muted">
              <div className="p-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">No SMS packages found</p>
                    <p className="text-sm">Contact admin to add SMS packages.</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smsPackages.map((pkg: SMSPackage) => (
                <Card key={pkg._id} className={`relative overflow-hidden ${pkg.isPopular ? 'border-2 border-primary' : ''}`}>
                  {pkg.isPopular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <div className="text-3xl font-bold">₹{pkg.price}<span className="text-sm font-normal text-muted-foreground">/package</span></div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                        {pkg.smsCount.toLocaleString()} SMS
                      </li>
                      <li className="text-sm text-muted-foreground">
                        Valid for {pkg.validityDays} days
                      </li>
                      {pkg.description && (
                        <li className="text-sm text-muted-foreground mt-2">
                          {pkg.description}
                        </li>
                      )}
                      {pkg.features && pkg.features.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Features:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {pkg.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <div className="h-1 w-1 rounded-full bg-primary mr-2"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="sm" 
                      disabled={pkg.status !== 'active' || purchasingPackageId === pkg._id}
                      onClick={() => handlePurchasePackage(pkg._id)}
                    >
                      {purchasingPackageId === pkg._id ? 'Processing...' : pkg.status === 'active' ? 'Buy Now' : 'Unavailable'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">My Campaigns</h3>
                <p className="text-muted-foreground text-sm">Manage your marketing campaigns</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
            
            {!isAuthenticated ? (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                <div className="p-6 text-amber-800 dark:text-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    <p className="font-medium">Authentication Required</p>
                  </div>
                  <p className="text-sm">Please log in to view your campaigns.</p>
                </div>
              </Card>
            ) : isLoadingCampaigns ? (
              <Card className="border-primary/20">
                <div className="flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading campaigns...</p>
                  </div>
                </div>
              </Card>
            ) : isErrorCampaigns ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <div className="p-6 text-destructive">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-destructive"></div>
                    <p className="font-medium">Error Loading Campaigns</p>
                  </div>
                  <p className="text-sm mb-3">{(fetchCampaignsError as any)?.data?.message || 'Failed to load campaigns'}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => refetchCampaigns()}
                  >
                    Retry
                  </Button>
                </div>
              </Card>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No campaigns yet</h3>
                <p className="text-muted-foreground mt-2">Create your first campaign to get started</p>
                <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>Create Campaign</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {campaigns.map((campaign: Campaign) => (
                  <Card key={campaign._id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-lg">{campaign.name}</h4>
                          <div className="flex gap-2">
                            {campaign.type.map((type) => (
                              <span 
                                key={type}
                                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                          <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                            campaign.status === 'Active' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : campaign.status === 'Draft'
                              ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}>
                            {campaign.status}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground line-clamp-2">
                          {campaign.content}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Target:</span>
                            <span className="text-muted-foreground">{campaign.targetAudience}</span>
                          </span>
                          
                          {campaign.budget > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Budget:</span>
                              <span className="text-muted-foreground">₹{campaign.budget.toLocaleString()}</span>
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Created:</span>
                            <span className="text-muted-foreground">
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                        
                        {campaign.metrics.messagesSent > 0 && (
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span className="font-medium">{campaign.metrics.messagesSent}</span>
                              <span className="text-muted-foreground">sent</span>
                            </span>
                            
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{campaign.metrics.deliveryRate.toFixed(1)}%</span>
                              <span className="text-muted-foreground">delivered</span>
                            </span>
                            
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{campaign.metrics.openRate.toFixed(1)}%</span>
                              <span className="text-muted-foreground">opened</span>
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {campaign.status === 'Draft' && (
                          <Button size="sm">
                            Launch
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            <CreateCampaignModal 
              open={isCreateModalOpen} 
              onOpenChange={setIsCreateModalOpen}
              onCampaignCreated={refetchCampaigns}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}