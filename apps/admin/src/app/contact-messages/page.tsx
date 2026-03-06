"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { Skeleton } from "@repo/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Eye, Trash2, Mail, Phone, User, MessageSquare, Clock, CheckCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type ContactMessage = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    status: "new" | "read" | "replied";
    createdAt: string;
    updatedAt: string;
};

const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    read: "bg-yellow-100 text-yellow-800",
    replied: "bg-green-100 text-green-800",
};

const STATUS_LABELS: Record<string, string> = {
    new: "New",
    read: "Read",
    replied: "Replied",
};

const ITEMS_PER_PAGE = 15;

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const [filterStatus, setFilterStatus] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                status: filterStatus,
                page: String(currentPage),
                limit: String(itemsPerPage),
            });
            const res = await fetch(`/api/admin/contacts?${params}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setMessages(data.messages || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch {
            toast.error("Failed to load contact messages.");
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleView = async (msg: ContactMessage) => {
        setViewMessage(msg);
        setIsViewOpen(true);
        // Auto-mark as read when opened
        if (msg.status === "new") {
            await updateStatus(msg._id, "read");
        }
    };

    const updateStatus = async (id: string, status: string) => {
        setIsUpdatingStatus(id);
        try {
            const res = await fetch("/api/admin/contacts", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            if (!res.ok) throw new Error("Failed to update");
            setMessages((prev) =>
                prev.map((m) => (m._id === id ? { ...m, status: status as ContactMessage["status"] } : m))
            );
            if (viewMessage && viewMessage._id === id) {
                setViewMessage((prev) => prev ? { ...prev, status: status as ContactMessage["status"] } : prev);
            }
            toast.success(`Status updated to "${STATUS_LABELS[status]}"`);
        } catch {
            toast.error("Failed to update status.");
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await fetch("/api/admin/contacts", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: deleteTarget._id }),
            });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Message deleted successfully.");
            setIsDeleteOpen(false);
            setDeleteTarget(null);
            fetchMessages();
        } catch {
            toast.error("Failed to delete message.");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const statsNew = messages.filter((m) => m.status === "new").length;
    const statsRead = messages.filter((m) => m.status === "read").length;
    const statsReplied = messages.filter((m) => m.status === "replied").length;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Contact Messages</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">New Messages</p>
                                <p className="text-3xl font-bold text-blue-600">{statsNew}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">Read</p>
                                <p className="text-3xl font-bold text-yellow-600">{statsRead}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">Replied</p>
                                <p className="text-3xl font-bold text-green-600">{statsReplied}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCheck className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>All Contact Submissions</CardTitle>
                            <CardDescription>Messages sent through the Contact Us form on the website.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setCurrentPage(1); }}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="replied">Replied</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" onClick={fetchMessages} title="Refresh">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-8 w-20 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Message</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {messages.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                    No contact messages found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            messages.map((msg) => (
                                                <TableRow key={msg._id} className={msg.status === "new" ? "bg-blue-50/50" : ""}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                <User className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-sm">
                                                                    {msg.firstName} {msg.lastName}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Mail className="w-3 h-3" />
                                                                {msg.email}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Phone className="w-3 h-3" />
                                                                {msg.phone}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs">
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(msg.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[msg.status]}`}
                                                        >
                                                            {STATUS_LABELS[msg.status]}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="View message"
                                                                onClick={() => handleView(msg)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Delete message"
                                                                className="text-destructive"
                                                                onClick={() => { setDeleteTarget(msg); setIsDeleteOpen(true); }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
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
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                                totalItems={total}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            {/* View Modal */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Contact Message</DialogTitle>
                        <DialogDescription>Full details of this contact submission.</DialogDescription>
                    </DialogHeader>
                    {viewMessage && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-3 pb-3 border-b">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-base">
                                        {viewMessage.firstName} {viewMessage.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{formatDate(viewMessage.createdAt)}</p>
                                </div>
                                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[viewMessage.status]}`}>
                                    {STATUS_LABELS[viewMessage.status]}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-start gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium">{viewMessage.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="text-sm font-medium">{viewMessage.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                                <div className="bg-secondary/50 rounded-xl p-4 text-sm leading-relaxed">
                                    {viewMessage.message}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {["new", "read", "replied"].map((s) => (
                                        <Button
                                            key={s}
                                            size="sm"
                                            variant={viewMessage.status === s ? "default" : "outline"}
                                            disabled={isUpdatingStatus === viewMessage._id}
                                            onClick={() => updateStatus(viewMessage._id, s)}
                                        >
                                            {STATUS_LABELS[s]}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Message?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the message from{" "}
                            <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
