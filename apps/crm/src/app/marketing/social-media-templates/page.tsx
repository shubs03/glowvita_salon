"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { ArrowLeft, Search, Image, Eye, RefreshCw } from 'lucide-react';
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
    refetchOnMountOrArgChange: true,
  });

  const templates: SocialMediaTemplate[] = templatesResponse?.data || [];
  const totalTemplates = templates.length || 0;

  const handleTemplateUse = (template: SocialMediaTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
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

      {/* Templates Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {filteredTemplates.length} of {totalTemplates} templates
        </p>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p>No templates found.</p>
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
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
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
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleTemplateUse(template)}
                >
                  Customize Template
                </Button>
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
