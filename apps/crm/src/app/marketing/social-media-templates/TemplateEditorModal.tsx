"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { toast } from 'sonner';
import { useSaveCustomizedTemplateMutation } from '@repo/store/services/api';
import CanvasTemplateEditor from '../../../components/CanvasTemplateEditor';
import { useCrmAuth } from '@/hooks/useCrmAuth';

interface SocialMediaTemplate {
  _id: string;
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  jsonData: any;
  /** Canvas data to load in the editor — vendor copy's data if available, else original's */
  editorJsonData?: any;
  availableFor: string[];
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** True when this vendor already has a customized copy */
  isCustomized: boolean;
  isVendorCopy?: boolean;
  /**
   * The admin-owned original template _id.
   * Always use this as the `templateId` when saving.
   */
  originalTemplateId: string;
  parentTemplateId?: string | null;
}

interface TemplateEditorModalProps {
  template: SocialMediaTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateEditorModal({ template, isOpen, onClose }: TemplateEditorModalProps) {
  const { user } = useCrmAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveCustomizedTemplate] = useSaveCustomizedTemplateMutation();

  const handleSaveTemplate = async (data: { jsonData: any; previewImage: string }) => {
    if (!template) return;

    // Always save against the original admin template id so the backend can
    // locate and upsert the correct vendor copy without touching the original.
    const targetTemplateId = template.originalTemplateId || template._id || template.id;

    setIsSaving(true);
    try {
      await saveCustomizedTemplate({
        templateId: targetTemplateId,
        jsonData: data.jsonData,
        title: `${template.title}${template.isCustomized ? '' : ' - Edited'}`,
        customizations: {
          lastModified: new Date().toISOString(),
          canvasSize: {
            width: data.jsonData?.backgroundImage?.width || 1080,
            height: data.jsonData?.backgroundImage?.height || 1080,
          },
        },
      }).unwrap();

      toast.success(
        template.isCustomized
          ? 'Your design has been updated!'
          : 'Template customization saved! Your personal copy has been created.'
      );
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template customization');
    } finally {
      setIsSaving(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <div>
              <DialogTitle className="text-xl">
                {template.isCustomized ? 'Edit My Design' : 'Customize Template'}: {template.title}
              </DialogTitle>
              {template.isCustomized && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  You are editing your personal copy — the original admin template is unchanged.
                </p>
              )}
            </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-background">
          <CanvasTemplateEditor
            initialImage={template.imageUrl}
            initialJsonData={template.editorJsonData ?? template.jsonData}
            onSaveTemplate={handleSaveTemplate}
            businessName={user?.businessName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}