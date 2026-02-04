"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from '@repo/store/hooks';
import { useUpdateVendorProfileMutation, useUpdateSupplierProfileMutation, useUpdateDoctorProfileMutation } from '@repo/store/api';
import { selectVendor, selectVendorLoading, selectVendorError, selectVendorMessage, clearVendorMessage, clearVendorError } from '@repo/store/slices/vendorSlice';
import { toast } from 'sonner';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import ProfilePage from './components/ProfilePage';

// Function to download QR code as PNG image
const downloadQRCode = async (url: string) => {
  try {
    const svgElement = document.getElementById('qr-code-svg');
    if (!svgElement) {
      toast.error('QR code not found');
      return;
    }

    // Get SVG as string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error('Could not create canvas context');
      return;
    }
    
    // Set canvas size (increased resolution for better quality)
    const size = 400; // Increased size for better quality PNG
    canvas.width = size;
    canvas.height = size;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Convert SVG to data URL
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      try {
        ctx.fillStyle = '#ffffff'; // White background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to PNG and download
        const pngUrl = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `qr-code-salon-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(svgUrl);
        
        toast.success('QR code downloaded successfully!');
      } catch (drawError) {
        console.error('Error drawing image to canvas:', drawError);
        toast.error('Failed to draw QR code');
      }
    };
    
    img.onerror = () => {
      toast.error('Failed to load QR code image');
    };
    
    img.src = svgUrl;
  } catch (error) {
    console.error('Error downloading QR code:', error);
    toast.error('Failed to download QR code');
  }
};

export default function SalonProfilePage() {
  const { user, role } = useCrmAuth();
  const dispatch = useDispatch();
  const vendor = useAppSelector(selectVendor);
  const loading = useAppSelector(selectVendorLoading);
  const error = useAppSelector(selectVendorError);
  const message = useAppSelector(selectVendorMessage);

  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  const [updateSupplierProfile] = useUpdateSupplierProfileMutation();
  const [updateDoctorProfile] = useUpdateDoctorProfileMutation();

  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Handle profile image upload
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      // Use the appropriate update function based on role
      if (role === 'vendor') {
        const result: any = await updateVendorProfile({
          _id: vendor?._id,
          profileImage: base64
        }).unwrap();

        if (result.success) {
          // Update local state would be handled by the ProfilePage component
          toast.success('Profile image updated successfully');
        } else {
          toast.error(result.message || 'Failed to update profile image');
        }
      } else if (role === 'supplier') {
        // For suppliers, use the supplier update function
        const result: any = await updateSupplierProfile({
          _id: vendor?._id, // This would need to be the supplier ID
          profileImage: base64
        }).unwrap();

        if (result.success) {
          toast.success('Profile image updated successfully');
        } else {
          toast.error(result.message || 'Failed to update profile image');
        }
      } else {
        // For doctors, use the doctor update function
        const result: any = await updateDoctorProfile({
          _id: vendor?._id, // This would need to be the doctor ID
          profileImage: base64
        }).unwrap();

        if (result.success) {
          toast.success('Profile image updated successfully');
        } else {
          toast.error(result.message || 'Failed to update profile image');
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update profile image');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const openProfileImagePreview = () => {
    // This would be handled by the ProfilePage component
    // For now, we'll just show a toast
    toast.info('Image preview functionality available in the profile page');
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  // Clear messages on unmount
  React.useEffect(() => {
    return () => {
      if (message) dispatch(clearVendorMessage());
      if (error) dispatch(clearVendorError());
    };
  }, [dispatch, message, error]);

  return (
    <ProfilePage />
  );
}