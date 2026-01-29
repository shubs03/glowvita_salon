
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useGetAddOnsQuery, useCreateAddOnMutation, useUpdateAddOnMutation, useDeleteAddOnMutation, useGetVendorServicesQuery } from "@repo/store/api";
import { toast } from 'sonner';
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { Search, Plus } from "lucide-react";

// Import new components
import AddOnsFiltersToolbar from "./components/AddOnsFiltersToolbar";
import AddOnsTable from "./components/AddOnsTable";
import AddOnsPaginationControls from "./components/AddOnsPaginationControls";
import AddOnsFormModal from "./components/AddOnsFormModal";
import AddOnsDeleteModal from "./components/AddOnsDeleteModal";

export default function AddOnsPage() {
    const { user } = useCrmAuth();
    const vendorId = user?._id;
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const { data, isLoading, refetch } = useGetAddOnsQuery(undefined, { skip: !vendorId });
    const { data: servicesData, isLoading: isServicesLoading } = useGetVendorServicesQuery(vendorId, { skip: !vendorId });
    const [createAddOn, { isLoading: isCreating }] = useCreateAddOnMutation();
    const [updateAddOn, { isLoading: isUpdating }] = useUpdateAddOnMutation();
    const [deleteAddOn, { isLoading: isDeleting }] = useDeleteAddOnMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingAddOn, setEditingAddOn] = useState<any>(null);
    const [addOnToDelete, setAddOnToDelete] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        duration: "",
        status: "active",
        services: [] as string[],
    });

    const [modalType, setModalType] = useState<"add" | "edit" | "view">("add");

    const addOns = data?.addOns || [];
    const services = servicesData?.services || [];

    const filteredAddOns = useMemo(() => {
        return addOns.filter((addon: any) =>
            addon.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (statusFilter === "all" || addon.status === statusFilter)
        );
    }, [addOns, searchTerm, statusFilter]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredAddOns.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredAddOns.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Modal handlers
    const handleOpenModal = (
        type: "add" | "edit" | "view",
        addon?: any
    ) => {
        setModalType(type);
        setEditingAddOn(addon || null);
        
        if (type === 'add') {
          setFormData({
            name: "",
            price: "",
            duration: "",
            status: "active",
            services: [] as string[],
          });
        } else if (addon) {
          setFormData({
            name: addon.name,
            price: String(addon.price),
            duration: String(addon.duration),
            status: addon.status,
            services: addon.services || (addon.service ? [addon.service] : []),
          });
        }
        
        setIsModalOpen(true);
    };




    const handleSave = async () => {
        if (formData.services.length === 0) {
            toast.error("Please select at least one service for this add-on");
            return;
        }

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                duration: Number(formData.duration),
            };

            console.log("Add-ons Page - Saving payload:", JSON.stringify(payload, null, 2));

            if (editingAddOn) {
                console.log("Add-ons Page - Updating add-on:", editingAddOn._id);
                const result = await updateAddOn({ ...payload, _id: editingAddOn._id }).unwrap();
                console.log("Add-ons Page - Update successful:", result);
                toast.success("Add-on updated successfully");
            } else {
                console.log("Add-ons Page - Creating new add-on");
                const result = await createAddOn(payload).unwrap();
                console.log("Add-ons Page - Create successful:", result);
                toast.success("Add-on created successfully");
            }
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error("Add-ons Page - Save error:", error);
            toast.error("Failed to save add-on");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAddOn(addOnToDelete._id).unwrap();
            toast.success("Add-on deleted successfully");
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error("Failed to delete add-on");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Enhanced Header Section */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                    Add-Ons
                  </h1>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                    Manage your add-ons and track services
                  </p>
                </div>
              </div>
            </div>

            {/* Add-Ons Filters Toolbar */}
            <AddOnsFiltersToolbar
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={(value: string) => setSearchTerm(value)}
                onStatusChange={(value: string) => setStatusFilter(value)}
                onAddNew={() => handleOpenModal('add')}
            />

            <Card>
                <CardContent className="p-0">
                    {/* Add-Ons Table */}
                    <AddOnsTable
                        addOns={addOns}
                        services={services}
                        isLoading={isLoading}
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        currentItems={currentItems}
                        onOpenModal={handleOpenModal}
                        onOpenDeleteModal={(addon) => {
                            setAddOnToDelete(addon);
                            setIsDeleteModalOpen(true);
                        }}
                    />

                    {/* Add-Ons Pagination Controls */}
                    <AddOnsPaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredAddOns.length}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        hasItems={filteredAddOns.length > 0}
                    />
                </CardContent>
            </Card>

            {/* Add-Ons Form Modal */}
            <AddOnsFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingAddOn={editingAddOn}
                formData={formData}
                setFormData={setFormData}
                services={services}
                onSave={handleSave}
                isProcessing={isCreating || isUpdating}
                modalType={modalType}
            />

            {/* Add-Ons Delete Modal */}
            <AddOnsDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDelete}
                addonToDelete={addOnToDelete}
                isProcessing={isDeleting}
            />
        </div>
    );
}
