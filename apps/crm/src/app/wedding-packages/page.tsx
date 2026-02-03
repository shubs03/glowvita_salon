"use client";

import { useState, useEffect } from "react";
import {
  useGetVendorServicesQuery,
  useGetVendorWeddingPackagesQuery,
  useCreateWeddingPackageMutation,
  useUpdateWeddingPackageMutation,
  useDeleteWeddingPackageMutation,
  useGetPublicVendorStaffQuery,
} from "@repo/store/services/api";
import { toast } from 'sonner';
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { PageHeader } from "./components/PageHeader";
import { StatsCards } from "./components/StatsCards";
import { PackageFiltersToolbar } from "./components/PackageFiltersToolbar";
import { PackageTable } from "./components/PackageTable";
import { PackagePaginationControls } from "./components/PackagePaginationControls";
import { PackageModal } from "./components/PackageModal";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { Card, CardContent } from "@repo/ui/card";

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
  rejectionReason?: string;
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
        const updateData = { ...formData } as any;
        if (selectedPackage.status === 'disapproved') {
          updateData.status = 'pending';
        }
        await updatePackage({
          packageId: selectedPackage._id,
          ...updateData,
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
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader onCreateClick={() => handleOpenModal("create")} />

        <StatsCards packages={packages} />

        <PackageFiltersToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddPackage={() => handleOpenModal("create")}
        />

        <div className="flex-1 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              <PackageTable
                packages={packages}
                staff={staff}
                searchTerm={searchTerm}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onViewClick={(pkg) => handleOpenModal("view", pkg)}
                onEditClick={(pkg) => handleOpenModal("edit", pkg)}
                onDeleteClick={handleDeleteClick}
              />
            </CardContent>
          </Card>
        </div>

        <PackagePaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil(packages.filter((pkg: WeddingPackage) =>
            pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
          ).length / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          totalItems={packages.filter((pkg: WeddingPackage) =>
            pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
          ).length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        <PackageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          modalType={modalType}
          formData={formData}
          onFormDataChange={setFormData}
          services={services}
          staff={staff}
          staffLoading={staffLoading}
          staffError={staffError}
          newService={newService}
          onNewServiceChange={setNewService}
          selectedStaffForAdd={selectedStaffForAdd}
          onSelectedStaffChange={setSelectedStaffForAdd}
          onSubmit={handleSubmit}
          onImageUpload={handleImageUpload}
          onAddService={handleAddService}
          onRemoveService={handleRemoveService}
          onQuantityChange={handleQuantityChange}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          packageName={selectedPackage?.name}
          onConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}