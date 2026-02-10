import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { FileText, Eye, Trash2, Clock, Check, X } from "lucide-react";
import { useUpdateVendorProfileMutation, useUpdateSupplierProfileMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';

interface DocumentsTabProps {
  documents: any;
  setVendor: any;
}

export const DocumentsTab = ({ documents, setVendor }: DocumentsTabProps) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  const [updateSupplierProfile] = useUpdateSupplierProfileMutation();
  const { role } = useCrmAuth();
  const [previewDocument, setPreviewDocument] = useState<{ src: string; type: string } | null>(null);

  const handleSave = async () => {
    try {
      const updateFn = role === 'vendor' ? updateVendorProfile : updateSupplierProfile;
      const result: any = await updateFn({
        _id: typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}')._id) : undefined,
        documents: documents
      }).unwrap();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update documents');
    }
  };

  const handleDocumentUpload = async (docType: string, file: File | null) => {
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'application/pdf'];

    // File type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Invalid file type. Only JPG, JPEG, and PDF are allowed for documents.`);
      return;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum size allowed is 5MB.`);
      return;
    }

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      setVendor((prev: any) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: base64,
          // Reset status when a new document is uploaded
          [`${docType}Status`]: 'pending',
          [`${docType}RejectionReason`]: null,
          [`${docType}AdminRejectionReason`]: null
        }
      }));
    } catch (error) {
      console.error('Error reading document:', error);
      toast.error('Failed to read document file');
    }
  };

  const handleRemoveDocument = (docType: string) => {
    setVendor((prev: any) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: null,
        [`${docType}Status`]: 'pending',
        [`${docType}RejectionReason`]: null,
        [`${docType}AdminRejectionReason`]: null
      }
    }));
  };

  const openDocumentPreview = (src: string, type: string) => {
    setPreviewDocument({ src, type });
  };

  const closeDocumentPreview = () => {
    setPreviewDocument(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const documentTypes = [
    { key: 'aadharCard', label: 'Aadhar Card' },
    { key: 'panCard', label: 'PAN Card' },
    { key: 'udyogAadhar', label: 'Udyog Aadhar' },
    { key: 'udhayamCert', label: 'Udhayam Certificate' },
    { key: 'shopLicense', label: 'Shop License' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Documents</CardTitle>
        <CardDescription>
          Upload and manage your verification documents. Documents will be reviewed by our team.
          <div className="mt-4 p-3 bg-primary/5 border-l-4 border-primary rounded-r-md">
            <p className="text-xs font-bold text-primary uppercase mb-1">Upload Requirements:</p>
            <ul className="text-[11px] text-primary/80 list-disc list-inside space-y-0.5 font-medium">
              <li>File formats: <span className="font-bold">JPG, JPEG, PDF</span></li>
              <li>Maximum file size: <span className="font-bold text-primary underline">5MB</span></li>
            </ul>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {documentTypes.map(({ key, label }) => (
            <div key={key} className="border rounded-lg p-4">
              {/* Hidden file input for each document type */}
              <input
                id={`doc-upload-${key}`}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleDocumentUpload(key, file);
                  // Reset the input value to allow uploading the same file again
                  e.target.value = '';
                }}
              />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{label}</p>
                    {documents?.[key] ? (
                      <p className="text-sm text-green-600">Uploaded</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {documents?.[key] ? (
                    <>
                      {getStatusBadge(documents[`${key}Status`] || 'pending')}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-lg"
                        onClick={() => openDocumentPreview(documents[key], key)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-lg"
                        onClick={() => handleRemoveDocument(key)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-10 px-4 rounded-lg" asChild>
                      <label htmlFor={`doc-upload-${key}`} className="cursor-pointer">
                        Upload
                      </label>
                    </Button>
                  )}
                </div>
              </div>

              {/* Display admin rejection reason if document is rejected */}
              {documents?.[`${key}Status`] === 'rejected' && documents[`${key}AdminRejectionReason`] && (
                <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
                  <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{documents[`${key}AdminRejectionReason`]}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Document Preview Modal */}
        {previewDocument && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeDocumentPreview}>
            <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 h-10 w-10 rounded-lg"
                onClick={closeDocumentPreview}
              >
                <X className="h-4 w-4" />
              </Button>
              {previewDocument.src?.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDocument.src}
                  className="w-full h-[80vh]"
                  title="Document Preview"
                />
              ) : (
                previewDocument.src?.startsWith('data:') || previewDocument.src?.startsWith('http') ? (
                  <img
                    src={previewDocument.src || ''}
                    alt="Document Preview"
                    className="object-contain max-h-[80vh] mx-auto max-w-full"
                    onError={(e) => {
                      console.log('Document image failed to load:', previewDocument.src);
                      // Set a fallback image on error
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90">
          Save Documents
        </Button>
      </CardFooter>
    </Card>
  );
};