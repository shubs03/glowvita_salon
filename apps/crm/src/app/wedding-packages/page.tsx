"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import {
  Plus,
  Minus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Tag,
  Star,
  BarChart2,
  Eye,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@repo/ui/checkbox";
import { Switch } from "@repo/ui/switch";
import { useDispatch, useSelector } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Badge } from "@repo/ui/badge";
import {
  useGetVendorServicesQuery,
  useGetVendorWeddingPackagesQuery,
  useCreateWeddingPackageMutation,
  useUpdateWeddingPackageMutation,
  useDeleteWeddingPackageMutation,
  useGetPublicVendorStaffQuery,
} from "@repo/store/services/api";
import Image from "next/image";
import { Skeleton } from "@repo/ui/skeleton";
import { Pagination } from "@repo/ui/pagination";
import { toast } from 'sonner';
import { useCrmAuth } from "@/hooks/useCrmAuth";

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  categoryName?: string;
}

interface PackageService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  staffRequired: boolean;
}

interface WeddingPackage {
  _id: string;
  name: string;
  description: string;
  services: PackageService[];
  totalPrice: number;
  discountedPrice: number | null;
  duration: number;
  staffCount: number;
  assignedStaff: string[];
  image: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  services: PackageService[];
  totalPrice: number;
  discountedPrice: number | null;
  duration: number;
  staffCount: number;
  assignedStaff: string[];
  image: string | null;
}

