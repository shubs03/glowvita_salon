"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import {
  X,
  ShoppingCart,
  TrendingUp,
  Package,
  Eye,
  CreditCard,
  User,
  Clock,
  Truck,
  Home,
  CheckCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { StatCard } from "../../../components/profile/StatCard";
import { Pagination } from "@repo/ui/pagination";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";
import Image from "next/image";
import {
  useGetClientOrdersQuery,
  useGetPublicTaxFeeSettingsQuery,
} from "@repo/store/services/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusHistoryEntry {
  status: string;
  date: string;
  notes: string;
  isEstimated?: boolean;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  origin?: string;
}

interface Order {
  _id: string;
  id: string;
  createdAt: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAmount?: number;
  taxAmount?: number;
  gstAmount?: number;
  platformFeeAmount?: number;
  status: string;
  shippingAddress: string;
  paymentMethod?: string;
  customerName?: string;
  sellerName?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  trackingNumber?: string;
  courier?: string;
  statusHistory?: StatusHistoryEntry[];
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

const ORDER_STEPS = ["Pending", "Processing", "Packed", "Shipped", "Delivered"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusIcon(status: string, cls = "h-5 w-5") {
  switch (status) {
    case "Pending":    return <Clock className={cls} />;
    case "Processing": return <Package className={cls} />;
    case "Packed":     return <Package className={cls} />;
    case "Shipped":    return <Truck className={cls} />;
    case "Delivered":  return <Home className={cls} />;
    case "Cancelled":  return <AlertCircle className={cls} />;
    default:           return <Clock className={cls} />;
  }
}

function statusColor(status: string) {
  switch (status) {
    case "Delivered":  return "bg-green-100 text-green-800 border-green-300";
    case "Shipped":    return "bg-blue-100 text-blue-800 border-blue-300";
    case "Packed":     return "bg-purple-100 text-purple-800 border-purple-300";
    case "Processing": return "bg-orange-100 text-orange-800 border-orange-300";
    case "Pending":    return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Cancelled":  return "bg-red-100 text-red-800 border-red-300";
    default:           return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function dotColor(status: string) {
  switch (status) {
    case "Delivered":  return "bg-green-500 border-green-500";
    case "Shipped":    return "bg-blue-500 border-blue-500";
    case "Packed":     return "bg-purple-500 border-purple-500";
    case "Processing": return "bg-orange-500 border-orange-500";
    case "Pending":    return "bg-yellow-500 border-yellow-500";
    case "Cancelled":  return "bg-red-500 border-red-500";
    default:           return "bg-gray-400 border-gray-400";
  }
}

function getOrderOrigin(items: OrderItem[]) {
  const origins = items.map((i) => i.origin || "Vendor");
  const unique = origins.filter((v, i, a) => a.indexOf(v) === i);
  if (unique.length === 1) return unique[0] === "Supplier" ? "Supplier" : "Salon";
  return "Mixed";
}

// ─── Flipkart-style Tracking Timeline ────────────────────────────────────────

/**
 * Builds a combined timeline by:
 * 1. Taking real statusHistory entries (actual timestamps from DB)
 * 2. Appending "pending" future steps that haven't happened yet
 */
function buildTrackingSteps(order: Order) {
  const history = order.statusHistory || [];

  if (order.status === "Cancelled") {
    // Just show what happened up to cancellation
    return history.map((h) => ({
      status: h.status,
      date: h.date,
      notes: h.notes,
      done: !h.isEstimated,
      isEstimated: !!h.isEstimated,
      isCancelled: h.status === "Cancelled",
    }));
  }

  // Construct steps based on ORDER_STEPS
  const steps = ORDER_STEPS.map((step) => {
    const entry = history.find((h) => h.status === step);
    if (entry) {
      return {
        status: step,
        date: entry.date,
        notes: entry.notes,
        done: !entry.isEstimated,
        isEstimated: !!entry.isEstimated,
        isCancelled: false,
      };
    } else {
      // Fallback for legacy orders
      const currentIndex = ORDER_STEPS.indexOf(order.status);
      const stepIndex = ORDER_STEPS.indexOf(step);
      const isDone = stepIndex <= currentIndex;
      return {
        status: step,
        date: isDone ? order.createdAt : null,
        notes: isDone ? `Order status: ${step}` : `Expected status: ${step}`,
        done: isDone,
        isEstimated: !isDone,
        isCancelled: false,
      };
    }
  });

  return steps;
}

interface TrackingTimelineProps {
  order: Order;
}

function TrackingTimeline({ order }: TrackingTimelineProps) {
  const steps = buildTrackingSteps(order);

  return (
    <div className="relative pl-2">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        
        // A step is considered "Active/Current" if it's done/actual,
        // and the next step is estimated/not done.
        const isCurrent = step.done && (!steps[idx + 1] || !steps[idx + 1].done);

        return (
          <div key={`${step.status}-${idx}`} className="flex gap-4">
            {/* Left column: dot + vertical line */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all flex items-center justify-center",
                  step.done
                    ? `${dotColor(step.status)} text-white border-transparent ${
                        isCurrent
                          ? "ring-4 ring-offset-1 " +
                            dotColor(step.status).replace("bg-", "ring-").split(" ")[0] +
                            "/30 scale-110"
                          : ""
                      }`
                    : "bg-background border-dashed border-gray-300 text-gray-400",
                ].join(" ")}
              >
                {step.done ? (
                  <CheckCircle className="h-3 w-3 text-white" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                )}
              </div>
              {!isLast && (
                <div
                  className={[
                    "w-0.5 flex-1 min-h-[3rem] my-1",
                    step.done && steps[idx + 1]?.done
                      ? "bg-green-500"
                      : "border-l-2 border-dashed border-gray-200",
                  ].join(" ")}
                />
              )}
            </div>

            {/* Right column: content */}
            <div className="pb-6 flex-1">
              {/* Status heading */}
              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                <span
                  className={[
                    "text-sm font-bold",
                    step.isCancelled
                      ? "text-red-700"
                      : step.done
                      ? "text-gray-900"
                      : "text-gray-400",
                  ].join(" ")}
                >
                  {step.status}
                  {step.isEstimated && (
                    <span className="ml-1 text-[11px] font-normal text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                      Expected
                    </span>
                  )}
                  {step.done && !step.isCancelled && (
                    <span className="ml-1 text-[11px] font-normal text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.2 rounded">
                      Completed
                    </span>
                  )}
                </span>
                
                {step.date && (
                  <span className="text-xs text-muted-foreground font-semibold">
                    {step.isEstimated ? "Est. " : ""}
                    {fmtDate(step.date)} · {fmtTime(step.date)}
                  </span>
                )}
              </div>

              {/* Notes */}
              {step.notes && (
                <p
                  className={[
                    "text-xs leading-relaxed max-w-md",
                    step.done ? "text-muted-foreground" : "text-muted-foreground/60 italic",
                  ].join(" ")}
                >
                  {step.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { user } = useAuth();
  const {
    data: ordersData,
    isLoading,
    isError,
    refetch,
  } = useGetClientOrdersQuery(undefined, {
    skip: !user,
    pollingInterval: 5000,
    refetchOnMountOrArgChange: true,
  });

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const { data: taxSettings } = useGetPublicTaxFeeSettingsQuery(undefined);
  const productGST = taxSettings?.productGST || 18;
  const productPlatformFee = taxSettings?.productPlatformFee || 10;

  const orderHistory: Order[] = ordersData?.data || [];

  const filteredOrders = useMemo(() => {
    return orderHistory.filter((order) => {
      const origin = getOrderOrigin(order.items);
      const date = new Date(order.createdAt);
      return (
        (statusFilter === "all" || order.status === statusFilter) &&
        (originFilter === "all" || origin === originFilter) &&
        (!dateFromFilter || date >= new Date(dateFromFilter)) &&
        (!dateToFilter || date <= new Date(dateToFilter))
      );
    });
  }, [orderHistory, statusFilter, originFilter, dateFromFilter, dateToFilter]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredOrders.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const isOrderCancellable = (status: string) => {
    const s = status.toLowerCase();
    return ["pending", "processing", "packed"].includes(s);
  };

  const handleViewClick = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel || !cancellationReason.trim()) return;
    setIsCancelling(true);
    const toastId = toast.loading("Cancelling order...");
    try {
      const response = await fetch("/api/client/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderToCancel._id,
          cancellationReason,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Order cancelled successfully", { id: toastId });
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        setCancellationReason("");
        refetch();
      } else {
        toast.error(result.message || "Failed to cancel order", { id: toastId });
      }
    } catch {
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={ShoppingCart} title="Total Orders" value={orderHistory.length} change="All time" />
        <StatCard icon={Package} title="Delivered" value={orderHistory.filter((o) => o.status === "Delivered").length} change="All time" />
        <StatCard icon={X} title="Cancelled" value={orderHistory.filter((o) => o.status?.toLowerCase() === "cancelled").length} change="All time" />
        <StatCard
          icon={TrendingUp}
          title="Total Spent"
          value={`₹${orderHistory.filter((o) => o.status === "Delivered").reduce((acc, o) => acc + (o.totalAmount || 0), 0).toFixed(2)}`}
          change="Delivered orders only"
        />
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>Your product order history.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Packed">Packed</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">Origin</label>
                <Select value={originFilter} onValueChange={setOriginFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Origin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Origins</SelectItem>
                    <SelectItem value="Salon">Salon</SelectItem>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">From</label>
                <Input type="date" className="w-[140px]" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">To</label>
                <Input type="date" className="w-[140px]" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Loading orders...</TableCell></TableRow>
                ) : isError ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-destructive">Failed to load orders.</TableCell></TableRow>
                ) : currentItems.length > 0 ? (
                  currentItems.map((order) => {
                    const productNames = order.items.map((i) => i.name).join(", ");
                    const totalQty = order.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
                    // Most recent statusHistory entry for table hint
                    const lastEntry = order.statusHistory && order.statusHistory.length > 0
                      ? order.statusHistory[order.statusHistory.length - 1]
                      : null;

                    return (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono text-xs">{order._id.slice(-8).toUpperCase()}</TableCell>
                        <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]" title={productNames}>{productNames}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{totalQty}</TableCell>
                        <TableCell className="text-sm">{order.sellerName || "N/A"}</TableCell>
                        <TableCell className="font-semibold">₹{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border w-fit ${statusColor(order.status)}`}>
                              {getStatusIcon(order.status, "h-3 w-3")}
                              {order.status}
                            </span>
                            {/* Show last tracking event timestamp */}
                            {lastEntry && (
                              <span className="text-[10px] text-muted-foreground">
                                {fmtDate(lastEntry.date)} · {fmtTime(lastEntry.date)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewClick(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status !== "Cancelled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`text-red-500 ${!isOrderCancellable(order.status) ? "opacity-50 cursor-not-allowed" : "hover:text-red-700 hover:bg-red-50"}`}
                              disabled={!isOrderCancellable(order.status)}
                              onClick={() => handleCancelClick(order)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">No orders found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            className="mt-4"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredOrders.length}
          />
        </CardContent>
      </Card>

      {/* ── Cancel Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order #{orderToCancel?._id.slice(-8).toUpperCase()}? Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="cancellation-reason">Reason for Cancellation</Label>
            <Textarea
              id="cancellation-reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Ordered by mistake"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No, Keep It</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={!cancellationReason.trim() || isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Order Detail View Modal ───────────────────────────────────────────── */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-bold">
              Order #{selectedOrder?._id.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-3 flex-wrap mt-1">
              <span className="text-sm">
                Placed on{" "}
                {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : ""}
              </span>
              {selectedOrder?.status && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status, "h-3 w-3")}
                  {selectedOrder.status}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">

                {/* ── Tracking Timeline ───────────────────────────────────── */}
                <div className="rounded-xl border p-5">
                  <h3 className="font-semibold text-base mb-5 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    Order Tracking
                  </h3>
                  <TrackingTimeline order={selectedOrder} />

                  {/* Tracking number callout */}
                  {selectedOrder.trackingNumber && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <Truck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-800">
                          {selectedOrder.courier || "Courier"} &middot; #{selectedOrder.trackingNumber}
                        </p>
                        <p className="text-xs text-blue-600">Use this to track on the courier&apos;s website</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Shipping + Payment ──────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping */}
                  <div className="rounded-xl border p-4">
                    <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Shipping Address
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedOrder.shippingAddress}
                    </p>
                    {/* Cancellation detail */}
                    {selectedOrder.status === "Cancelled" && selectedOrder.cancellationReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-semibold text-red-800 mb-1">Cancellation Details</p>
                        <p className="text-xs text-red-700">&ldquo;{selectedOrder.cancellationReason}&rdquo;</p>
                        {selectedOrder.cancelledBy && (
                          <p className="text-xs text-red-600 mt-1">Cancelled by: {selectedOrder.cancelledBy}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment */}
                  <div className="rounded-xl border p-4">
                    <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                      <span className="text-primary font-bold">₹</span>
                      Payment Summary
                    </h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{selectedOrder.items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>₹{(typeof selectedOrder.shippingAmount === "number" ? selectedOrder.shippingAmount : 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST ({productGST}%)</span>
                        <span>₹{(typeof selectedOrder.gstAmount === "number" ? selectedOrder.gstAmount : 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Fee ({productPlatformFee}%)</span>
                        <span>₹{(typeof selectedOrder.platformFeeAmount === "number" ? selectedOrder.platformFeeAmount : 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                        <span>Total</span>
                        <span className="text-primary">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t">
                        <span className="text-muted-foreground">Payment</span>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          <span>
                            {selectedOrder.paymentMethod === "cash-on-delivery"
                              ? "Cash on Delivery"
                              : selectedOrder.paymentMethod === "pay-online"
                              ? "Online Payment"
                              : selectedOrder.paymentMethod || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Items ───────────────────────────────────────────────── */}
                <div className="rounded-xl border p-4">
                  <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Items Ordered ({selectedOrder.items.length})
                  </h3>
                  {selectedOrder.sellerName && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Seller: <span className="font-medium text-foreground">{selectedOrder.sellerName}</span>
                    </p>
                  )}
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                        <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-sm">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                            <Badge variant={item.origin === "Supplier" ? "default" : "secondary"} className="text-[10px] h-4">
                              {item.origin === "Supplier" ? "Supplier" : "Salon"}
                            </Badge>
                          </div>
                        </div>
                        <p className="font-semibold text-sm">
                          ₹{((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
