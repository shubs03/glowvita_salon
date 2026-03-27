import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { OrderStatusTimeline } from '@/components/OrderStatusTimeline';
import { Package, ShoppingCart, User, Mail, MapPin, Truck, XCircle, Calendar, Building, Phone } from 'lucide-react';
import Image from 'next/image';

type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  orderId?: string;
  items: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  vendorId?: any;
  supplierId?: any;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  createdAt: string;
  trackingNumber?: string;
  courier?: string;
  cancellationReason?: string;
  userId?: any;
};

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: Order | null;
  role?: string;
  activeTab?: string;
}

export function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  selectedOrder,
  role,
  activeTab,
}: OrderDetailsModalProps) {
  if (!selectedOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden p-0">
        <style jsx>{`
          .modal-content::-webkit-scrollbar {
            display: none;
          }
          .modal-content {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          /* Indicate status icons are not clickable */
          .status-timeline div div {
            cursor: default;
          }
        `}</style>
        <DialogHeader className="p-6 pb-4 bg-muted">
          <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
          <DialogDescription>
            Order ID: #{selectedOrder.orderId || `ONLINE-${selectedOrder._id.substring(0, 8).toUpperCase()}`}
          </DialogDescription>
        </DialogHeader>
        <div className="modal-content overflow-y-auto max-h-[calc(80vh-6rem)] p-6 pt-4">
          <div className="space-y-6">
            {/* Order Progress */}
            <div className="status-timeline rounded-lg p-4 bg-muted">
              <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Order Progress
              </h3>
              <OrderStatusTimeline currentStatus={selectedOrder.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items - Sticky */}
              <div className="lg:col-span-2 sticky top-0">
                <div className="rounded-lg p-4 border">
                  <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Items Ordered ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div 
                        key={item.productId} 
                        className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                      >
                        <Image 
                          src={item.productImage || 'https://placehold.co/60x60.png'} 
                          alt={item.productName} 
                          width={60} 
                          height={60} 
                          className="rounded-md object-cover border" 
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-md">{item.productName}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Package className="h-3 w-3" />
                              Qty: {item.quantity}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>₹{(item.price || 0).toFixed(2)} each</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-md font-bold text-primary">₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Order Total Breakdown */}
                    <div className="rounded-lg p-3 bg-muted space-y-2">
                      {/* Show fee breakdown only for online orders */}
                      {((selectedOrder as any).shippingAmount > 0 || (selectedOrder as any).gstAmount > 0 || (selectedOrder as any).platformFeeAmount > 0) && (
                        <>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>₹{(
                              (selectedOrder.totalAmount || 0) -
                              ((selectedOrder as any).shippingAmount || 0) -
                              ((selectedOrder as any).gstAmount || 0) -
                              ((selectedOrder as any).platformFeeAmount || 0)
                            ).toFixed(2)}</span>
                          </div>
                          {(selectedOrder as any).shippingAmount > 0 && (
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <span>Shipping</span>
                              <span>₹{((selectedOrder as any).shippingAmount || 0).toFixed(2)}</span>
                            </div>
                          )}
                          {(selectedOrder as any).gstAmount > 0 && (
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <span>GST</span>
                              <span>₹{((selectedOrder as any).gstAmount || 0).toFixed(2)}</span>
                            </div>
                          )}
                          {(selectedOrder as any).platformFeeAmount > 0 && (
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <span>Platform Fee</span>
                              <span>₹{((selectedOrder as any).platformFeeAmount || 0).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t border-border pt-2 mt-1" />
                        </>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-md font-semibold">Total Amount</span>
                        <span className="text-xl font-bold text-primary">₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-4">
                {/* Customer / Supplier / Vendor Information */}
                <div className="rounded-lg p-4 border">
                  {/* Determine what to show based on role and tab */}
                  {(() => {
                    // Vendor in My Purchases tab → show supplier who supplied the goods
                    const isMyPurchases = activeTab === 'my-purchases';
                    const supplierObj = selectedOrder.supplierId && typeof selectedOrder.supplierId === 'object' ? selectedOrder.supplierId : null;
                    const vendorObj = selectedOrder.vendorId && typeof selectedOrder.vendorId === 'object' ? selectedOrder.vendorId : null;

                    if (isMyPurchases && supplierObj) {
                      return (
                        <>
                          <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            Supplier Details
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{supplierObj.shopName || supplierObj.businessName || `${supplierObj.firstName || ''} ${supplierObj.lastName || ''}`.trim() || 'N/A'}</span>
                            </div>
                            {supplierObj.email && (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{supplierObj.email}</span>
                              </div>
                            )}
                            {(supplierObj.mobile || supplierObj.phone) && (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{supplierObj.mobile || supplierObj.phone}</span>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    }

                    // Supplier in Received Orders tab → show vendor who placed the order
                    if (role === 'supplier' && vendorObj) {
                      return (
                        <>
                          <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            Vendor Details
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{vendorObj.businessName || `${vendorObj.firstName || ''} ${vendorObj.lastName || ''}`.trim() || 'N/A'}</span>
                            </div>
                            {vendorObj.email && (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{vendorObj.email}</span>
                              </div>
                            )}
                            {vendorObj.phone && (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{vendorObj.phone}</span>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    }

                    // Default: Customer Orders tab → show customer info
                    return (
                      <>
                        <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          Customer Details
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{selectedOrder.customerName || 'N/A'}</span>
                          </div>
                          {selectedOrder.customerEmail && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{selectedOrder.customerEmail}</span>
                            </div>
                          )}
                          {(selectedOrder as any).customerPhone && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{(selectedOrder as any).customerPhone}</span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Shipping Information */}
                <div className="rounded-lg p-4 border">
                  <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Shipping Address
                  </h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedOrder.shippingAddress || 'No shipping address provided'}</p>
                  </div>
                </div>

                {/* Cancellation Reason */}
                {selectedOrder.status === 'Cancelled' && selectedOrder.cancellationReason && (
                  <div className="rounded-lg p-4 border">
                    <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-primary" />
                      Cancellation Reason
                    </h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm leading-relaxed">{selectedOrder.cancellationReason}</p>
                    </div>
                  </div>
                )}

                {/* Tracking Information */}
                {selectedOrder.trackingNumber && (
                  <div className="rounded-lg p-4 border">
                    <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      Tracking Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">Courier</p>
                          <p className="text-xs text-muted-foreground">{selectedOrder.courier || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">Tracking Number</p>
                          <p className="text-xs font-mono text-primary">{selectedOrder.trackingNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Timeline */}
                <div className="rounded-lg p-4 border">
                  <h3 className="font-bold text-md mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Order Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">Order Placed</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedOrder.createdAt ? 
                            new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 
                            'Date not available'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}