export default function WeddingPackagesPage() {
  const { user } = useCrmAuth();
  // Ensure we have a valid vendorId
  const vendorId = user?.userId?.toString() || user?._id?.toString() || "";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<WeddingPackage | null>(null);
  const [modalType, setModalType] = useState<"create" | "edit" | "view">("create");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    services: [],
    totalPrice: 0,
    discountedPrice: null,
    duration: 0,
    staffCount: 1,
    assignedStaff: [],
    image: null,
  });
  const [newService, setNewService] = useState({
    serviceId: "",
    quantity: 1,
    staffRequired: true,
  });
  const [selectedStaffForAdd, setSelectedStaffForAdd] = useState("");

  // API hooks
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useGetVendorServicesQuery({ vendorId }, { skip: !vendorId });
  const { data: staffData, isLoading: staffLoading, error: staffError } = useGetPublicVendorStaffQuery(vendorId, { skip: !vendorId });
  const { data: packagesData, isLoading: packagesLoading, refetch } = useGetVendorWeddingPackagesQuery(vendorId, { skip: !vendorId });
  const [createPackage, { isLoading: isCreating }] = useCreateWeddingPackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdateWeddingPackageMutation();
  const [deletePackage, { isLoading: isDeleting }] = useDeleteWeddingPackageMutation();

  // Debugging: Log the data
  useEffect(() => {
    if (servicesData) {
      console.log('Services data:', servicesData);
    }
    if (servicesError) {
      console.error('Services error:', servicesError);
    }
    if (staffData) {
      console.log('Staff data:', staffData);
    }
    if (staffError) {
      console.error('Staff error:', staffError);
    }
  }, [servicesData, servicesError, staffData, staffError]);

  const services = servicesData?.services || [];
  const staff = staffData?.staff || staffData?.data || [];
  const packages = packagesData?.weddingPackages || [];
  
  // Log staff for debugging
  console.log('Parsed staff array:', staff);
  console.log('Staff count:', staff.length);
  
  // Filter packages based on search term
  const filteredPackages = packages.filter((pkg: WeddingPackage) => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredPackages.slice(startIndex, endIndex);

  // Calculate totals when services change
  useEffect(() => {
    if (formData.services.length > 0) {
      const total = formData.services.reduce((sum, pkgService) => {
        const service = services.find((s: Service) => s._id === pkgService.serviceId);
        return sum + (service ? service.price * pkgService.quantity : 0);
      }, 0);
      
      const totalDuration = formData.services.reduce((sum, pkgService) => {
        const service = services.find((s: Service) => s._id === pkgService.serviceId);
        return sum + (service ? service.duration * pkgService.quantity : 0);
      }, 0);
      
      setFormData(prev => ({
        ...prev,
        totalPrice: total,
        duration: totalDuration
      }));
    }
  }, [formData.services, services]);

  const handleOpenModal = (type: "create" | "edit" | "view", pkg?: WeddingPackage) => {
    setModalType(type);
    setSelectedStaffForAdd(""); // Reset staff selector
    if (type === "create") {
      setFormData({
        name: "",
        description: "",
        services: [],
        totalPrice: 0,
        discountedPrice: null,
        duration: 0,
        staffCount: 1,
        assignedStaff: [],
        image: null,
      });
    } else if (pkg) {
      setSelectedPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description,
        services: [...pkg.services],
        totalPrice: pkg.totalPrice,
        discountedPrice: pkg.discountedPrice,
        duration: pkg.duration,
        staffCount: pkg.staffCount || 1,
        assignedStaff: pkg.assignedStaff || [],
        image: pkg.image,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
    setSelectedStaffForAdd(""); // Reset staff selector
  };

  const handleDeleteClick = (pkg: WeddingPackage) => {
    setSelectedPackage(pkg);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedPackage) {
      try {
        await deletePackage(selectedPackage._id).unwrap();
        toast.success("Wedding package deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedPackage(null);
        refetch();
      } catch (error) {
        toast.error("Failed to delete wedding package");
        console.error("Delete error:", error);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddService = () => {
    if (newService.serviceId) {
      const service = services.find((s: Service) => s._id === newService.serviceId);
      if (service) {
        setFormData(prev => ({
          ...prev,
          services: [
            ...prev.services,
            {
              serviceId: newService.serviceId,
              serviceName: service.name,  // This should match what the API expects
              quantity: newService.quantity,
              staffRequired: newService.staffRequired,
            }
          ]
        }));
        setNewService({
          serviceId: "",
          quantity: 1,
          staffRequired: true,
        });
      }
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.serviceId !== serviceId)
    }));
  };

  const handleQuantityChange = (serviceId: string, delta: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => 
        s.serviceId === serviceId 
          ? { ...s, quantity: Math.max(1, s.quantity + delta) } 
          : s
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalType === "create") {
        // Ensure we're sending the correct data structure
        const packageData = {
          ...formData,
          vendorId,
        };
        
        await createPackage(packageData).unwrap();
        toast.success("Wedding package created successfully");
      } else if (modalType === "edit" && selectedPackage) {
        await updatePackage({
          packageId: selectedPackage._id,
          ...formData,
        }).unwrap();
        toast.success("Wedding package updated successfully");
      }
      
      handleCloseModal();
      refetch();
    } catch (error: any) {
      toast.error(`Failed to ${modalType} wedding package`);
      console.error("Submit error:", error);
      
      // Log the actual error response for debugging
      if (error?.data?.error) {
        console.error("Server error details:", error.data.error);
      }
    }
  };

  if (servicesLoading || packagesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Wedding Packages</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wedding Packages</h1>
          <p className="text-muted-foreground">
            Create and manage wedding packages for your clients
          </p>
        </div>
        <Button onClick={() => handleOpenModal("create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">Active packages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{packages.length > 0 
                ? (packages.reduce((sum: number, pkg: WeddingPackage) => sum + pkg.totalPrice, 0) / packages.length).toFixed(0) 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Average package price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.length > 0 
                ? packages.reduce((prev: WeddingPackage, current: WeddingPackage) => 
                    (prev.services.length > current.services.length) ? prev : current
                  ).name 
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Package with most services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.length > 0 
                ? Math.round(packages.reduce((sum: number, pkg: WeddingPackage) => sum + pkg.duration, 0) / packages.length / 60) 
                : 0}h
            </div>
            <p className="text-xs text-muted-foreground">Average package duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Packages Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((pkg: WeddingPackage) => (
                    <TableRow key={pkg._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {pkg.image ? (
                            <Image
                              src={pkg.image}
                              alt={pkg.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                          )}
                          <span className="font-medium">{pkg.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pkg.services.length} services
                        </Badge>
                      </TableCell>
                      <TableCell>{Math.floor(pkg.duration / 60)}h {pkg.duration % 60}m</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="secondary">
                            {pkg.staffCount || 1} {pkg.staffCount === 1 ? 'staff' : 'staff'}
                          </Badge>
                          {pkg.assignedStaff && pkg.assignedStaff.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pkg.assignedStaff.slice(0, 2).map((staffId: string) => {
                                const staffMember = staff.find((s: any) => (s.id || s._id) === staffId);
                                return staffMember ? (
                                  <span key={staffId} className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                    {staffMember.name}
                                  </span>
                                ) : null;
                              })}
                              {pkg.assignedStaff.length > 2 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                  +{pkg.assignedStaff.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {pkg.discountedPrice ? (
                          <div className="flex flex-col">
                            <span className="line-through text-muted-foreground">₹{pkg.totalPrice}</span>
                            <span className="font-bold">₹{pkg.discountedPrice}</span>
                          </div>
                        ) : (
                          <span>₹{pkg.totalPrice}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            pkg.status === 'approved' ? 'default' : 
                            pkg.status === 'disapproved' ? 'destructive' : 'secondary'
                          }
                          className={
                            pkg.status === 'approved' ? 'bg-green-100 text-green-800' :
                            pkg.status === 'disapproved' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {pkg.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={pkg.isActive}
                          // onCheckedChange={() => handleVisibilityToggle(pkg)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal("view", pkg)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal("edit", pkg)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive" 
                          onClick={() => handleDeleteClick(pkg)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      {searchTerm ? "No matching packages found." : "No wedding packages found. Create your first package to get started!"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredPackages.length > 0 && (
            <Pagination
              className="mt-4 p-4 border-t"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={filteredPackages.length}
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Package Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === "create" ? "Create Wedding Package" : 
               modalType === "edit" ? "Edit Wedding Package" : "View Wedding Package"}
            </DialogTitle>
            <DialogDescription>
              {modalType === "create" ? "Create a new wedding package for your clients" : 
               modalType === "edit" ? "Edit the details of your wedding package" : "View package details"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Bridal Glam Package"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={modalType === "view"}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your wedding package..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={modalType === "view"}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Package Image</Label>
                  {formData.image ? (
                    <div className="relative">
                      <Image
                        src={formData.image}
                        alt="Package preview"
                        width={200}
                        height={200}
                        className="rounded-md object-cover"
                      />
                      {modalType !== "view" && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : modalType !== "view" ? (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80">
                          <span>Upload an image</span>
                          <input
                            id="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No image uploaded</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Package Details</Label>
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between">
                      <span>Total Services:</span>
                      <span className="font-medium">{formData.services.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Duration:</span>
                      <span className="font-medium">
                        {Math.floor(formData.duration / 60)}h {formData.duration % 60}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff Required:</span>
                      <span className="font-medium">{formData.staffCount} {formData.staffCount === 1 ? 'Professional' : 'Professionals'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Price:</span>
                      <span className="font-medium">₹{formData.totalPrice.toFixed(2)}</span>
                    </div>
                    {formData.discountedPrice && (
                      <div className="flex justify-between text-green-600">
                        <span>Discounted Price:</span>
                        <span className="font-medium">₹{formData.discountedPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staffCount">Staff Required</Label>
                  <Input
                    id="staffCount"
                    type="number"
                    min="1"
                    placeholder="e.g., 2"
                    value={formData.staffCount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      staffCount: parseInt(e.target.value) || 1
                    }))}
                    disabled={modalType === "view"}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of professionals needed to perform this package
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Assign Staff (Optional)</Label>
                  {staffLoading ? (
                    <div className="flex items-center justify-center p-4 border rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading staff...</span>
                    </div>
                  ) : staffError ? (
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <p className="text-sm text-red-600">Error loading staff. Please try again.</p>
                    </div>
                  ) : modalType === "view" ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.assignedStaff.length > 0 ? (
                        formData.assignedStaff.map((staffId) => {
                          const staffMember = staff.find((s: any) => (s.id || s._id) === staffId);
                          return staffMember ? (
                            <Badge key={staffId} variant="secondary">
                              {staffMember.name}
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">No staff assigned</p>
                      )}
                    </div>
                  ) : staff.length === 0 ? (
                    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <p className="text-sm text-yellow-800">No staff members available. Please add staff members first.</p>
                    </div>
                  ) : (
                    <>
                      <Select
                        value={selectedStaffForAdd}
                        onValueChange={(value) => {
                          console.log('Selected staff value:', value);
                          console.log('Current assignedStaff:', formData.assignedStaff);
                          console.log('All staff:', staff);
                          
                          if (value && value !== "no-staff" && !formData.assignedStaff.includes(value)) {
                            setFormData(prev => ({
                              ...prev,
                              assignedStaff: [...prev.assignedStaff, value]
                            }));
                            // Reset after a brief delay to allow the selection to register
                            setTimeout(() => {
                              setSelectedStaffForAdd("");
                            }, 100);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff members" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.length > 0 ? (
                            staff.map((staffMember: any) => (
                              <SelectItem 
                                key={staffMember.id || staffMember._id} 
                                value={staffMember.id || staffMember._id}
                                disabled={formData.assignedStaff.includes(staffMember.id || staffMember._id)}
                              >
                                {staffMember.name} {formData.assignedStaff.includes(staffMember.id || staffMember._id) ? '(Selected)' : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-staff" disabled>
                              No staff available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.assignedStaff.map((staffId) => {
                          const staffMember = staff.find((s: any) => (s.id || s._id) === staffId);
                          return staffMember ? (
                            <Badge key={staffId} variant="secondary" className="flex items-center gap-1">
                              {staffMember.name}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    assignedStaff: prev.assignedStaff.filter(id => id !== staffId)
                                  }));
                                }}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {staff.length} staff member{staff.length !== 1 ? 's' : ''} available. Select those who can perform this package.
                      </p>
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">Discounted Price (Optional)</Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    placeholder="e.g., 4500"
                    value={formData.discountedPrice || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      discountedPrice: e.target.value ? parseFloat(e.target.value) : null 
                    }))}
                    disabled={modalType === "view"}
                  />
                </div>
              </div>
            </div>
            
            {modalType !== "view" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Add Services to Package</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddService} disabled={!newService.serviceId}>
                    Add Service
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <Select 
                      value={newService.serviceId} 
                      onValueChange={(value) => setNewService(prev => ({ ...prev, serviceId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service: Service) => (
                          <SelectItem key={service._id} value={service._id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newService.quantity}
                      onChange={(e) => setNewService(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  
                  <div className="space-y-2 flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="staffRequired"
                        checked={newService.staffRequired}
                        onCheckedChange={(checked) => 
                          setNewService(prev => ({ ...prev, staffRequired: !!checked }))
                        }
                      />
                      <Label htmlFor="staffRequired">Staff Required</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <Label>Package Services</Label>
              {formData.services.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.services.map((pkgService: PackageService) => {
                    const service = services.find((s: Service) => s._id === pkgService.serviceId);
                    return (
                      <div key={pkgService.serviceId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{service?.name || pkgService.serviceName}</div>
                          <Badge variant="secondary">{service?.categoryName}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {modalType !== "view" && (
                            <div className="flex items-center border rounded-lg">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleQuantityChange(pkgService.serviceId, -1)}
                                disabled={pkgService.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-2 text-sm font-medium">{pkgService.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleQuantityChange(pkgService.serviceId, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {modalType !== "view" && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveService(pkgService.serviceId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="text-right min-w-[80px]">
                            <div className="text-sm font-semibold">
                              ₹{service ? (service.price * pkgService.quantity).toFixed(2) : "0.00"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {service ? `${service.duration * pkgService.quantity} min` : "0 min"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  No services added to this package yet
                </div>
              )}
            </div>
            
            {modalType !== "view" && (
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating || formData.services.length === 0}>
                  {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {modalType === "create" ? "Create Package" : "Update Package"}
                </Button>
              </DialogFooter>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wedding Package?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPackage?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}