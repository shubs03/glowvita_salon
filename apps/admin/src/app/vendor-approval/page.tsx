
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { CheckCircle, Eye, XCircle, Users, ThumbsUp, Hourglass, ThumbsDown, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Badge } from '@repo/ui/badge';
import { useGetSuppliersQuery, useUpdateSupplierMutation, useDeleteSupplierMutation } from '@repo/store/api';
import { useGetDoctorsQuery, useUpdateDoctorMutation, useDeleteDoctorMutation } from '../../../../../packages/store/src/services/api';
import { useGetVendorsQuery, useUpdateVendorStatusMutation } from '@repo/store/api';
import { useGetPendingServicesQuery, useUpdateServiceStatusMutation } from '@repo/store/api';
import { toast } from 'sonner';

// Static data for products (unchanged)
const productsData = [
  {
    id: "PROD-001",
    productImage: "https://placehold.co/400x400.png",
    productName: "Organic Face Serum",
    salonName: "New Beauty Haven",
    price: 85.00,
    salePrice: 75.00,
    category: "Skincare",
    description: "A hydrating serum made with natural ingredients.",
    stock: 50,
  },
  {
    id: "PROD-002",
    productImage: "https://placehold.co/400x400.png",
    productName: "Matte Lipstick",
    salonName: "The Glow Up Studio",
    price: 25.00,
    salePrice: 25.00,
    category: "Makeup",
    description: "A long-lasting matte lipstick in a vibrant red shade.",
    stock: 120,
  }
];

// Updated Vendor type based on provided data structure
type Vendor = {
  _id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  pincode: string;
  state: string;
  address: string;
  description: string;
  category: string;
  subCategories: string[];
  website?: string | null;
  profileImage?: string | null;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Disabled';
  createdAt: string;
  updatedAt: string;
  subscription: {
    plan: string | null;
    status: string;
    expires: string | null;
  };
};

type Service = {
    _id: string;
    serviceName: string;
    vendorName: string;
    category: string;
    price: number;
    status: "pending" | "approved" | "disapproved";
    description: string;
};
type Product = typeof productsData[0];

type Doctor = {
  _id: string;
  id: string;
  profileImage: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  clinicName: string;
  specialization: string;
  experience: string;
  qualification: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  registrationNumber: string;
  state: string;
  city: string;
  pincode: string;
  physicalConsultationStartTime: string;
  physicalConsultationEndTime: string;
  assistantName: string;
  assistantContact: string;
  doctorAvailability: string;
};

