import React from "react";
import { Card, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { FileText, Eye, Trash2, Clock, Check, X } from "lucide-react";

interface DocumentCardProps {
  docType: string;
  label: string;
  document: string | null;
  status: string;
  onUpload: (docType: string, file: File | null) => void;
  onPreview: (src: string, type: string) => void;
  onRemove: (docType: string) => void;
}

export const DocumentCard = ({ 
  docType, 
  label, 
  document, 
  status, 
  onUpload, 
  onPreview, 
  onRemove 
}: DocumentCardProps) => {
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

  return (
    <div className="border rounded-lg p-4">
      {/* Hidden file input for each document type */}
      <input
        id={`doc-upload-${docType}`}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onUpload(docType, file);
          // Reset the input value to allow uploading the same file again
          e.target.value = '';
        }}
      />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">{label}</p>
            {document ? (
              <p className="text-sm text-green-600">Uploaded</p>
            ) : (
              <p className="text-sm text-muted-foreground">Not uploaded</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {document ? (
            <>
              {getStatusBadge(status)}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg"
                onClick={() => onPreview(document, docType)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg"
                onClick={() => onRemove(docType)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="h-10 px-4 rounded-lg" asChild>
              <label htmlFor={`doc-upload-${docType}`} className="cursor-pointer">
                Upload
              </label>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};