'use client';
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Checkbox } from "@repo/ui/checkbox";
import { Card } from "@repo/ui/card";
import { MessageSquare, Plus } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@repo/store/hooks';
// Import the hooks from the dedicated SMS template slice
import { useGetCrmSmsTemplatesQuery, useGetTestSmsTemplatesQuery } from '@repo/store/slices/smsTemplateSlice';
// Import campaign hooks
import { useCreateCrmCampaignMutation } from '@repo/store/services/api';

type Template = {
  _id: string;
  name: string;
  content: string;
  type: string;
  status: string;
  price: number;
  description?: string;
  isPopular?: boolean;
  isCustom?: boolean;
};

type CreateCampaignModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignCreated?: () => void;
};

export function CreateCampaignModal({ open, onOpenChange, onCampaignCreated }: CreateCampaignModalProps) {
  const dispatch = useAppDispatch();
  
  // Get CRM authentication state for accessing CRM SMS templates
  const { isAuthenticated, token } = useAppSelector((state: any) => ({
    isAuthenticated: state.crmAuth.isCrmAuthenticated,
    token: state.crmAuth.token
  }));
  
  // Debug authentication state
  console.log('CRM Auth State:', { isAuthenticated, token, open });
  
  // Fetch CRM SMS templates
  const {
    data: templatesResponse,
    isLoading,
    isError,
    error: fetchError,
    refetch: refetchTemplates
  } = useGetCrmSmsTemplatesQuery(undefined, {
    skip: !open, // Temporarily remove auth check to see if that's the issue
    refetchOnMountOrArgChange: true
  });
  
  // Test endpoint to bypass authentication
  const {
    data: testTemplatesResponse,
    isLoading: isLoadingTest,
    isError: isErrorTest,
    error: fetchErrorTest,
    refetch: refetchTestTemplates
  } = useGetTestSmsTemplatesQuery(undefined, {
    skip: !open,
    refetchOnMountOrArgChange: true
  });
  
  // Extract templates from the response - the slice transforms it to { templates: [], total: number }
  const templates = templatesResponse?.templates || [];
  const testTemplates = testTemplatesResponse?.templates || [];
  
  // ENHANCED DEBUG: Check if we're getting the raw data instead of transformed
  const rawTemplates = Array.isArray((templatesResponse as any)?.data) ? (templatesResponse as any).data : [];
  const rawTestTemplates = Array.isArray((testTemplatesResponse as any)?.data) ? (testTemplatesResponse as any).data : [];
  
  // Use the templates that actually have data
  const finalTemplates = templates.length > 0 ? templates : rawTemplates;
  const finalTestTemplates = testTemplates.length > 0 ? testTemplates : rawTestTemplates;
  
  // Debug API response
  console.log('Main API Response:', { templatesResponse, templates: finalTemplates, isLoading, isError, fetchError });
  console.log('Test API Response:', { testTemplatesResponse, testTemplates: finalTestTemplates, isLoadingTest, isErrorTest, fetchErrorTest });
  console.log('Final Templates array:', finalTemplates);
  console.log('Final Test Templates array:', finalTestTemplates);
  console.log('Final Templates length:', finalTemplates.length);
  console.log('Final Test Templates length:', finalTestTemplates.length);
  console.log('Auth state:', { isAuthenticated, token: token ? 'present' : 'missing' });
  console.log('Raw fetch error:', fetchError);
  console.log('Raw test fetch error:', fetchErrorTest);
  
  // Check if we have data in different formats
  console.log('Raw templates check:', {
    'templatesResponse?.templates': templatesResponse?.templates,
    'templatesResponse?.data': (templatesResponse as any)?.data,
    'testTemplatesResponse?.templates': testTemplatesResponse?.templates,
    'testTemplatesResponse?.data': (testTemplatesResponse as any)?.data
  });
  
  // Debug API URLs being called
  console.log('Expected CRM API URL should be: http://localhost:3001/api/crm/sms-template');
  console.log('Expected Test API URL should be: http://localhost:3001/api/crm/test-sms-templates');
  
  const error = isError ? 'Failed to load templates. Please try again.' : null;
  
  // Refetch templates when modal opens or auth state changes
  useEffect(() => {
    if (open && isAuthenticated) {
      refetchTemplates();
    }
  }, [open, isAuthenticated, refetchTemplates]);
  
  // Campaign creation mutation
  const [createCrmCampaign, { isLoading: isCreatingCampaign }] = useCreateCrmCampaignMutation();
  
  // Form state
  const [campaignName, setCampaignName] = useState('');
  const [campaignTypes, setCampaignTypes] = useState<string[]>(['SMS']);
  const [targetAudience, setTargetAudience] = useState('All Customers');
  const [budget, setBudget] = useState(0);
  const [scheduledDate, setScheduledDate] = useState('');
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [message, setMessage] = useState('');

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template._id);
    setMessage(template.content);
  };

  const handleCreateNewTemplate = () => {
    if (newTemplateName.trim()) {
      // In a real app, you would save this to your templates list via API
      const newTemplate: Template = {
        _id: `temp-${Date.now()}`,
        name: newTemplateName,
        content: '',
        type: 'Other',
        status: 'Draft',
        price: 0,
        isCustom: true
      };
      // Note: In a real implementation, you would create the template via API
      // and the query would automatically refetch to show the new template
      setSelectedTemplate(newTemplate._id);
      setMessage('');
      setNewTemplateName('');
      setShowNewTemplateForm(false);
    }
  };
  
  const handleCampaignTypeToggle = (type: string, checked: boolean) => {
    if (checked) {
      setCampaignTypes(prev => [...prev, type]);
    } else {
      setCampaignTypes(prev => prev.filter(t => t !== type));
    }
  };
  
  const resetForm = () => {
    setCampaignName('');
    setCampaignTypes(['SMS']);
    setTargetAudience('All Customers');
    setBudget(0);
    setScheduledDate('');
    setSelectedTemplate(null);
    setMessage('');
    setNewTemplateName('');
    setShowNewTemplateForm(false);
  };
  
  const handleCreateCampaign = async () => {
    try {
      if (!campaignName.trim()) {
        toast.error('Please enter a campaign name');
        return;
      }
      
      if (!message.trim()) {
        toast.error('Please enter message content');
        return;
      }
      
      if (campaignTypes.length === 0) {
        toast.error('Please select at least one campaign type');
        return;
      }
      
      const campaignData = {
        name: campaignName.trim(),
        type: campaignTypes,
        content: message.trim(),
        templateId: selectedTemplate,
        targetAudience,
        budget: budget || 0,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : new Date().toISOString(),
        status: 'Draft'
      };
      
      console.log('Creating campaign with data:', campaignData);
      
      const result = await createCrmCampaign(campaignData).unwrap();
      
      console.log('Campaign created successfully:', result);
      
      toast.success('Campaign created successfully!');
      
      // Trigger refetch of campaigns list
      if (onCampaignCreated) {
        onCampaignCreated();
      }
      
      // Reset form and close modal
      resetForm();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error(error?.data?.message || 'Failed to create campaign. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Create New Campaign
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Fill in the details below to create a new campaign.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - SMS Templates */}
              <div className="space-y-6 pr-0 lg:pr-4 border-r-0 lg:border-r border-border">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    SMS Templates
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetchTestTemplates()}
                      className="text-xs h-8 hover:bg-primary/10 transition-colors"
                    >
                      Test DB
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowNewTemplateForm(true)}
                      className="text-xs h-8 hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      New Template
                    </Button>
                  </div>
                </div>

                {showNewTemplateForm && (
                  <Card className="p-4 border-2 border-dashed border-primary/30 bg-primary/5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Plus className="h-4 w-4" />
                        Create New Template
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="templateName" className="text-sm font-medium">
                            Template Name
                          </Label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              id="templateName"
                              placeholder="Enter template name"
                              value={newTemplateName}
                              onChange={(e) => setNewTemplateName(e.target.value)}
                              className="flex-1"
                            />
                            <div className="flex gap-2">
                              <Button onClick={handleCreateNewTemplate} size="sm" className="flex-shrink-0">
                                Create
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowNewTemplateForm(false)}
                                className="flex-shrink-0"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {!isAuthenticated ? (
                  <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                    <div className="p-4 text-amber-800 dark:text-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                        <p className="font-medium">Authentication Required</p>
                      </div>
                      <p className="text-sm">Please log in to load SMS templates.</p>
                    </div>
                  </Card>
                ) : isLoading ? (
                  <Card className="border-primary/20">
                    <div className="flex items-center justify-center p-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <p className="text-sm text-muted-foreground">Loading templates...</p>
                      </div>
                    </div>
                  </Card>
                ) : error ? (
                  <Card className="border-destructive/20 bg-destructive/5">
                    <div className="p-4 text-destructive">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-destructive"></div>
                        <p className="font-medium">Error Loading Templates</p>
                      </div>
                      <p className="text-sm mb-3">{(fetchError as any)?.data?.message || error}</p>
                      <details className="text-xs mb-3">
                        <summary className="cursor-pointer hover:text-destructive/80">Error details</summary>
                        <pre className="mt-2 p-2 bg-destructive/10 rounded text-xs overflow-auto">
                          {JSON.stringify(fetchError, null, 2)}
                        </pre>
                      </details>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => refetchTemplates()}
                      >
                        Retry
                      </Button>
                    </div>
                  </Card>
                ) : finalTemplates?.length === 0 || !Array.isArray(finalTemplates) ? (
                  <Card className="border-muted">
                    <div className="p-6 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">No templates found from main API</p>
                          <p className="text-sm">Testing with direct DB access...</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <details className="text-left">
                          <summary className="cursor-pointer text-sm font-medium hover:text-foreground mb-2">
                            Main API Response
                          </summary>
                          <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-32">
                            {JSON.stringify(templatesResponse, null, 2)}
                          </pre>
                        </details>
                        
                        <details className="text-left">
                          <summary className="cursor-pointer text-sm font-medium hover:text-foreground mb-2">
                            Test API Response
                          </summary>
                          <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-32">
                            {JSON.stringify(testTemplatesResponse, null, 2)}
                          </pre>
                        </details>
                        
                        <div className="flex flex-wrap gap-4 justify-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span>Final Templates: {finalTemplates.length}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>Test Templates: {finalTestTemplates.length}</span>
                          </div>
                        </div>
                        
                        {finalTestTemplates.length > 0 && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <p className="font-medium">✅ Database Connection Success</p>
                            </div>
                            <p className="text-sm mb-2">Database has {finalTestTemplates.length} templates! Issue is with authentication or main API.</p>
                            <div className="text-xs">
                              <p className="font-medium mb-1">Available Templates:</p>
                              <p>{finalTestTemplates.map((t: any) => t.name).join(', ')}</p>
                            </div>
                          </div>
                        )}
                        
                        {finalTemplates.length > 0 && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <p className="font-medium">✅ Main API Success</p>
                            </div>
                            <p className="text-sm mb-2">Main API has {finalTemplates.length} templates!</p>
                            <div className="text-xs">
                              <p className="font-medium mb-1">Available Templates:</p>
                              <p>{finalTemplates.map((t: any) => t.name).join(', ')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {finalTemplates.map((template: Template) => (
                      <Card
                        key={template._id}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedTemplate === template._id 
                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                            : 'hover:bg-muted/50 hover:border-primary/30'
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                            selectedTemplate === template._id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            <MessageSquare className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-foreground truncate">{template.name}</h4>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {template.isPopular && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200 font-medium">
                                    ✨ Popular
                                  </span>
                                )}
                                <div className={`h-2 w-2 rounded-full ${
                                  template.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                                }`}></div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {template.content.substring(0, 80)}{template.content.length > 80 ? '...' : ''}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                                {template.type}
                              </span>
                              <span className={`px-2 py-1 rounded-md font-medium ${
                                template.status === 'Active' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {template.status}
                              </span>
                              {template.price > 0 && (
                                <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-semibold">
                                  ${template.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
            </div>
            
            {/* Right Column - Campaign Details */}
            <div className="space-y-6 pl-0 lg:pl-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Campaign Details</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="campaign-name" className="text-sm font-medium flex items-center gap-2">
                  Campaign Name
                  <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="campaign-name" 
                  placeholder="Enter a descriptive campaign name" 
                  className="h-11"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Campaign Type
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      id="type-sms" 
                      checked={campaignTypes.includes('SMS')}
                      onCheckedChange={(checked) => handleCampaignTypeToggle('SMS', checked as boolean)}
                      className="data-[state=checked]:bg-primary" 
                    />
                    <Label htmlFor="type-sms" className="font-medium cursor-pointer flex-1">
                      SMS
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      id="type-email" 
                      checked={campaignTypes.includes('Email')}
                      onCheckedChange={(checked) => handleCampaignTypeToggle('Email', checked as boolean)}
                      className="data-[state=checked]:bg-primary" 
                    />
                    <Label htmlFor="type-email" className="font-medium cursor-pointer flex-1">
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      id="type-whatsapp" 
                      checked={campaignTypes.includes('WhatsApp')}
                      onCheckedChange={(checked) => handleCampaignTypeToggle('WhatsApp', checked as boolean)}
                      className="data-[state=checked]:bg-primary" 
                    />
                    <Label htmlFor="type-whatsapp" className="font-medium cursor-pointer flex-1">
                      WhatsApp
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
                  Message Content
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Textarea 
                    id="message" 
                    placeholder="Type your message here..." 
                    className="min-h-[140px] resize-none pr-16"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                    {message.length}/160
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    SMS limit: 160 characters per message
                  </span>
                  <span className={`font-medium ${
                    message.length <= 160 ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {Math.ceil(message.length / 160)} SMS{Math.ceil(message.length / 160) !== 1 ? 'es' : ''}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="target-audience" className="text-sm font-medium">
                    Target Audience
                  </Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Customers">All Customers</SelectItem>
                      <SelectItem value="New Customers">New Customers</SelectItem>
                      <SelectItem value="Returning Customers">Returning Customers</SelectItem>
                      <SelectItem value="Premium Customers">Premium Customers</SelectItem>
                      <SelectItem value="Inactive Customers">Inactive Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="budget" className="text-sm font-medium">
                    Budget (₹)
                  </Label>
                  <Input 
                    id="budget" 
                    type="number"
                    placeholder="Enter campaign budget" 
                    className="h-11"
                    min="0"
                    value={budget || ''}
                    onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="scheduled-date" className="text-sm font-medium">
                  Scheduled Date (Optional)
                </Label>
                <Input 
                  id="scheduled-date" 
                  type="datetime-local"
                  className="h-11"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to send immediately or schedule for a future date
                </p>
              </div>
              
              {selectedTemplate && (
                <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">Selected Template</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Using template: <span className="font-medium text-foreground">{finalTemplates.find((t: any) => t._id === selectedTemplate)?.name}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t bg-background">
      <Button 
        variant="outline" 
        onClick={() => {
          resetForm();
          onOpenChange(false);
        }}
        className="order-2 sm:order-1"
        disabled={isCreatingCampaign}
      >
        Cancel
      </Button>
      <Button 
        className="order-1 sm:order-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        disabled={!message.trim() || !campaignName.trim() || isCreatingCampaign}
        onClick={handleCreateCampaign}
      >
        {isCreatingCampaign ? 'Creating...' : 'Create Campaign'}
      </Button>
    </div>
  </DialogContent>
</Dialog>
);
}