type Supplier = {
  _id: string;
  supplierName: string;
  businessRegistrationNo: string;
  supplierType: string;
  licenseFile: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ActionType = 'approve' | 'reject' | 'delete';
type ItemType = 'vendor' | 'service' | 'product' | 'doctor' | 'supplier';

export default function VendorApprovalPage() {
  // RTK Query hooks
  const { data: vendors = [], isLoading: vendorsLoading, error: vendorsError } = useGetVendorsQuery(undefined);
  const [updateVendorStatus] = useUpdateVendorStatusMutation();
  const { data: suppliersData = [], isLoading: suppliersLoading } = useGetSuppliersQuery(undefined);
  const { data: doctorsData = [], isLoading: doctorsLoading } = useGetDoctorsQuery(undefined);
  const { data: pendingServices = [], isLoading: servicesLoading, refetch: refetchPendingServices } = useGetPendingServicesQuery(undefined);
  const [updateServiceStatus] = useUpdateServiceStatusMutation();

  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  const [updateDoctor] = useUpdateDoctorMutation();
  const [deleteDoctor] = useDeleteDoctorMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<Vendor | Service | Product | Doctor | Supplier | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [itemType, setItemType] = useState<ItemType | null>(null);

  const pendingSuppliers = suppliersData.filter((s: Supplier) => s.status === 'Pending');
  const pendingDoctors = doctorsData.filter((d: Doctor) => d.status === 'Pending');
  const pendingVendors = vendors.filter((v: Vendor) => v.status === 'Pending' || v.status === 'Disabled');

  // Pagination logic
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentVendors = pendingVendors.slice(firstItemIndex, lastItemIndex);
  const currentServices = pendingServices.slice(firstItemIndex, lastItemIndex);
  const currentProducts = productsData.slice(firstItemIndex, lastItemIndex);
  const currentDoctors = pendingDoctors.slice(firstItemIndex, lastItemIndex);
  const currentSuppliers = pendingSuppliers.slice(firstItemIndex, lastItemIndex);

  const totalVendorPages = Math.ceil(pendingVendors.length / itemsPerPage);
  const totalServicePages = Math.ceil(pendingServices.length / itemsPerPage);
  const totalProductPages = Math.ceil(productsData.length / itemsPerPage);
  const totalDoctorPages = Math.ceil(pendingDoctors.length / itemsPerPage);
  const totalSupplierPages = Math.ceil(pendingSuppliers.length / itemsPerPage);

  const handleActionClick = (item: Vendor | Service | Product | Doctor | Supplier, type: ItemType, action: ActionType) => {
    setSelectedItem(item);
    setItemType(type);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const handleViewClick = (item: Vendor | Service | Product | Doctor | Supplier, type: ItemType) => {
    setSelectedItem(item);
    setItemType(type);
    setIsViewModalOpen(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageViewerOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedItem || !actionType || !itemType) return;

    const itemName = (selectedItem as any).businessName || (selectedItem as any).serviceName || (selectedItem as any).productName || (selectedItem as any).name || `${(selectedItem as any).firstName} ${(selectedItem as any).lastName}`;

    try {
      if (itemType === 'vendor') {
        const vendor = selectedItem as Vendor;
        if (actionType === 'delete') {
          toast.error('Error', { description: 'Delete functionality for vendors is not yet implemented.' });
        } else {
          const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
          await updateVendorStatus({ id: vendor._id, status: newStatus }).unwrap();
          toast.success('Success', { description: `Vendor "${itemName}" status updated to ${newStatus}.` });
        }
      } else if (itemType === 'supplier') {
        const supplier = selectedItem as Supplier;
        if (actionType === 'delete') {
          await deleteSupplier(supplier._id).unwrap();
          toast.success('Success', { description: `Supplier "${itemName}" deleted.` });
        } else {
          const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
          await updateSupplier({ id: supplier._id, status: newStatus }).unwrap();
          toast.success('Success', { description: `Supplier "${itemName}" status updated to ${newStatus}.` });
        }
      } else if (itemType === 'doctor') {
        const doctor = selectedItem as Doctor;
        if (actionType === 'delete') {
          await deleteDoctor(doctor._id).unwrap();
          toast.success('Success', { description: `Doctor "${itemName}" deleted.` });
        } else {
          const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
          await updateDoctor({ id: doctor._id, status: newStatus }).unwrap();
          toast.success('Success', { description: `Doctor "${itemName}" status updated to ${newStatus}.` });
        }
      } else if (itemType === 'service') {
          const service = selectedItem as Service;
          const newStatus = actionType === 'approve' ? 'approved' : 'disapproved';
          await updateServiceStatus({ serviceId: service._id, status: newStatus }).unwrap();
          toast.success(`Service "${service.serviceName}" has been ${newStatus}.`);
          refetchPendingServices(); // Refetch the list of pending services
      } else {
        console.log(`Performing ${actionType} on ${itemType} ${itemName}`);
      }
    } catch (error) {
      toast.error('Error', { description: `Failed to perform action on ${itemType}.` });
    }

    setIsActionModalOpen(false);
    setSelectedItem(null);
    setActionType(null);
    setItemType(null);
  };

  const getModalContent = () => {
    if (!actionType || !selectedItem || !itemType) return { title: '', description: '', buttonText: '' };

    const itemName = (selectedItem as any).businessName || (selectedItem as any).serviceName || (selectedItem as any).productName || (selectedItem as any).name || `${(selectedItem as any).firstName} ${(selectedItem as any).lastName}`;

    switch (actionType) {
      case 'approve':
        return {
          title: `Approve ${itemType}?`,
          description: `Are you sure you want to approve the ${itemType} "${itemName}"?`,
          buttonText: 'Approve',
        };
      case 'reject':
        return {
          title: `Reject ${itemType}?`,
          description: `Are you sure you want to reject the ${itemType} "${itemName}"? This action cannot be undone.`,
          buttonText: 'Reject',
        };
      case 'delete':
        return {
          title: `Delete ${itemType}?`,
          description: `Are you sure you want to permanently delete the ${itemType} "${itemName}"? This action is irreversible.`,
          buttonText: 'Delete',
        };
      default:
        return { title: '', description: '', buttonText: '' };
    }
  };

  const { title, description, buttonText } = getModalContent();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Approvals</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVendors.length}</div>
            <p className="text-xs text-muted-foreground">Vendors to review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Services</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingServices.length}</div>
            <p className="text-xs text-muted-foreground">Services to approve</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Doctors</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingDoctors.length}</div>
            <p className="text-xs text-muted-foreground">Doctors awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Suppliers</CardTitle>
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingSuppliers.length}</div>
            <p className="text-xs text-muted-foreground">Suppliers awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vendor-approvals">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 max-w-3xl">
          <TabsTrigger value="vendor-approvals">Vendor Approvals</TabsTrigger>
          <TabsTrigger value="service-approvals">Service Approvals</TabsTrigger>
          <TabsTrigger value="product-approvals">Product Approvals</TabsTrigger>
          <TabsTrigger value="doctor-approvals">Doctor Approvals</TabsTrigger>
          <TabsTrigger value="supplier-approvals">Supplier Approvals</TabsTrigger>
        </TabsList>
        <TabsContent value="vendor-approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Vendor Approvals</CardTitle>
              <CardDescription>Vendors waiting for verification to join the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor ID</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Pincode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorsLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : vendorsError ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">Error loading vendors.</TableCell>
                      </TableRow>
                    ) : currentVendors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">No pending vendor approvals.</TableCell>
                      </TableRow>
                    ) : (
                      currentVendors.map((vendor) => (
                        <TableRow key={vendor._id}>
                          <TableCell className="font-mono text-xs">{vendor._id}</TableCell>
                          <TableCell className="font-medium">{vendor.businessName}</TableCell>
                          <TableCell>{`${vendor.firstName} ${vendor.lastName}`}</TableCell>
                          <TableCell>{vendor.phone}</TableCell>
                          <TableCell>{vendor.city}</TableCell>
                          <TableCell>{vendor.pincode}</TableCell>
                          <TableCell>
                            <Badge
                              variant={vendor.status === 'Pending' || vendor.status === 'Disabled' ? 'default' : 'secondary'}
                              className={vendor.status === 'Pending' || vendor.status === 'Disabled' ? 'bg-yellow-100 text-yellow-800' : ''}
                            >
                              {vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleViewClick(vendor, 'vendor')}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(vendor, 'vendor', 'approve')}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(vendor, 'vendor', 'reject')}>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="sr-only">Reject</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleActionClick(vendor, 'vendor', 'delete')}
                              disabled
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalVendorPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={pendingVendors.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="service-approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Service Approvals</CardTitle>
              <CardDescription>Services submitted by vendors waiting for approval.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                   {servicesLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : currentServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No pending service approvals.</TableCell>
                      </TableRow>
                    ) : (
                      currentServices.map((service) => (
                      <TableRow key={service._id}>
                        <TableCell className="font-medium">{service.serviceName}</TableCell>
                        <TableCell>{service.vendorName}</TableCell>
                        <TableCell>₹{service.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {service.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewClick(service, 'service')}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleActionClick(service, 'service', 'approve')}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleActionClick(service, 'service', 'reject')}>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Reject</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalServicePages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={pendingServices.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="product-approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Product Approvals</CardTitle>
              <CardDescription>Products submitted by vendors waiting for approval.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Salon Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Image
                              src={product.productImage}
                              alt={product.productName}
                              width={40}
                              height={40}
                              className="rounded-md cursor-pointer"
                              onClick={() => handleImageClick(product.productImage)}
                            />
                            <span className="font-medium">{product.productName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.salonName}</TableCell>
                        <TableCell>
                          <div>
                            <span className={product.salePrice < product.price ? "line-through text-muted-foreground" : ""}>
                              ${product.price.toFixed(2)}
                            </span>
                            {product.salePrice < product.price && (
                              <div className="text-green-600 font-semibold">${product.salePrice.toFixed(2)}</div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">Sale price is the discounted price.</p>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewClick(product, 'product')}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleActionClick(product, 'product', 'approve')}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleActionClick(product, 'product', 'reject')}>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Reject</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleActionClick(product, 'product', 'delete')}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalProductPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={productsData.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="doctor-approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Doctor Approvals</CardTitle>
              <CardDescription>Doctors waiting for verification.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor's Name</TableHead>
                      <TableHead>Clinic Name</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : currentDoctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No pending doctor approvals.</TableCell>
                      </TableRow>
                    ) : (
                      currentDoctors.map((doctor) => (
                        <TableRow key={doctor._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Image
                                src={doctor.profileImage || "https://placehold.co/400x400.png"}
                                alt={doctor.name}
                                width={40}
                                height={40}
                                className="rounded-full cursor-pointer"
                                onClick={() => handleImageClick(doctor.profileImage || "https://placehold.co/400x400.png")}
                              />
                              <span className="font-medium">{doctor.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{doctor.clinicName}</TableCell>
                          <TableCell>{doctor.specialization}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleViewClick(doctor, 'doctor')}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(doctor, 'doctor', 'approve')}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(doctor, 'doctor', 'reject')}>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="sr-only">Reject</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(doctor, 'doctor', 'delete')}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalDoctorPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={pendingDoctors.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="supplier-approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Supplier Approvals</CardTitle>
              <CardDescription>Suppliers waiting for verification.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Business Reg. No.</TableHead>
                      <TableHead>Supplier Type</TableHead>
                      <TableHead>License/Cert.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : currentSuppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No pending supplier approvals.</TableCell>
                      </TableRow>
                    ) : (
                      currentSuppliers.map((supplier) => (
                        <TableRow key={supplier._id}>
                          <TableCell className="font-medium">{supplier.firstName + " " + supplier.lastName}</TableCell>
                          <TableCell>{supplier.businessRegistrationNo}</TableCell>
                          <TableCell>{supplier.supplierType}</TableCell>
                          <TableCell>
                            <a href={supplier.licenseFile} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              View License
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge variant={supplier.status === 'Pending' ? 'default' : 'secondary'} className={supplier.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}>
                              {supplier.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleViewClick(supplier, 'supplier')}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'supplier', 'approve')}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'supplier', 'reject')}>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="sr-only">Reject</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'supplier', 'delete')}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalSupplierPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={pendingSuppliers.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'delete' || actionType === 'reject' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
            >
              {buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle>View Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            {itemType === 'vendor' && selectedItem && (
              <>
                <div className="flex items-center gap-4">
                  <Image
                    src={(selectedItem as Vendor).profileImage || 'https://placehold.co/100x100.png'}
                    alt={(selectedItem as Vendor).businessName}
                    width={80}
                    height={80}
                    className="rounded-lg"
                    onClick={() => handleImageClick((selectedItem as Vendor).profileImage || 'https://placehold.co/100x100.png')}
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{(selectedItem as Vendor).businessName}</h3>
                    <p className="text-muted-foreground">{`${(selectedItem as Vendor).firstName} ${(selectedItem as Vendor).lastName}`}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Vendor ID</span>
                  <span className="col-span-2">{(selectedItem as Vendor)._id}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Email</span>
                  <span className="col-span-2">{(selectedItem as Vendor).email}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Phone</span>
                  <span className="col-span-2">{(selectedItem as Vendor).phone}</span>
                </div>
                <div className="grid grid-cols-3 items-start gap-4">
                  <span className="font-semibold text-muted-foreground">Address</span>
                  <span className="col-span-2">{(selectedItem as Vendor).address}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">City</span>
                  <span className="col-span-2">{(selectedItem as Vendor).city}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">State</span>
                  <span className="col-span-2">{(selectedItem as Vendor).state}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Pincode</span>
                  <span className="col-span-2">{(selectedItem as Vendor).pincode}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Category</span>
                  <span className="col-span-2"><Badge>{(selectedItem as Vendor).category}</Badge></span>
                </div>
                <div className="grid grid-cols-3 items-start gap-4">
                  <span className="font-semibold text-muted-foreground">Sub-Categories</span>
                  <span className="col-span-2">{(selectedItem as Vendor).subCategories.join(', ') || 'None'}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Description</span>
                  <span className="col-span-2">{(selectedItem as Vendor).description || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Website</span>
                  <span className="col-span-2">
                    {(selectedItem as Vendor).website ? (
                      <a
                        href={(selectedItem as Vendor).website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {(selectedItem as Vendor).website}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Status</span>
                  <span className="col-span-2">{(selectedItem as Vendor).status}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Subscription Status</span>
                  <span className="col-span-2">{(selectedItem as Vendor).subscription.status}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Created At</span>
                  <span className="col-span-2">{new Date((selectedItem as Vendor).createdAt).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Updated At</span>
                  <span className="col-span-2">{new Date((selectedItem as Vendor).updatedAt).toLocaleString()}</span>
                </div>
              </>
            )}
            {itemType === 'service' && selectedItem && (
              <>
                <h3 className="text-lg font-semibold">{(selectedItem as Service).serviceName}</h3>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Vendor</span>
                  <span className="col-span-2">{(selectedItem as Service).vendorName}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Price</span>
                  <span className="col-span-2">₹{(selectedItem as Service).price.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-3 items-start gap-4">
                  <span className="font-semibold text-muted-foreground">Description</span>
                  <p className="col-span-2">{(selectedItem as Service).description}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Status</span>
                  <span className="col-span-2">{(selectedItem as Service).status}</span>
                </div>
              </>
            )}
            {itemType === 'product' && selectedItem && (
              <>
                <div className="flex items-center gap-4">
                  <Image
                    src={(selectedItem as Product).productImage}
                    alt={(selectedItem as Product).productName}
                    width={80}
                    height={80}
                    className="rounded-lg"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{(selectedItem as Product).productName}</h3>
                    <p className="text-muted-foreground">{(selectedItem as Product).salonName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Product ID</span>
                  <span className="col-span-2">{(selectedItem as Product).id}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Category</span>
                  <span className="col-span-2"><Badge>{(selectedItem as Product).category}</Badge></span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Price</span>
                  <span className="col-span-2">${(selectedItem as Product).price.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Sale Price</span>
                  <span className="col-span-2">${(selectedItem as Product).salePrice.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Stock</span>
                  <span className="col-span-2">{(selectedItem as Product).stock} units</span>
                </div>
                <div className="grid grid-cols-3 items-start gap-4">
                  <span className="font-semibold text-muted-foreground">Description</span>
                  <p className="col-span-2">{(selectedItem as Product).description}</p>
                </div>
              </>
            )}
            {itemType === 'doctor' && selectedItem && (
              <>
                <div className="flex items-start gap-4">
                  <Image
                    src={(selectedItem as Doctor).profileImage || "https://placehold.co/100x100.png"}
                    alt={(selectedItem as Doctor).name}
                    width={80}
                    height={80}
                    className="rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{(selectedItem as Doctor).name}</h3>
                    <p className="text-sm text-muted-foreground">{(selectedItem as Doctor).clinicName}</p>
                    <Badge variant="outline" className="mt-2">{(selectedItem as Doctor).specialization}</Badge>
                  </div>
                </div>
                <div className="mt-4 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Email:</span><span>{(selectedItem as Doctor).email}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Phone:</span><span>{(selectedItem as Doctor).phone}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Gender:</span><span>{(selectedItem as Doctor).gender}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Reg. No:</span><span>{(selectedItem as Doctor).registrationNumber}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Experience:</span><span>{(selectedItem as Doctor).experience}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Qualification:</span><span>{(selectedItem as Doctor).qualification}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Availability:</span><span>{(selectedItem as Doctor).doctorAvailability}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Consultation Time:</span><span>{(selectedItem as Doctor).physicalConsultationStartTime} - {(selectedItem as Doctor).physicalConsultationEndTime}</span></div>
                  <div className="flex justify-between border-b py-1 md:col-span-2"><span className="text-muted-foreground">Location:</span><span>{`${(selectedItem as Doctor).city}, ${(selectedItem as Doctor).state}, ${(selectedItem as Doctor).pincode}`}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Assistant Name:</span><span>{(selectedItem as Doctor).assistantName}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Assistant Contact:</span><span>{(selectedItem as Doctor).assistantContact}</span></div>
                </div>
              </>
            )}
            {itemType === 'supplier' && selectedItem && (
              <>
                <h3 className="text-lg font-semibold">{(selectedItem as Supplier).supplierName}</h3>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Supplier ID</span>
                  <span className="col-span-2">{(selectedItem as Supplier)._id}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Owner</span>
                  <span className="col-span-2">{`${(selectedItem as Supplier).firstName} ${(selectedItem as Supplier).lastName}`}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Contact</span>
                  <span className="col-span-2">{(selectedItem as Supplier).email}<br />{(selectedItem as Supplier).phone}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Business Reg. No.</span>
                  <span className="col-span-2">{(selectedItem as Supplier).businessRegistrationNo}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Supplier Type</span>
                  <span className="col-span-2"><Badge>{(selectedItem as Supplier).supplierType}</Badge></span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">License</span>
                  <span className="col-span-2">
                    <a href={(selectedItem as Supplier).licenseFile} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      View License
                    </a>
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Status</span>
                  <span className="col-span-2">{(selectedItem as Supplier).status}</span>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImageUrl && (
            <div className="flex justify-center items-center p-4">
              <Image src={selectedImageUrl} alt="Preview" width={500} height={500} className="rounded-lg max-h-[70vh] w-auto" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageViewerOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
