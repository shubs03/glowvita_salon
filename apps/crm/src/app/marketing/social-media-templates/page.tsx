"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { ArrowLeft, Search, Image, Heart, MessageSquare, Share, Eye, RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';
import { useGetCrmSocialMediaTemplatesQuery } from '@repo/store/services/api';
import { toast } from 'sonner';
import TemplateEditorModal from './TemplateEditorModal';

interface SocialMediaTemplate {
  _id: string;
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  availableFor: string[];
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SocialMediaTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreatingSamples, setIsCreatingSamples] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SocialMediaTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Fetch social media templates available for CRM
  const {
    data: templatesResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useGetCrmSocialMediaTemplatesQuery(undefined, {
    // Add RTK Query options for better debugging
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: true,
  });

  console.log('Social Media Templates Response:', templatesResponse);
  console.log('Templates data:', templatesResponse?.templates);
  console.log('Total templates:', templatesResponse?.total);
  console.log('IsLoading:', isLoading);
  console.log('IsError:', isError);
  console.log('Error:', error);

  const templates: SocialMediaTemplate[] = templatesResponse?.templates || [];
  const totalTemplates = templatesResponse?.total || 0;

  // Function to test diagnostic endpoint
  const testDiagnostic = async () => {
    try {
      console.log('Testing diagnostic endpoint...');
      const response = await fetch('/api/diagnostic/social-media-templates');
      const result = await response.json();
      console.log('Diagnostic Response:', result);
      setDebugInfo({ diagnostic: result });
    } catch (error: any) {
      console.error('Diagnostic Error:', error);
      setDebugInfo({ diagnosticError: error.message });
    }
  };

  // Function to test API directly
  const testApiDirectly = async () => {
    try {
      console.log('Testing API directly...');
      const response = await fetch('/api/crm/social-media-templates');
      const result = await response.json();
      console.log('Direct API Response:', result);
      setDebugInfo(result);
    } catch (error: any) {
      console.error('Direct API Error:', error);
      setDebugInfo({ error: error.message });
    }
  };

  // Function to create sample templates
  const createSampleTemplates = async () => {
    setIsCreatingSamples(true);
    try {
      const response = await fetch('/api/test/social-media-templates');
      const result = await response.json();
      
      if (result.success) {
        toast.success('Sample templates created successfully!');
        // Refetch the templates to update the UI
        await refetch();
      } else {
        throw new Error(result.error || 'Failed to create sample templates');
      }
    } catch (error) {
      console.error('Error creating sample templates:', error);
      toast.error('Failed to create sample templates. Please try again.');
    } finally {
      setIsCreatingSamples(false);
    }
  };

  // Get unique categories from templates
  const templateCategories = templates.map((template) => template.category);
  const uniqueCategories = Array.from(new Set(templateCategories));
  const categories: string[] = ['All', ...uniqueCategories];

  // Filter templates based on search and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateUse = (template: SocialMediaTemplate) => {
    // Open template in editor for editing
    setSelectedTemplate(template);
    setIsEditorOpen(true);
    console.log('Opening template in editor:', template);
  };

  const handleTemplatePreview = (template: SocialMediaTemplate) => {
    // Open template in editor in preview mode
    setSelectedTemplate(template);
    setIsEditorOpen(true);
    console.log('Previewing template:', template);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/marketing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketing
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading social media templates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/marketing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketing
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load social media templates</p>
            <p className="text-muted-foreground text-sm">
              Please try again later
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/marketing">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketing
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Social Media Templates</h1>
        
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Templates Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {filteredTemplates.length} of {totalTemplates} templates
        </p>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || selectedCategory !== 'All'
              ? 'Try adjusting your search or filter criteria'
              : 'No social media templates are available at the moment'}
          </p>
          
          {/* Show create sample templates button if no templates and no search/filter active */}
          {!searchTerm && selectedCategory === 'All' && totalTemplates === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Would you like to create some sample templates to get started?
              </p>
              <Button 
                onClick={createSampleTemplates}
                disabled={isCreatingSamples}
                className="mx-auto"
              >
                {isCreatingSamples ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating Sample Templates...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sample Templates
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                This will create sample social media templates with different availability types
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square bg-gray-100">
                {template.imageUrl ? (
                  <img
                    src={template.imageUrl}
                    alt={template.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-2">{template.title}</CardTitle>
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTemplateUse(template)}
                  >
                    Edit Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTemplatePreview(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Template Editor Modal */}
      <TemplateEditorModal
        template={selectedTemplate}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
      />
    </div>
  );
}