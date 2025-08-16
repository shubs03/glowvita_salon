
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { CheckCircle, Eye, XCircle, Users, ThumbsUp, Hourglass, ThumbsDown, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

const vendorsData = [
    {
        id: "VEN-007",
        name: "New Beauty Haven",
        owner: "Jessica Day",
        phone: "789-012-3456",
        city: "Miami",
        pincode: "33101",
    },
    {
        id: "VEN-008",
        name: "City Style Salon",
        owner: "Winston Bishop",
        phone: "890-123-4567",
        city: "San Diego",
        pincode: "92101",
    },
    {
        id: "VEN-009",
        name: "Urban Cuts",
        owner: "Nick Miller",
        phone: "901-234-5678",
        city: "Portland",
        pincode: "97201",
    },
    {
        id: "VEN-010",
        name: "The Glow Up Studio",
        owner: "Cece Parekh",
        phone: "012-345-6789",
        city: "Seattle",
        pincode: "98101",
    },
    {
        id: "VEN-011",
        name: "Chic & Co.",
        owner: "Schmidt",
        phone: "123-456-7890",
        city: "Los Angeles",
        pincode: "90028",
    },
];

const servicesData = [
  {
    id: "SRV-001",
    serviceName: "Advanced Haircut",
    vendorName: "New Beauty Haven",
    category: "Hair",
    price: 75.00,
    status: "Pending",
  },
  {
    id: "SRV-002",
    serviceName: "Gel Manicure",
    vendorName: "City Style Salon",
    category: "Nails",
    price: 55.00,
    status: "Pending",
  },
  {
    id: "SRV-003",
    serviceName: "Deep Tissue Massage",
    vendorName: "Urban Cuts",
    category: "Spa",
    price: 120.00,
    status: "Approved",
  },
   {
    id: "SRV-004",
    serviceName: "Bridal Makeup",
    vendorName: "The Glow Up Studio",
    category: "Makeup",
    price: 250.00,
    status: "Pending",
  },
];

const productsData = [
    {
        id: "PROD-001",
        productImage: "https://placehold.co/400x400.png",
        productName: "Organic Face Serum",
        salonName: "New Beauty Haven",
        price: 85.00,
        salePrice: 75.00,
        category: "Skincare"
    },
    {
        id: "PROD-002",
        productImage: "https://placehold.co/400x400.png",
        productName: "Matte Lipstick",
        salonName: "The Glow Up Studio",
        price: 25.00,
        salePrice: 25.00,
        category: "Makeup"
    }
];

const doctorsApprovalData = [
    {
        id: "DOC-APP-001",
        profileImage: "https://placehold.co/400x400.png",
        doctorName: "Dr. Emily Carter",
        clinicName: "Serene Skin Clinic",
        specialization: "Dermatologist"
    },
    {
        id: "DOC-APP-002",
        profileImage: "https://placehold.co/400x400.png",
        doctorName: "Dr. Ben Adams",
        clinicName: "Heal & Glow",
        specialization: "Trichologist"
    }
];

type Vendor = typeof vendorsData[0];
type Service = typeof servicesData[0];
type Product = typeof productsData[0];
type Doctor = typeof doctorsApprovalData[0];
type ActionType = 'approve' | 'reject' | 'delete';
type ItemType = 'vendor' | 'service' | 'product' | 'doctor';

export default function VendorApprovalPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState<Vendor | Service | Product | Doctor | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [itemType, setItemType] = useState<ItemType | null>(null);

    // Pagination logic for each tab
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentVendors = vendorsData.slice(firstItemIndex, lastItemIndex);
    const currentServices = servicesData.slice(firstItemIndex, lastItemIndex);
    const currentProducts = productsData.slice(firstItemIndex, lastItemIndex);
    const currentDoctors = doctorsApprovalData.slice(firstItemIndex, lastItemIndex);

    const totalVendorPages = Math.ceil(vendorsData.length / itemsPerPage);
    const totalServicePages = Math.ceil(servicesData.length / itemsPerPage);
    const totalProductPages = Math.ceil(productsData.length / itemsPerPage);
    const totalDoctorPages = Math.ceil(doctorsApprovalData.length / itemsPerPage);

    const handleActionClick = (item: Vendor | Service | Product | Doctor, type: ItemType, action: ActionType) => {
        setSelectedItem(item);
        setItemType(type);
        setActionType(action);
        setIsActionModalOpen(true);
    };

    const handleViewClick = (vendor: Vendor) => {
        setSelectedItem(vendor);
        setItemType('vendor');
        setIsViewModalOpen(true);
    };

    const handleImageClick = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setIsImageViewerOpen(true);
    }

    const handleConfirmAction = () => {
        if (selectedItem && actionType) {
            const itemName = (selectedItem as any).name || (selectedItem as any).serviceName || (selectedItem as any).productName || (selectedItem as any).doctorName;
            console.log(`Performing ${actionType} on ${itemType} ${itemName}`);
        }
        setIsActionModalOpen(false);
        setSelectedItem(null);
        setActionType(null);
        setItemType(null);
    };

    const getModalContent = () => {
        if (!actionType || !selectedItem || !itemType) return { title: '', description: '', buttonText: '' };
        
        const itemName = (selectedItem as any).name || (selectedItem as any).serviceName || (selectedItem as any).productName || (selectedItem as any).doctorName;

        switch (actionType) {
            case 'approve':
                return {
                    title: `Approve ${itemType}?`,
                    description: `Are you sure you want to approve the ${itemType} "${itemName}"?`,
                    buttonText: 'Approve'
                };
            case 'reject':
                return {
                    title: `Reject ${itemType}?`,
                    description: `Are you sure you want to reject the ${itemType} "${itemName}"? This action cannot be undone.`,
                    buttonText: 'Reject'
                };
            case 'delete':
                return {
                    title: `Delete ${itemType}?`,
                    description: `Are you sure you want to permanently delete the ${itemType} "${itemName}"? This action is irreversible.`,
                    buttonText: 'Delete'
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
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+2 since last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">450</div>
            <p className="text-xs text-muted-foreground">87% approval rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <p className="text-xs text-muted-foreground">Waiting for review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disapproved</CardTitle>
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">118</div>
            <p className="text-xs text-muted-foreground">Onboarding rejected</p>
          </CardContent>
        </Card>
      </div>

    <Tabs defaultValue="vendor-approvals">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl">
            <TabsTrigger value="vendor-approvals">Vendor Approvals</TabsTrigger>
            <TabsTrigger value="service-approvals">Service Approvals</TabsTrigger>
            <TabsTrigger value="product-approvals">Product Approvals</TabsTrigger>
            <TabsTrigger value="doctor-approvals">Doctor Approvals</TabsTrigger>
        </TabsList>
        <TabsContent value="vendor-approvals">
            <Card>
                <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Vendors waiting for verification to join the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="overflow-x-auto no-scrollbar">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Vendor ID</TableHead>
                        <TableHead>Salon Name</TableHead>
                        <TableHead>Owner Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Pincode</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentVendors.map((vendor) => (
                            <TableRow key={vendor.id}>
                            <TableCell className="font-mono text-xs">{vendor.id}</TableCell>
                            <TableCell className="font-medium">{vendor.name}</TableCell>
                            <TableCell>{vendor.owner}</TableCell>
                            <TableCell>{vendor.phone}</TableCell>
                            <TableCell>{vendor.city}</TableCell>
                            <TableCell>{vendor.pincode}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleViewClick(vendor)}>
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
                                <Button variant="ghost" size="icon" onClick={() => handleActionClick(vendor, 'vendor', 'delete')}>
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
                    totalPages={totalVendorPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={vendorsData.length}
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
                        <TableHead>Service ID</TableHead>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentServices.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell className="font-mono text-xs">{service.id}</TableCell>
                                <TableCell className="font-medium">{service.serviceName}</TableCell>
                                <TableCell>{service.vendorName}</TableCell>
                                <TableCell>{service.category}</TableCell>
                                <TableCell>${service.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        service.status === "Approved" ? "bg-green-100 text-green-800" :
                                        "bg-yellow-100 text-yellow-800"
                                    }`}>
                                        {service.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {service.status === "Pending" && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(service, 'service', 'approve')}>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="sr-only">Approve</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(service, 'service', 'reject')}>
                                                <XCircle className="h-4 w-4 text-red-600" />
                                                <span className="sr-only">Reject</span>
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
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
                    totalItems={servicesData.length}
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
                                                <span>${product.price.toFixed(2)}</span>
                                                {product.salePrice < product.price && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Sale: <span className="font-semibold text-green-600">${product.salePrice.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => { /* View logic */ }}>
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
                                {currentDoctors.map((doctor) => (
                                    <TableRow key={doctor.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                 <Image 
                                                    src={doctor.profileImage} 
                                                    alt={doctor.doctorName} 
                                                    width={40} 
                                                    height={40} 
                                                    className="rounded-full cursor-pointer"
                                                    onClick={() => handleImageClick(doctor.profileImage)}
                                                />
                                                <span className="font-medium">{doctor.doctorName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{doctor.clinicName}</TableCell>
                                        <TableCell>{doctor.specialization}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => { /* View logic */ }}>
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
                                ))}
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
                        totalItems={doctorsApprovalData.length}
                    />
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>


       <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
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
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Vendor Details: {(selectedItem as Vendor)?.name}</DialogTitle>
            </DialogHeader>
            {selectedItem && itemType === 'vendor' && (
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="font-semibold text-muted-foreground">Vendor ID</span>
                        <span className="col-span-2">{(selectedItem as Vendor).id}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="font-semibold text-muted-foreground">Owner</span>
                        <span className="col-span-2">{(selectedItem as Vendor).owner}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="font-semibold text-muted-foreground">Phone</span>
                        <span className="col-span-2">{(selectedItem as Vendor).phone}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="font-semibold text-muted-foreground">City</span>
                        <span className="col-span-2">{(selectedItem as Vendor).city}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="font-semibold text-muted-foreground">Pincode</span>
                        <span className="col-span-2">{(selectedItem as Vendor).pincode}</span>
                    </div>
                </div>
            )}
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
                    <Image src={selectedImageUrl} alt="Preview" width={500} height={500} className="rounded-lg max-h-[70vh] w-auto"/>
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

    

    