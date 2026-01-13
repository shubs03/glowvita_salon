
"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Check,
} from "lucide-react";
import { Checkbox } from "@repo/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import {
    useGetAddOnsQuery,
    useCreateAddOnMutation,
    useUpdateAddOnMutation,
    useDeleteAddOnMutation,
    useGetVendorServicesQuery,
} from "@repo/store/api";
import { toast } from 'sonner';
import { useCrmAuth } from "@/hooks/useCrmAuth";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/select";
import { Pagination } from "@repo/ui/pagination";

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

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        duration: "",
        status: "active",
        services: [] as string[],
    });

    const addOns = data?.addOns || [];
    const services = servicesData?.services || [];

    const filteredAddOns = useMemo(() => {
        return addOns.filter((addon: any) =>
            addon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [addOns, searchTerm]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredAddOns.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredAddOns.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleOpenModal = (addon: any = null) => {
        if (addon) {
            setEditingAddOn(addon);
            setFormData({
                name: addon.name,
                price: String(addon.price),
                duration: String(addon.duration),
                status: addon.status,
                services: addon.services || (addon.service ? [addon.service] : []),
            });
        } else {
            setEditingAddOn(null);
            setFormData({
                name: "",
                price: "",
                duration: "",
                status: "active",
                services: [],
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
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Add-Ons Management</h1>
                    <p className="text-muted-foreground">Manage the add-ons associated with your services.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search add-ons..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Add-On
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Mapped Service</TableHead>
                                    <TableHead>Price (₹)</TableHead>
                                    <TableHead>Duration (min)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : currentItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No add-ons found</TableCell>
                                    </TableRow>
                                ) : (
                                    currentItems.map((addon: any) => (
                                        <TableRow key={addon._id}>
                                            <TableCell className="font-medium">{addon.name}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {addon.services && addon.services.length > 0 ? (
                                                        addon.services.map((serviceId: any) => {
                                                            const service = services.find((s: any) => String(s._id) === String(serviceId));
                                                            return service ? (
                                                                <Badge key={String(serviceId)} variant="outline" className="text-[10px]">
                                                                    {service.name}
                                                                </Badge>
                                                            ) : null;
                                                        })
                                                    ) : addon.service ? (
                                                        // Fallback for older data
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {services.find((s: any) => String(s._id) === String(addon.service))?.name || "Not mapped"}
                                                        </Badge>
                                                    ) : "Not mapped"}
                                                </div>
                                            </TableCell>
                                            <TableCell>₹{addon.price}</TableCell>
                                            <TableCell>{addon.duration} min</TableCell>
                                            <TableCell>
                                                <Badge variant={addon.status === "active" ? "default" : "secondary"}>
                                                    {addon.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(addon)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                                                    setAddOnToDelete(addon);
                                                    setIsDeleteModalOpen(true);
                                                }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredAddOns.length > 0 && (
                        <Pagination
                            className="mt-4 p-4 border-t"
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={filteredAddOns.length}
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingAddOn ? "Edit Add-On" : "Add New Add-On"}</DialogTitle>
                        <DialogDescription>
                            Enter the details for the add-on.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" className="col-span-3" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price (₹)</Label>
                            <Input id="price" type="number" className="col-span-3" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">Duration (min)</Label>
                            <Input id="duration" type="number" className="col-span-3" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                        </div>
                        <div className="space-y-4">
                            <Label>Mapped Services</Label>
                            <div className="grid grid-cols-2 gap-4 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                                {services.map((service: any) => (
                                    <div key={String(service._id)} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`service-${service._id}`}
                                            checked={formData.services.includes(String(service._id))}
                                            onCheckedChange={(checked) => {
                                                const serviceId = String(service._id);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    services: checked
                                                        ? [...prev.services, serviceId]
                                                        : prev.services.filter(id => id !== serviceId)
                                                }));
                                            }}
                                        />
                                        <label
                                            htmlFor={`service-${service._id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {service.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isCreating || isUpdating || !formData.name}>
                            {isCreating || isUpdating ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this add-on? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
