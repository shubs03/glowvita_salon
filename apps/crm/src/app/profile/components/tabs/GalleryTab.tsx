import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { UploadCloud, Eye, Trash2, FileText, X } from "lucide-react";
import { useUpdateVendorProfileMutation } from '@repo/store/api';
import { toast } from 'sonner';

interface GalleryTabProps {
  gallery: string[];
  setVendor: any;
}

export const GalleryTab = ({ gallery, setVendor }: GalleryTabProps) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      const result: any = await updateVendorProfile({
        gallery: gallery
      }).unwrap();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update gallery');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    setVendor((prev: any) => ({ ...prev, gallery: newGallery }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // File type validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPG, JPEG, PNG, and WEBP are allowed.`);
        continue;
      }

      // File size validation
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name}. Maximum size allowed is 5MB.`);
        continue;
      }

      // In a real app, you would upload the files to a server and get URLs
      // For now, we'll convert to base64 strings for demonstration
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
        newImages.push(base64);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error(`Failed to read file: ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      setVendor((prev: any) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...newImages]
      }));
    }
  };

  const openPreview = (src: string) => {
    setPreviewImage(src);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salon Gallery</CardTitle>
        <CardDescription>Manage your salon's photo gallery.</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="mb-6 p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById('gallery-upload')?.click()}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag & drop images here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click anywhere in this area to select files
          </p>
          <div className="mt-4 p-3 bg-primary/5 border-l-4 border-primary rounded-r-md">
            <p className="text-xs font-bold text-primary uppercase mb-1">Upload Requirements:</p>
            <ul className="text-[11px] text-primary/80 list-disc list-inside space-y-0.5 font-medium">
              <li>File formats: <span className="font-bold">JPG, JPEG, PNG, WEBP</span></li>
              <li>Maximum file size: <span className="font-bold text-primary underline">5MB</span></li>
            </ul>
          </div>
          <Input
            id="gallery-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
        {gallery && gallery.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((src, index) => (
              <div key={index} className="relative group aspect-video">
                {src && (src?.startsWith('data:') || src?.startsWith('http')) ? (
                  <img
                    src={src}
                    alt={`Salon image ${index + 1}`}
                    className="object-cover rounded-lg cursor-pointer w-full h-full"
                    onClick={() => openPreview(src)}
                    onError={(e) => {
                      console.log('Gallery image failed to load:', src);
                      // Set a fallback image on error
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-lg w-full h-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(src);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No images uploaded yet</p>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closePreview}>
            <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 h-10 w-10 rounded-lg"
                onClick={closePreview}
              >
                <X className="h-4 w-4" />
              </Button>
              {previewImage?.startsWith('data:') || previewImage?.startsWith('http') ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="object-contain max-h-[80vh] mx-auto max-w-full"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90">
          Save Gallery
        </Button>
      </CardFooter>
    </Card>
  );
};