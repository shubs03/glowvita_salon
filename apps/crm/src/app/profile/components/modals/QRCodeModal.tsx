import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Download, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { NEXT_PUBLIC_WEB_URL } from '../../../../../../../packages/config/config';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: any;
  role: string;
}

// Function to download QR code as PNG image
const downloadQRCode = async (url: string) => {
  try {
    const svgElement = document.getElementById('qr-code-svg');
    if (!svgElement) {
      // toast.error('QR code not found');
      return;
    }

    // Get SVG as string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      // toast.error('Could not create canvas context');
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
        
        // toast.success('QR code downloaded successfully!');
      } catch (drawError) {
        console.error('Error drawing image to canvas:', drawError);
        // toast.error('Failed to draw QR code');
      }
    };
    
    img.onerror = () => {
      // toast.error('Failed to load QR code image');
    };
    
    img.src = svgUrl;
  } catch (error) {
    console.error('Error downloading QR code:', error);
    // toast.error('Failed to download QR code');
  }
};

export const QRCodeModal = ({
  open,
  onOpenChange,
  profileData,
  role
}: QRCodeModalProps) => {
  const salonUrl = profileData?._id 
    ? `${NEXT_PUBLIC_WEB_URL}/salon/${profileData._id}` 
    : `${NEXT_PUBLIC_WEB_URL}/salon`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Salon Details</DialogTitle>
          <DialogDescription>
            Scan this QR code to access the salon details page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG
              id="qr-code-svg"
              value={salonUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/logo.svg",
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Scan with your phone camera or QR scanner
            </p>
            <Button 
              onClick={() => downloadQRCode(salonUrl)}
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-lg border-border hover:border-primary"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};