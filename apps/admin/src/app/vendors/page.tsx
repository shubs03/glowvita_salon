
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { Input } from "@repo/ui/input";
import {
  Eye,
  ToggleRight,
  ToggleLeft,
  FileDown,
  X,
  Trash2,
  Plus,
  FilePenIcon,
  Users,
  UserCheck,
  BarChart,
  UserX,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { VendorEditForm, type Vendor } from "../../components/VendorEditForm";
import { toast } from "sonner";
import { cn } from "@repo/ui/cn";
import {
  useCreateVendorMutation,
  useGetVendorsQuery,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useUpdateVendorStatusMutation,
} from "../../../../../packages/store/src/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { useAppSelector } from "@repo/store/hooks";
import { selectSelectedRegion } from "@repo/store/slices/adminAuthSlice";

type ActionType = "enable" | "disable" | "delete" | "approve" | "disapprove";

export default function VendorManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const selectedRegion = useAppSelector(selectSelectedRegion);

  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
  } = useGetVendorsQuery(selectedRegion);
  const [createVendor] = useCreateVendorMutation();
  const [updateVendor] = useUpdateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();
  const [updateVendorStatus] = useUpdateVendorStatusMutation();

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = Array.isArray(vendors)
    ? vendors.slice(firstItemIndex, lastItemIndex)
    : [];

  const totalPages = Math.ceil(
    (Array.isArray(vendors) ? vendors.length : 0) / itemsPerPage
  );

  const handleOpenFormModal = (vendor: Vendor | null = null) => {
    setSelectedVendor(vendor);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (vendorData: any) => {
    try {
      if (selectedVendor) {
        // Edit mode
        await updateVendor({ id: selectedVendor._id, ...vendorData }).unwrap();
        toast.success("Vendor updated successfully");
      } else {
        // Create mode
        await createVendor(vendorData).unwrap();
        toast.success("Vendor created successfully");
        handleCloseModal();
      }
      refetch(); // Refetch data to show updates
    } catch (err: any) {
      console.error("Failed to save vendor:", err);
      // Re-throw so the child form component knows it failed
      throw err;
    }
  };

  const handleActionClick = (vendor: Vendor, action: ActionType) => {
    setSelectedVendor(vendor);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedVendor || !actionType) return;

    try {
      switch (actionType) {
        case "enable":
          await updateVendorStatus({
            id: selectedVendor._id,
            status: "Active",
          }).unwrap();
          break;
        case "disable":
          await updateVendorStatus({
            id: selectedVendor._id,
            status: "Disabled",
          }).unwrap();
          break;
        case "approve":
          await updateVendorStatus({
            id: selectedVendor._id,
            status: "Approved",
          }).unwrap();
          break;
        case "disapprove":
          await updateVendorStatus({
            id: selectedVendor._id,
            status: "Disapproved",
          }).unwrap();
          break;
        case "delete":
          await deleteVendor({ id: selectedVendor._id }).unwrap();
          break;
      }
      refetch(); // Refetch data
      setIsActionModalOpen(false);
      setSelectedVendor(null);
      toast.success(`Vendor ${actionType}d successfully`);
    } catch (err: any) {
      console.error(`Failed to ${actionType} vendor:`, err);
    }
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
    setSelectedVendor(null);
  };

  const getModalContent = () => {
    if (!actionType || !selectedVendor)
      return { title: "", description: "", buttonText: "" };
    switch (actionType) {
      case "enable":
        return {
          title: "Enable Vendor?",
          description: `Are you sure you want to enable the vendor "${selectedVendor.firstName} ${selectedVendor.lastName}"?`,
          buttonText: "Enable",
        };
      case "disable":
        return {
          title: "Disable Vendor?",
          description: `Are you sure you want to disable the vendor "${selectedVendor.firstName} ${selectedVendor.lastName}"?`,
          buttonText: "Disable",
        };
      case "approve":
        return {
          title: "Approve Vendor?",
          description: `Are you sure you want to approve the vendor "${selectedVendor.firstName} ${selectedVendor.lastName}"?`,
          buttonText: "Approve",
        };
      case "disapprove":
        return {
          title: "Disapprove Vendor?",
          description: `Are you sure you want to disapprove the vendor "${selectedVendor.firstName} ${selectedVendor.lastName}"?`,
          buttonText: "Disapprove",
        };
      case "delete":
        return {
          title: "Delete Vendor?",
          description: `Are you sure you want to permanently delete the vendor "${selectedVendor.firstName} ${selectedVendor.lastName}"? This action is irreversible.`,
          buttonText: "Delete",
        };
      default:
        return { title: "", description: "", buttonText: "" };
    }
  };

  const { title, description, buttonText } = getModalContent();

  const vendorsArray = Array.isArray(vendors) ? vendors : [];
  const activeVendors = vendorsArray.filter(
    (v: Vendor) => v?.status === "Active"
  ).length;
  const disabledVendors = vendorsArray.filter(
    (v: Vendor) => v?.status === "Disabled"
  ).length;
  const approvedVendors = vendorsArray.filter(
    (v: Vendor) => v?.status === "Approved"
  ).length;
  const disapprovedVendors = vendorsArray.filter(
    (v: Vendor) => v?.status === "Disapproved"
  ).length;

  const getUnapprovedDocuments = (vendor: Vendor) => {
    const documents = vendor.documents;
    if (!documents) return [];

    const mandatoryDocs = [
      { key: 'aadharCard', label: 'Aadhar Card' },
      { key: 'panCard', label: 'PAN Card' },
      { key: 'udyogAadhar', label: 'Udyog Aadhar' },
      { key: 'udhayamCert', label: 'Udhayam Certificate' },
      { key: 'shopLicense', label: 'Shop License' }
    ] as const;

    return mandatoryDocs
      .filter(doc => {
        const isUploaded = documents[doc.key] && documents[doc.key] !== '';
        // In the Vendor model, the status is usually stored as docType + 'Status'
        const status = (documents as any)[`${doc.key}Status`] || 'pending';
        return isUploaded && status !== 'approved';
      })
      .map(doc => doc.label);
  };

  if (error)
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-red-600">
        Error loading vendors
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold font-headline">
          Vendor Management
        </h1>
        {selectedRegion && selectedRegion !== 'all' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Region Filtered
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Vendors
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendors.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Vendors
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activeVendors}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently operational
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Disabled Vendors
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {disabledVendors}
              </div>
              <p className="text-xs text-muted-foreground">
                Temporarily inactive
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Vendors
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {approvedVendors}
              </div>
              <p className="text-xs text-muted-foreground">Approved vendors</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Vendor List</CardTitle>
              <CardDescription>
                Details about all registered vendors.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={isLoading}>
                <FileDown className="mr-2 h-4 w-4" />
                Export List
              </Button>
              <Button
                onClick={() => handleOpenFormModal(null)}
                disabled={isLoading}
              >
                Add Vendor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 rounded-lg bg-secondary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" disabled={isLoading}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                type="text"
                placeholder="Filter by Salon Name..."
                disabled={isLoading}
              />
              <Input
                type="text"
                placeholder="Filter by Owner Name..."
                disabled={isLoading}
              />
              <Input
                type="text"
                placeholder="Filter by Phone..."
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salon Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(itemsPerPage)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : currentItems.length > 0 ? (
                  currentItems.map((vendor: Vendor) => (
                    <TableRow key={vendor._id}>
                      <TableCell className="font-medium">
                        {vendor.businessName}
                      </TableCell>
                      <TableCell>{`${vendor.firstName} ${vendor.lastName}`}</TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${vendor.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : vendor.status === "Approved"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : vendor.status === "Disapproved"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                            }`}
                        >
                          {vendor.status || "Pending"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenFormModal(vendor)}
                        >
                          <FilePenIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleActionClick(
                              vendor,
                              vendor.status === "Active" ? "disable" : "enable"
                            )
                          }
                          className={
                            vendor.status === "Active"
                              ? "text-yellow-600 hover:text-yellow-700"
                              : "text-green-600 hover:text-green-700"
                          }
                        >
                          {vendor.status === "Active" ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {vendor.status === "Active" ? "Disable" : "Enable"}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleActionClick(vendor, "approve")}
                          className={cn("text-blue-600 hover:text-blue-700", getUnapprovedDocuments(vendor).length > 0 && "text-gray-400 opacity-50")}
                          disabled={getUnapprovedDocuments(vendor).length > 0}
                          title={getUnapprovedDocuments(vendor).length > 0
                            ? `Mandatory documents pending: ${getUnapprovedDocuments(vendor).join(', ')}`
                            : 'Approve Vendor'
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="sr-only">Approve</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleActionClick(vendor, "disapprove")
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Disapprove</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleActionClick(vendor, "delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No vendors found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {isLoading ? (
            <div className="mt-4 flex justify-between items-center">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          ) : (
            <Pagination
              className="mt-4"
              currentPage={Number(currentPage) || 1}
              totalPages={Math.max(1, Number(totalPages) || 1)}
              onPageChange={(page) =>
                setCurrentPage(Math.max(1, Number(page) || 1))
              }
              itemsPerPage={Math.max(1, Number(itemsPerPage) || 10)}
              onItemsPerPageChange={(value) =>
                setItemsPerPage(Math.max(1, Number(value) || 10))
              }
              totalItems={Math.max(
                0,
                Array.isArray(vendors) ? vendors.length : 0
              )}
            />
          )}
        </CardContent>
      </Card>

      <VendorEditForm
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        vendor={selectedVendor}
        onSubmit={handleFormSubmit}
        onSuccess={() => {
          handleCloseModal();
          refetch();
        }}
      />

      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsActionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionType === "delete" ||
                  actionType === "disable" ||
                  actionType === "disapprove"
                  ? "destructive"
                  : "default"
              }
              onClick={handleConfirmAction}
            >
              {buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
