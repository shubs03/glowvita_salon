
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ArrowLeft, Search, RefreshCw, Pencil, Sparkles, LayoutTemplate, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useGetCrmSocialMediaTemplatesQuery, useDeleteCustomizedTemplateMutation } from '@repo/store/services/api';
import TemplateEditorModal from './TemplateEditorModal';
import TemplateCanvasThumbnail from '../../../components/TemplateCanvasThumbnail';

interface SocialMediaTemplate {
  _id: string;
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  jsonData: any;
  /** The jsonData that should be loaded in the editor (vendor copy's data if available) */
  editorJsonData: any;
  availableFor: string[];
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** True when this item IS a vendor copy (shown in My Customizations tab) */
  isVendorCopy: boolean;
  /** True when the vendor has saved a copy of an original (shown as badge on originals) */
  isCustomized: boolean;
  /** The admin original template's _id — used when saving */
  originalTemplateId: string;
  parentTemplateId?: string | null;
}

export default function SocialMediaTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<SocialMediaTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const [deleteCustomizedTemplate] = useDeleteCustomizedTemplateMutation();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customization? This action cannot be undone.')) {
      return;
    }

    setIsDeletingId(id);
    try {
      await deleteCustomizedTemplate(id).unwrap();
      toast.success('Customized template deleted successfully');
    } catch (err) {
      console.error('Failed to delete template:', err);
      toast.error('Failed to delete template customization');
    } finally {
      setIsDeletingId(null);
    }
  };

  const {
    data: templatesResponse,
    isLoading,
    isError,
    refetch
  } = useGetCrmSocialMediaTemplatesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const allItems: SocialMediaTemplate[] = templatesResponse?.templates || [];

  // All Admin original templates are always visible in "All Templates"
  const originals = allItems.filter(t => !t.isVendorCopy);

  // Vendor's own saved copies → "My Customizations" tab
  const myCustomizations = allItems.filter(t => t.isVendorCopy);

  const handleTemplateUse = (template: SocialMediaTemplate, forceOriginal = false) => {
    const templateToOpen = forceOriginal
      ? { ...template, editorJsonData: template.jsonData, isCustomized: false }
      : template;
    setSelectedTemplate(templateToOpen);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
    refetch(); // so customized badge / my customizations updates immediately
  };

  const uniqueCategories = Array.from(new Set(originals.map(t => t.category)));
  const categories: string[] = ['All', ...uniqueCategories];

  const applyFilters = (list: SocialMediaTemplate[]) =>
    list.filter(t => {
      const matchSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
      return matchSearch && matchCat;
    });

  const filteredOriginals = applyFilters(originals);
  const filteredCustomizations = applyFilters(myCustomizations);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/marketing"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Marketing</Button></Link>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
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
          <Link href="/marketing"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Marketing</Button></Link>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load social media templates</p>
            <p className="text-muted-foreground text-sm">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  const TemplateGrid = ({
    templates,
    emptyMessage,
    isAllTemplates = false,
  }: {
    templates: SocialMediaTemplate[];
    emptyMessage: string;
    isAllTemplates?: boolean;
  }) =>
    templates.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
        <LayoutTemplate className="h-12 w-12 opacity-30" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map(template => (
          <Card key={template._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Preview */}
            <div className="relative aspect-square bg-gray-100">
              <TemplateCanvasThumbnail
                imageUrl={template.imageUrl}
                jsonData={isAllTemplates ? template.jsonData : (template.editorJsonData ?? template.jsonData)}
                alt={template.title}
              />
              <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                {template.isVendorCopy && (
                  <Badge
                    className="text-xs flex items-center gap-1"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none' }}
                  >
                    <Sparkles className="h-3 w-3" /> My Design
                  </Badge>
                )}
                {!template.isVendorCopy && template.isCustomized && (
                  <Badge
                    className="text-xs flex items-center gap-1"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none' }}
                  >
                    <Pencil className="h-3 w-3" /> Customized
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base line-clamp-2">{template.title}</CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex gap-2">
              <Button
                size="sm"
                className="flex-1 gap-2"
                onClick={() => handleTemplateUse(template, isAllTemplates)}
              >
                <Pencil className="h-3.5 w-3.5" />
                {isAllTemplates ? 'Customize Template' : 'Edit My Design'}
              </Button>
              {!isAllTemplates && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 flex gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(template._id);
                  }}
                  disabled={isDeletingId === template._id}
                >
                  {isDeletingId === template._id ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/marketing">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Marketing
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Social Media Templates</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            All Templates
            <Badge variant="secondary" className="ml-1 text-xs">{filteredOriginals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="my" className="gap-2">
            <Sparkles className="h-4 w-4" />
            My Customizations
            {myCustomizations.length > 0 && (
              <Badge
                className="ml-1 text-xs"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none' }}
              >
                {filteredCustomizations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <p className="text-sm text-muted-foreground mb-4">
            {filteredOriginals.length} of {originals.length} templates
          </p>
          <TemplateGrid
            templates={filteredOriginals}
            emptyMessage="No templates found. Try adjusting your search or category filter."
            isAllTemplates={true}
          />
        </TabsContent>

        <TabsContent value="my">
          <p className="text-sm text-muted-foreground mb-4">
            {filteredCustomizations.length} saved design{filteredCustomizations.length !== 1 ? 's' : ''}
          </p>
          <TemplateGrid
            templates={filteredCustomizations}
            emptyMessage="You haven't customized any templates yet. Go to All Templates and click 'Customize Template' to get started!"
            isAllTemplates={false}
          />
        </TabsContent>
      </Tabs>

      {/* Editor Modal */}
      <TemplateEditorModal
        template={selectedTemplate}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
      />
    </div>
  );
}
