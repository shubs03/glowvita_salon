"use client";

import React, { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";
import { Badge } from "@repo/ui/badge";
import { CheckCircle2, X, Clock } from "lucide-react";
import { useUpdateVendorDocumentStatusMutation } from '@repo/store/api';
import { toast } from 'sonner';

interface DocumentStatusManagerProps {
  vendor: any;
  onUpdate: () => void;
}

const DocumentStatusManager: React.FC<DocumentStatusManagerProps> = ({ vendor, onUpdate }) => {
  console.log('DocumentStatusManager - Vendor:', vendor);
  
  const [updateDocumentStatus] = useUpdateVendorDocumentStatusMutation();
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const documentTypes = [
    { key: 'aadharCard', label: 'Aadhar Card' },
    { key: 'panCard', label: 'PAN Card' },
    { key: 'udyogAadhar', label: 'Udyog Aadhar' },
    { key: 'udhayamCert', label: 'Udhayam Certificate' },
    { key: 'shopLicense', label: 'Shop License' }
  ];

  const handleUpdateStatus = async () => {
    if (!selectedDocument) {
      toast.error('Please select a document type');
      return;
    }

    if (status === 'rejected' && !rejectionReason.trim()) {
      toast.error('Rejection reason is required when rejecting a document');
      return;
    }

    try {
      await updateDocumentStatus({
        vendorId: vendor._id,
        documentType: selectedDocument,
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : ''
      }).unwrap();

      toast.success(`Document status updated successfully`);
      setSelectedDocument('');
      setStatus('pending');
      setRejectionReason('');
      onUpdate();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update document status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="mr-1 h-3 w-3" /> Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    }
  };

  // Find documents that need approval
  const pendingDocuments = vendor?.documents ? 
    documentTypes.filter(({ key }) => {
      const docStatus = vendor.documents[`${key}Status`] || 'pending';
      // Check if document exists (not null or undefined) and not empty string
      const isUploaded = vendor.documents[key] && vendor.documents[key] !== '';
      const isPending = docStatus === 'pending' && isUploaded;
      
      // Debug logging
      if (isPending) {
        console.log(`Pending document found: ${key}`, {
          status: docStatus,
          uploaded: isUploaded,
          value: vendor.documents[key]
        });
      }
      
      return isPending;
    }) : [];

  console.log('Pending documents:', pendingDocuments);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Status Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {pendingDocuments.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Documents Needing Approval
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {pendingDocuments.length} document{pendingDocuments.length > 1 ? 's' : ''} {pendingDocuments.length > 1 ? 'are' : 'is'} pending your review.
              Please select a document below to approve or reject.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={selectedDocument} onValueChange={setSelectedDocument}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(({ key, label }) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {status === 'rejected' && (
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>
        )}
        
        <Button onClick={handleUpdateStatus}>Update Document Status</Button>
        
        {vendor?.documents && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Document Status</h3>
            <div className="space-y-3">
              {documentTypes.map(({ key, label }) => {
                const docStatus = vendor.documents[`${key}Status`] || 'pending';
                const adminRejectionReason = vendor.documents[`${key}AdminRejectionReason`];
                const isUploaded = !!vendor.documents[key];
                
                // Highlight pending documents for approval
                const isPendingApproval = docStatus === 'pending' && isUploaded;
                
                return (
                  <div key={key} className={`border rounded-lg p-4 ${isPendingApproval ? 'border-yellow-500 bg-yellow-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{label}</p>
                          {isUploaded ? (
                            <div>
                              <p className="text-sm text-green-600">Uploaded</p>
                              <button 
                                className="text-xs text-blue-600 hover:underline mt-1"
                                onClick={() => {
                                  // Try to open the document in a new tab
                                  if (vendor.documents[key]) {
                                    window.open(vendor.documents[key], '_blank');
                                  }
                                }}
                              >
                                View Document
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(docStatus)}
                        {isPendingApproval && (
                          <Badge className="bg-yellow-500 text-white">Needs Review</Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Display admin rejection reason if document is rejected */}
                    {docStatus === 'rejected' && adminRejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
                        <p className="text-sm font-medium text-red-800">Admin Rejection Reason:</p>
                        <p className="text-sm text-red-700">{adminRejectionReason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentStatusManager;