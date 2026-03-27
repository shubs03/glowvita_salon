
"use client";

import { useState, useRef } from "react";
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
  Download,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";

type ActionType = "enable" | "disable" | "delete" | "approve" | "disapprove";

export default function VendorManagementPage() {
  const tableRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [filterSalon, setFilterSalon] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
  const sortedVendors = Array.isArray(vendors)
    ? [...vendors].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  const filteredVendors = sortedVendors.filter((v: Vendor) => {
    const salonMatch = !filterSalon || (v.businessName || '').toLowerCase().includes(filterSalon.toLowerCase());
    const ownerMatch = !filterOwner || `${v.firstName} ${v.lastName}`.toLowerCase().includes(filterOwner.toLowerCase());
    const phoneMatch = !filterPhone || (v.phone || '').includes(filterPhone);
    const statusMatch = filterStatus === 'all' || (v.status || 'Pending').toLowerCase() === filterStatus.toLowerCase();
    return salonMatch && ownerMatch && phoneMatch && statusMatch;
  });
  const currentItems = filteredVendors.slice(firstItemIndex, lastItemIndex);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

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

  const exportToExcel = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (!tableRef.current) return;
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    const tableClone = table.cloneNode(true) as HTMLTableElement;

    // Remove Actions column (5th column)
    tableClone.querySelectorAll('th:nth-child(5), td:nth-child(5)').forEach(cell => cell.remove());

    tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
      cell.textContent = cell.getAttribute('data-export-value');
    });

    const wb = XLSX.utils.table_to_book(tableClone, { sheet: 'Sheet1' });
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportToCSV = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (!tableRef.current) return;
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    const tableClone = table.cloneNode(true) as HTMLTableElement;

    tableClone.querySelectorAll('th:nth-child(5), td:nth-child(5)').forEach(cell => cell.remove());

    tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
      cell.textContent = cell.getAttribute('data-export-value');
    });

    const wb = XLSX.utils.table_to_book(tableClone, { sheet: 'Sheet1' });
    XLSX.writeFile(wb, `${fileName}.csv`);
  };

  const exportToPDF = async (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (!tableRef.current) return;
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    const tableClone = table.cloneNode(true) as HTMLTableElement;

    tableClone.querySelectorAll('th:nth-child(5), td:nth-child(5)').forEach(cell => cell.remove());

    tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
      cell.textContent = cell.getAttribute('data-export-value');
    });

    tableClone.style.position = 'absolute';
    tableClone.style.left = '-9999px';
    tableClone.style.width = 'auto';
    document.body.appendChild(tableClone);

    const canvas = await html2canvas(tableClone, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    document.body.removeChild(tableClone);

    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let finalImgHeight = imgHeight;
    let finalImgWidth = imgWidth;
    if (imgHeight > (pdfHeight - (margin * 2))) {
      finalImgHeight = pdfHeight - (margin * 2);
      finalImgWidth = (canvas.width * finalImgHeight) / canvas.height;
    }

    pdf.addImage(imgData, 'PNG', margin, margin, finalImgWidth, finalImgHeight);
    pdf.save(`${fileName}.pdf`);
  };

  const copyToClipboard = (tableRef: React.RefObject<HTMLDivElement>) => {
    if (!tableRef.current) return;
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    const tableClone = table.cloneNode(true) as HTMLTableElement;

    tableClone.querySelectorAll('th:nth-child(5), td:nth-child(5)').forEach(cell => cell.remove());

    tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
      cell.textContent = cell.getAttribute('data-export-value');
    });

    tableClone.style.position = 'absolute';
    tableClone.style.left = '-9999px';
    document.body.appendChild(tableClone);

    const range = document.createRange();
    range.selectNode(tableClone);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.execCommand('copy');
    window.getSelection()?.removeAllRanges();
    document.body.removeChild(tableClone);

    alert('Table copied to clipboard!');
  };

  const printTable = (tableRef: React.RefObject<HTMLDivElement>) => {
    if (!tableRef.current) return;
    const table = tableRef.current.querySelector('table');
    if (!table) return;
    const tableClone = table.cloneNode(true) as HTMLTableElement;

    tableClone.querySelectorAll('th:nth-child(5), td:nth-child(5)').forEach(cell => cell.remove());

    tableClone.querySelectorAll('td[data-export-value]').forEach(cell => {
      cell.textContent = cell.getAttribute('data-export-value');
    });

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Report</title>');
      printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(tableClone.outerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getUnapprovedDocuments = (vendor: Vendor) => {
    const documents = vendor.documents || {};

    const mandatoryDocs = [
      { key: 'aadharCard', label: 'Aadhar Card' },
      { key: 'panCard', label: 'PAN Card' },
      { key: "udhayamCert", label: "Udhayam Certificate" },
      { key: "shopAct", label: "Shop Act" },
    ] as const;

    return mandatoryDocs
      .filter(doc => {
        const isUploaded = !!(documents[doc.key] && documents[doc.key] !== '');
        const status = (documents as any)[`${doc.key}Status`];

        // Aadhaar and PAN are strictly mandatory
        if (doc.key === "aadharCard" || doc.key === "panCard") {
          return !isUploaded || status !== "approved";
        }

        // Other docs: if uploaded, must be approved
        return isUploaded && status !== "approved";
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isLoading || filteredVendors.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export List
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'vendors_report')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'vendors_report')}>
                    <FileText className="mr-2 h-4 w-4" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'vendors_report')}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => printTable(tableRef)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={() => {
                  setFilterSalon('');
                  setFilterOwner('');
                  setFilterPhone('');
                  setFilterStatus('all');
                  setCurrentPage(1);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                type="text"
                placeholder="Filter by Salon Name..."
                disabled={isLoading}
                value={filterSalon}
                onChange={(e) => { setFilterSalon(e.target.value); setCurrentPage(1); }}
              />
              <Input
                type="text"
                placeholder="Filter by Owner Name..."
                disabled={isLoading}
                value={filterOwner}
                onChange={(e) => { setFilterOwner(e.target.value); setCurrentPage(1); }}
              />
              <Input
                type="text"
                placeholder="Filter by Phone..."
                disabled={isLoading}
                value={filterPhone}
                onChange={(e) => { setFilterPhone(e.target.value); setCurrentPage(1); }}
              />
              <Select
                disabled={isLoading}
                value={filterStatus}
                onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Disapproved">Disapproved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div ref={tableRef} className="overflow-x-auto no-scrollbar">
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
                      <TableCell data-export-value={vendor.status || "Pending"}>
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
              totalItems={filteredVendors.length}
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
