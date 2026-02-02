import React, { useState } from "react";
import { Card, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { MapPin, Globe, Download, ImageIcon, Eye, UploadCloud, QrCode } from "lucide-react";
import { toast } from 'sonner';

interface ProfileHeaderProps {
  role: string;
  profileData: any;
  localVendor: any;
  localSupplier: any;
  localDoctor: any;
  isUploading: boolean;
  handleProfileImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  openProfileImagePreview: () => void;
  setQrModalOpen: (open: boolean) => void;
}

export const ProfileHeader = ({
  role,
  profileData,
  localVendor,
  localSupplier,
  localDoctor,
  isUploading,
  handleProfileImageUpload,
  openProfileImagePreview,
  setQrModalOpen
}: ProfileHeaderProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-muted/30 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-lg flex-shrink-0 group">
            {profileData?.profileImage && (profileData?.profileImage?.startsWith('data:') || profileData?.profileImage?.startsWith('http')) ? (
              <img
                src={profileData?.profileImage}
                alt={role === 'vendor' ? "Salon Logo" : role === 'supplier' ? "Supplier Logo" : "Doctor Profile"}
                className="object-cover cursor-pointer w-full h-full"
                onClick={openProfileImagePreview}
                onError={(e) => {
                  console.log('Profile image failed to load:', profileData?.profileImage);
                  // Set a fallback image on error
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-full h-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-1 sm:gap-2">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
                ) : (
                  <>
                    {profileData?.profileImage && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg border-border hover:border-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProfileImagePreview();
                        }}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg border-border hover:border-primary"
                      asChild
                    >
                      <label className="cursor-pointer">
                        <UploadCloud className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageUpload}
                          disabled={isUploading}
                          aria-label="Upload profile image"
                        />
                      </label>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex-grow w-full sm:w-auto">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
              {role === 'vendor' ? (localVendor?.businessName || 'Your Salon') :
                role === 'supplier' ? (localSupplier?.shopName || `${localSupplier?.firstName} ${localSupplier?.lastName}`) :
                  (localDoctor?.name || 'Doctor Profile')}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base flex items-center gap-2 mt-1 break-words">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-foreground flex-shrink-0" />
              <span className="line-clamp-2">
                {role === 'vendor' ? (localVendor?.address || 'Address not set') :
                  role === 'supplier' ? (localSupplier?.address || `${localSupplier?.city || ''}, ${localSupplier?.state || ''}, ${localSupplier?.country || ''}`) :
                    (localDoctor?.clinicAddress || `${localDoctor?.city || ''}, ${localDoctor?.state || ''}`)}
              </span>
            </CardDescription>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              {role === 'vendor' ? 'Vendor' : role === 'supplier' ? 'Supplier' : 'Doctor'} ID:{" "}
              <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">
                {profileData?._id?.substring(0, 8) || 'N/A'}
              </span>
            </div>
            {role === 'vendor' && localVendor?.website && (
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
                <Button variant="outline" size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm rounded-lg border-border hover:border-primary" asChild>
                  <a
                    href={localVendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm rounded-lg border-border hover:border-primary" asChild>
                  <a href="/apps">
                    Download App
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm rounded-lg border-border hover:border-primary"
                  onClick={() => setQrModalOpen(true)}
                >
                  <QrCode className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> QR Code
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};