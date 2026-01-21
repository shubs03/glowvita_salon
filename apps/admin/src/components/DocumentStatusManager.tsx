"use client";

import React, { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";
import { Badge } from "@repo/ui/badge";
import { CheckCircle2, X, Clock, Eye, FileText } from "lucide-react";
import { useUpdateVendorDocumentStatusMutation } from '@repo/store/api';
import { toast } from 'sonner';

interface DocumentStatusManagerProps {
  vendor: any;
  onUpdate: () => void;
}

const DocumentStatusManager: React.FC<DocumentStatusManagerProps> = ({ vendor, onUpdate }) => {
  const [updateDocumentStatus] = useUpdateVendorDocumentStatusMutation();
  const [previewDocument, setPreviewDocument] = useState<{ src: string; type: string } | null>(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const documentTypes = [
    { key: 'aadharCard', label: 'Aadhar Card' },
    { key: 'panCard', label: 'PAN Card' },
    { key: 'udyogAadhar', label: 'Udyog Aadhar' },
    { key: 'udhayamCert', label: 'Udhayam Certificate' },
    { key: 'shopLicense', label: 'Shop License' }
  ];

  const getDocumentStatus = (docType: string) => {
    if (vendor?.documents && typeof vendor.documents === 'object') {
      const statusKey = `${docType}Status`;
      return vendor.documents[statusKey] || 'pending';
    }
    return 'pending';
  };

  const getRejectionReason = (docType: string) => {
    if (vendor?.documents && typeof vendor.documents === 'object') {
      const reasonKey = `${docType}AdminRejectionReason`;
      return vendor.documents[reasonKey] || '';
    }
    return '';
  };

  const getDocumentValue = (docType: string) => {
    if (vendor?.documents && typeof vendor.documents === 'object') {
      return vendor.documents[docType] || null;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none shadow-none"><CheckCircle2 className="mr-1 h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none shadow-none"><X className="mr-1 h-3 w-3" /> Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none shadow-none"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    }
  };

  const handleApproveDocument = async (docType: string) => {
    try {
      await updateDocumentStatus({
        vendorId: vendor._id,
        documentType: docType,
        status: 'approved',
        rejectionReason: ''
      }).unwrap();

      const documentLabel = documentTypes.find(d => d.key === docType)?.label || docType;
      toast.success(`${documentLabel} approved successfully`);
      onUpdate();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve document');
    }
  };

  const handleRejectDocument = (docType: string) => {
    setSelectedDocumentType(docType);
    setRejectionReason('');
    setIsRejectionModalOpen(true);
  };

  const handleConfirmRejection = async () => {
    if (!selectedDocumentType) return;

    try {
      await updateDocumentStatus({
        vendorId: vendor._id,
        documentType: selectedDocumentType,
        status: 'rejected',
        rejectionReason
      }).unwrap();

      const documentLabel = documentTypes.find(d => d.key === selectedDocumentType)?.label || selectedDocumentType;
      toast.success(`${documentLabel} rejected successfully`);

      setIsRejectionModalOpen(false);
      setSelectedDocumentType(null);
      setRejectionReason('');
      onUpdate();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject document');
    }
  };

  const openDocumentPreview = (src: string, type: string) => {
    setPreviewDocument({ src, type });
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-lg">Document Status Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {(() => {
          const pendingCount = documentTypes.filter(({ key }) => {
            const isUploaded = !!getDocumentValue(key);
            const status = getDocumentStatus(key);
            return isUploaded && status === 'pending';
          }).length;

          if (pendingCount > 0) {
            return (
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <h3 className="font-semibold text-yellow-800 flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Documents Needing Approval
                </h3>
                <p className="text-xs text-yellow-700 mt-1">
                  {pendingCount} document{pendingCount > 1 ? 's are' : ' is'} pending your review.
                  Please select a document below to approve or reject.
                </p>
              </div>
            );
          }
          return null;
        })()}

        <div className="space-y-4">
          {documentTypes.map(({ key, label }) => {
            const docValue = getDocumentValue(key);
            const docStatus = getDocumentStatus(key);
            const rejectionReasonText = getRejectionReason(key);

            return (
              <div key={key} className={`border rounded-lg p-4 transition-all ${docStatus === 'pending' && docValue ? 'border-yellow-200 bg-yellow-50/20' : 'border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${docValue ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      {docValue ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center text-xs text-green-600 font-medium">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Uploaded
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center text-xs text-muted-foreground">
                          <X className="mr-1 h-3 w-3" />
                          Not uploaded
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {docValue ? (
                      <>
                        {getStatusBadge(docStatus)}
                        {docStatus === 'pending' && (
                          <Badge className="bg-yellow-500 text-white text-[10px] hover:bg-yellow-600 border-none shadow-none">Needs Review</Badge>
                        )}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => openDocumentPreview(docValue as string, key)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {docStatus === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                              onClick={() => handleApproveDocument(key)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-3 text-xs"
                              onClick={() => handleRejectDocument(key)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic font-medium">Waiting for upload</span>
                    )}
                  </div>
                </div>

                {docStatus === 'rejected' && rejectionReasonText && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100 flex gap-2">
                    <div className="text-red-500 mt-0.5">
                      <X className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-800">Rejection Reason:</p>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">{rejectionReasonText}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Document Preview Overlay */}
      {previewDocument && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewDocument(null)}
        >
          <div className="relative max-w-5xl max-h-full w-full flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end w-full">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 w-10"
                onClick={() => setPreviewDocument(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-white/5 p-1 border border-white/10 shadow-2xl">
              {previewDocument.src?.toLowerCase().endsWith('.pdf') || previewDocument.src?.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDocument.src}
                  className="w-full h-[85vh] rounded-lg bg-white"
                  title="Document Preview"
                />
              ) : (
                <img
                  src={previewDocument.src}
                  alt="Document Preview"
                  className="object-contain max-h-[85vh] mx-auto rounded-lg shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <X className="h-5 w-5" />
              Reject Document
            </DialogTitle>
            <DialogDescription>
              Provide a clear reason why this document is being rejected. The vendor will see this reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Label htmlFor="rejectionReason" className="font-semibold">Rejection Reason *</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Image is blurry, Expired document, Mismatching name..."
              className="min-h-[120px] focus-visible:ring-red-500"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsRejectionModalOpen(false)}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejection}
              disabled={!rejectionReason.trim()}
              className="px-8"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DocumentStatusManager;