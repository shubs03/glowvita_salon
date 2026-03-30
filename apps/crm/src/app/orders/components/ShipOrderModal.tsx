import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { Label } from '@repo/ui/label';
import { Input } from '@repo/ui/input';
import { Truck, Package } from 'lucide-react';

type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  orderId?: string; // Make orderId optional since ClientOrder doesn't have it
  items: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  vendorId?: string;
  supplierId?: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  createdAt: string;
  trackingNumber?: string;
  courier?: string;
  cancellationReason?: string; // Add cancellation reason field
  // For ClientOrder specific fields
  userId?: string; // To identify online orders
};

interface ShipOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (trackingInfo: { trackingNumber: string; courier: string }) => void;
  orderToShip: Order | null;
  isUpdatingStatus: boolean;
}

interface TrackingInfo {
  trackingNumber: string;
  courier: string;
}

export function ShipOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderToShip,
  isUpdatingStatus
}: ShipOrderModalProps) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo>({
    trackingNumber: '',
    courier: ''
  });

  if (!orderToShip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Ship Order
          </DialogTitle>
          <DialogDescription>
            Enter tracking information for order #{orderToShip.orderId || `ONLINE-${orderToShip._id.substring(0, 8).toUpperCase()}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tracking Number</Label>
            <Input
              placeholder="Enter tracking number"
              value={trackingInfo.trackingNumber}
              onChange={e => setTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
              className="h-12 rounded-xl border-border/30 focus:border-primary focus:ring-primary/20"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-base font-semibold">Courier Service</Label>
            <Input
              placeholder="Enter courier name (e.g., FedEx, DHL)"
              value={trackingInfo.courier}
              onChange={e => setTrackingInfo(prev => ({ ...prev, courier: e.target.value }))}
              className="h-12 rounded-xl border-border/30 focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* Order Preview */}
          <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono">
                  #{orderToShip.orderId || `ONLINE-${orderToShip._id.substring(0, 8).toUpperCase()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold text-primary">₹{(orderToShip.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span>{(orderToShip.items?.length || 0)} product{(orderToShip.items?.length || 0) > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(trackingInfo)}
            disabled={isUpdatingStatus || !trackingInfo.trackingNumber.trim() || !trackingInfo.courier.trim()}
            className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isUpdatingStatus ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2"></div>
                Shipping...
              </>
            ) : (
              <>
                <Truck className="mr-2 h-4 w-4" />
                Confirm Shipment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}