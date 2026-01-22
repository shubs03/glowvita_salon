"use client";

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Skeleton } from "@repo/ui/skeleton";
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select } from '@repo/ui/select';
import { Plus, Search, FileDown, Eye, Edit, Trash2, Users, UserPlus, UserX, ShoppingBag, Calendar, User, Star, CreditCard, Package, PieChart, MessageCircle, Clock, Scissors, UserCheck, FileText, Timer, Briefcase, CheckCircle, AlertTriangle, Copy, FileSpreadsheet, Printer, Download } from 'lucide-react';
import { useGetClientsQuery, useCreateClientMutation, useUpdateClientMutation, useDeleteClientMutation, useGetAppointmentsQuery } from '@repo/store/api';
import { toast } from 'sonner';
import { useCrmAuth } from '@/hooks/useCrmAuth';

type Client = {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    birthdayDate: string;
    gender: 'Male' | 'Female' | 'Other';
    country: string;
    occupation: string;
    profilePicture?: string;
    address: string;
    preferences?: string;
    lastVisit: string;
    totalBookings: number;
    totalSpent: number;
    status: 'Active' | 'Inactive' | 'New';
    createdAt?: string;
    updatedAt?: string;
};

// Helper function to format dates for display
const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not provided';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

export default function ClientsPage() {
    const { user } = useCrmAuth();
    // Fetch offline clients
    const { data: offlineClients = [], isLoading: isOfflineLoading, isError: isOfflineError, refetch: refetchOffline } = useGetClientsQuery({
        search: '',
        status: '',
        page: 1,
        limit: 100,
        source: 'offline'
    }, {
        skip: !user?._id,
    });

    // Fetch online clients
    const { data: onlineClients = [], isLoading: isOnlineLoading, isError: isOnlineError, refetch: refetchOnline } = useGetClientsQuery({
        search: '',
        status: '',
        page: 1,
        limit: 100,
        source: 'online'
    }, {
        skip: !user?._id,
    });
    const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
    const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
    const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    // Segment tabs: offline (existing data) and online (future data)
    const [clientSegment, setClientSegment] = useState<'offline' | 'online'>('offline');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileClient, setProfileClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [appointmentTab, setAppointmentTab] = useState('upcoming');
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [selectedClientForAppointment, setSelectedClientForAppointment] = useState<Client | null>(null);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);

    // Export functions
    const getDataForExport = () => {
        return filteredClients.map((client: Client) => ({
            'Name': client.fullName,
            'Email': client.email,
            'Phone': client.phone,
            'Birthday': formatDateForDisplay(client.birthdayDate),
            'Last Visit': formatDateForDisplay(client.lastVisit),
            'Total Bookings': bookingsById.get(String(client._id)) || 0,
            'Total Spent': (totalsById.get(String(client._id)) || 0).toFixed(2),
            'Status': client.status
        }));
    };

    const exportToExcel = () => {
        const data = getDataForExport();
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Clients");
        XLSX.writeFile(wb, "clients_list.xlsx");
    };

    const exportToCSV = () => {
        const data = getDataForExport();
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "clients_list.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = async () => {
        // Fallback to basic window print for PDF as html2canvas on complex tables is unreliable
        // Creating a downloadable PDF from client-side without a dedicated PDF library for data (like jspdf-autotable) is tricky
        // We will repurpose the print view which users can Save as PDF
        printTable();
    };

    const copyToClipboard = () => {
        const data = getDataForExport();
        if (data.length === 0) {
            toast.info('No data to copy');
            return;
        }

        // Create TSV (Tab Separated Values)
        const headers = Object.keys(data[0]);
        const tsv = [
            headers.join('\t'),
            ...data.map((row: any) => headers.map(header => row[header as keyof typeof row]).join('\t'))
        ].join('\n');

        navigator.clipboard.writeText(tsv).then(() => {
            toast.success('Client data copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast.error('Failed to copy data.');
        });
    };

    const printTable = () => {
        const data = getDataForExport();
        if (data.length === 0) {
            toast.info('No data to print');
            return;
        }

        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            const headers = Object.keys(data[0]);

            const htmlContent = `
                <html>
                <head>
                    <title>Clients List</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        h1 { color: #333; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { bg-color: #f2f2f2; font-weight: bold; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                    </style>
                </head>
                <body>
                    <h1>Clients List</h1>
                    <table>
                        <thead>
                            <tr>
                                ${headers.map(h => `<th>${h}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map((row: any) => `
                                <tr>
                                    ${headers.map(h => `<td>${row[h as keyof typeof row] || ''}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            // Wait for styles to load (though they are inline here)
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }
    };

    const handleExport = (format: string) => {
        switch (format) {
            case 'excel':
                exportToExcel();
                break;
            case 'csv':
                exportToCSV();
                break;
            case 'pdf':
                exportToPDF();
                break;
            case 'copy':
                copyToClipboard();
                break;
            case 'print':
                printTable();
                break;
            default:
                break;
        }
    };

    // Appointment form state
    const [appointmentData, setAppointmentData] = useState({
        date: '',
        startTime: '',
        service: '',
        duration: '',
        staffMember: '',
        notes: ''
    });

    // Form state
    const [formData, setFormData] = useState<{
        fullName: string;
        email: string;
        phone: string;
        birthdayDate: string;
        gender: 'Male' | 'Female' | 'Other' | '';
        country: string;
        occupation: string;
        profilePicture: string;
        address: string;
        preferences: string;
    }>({
        fullName: '',
        email: '',
        phone: '',
        birthdayDate: '',
        gender: '',
        country: '',
        occupation: '',
        profilePicture: '',
        address: '',
        preferences: ''
    });

    // Combine clients based on selected segment
    const combinedClients = useMemo(() => {
        if (clientSegment === 'online') {
            return onlineClients;
        }
        return offlineClients;
    }, [offlineClients, onlineClients, clientSegment]);

    const filteredClients = useMemo(() => {
        if (!combinedClients) return [];
        return combinedClients.filter((client: Client) =>
            client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm)
        );
    }, [combinedClients, searchTerm]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredClients.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    // Fetch appointments for this vendor (pass vendorId so backend can filter)
    const vendorId = user?.vendorId || user?._id;
    const { data: appointmentsResponse, isLoading: isLoadingAppointments } = useGetAppointmentsQuery({ vendorId });

    // Normalize appointments into an array regardless of API shape
    const appointments: any[] = useMemo(() => {
        const r: any = appointmentsResponse;
        if (Array.isArray(r)) return r;
        if (Array.isArray(r?.data)) return r.data;
        if (Array.isArray(r?.appointments)) return r.appointments;
        if (Array.isArray(r?.data?.appointments)) return r.data.appointments;
        return [];
    }, [appointmentsResponse]);

    // Compute bookings and totals per client strictly by client ID
    const { bookingsById, totalsById } = useMemo(() => {
        const countsById = new Map<string, number>();
        const totalsById = new Map<string, number>();

        (appointments || []).forEach((appt: any) => {
            const rawClientId = appt?.client?._id ?? appt?.client ?? appt?.clientId ?? appt?.client_id;
            const clientId = rawClientId != null ? String(rawClientId) : '';
            if (!clientId) return; // count only when appointment has a client ID

            const amount = Number(appt?.totalAmount ?? appt?.amount ?? appt?.price ?? 0) || 0;

            countsById.set(clientId, (countsById.get(clientId) || 0) + 1);

            // Only count towards total sales/spent if the appointment is completed
            if (appt.status === 'completed') {
                totalsById.set(clientId, (totalsById.get(clientId) || 0) + amount);
            }
        });

        return { bookingsById: countsById, totalsById };
    }, [appointments]);

    const handleOpenModal = (client?: Client) => {
        if (client) {
            // Format the birthday date for the date input (YYYY-MM-DD)
            let birthdayDateFormatted = '';
            if (client.birthdayDate) {
                try {
                    const date = new Date(client.birthdayDate);
                    // Check if the date is valid
                    if (!isNaN(date.getTime())) {
                        birthdayDateFormatted = date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.error('Error formatting birthday date:', e);
                }
            }

            setFormData({
                fullName: client.fullName,
                email: client.email,
                phone: client.phone,
                birthdayDate: birthdayDateFormatted,
                gender: client.gender,
                country: client.country,
                occupation: client.occupation,
                profilePicture: client.profilePicture || '',
                address: client.address,
                preferences: client.preferences || ''
            });
        } else {
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                birthdayDate: '',
                gender: '',
                country: '',
                occupation: '',
                profilePicture: '',
                address: '',
                preferences: ''
            });
        }
        setSelectedClient(client || null);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            // Allow only digits and limit to 10 characters
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, phone: digitsOnly }));
            return;
        }
        if (name === 'fullName') {
            // Allow only letters and spaces
            const lettersAndSpaces = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({ ...prev, fullName: lettersAndSpaces }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedFormats.includes(file.type)) {
                toast.error('Invalid file format. Only JPG, JPEG, PNG, and WEBP are allowed.');
                e.target.value = ''; // Reset input
                return;
            }

            // Validate file size (500KB = 500 * 1024 bytes)
            const maxSize = 500 * 1024; // 500 KB
            if (file.size > maxSize) {
                toast.error('File size exceeds 500 KB. Please choose a smaller image.');
                e.target.value = ''; // Reset input
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveClient = async () => {
        try {
            // Validate Full Name: required and only letters/spaces
            if (!formData.fullName || formData.fullName.trim().length === 0) {
                toast.error('Full name is required.');
                return;
            }
            if (formData.fullName.trim().length < 2) {
                toast.error('Full name must be at least 2 characters long.');
                return;
            }

            // Validate Email: required and must contain @
            if (!formData.email || formData.email.trim().length === 0) {
                toast.error('Email address is required.');
                return;
            }
            if (!formData.email.includes('@')) {
                toast.error('Email must contain @ symbol.');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                toast.error('Please enter a valid email address.');
                return;
            }

            // Validate phone: exactly 10 digits
            if (!formData.phone || formData.phone.trim().length !== 10) {
                toast.error('Phone number must be exactly 10 digits.');
                return;
            }

            const gender = (formData.gender as 'Male' | 'Female' | 'Other') || 'Other';

            const clientData = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                birthdayDate: formData.birthdayDate,
                gender: gender,
                country: formData.country.trim(),
                occupation: formData.occupation.trim(),
                profilePicture: formData.profilePicture,
                address: formData.address.trim(),
                preferences: formData.preferences.trim()
            };

            if (selectedClient) {
                // Update existing client
                await updateClient({ _id: selectedClient._id, ...clientData }).unwrap();
                toast.success("Client updated successfully.");
            } else {
                // Create new client
                await createClient(clientData).unwrap();
                toast.success("Client created successfully.");
            }

            refetchOffline();
            setIsModalOpen(false);
        } catch (err: any) {
            const errorMessage = err?.data?.message || "Failed to save client.";
            toast.error(errorMessage);
        }
    };

    const handleDeleteClick = (client: Client) => {
        setSelectedClient(client);
        setIsDeleteModalOpen(true);
    };



    const handleNameClick = (client: Client) => {
        setProfileClient(client);
        setIsProfileModalOpen(true);
        setActiveTab('overview');
    };

    const handleAddAppointment = (client?: Client) => {
        if (client) {
            setSelectedClientForAppointment(client);
        }
        setIsNewAppointmentModalOpen(true);
    };

    const handleSelectClientForAppointment = (client: Client) => {
        setSelectedClientForAppointment(client);
        setClientSearchTerm('');
    };

    const handleRemoveSelectedClient = () => {
        setSelectedClientForAppointment(null);
    };

    const handleAppointmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAppointmentData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAppointment = () => {
        if (!selectedClientForAppointment) {
            alert('Please select a client for the appointment');
            return;
        }
        // Here you would typically save the appointment to your backend
        console.log('Saving appointment:', {
            ...appointmentData,
            clientId: selectedClientForAppointment._id,
            clientName: selectedClientForAppointment.fullName
        });

        // Reset form
        setAppointmentData({
            date: '',
            startTime: '',
            service: '',
            duration: '',
            staffMember: '',
            notes: ''
        });
        setSelectedClientForAppointment(null);
        setIsNewAppointmentModalOpen(false);
        alert('Appointment saved successfully!');
    };

    const filteredClientsForAppointment = useMemo(() => {
        // Use combinedClients for search functionality
        const allClients = [...offlineClients, ...onlineClients];
        return allClients.filter((client: Client) =>
            client.fullName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
            client.phone.includes(clientSearchTerm)
        );
    }, [offlineClients, onlineClients, clientSearchTerm]);

    const handleConfirmDelete = async () => {
        if (selectedClient) {
            try {
                await deleteClient(selectedClient._id).unwrap();
                toast.success("Client deleted successfully.");
                refetchOffline();
            } catch (err: any) {
                const errorMessage = err?.data?.message || "Failed to delete client.";
                toast.error(errorMessage);
            } finally {
                setIsDeleteModalOpen(false);
                setSelectedClient(null);
            }
        }
    };

    const getStatusColor = (status: Client['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Inactive': return 'bg-gray-100 text-gray-800';
            case 'New': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isOfflineLoading || isOnlineLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-5 w-80" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                    <Skeleton className="h-4 w-24" />
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Skeleton className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <Skeleton className="h-3 w-32" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-white to-blue-50 border-b border-blue-100">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <Skeleton className="h-6 w-32 mb-2" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    <div className="relative">
                                        <Skeleton className="h-10 w-80" />
                                    </div>
                                    <Skeleton className="h-10 w-24" />
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-lg" ref={tableRef}>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {["Client", "Contact", "Last Visit", "Bookings", "Status", "Actions"].map((_, i) => (
                                                <TableHead key={i}>
                                                    <Skeleton className="h-5 w-full" />
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...Array(5)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="w-10 h-10 rounded-full" />
                                                        <div>
                                                            <Skeleton className="h-5 w-32 mb-1" />
                                                            <Skeleton className="h-4 w-24" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-full mb-1" />
                                                    <Skeleton className="h-4 w-28" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-20" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-8" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-16 rounded-full" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Skeleton className="h-8 w-8 rounded" />
                                                        <Skeleton className="h-8 w-8 rounded" />
                                                        <Skeleton className="h-8 w-8 rounded" />
                                                        <Skeleton className="h-8 w-8 rounded" />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isOfflineError || isOnlineError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        <p>Error loading clients data</p>
                    </div>
                    <Button onClick={() => { refetchOffline(); refetchOnline(); }} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-headline mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Client Management</h1>
                    <p className="text-gray-600">Manage your salon clients and track their appointments</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Total Clients</CardTitle>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{offlineClients.length + onlineClients.length}</div>
                            <p className="text-xs text-green-600 font-medium">+2 from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">New Clients (30d)</CardTitle>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <UserPlus className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{[...offlineClients, ...onlineClients].filter((c: Client) => c.status === 'New').length}</div>
                            <p className="text-xs text-gray-500">New clients this month</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Total Bookings</CardTitle>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <ShoppingBag className="h-4 w-4 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                            <p className="text-xs text-gray-500">All time bookings</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-700">Inactive Clients</CardTitle>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <UserX className="h-4 w-4 text-red-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{[...offlineClients, ...onlineClients].filter((c: Client) => c.status === 'Inactive').length}</div>
                            <p className="text-xs text-gray-500">Clients with no recent activity</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-white to-blue-50 border-b border-blue-100">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">All Clients</CardTitle>
                                <CardDescription className="text-gray-600">View, add, and manage your client list.</CardDescription>
                            </div>
                            <div className="flex gap-3 flex-wrap items-center">
                                {/* Segment Tabs */}
                                <div className="flex items-center rounded-md border border-blue-200 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => { setClientSegment('offline'); setCurrentPage(1); }}
                                        className={`px-3 py-2 text-sm font-medium ${clientSegment === 'offline' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
                                    >
                                        Offline Clients
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setClientSegment('online'); setCurrentPage(1); }}
                                        className={`px-3 py-2 text-sm font-medium border-l ${clientSegment === 'online' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
                                    >
                                        Online Customers
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name, email, or phone..."
                                        className="w-full md:w-80 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-700">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleExport('copy')}>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('csv')}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('print')}>
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg" onClick={() => handleOpenModal()}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Client
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/80">
                                    <TableRow className="border-gray-100">
                                        <TableHead className="font-semibold text-gray-700">Name</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Birthday</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Last Visit</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Total Bookings</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Total Spent</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems.map((client: Client, index: number) => (
                                        <TableRow key={client._id} className={`border-gray-100 hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                            <TableCell className="font-medium flex items-center gap-3 py-4">
                                                <div className="relative">
                                                    <img


                                                        src={client.profilePicture || `https://placehold.co/40x40.png?text=${client.fullName[0]}`}
                                                        alt={client.fullName}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                    />
                                                    <div className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white ${client.status === 'Active' ? 'bg-green-500' : client.status === 'New' ? 'bg-blue-500' : 'bg-gray-400'
                                                        }`}></div>
                                                </div>
                                                <button
                                                    onClick={() => handleNameClick(client)}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-semibold transition-colors"
                                                >
                                                    {client.fullName}
                                                </button>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="text-gray-900 font-medium">{client.email}</div>
                                                <div className="text-sm text-gray-500">{client.phone}</div>
                                            </TableCell>
                                            <TableCell className="py-4 text-gray-700">
                                                {formatDateForDisplay(client.birthdayDate)}
                                            </TableCell>
                                            <TableCell className="py-4 text-gray-700">
                                                {formatDateForDisplay(client.lastVisit)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                                    {bookingsById.get(String(client._id)) || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 font-semibold text-green-600">₹{(
                                                totalsById.get(String(client._id)) || 0
                                            ).toFixed(2)}</TableCell>
                                            <TableCell className="py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${client.status === 'Active'
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : client.status === 'New'
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                    }`}>
                                                    {client.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600" onClick={() => handleNameClick(client)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600" onClick={() => handleOpenModal(client)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100 text-red-600" onClick={() => handleDeleteClick(client)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                            <Pagination
                                className=""
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={setItemsPerPage}
                                totalItems={filteredClients.length}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                        <DialogDescription>
                            {selectedClient ? 'Update the details for this client.' : 'Enter the details for the new client.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Profile Picture */}
                        <div className="space-y-2">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <p className="text-sm font-medium text-gray-700 text-center mb-2">Profile Photo</p>
                                    <input
                                        id="profilePicture"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="profilePicture"
                                        className="cursor-pointer block"
                                    >
                                        <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-200 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-blue-50">
                                            {formData.profilePicture ? (
                                                <img
                                                    src={formData.profilePicture}
                                                    alt="Profile preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                    <span className="text-xs text-gray-500">Add Photo</span>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                    {formData.profilePicture && (
                                        <div className="absolute -top-1 -right-1">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, profilePicture: '' }))}
                                                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors duration-200"
                                                title="Remove photo"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                Allowed: JPG, JPEG, PNG, WEBP • Max size: 500 KB
                            </p>
                        </div>

                        {/* Full Name and Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone and Birthday */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    inputMode="numeric"
                                    pattern="\d{10}"
                                    maxLength={10}
                                    placeholder="Enter 10-digit phone number"
                                    title="Phone number must be exactly 10 digits"
                                    onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birthdayDate">Birthday Date</Label>
                                <Input
                                    id="birthdayDate"
                                    name="birthdayDate"
                                    type="date"
                                    value={formData.birthdayDate}
                                    onChange={handleInputChange}
                                    placeholder="Select birthday (optional)"
                                />
                            </div>
                        </div>

                        {/* Gender and Country */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={(e) => handleSelectChange('gender', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:border-blue-500"
                                >
                                    <option value="">Select Gender (optional)</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder="e.g., India (optional)"
                                />
                            </div>
                        </div>

                        {/* Occupation */}
                        <div className="space-y-2">
                            <Label htmlFor="occupation">Occupation</Label>
                            <Input
                                id="occupation"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleInputChange}
                                placeholder="e.g., Software Engineer (optional)"
                            />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter full address (optional)"
                                rows={3}
                            />
                        </div>
                        {/* Preferences */}
                        <div className="space-y-2">
                            <Label htmlFor="preferences">Notes</Label>
                            <Textarea
                                id="preferences"
                                name="preferences"
                                value={formData.preferences}
                                onChange={handleInputChange}
                                placeholder="Enter any client preferences or notes (optional)"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveClient} disabled={isCreating || isUpdating}>
                            {isCreating || isUpdating ? 'Saving...' : selectedClient ? 'Update Client' : 'Save Client'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>



            {/* New Appointment Modal */}
            <Dialog open={isNewAppointmentModalOpen} onOpenChange={setIsNewAppointmentModalOpen}>
                <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col p-0 sm:w-[90vw] md:w-[85vw] lg:max-w-6xl">
                    <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-blue-100">
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            </div>
                            New Appointment
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 mt-2 text-sm sm:text-base">
                            Schedule a new appointment for your client with detailed information and service selection
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                        {/* Left Side - Appointment Details */}
                        <div className="w-full lg:w-3/5 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r bg-gray-50/30 overflow-y-auto">
                            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-md flex items-center justify-center">
                                        <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                                    </div>
                                    Appointment Details
                                </h3>

                                <div className="space-y-4 sm:space-y-6">
                                    {/* Date and Start Time */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date" className="text-sm font-semibold text-gray-700">Select Date</Label>
                                            <Input
                                                id="date"
                                                name="date"
                                                type="date"
                                                value={appointmentData.date}
                                                onChange={handleAppointmentInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 sm:h-12"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="startTime" className="text-sm font-semibold text-gray-700">Start Time</Label>
                                            <Input
                                                id="startTime"
                                                name="startTime"
                                                type="time"
                                                value={appointmentData.startTime}
                                                onChange={handleAppointmentInputChange}
                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 sm:h-12"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Service */}
                                    <div className="space-y-2">
                                        <Label htmlFor="service" className="text-sm font-semibold text-gray-700">Service</Label>
                                        <select
                                            id="service"
                                            name="service"
                                            value={appointmentData.service}
                                            onChange={handleAppointmentInputChange}
                                            className="flex h-10 sm:h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Service</option>
                                            <option value="haircut">Haircut</option>
                                            <option value="styling">Hair Styling</option>
                                            <option value="coloring">Hair Coloring</option>
                                            <option value="facial">Facial Treatment</option>
                                            <option value="manicure">Manicure</option>
                                            <option value="pedicure">Pedicure</option>
                                            <option value="massage">Massage</option>
                                            <option value="makeup">Makeup</option>
                                        </select>
                                    </div>

                                    {/* Duration */}
                                    <div className="space-y-2">
                                        <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">Duration</Label>
                                        <select
                                            id="duration"
                                            name="duration"
                                            value={appointmentData.duration}
                                            onChange={handleAppointmentInputChange}
                                            className="flex h-10 sm:h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Duration</option>
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="90">1.5 hours</option>
                                            <option value="120">2 hours</option>
                                            <option value="150">2.5 hours</option>
                                            <option value="180">3 hours</option>
                                        </select>
                                    </div>

                                    {/* Staff Members */}
                                    <div className="space-y-2">
                                        <Label htmlFor="staffMember" className="text-sm font-semibold text-gray-700">Staff Member</Label>
                                        <select
                                            id="staffMember"
                                            name="staffMember"
                                            value={appointmentData.staffMember}
                                            onChange={handleAppointmentInputChange}
                                            className="flex h-10 sm:h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Staff Member</option>
                                            <option value="sarah">Sarah Johnson - Hair Stylist</option>
                                            <option value="mike">Mike Davis - Barber</option>
                                            <option value="emma">Emma Wilson - Beautician</option>
                                            <option value="alex">Alex Brown - Massage Therapist</option>
                                            <option value="lisa">Lisa Garcia - Nail Technician</option>
                                        </select>
                                    </div>

                                    {/* Appointment Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Appointment Notes</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            value={appointmentData.notes}
                                            onChange={handleAppointmentInputChange}
                                            placeholder="Add any special notes, requests, or preferences..."
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px] sm:min-h-[100px]"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Client Selection */}
                        <div className="w-full lg:w-2/5 p-4 sm:p-6 flex flex-col bg-white">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 rounded-md flex items-center justify-center">
                                    <UserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600" />
                                </div>
                                Client Selection
                            </h3>

                            {/* Search Box */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search clients by name, email, or phone..."
                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        value={clientSearchTerm}
                                        onChange={(e) => setClientSearchTerm(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                    />
                                </div>
                            </div>

                            {/* Selected Client Display */}
                            {selectedClientForAppointment && (
                                <div className="mb-4">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <img
                                                    src={selectedClientForAppointment.profilePicture || `https://placehold.co/40x40.png?text=${selectedClientForAppointment.fullName[0]}`}
                                                    alt={selectedClientForAppointment.fullName}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{selectedClientForAppointment.fullName}</p>
                                                    <p className="text-xs text-gray-600">{selectedClientForAppointment.phone}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveSelectedClient}
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Show when search is focused or has content */}
                            {(isSearchFocused || clientSearchTerm) && (
                                <div className="space-y-3">
                                    {/* Add New Client Button */}
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsSearchFocused(false);
                                            handleOpenModal();
                                        }}
                                        className="w-full border-gray-300 hover:bg-gray-50 text-sm h-10"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New Client
                                    </Button>

                                    {/* Client List */}
                                    <div className="space-y-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                                        {filteredClientsForAppointment.map((client: Client) => (
                                            <div
                                                key={client._id}
                                                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${selectedClientForAppointment?._id === client._id
                                                    ? 'bg-blue-50 border-blue-300 shadow-md'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                                onClick={() => {
                                                    handleSelectClientForAppointment(client);
                                                    setIsSearchFocused(false);
                                                }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={client.profilePicture || `https://placehold.co/32x32.png?text=${client.fullName[0]}`}
                                                        alt={client.fullName}
                                                        className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 text-sm">{client.fullName}</p>
                                                        <p className="text-xs text-gray-600">{client.phone}</p>
                                                    </div>
                                                    {selectedClientForAppointment?._id === client._id && (
                                                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {filteredClientsForAppointment.length === 0 && (
                                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                <p className="font-medium text-sm">No clients found</p>
                                                <p className="text-xs">Try adjusting your search</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Save Appointment Button */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <Button
                                    onClick={handleSaveAppointment}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg h-12 text-base font-semibold"
                                    disabled={!selectedClientForAppointment || !appointmentData.date || !appointmentData.startTime || !appointmentData.service}
                                >
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Save Appointment
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Client Profile Modal */}
            <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col p-0 sm:w-[90vw] md:w-[85vw] lg:max-w-6xl">
                    {profileClient && (
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <img
                                            src={profileClient.profilePicture || `https://placehold.co/80x80.png?text=${profileClient.fullName[0]}`}
                                            alt={profileClient.fullName}
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 sm:border-3 border-white shadow-lg"
                                        />
                                        <div>
                                            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{profileClient.fullName}</h2>
                                            <p className="text-sm sm:text-base text-gray-600">{profileClient.email}</p>
                                        </div>
                                    </div>
                                    {/* {activeTab !== 'payment-history' && (
                                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base" onClick={() => handleAddAppointment(profileClient)}>
                                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                            Add Appointment
                                        </Button>
                                    )} */}
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex flex-1 overflow-hidden">
                                {/* Sidebar */}
                                <div className="w-20 sm:w-32 md:w-48 lg:w-64 bg-gray-50 border-r overflow-y-auto flex-shrink-0">
                                    <div className="p-2 sm:p-3 md:p-4">
                                        <div className="flex flex-col space-y-1">
                                            {[
                                                { id: 'overview', label: 'Overview', icon: PieChart },
                                                { id: 'client-details', label: 'Client Details', icon: User },
                                                { id: 'appointments', label: 'Appointments', icon: Calendar },
                                                { id: 'orders', label: 'Orders', icon: Package },
                                                { id: 'reviews', label: 'Reviews', icon: Star },
                                                { id: 'payment-history', label: 'Payment History', icon: CreditCard }
                                            ].map((tab) => {
                                                const IconComponent = tab.icon;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={`w-full text-left px-1 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeTab === tab.id
                                                            ? 'bg-blue-100 text-blue-700 border-l-2 sm:border-l-4 border-blue-500'
                                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col sm:flex-row items-center sm:items-start">
                                                            <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 mb-1 sm:mb-0 sm:mr-2" />
                                                            <span className="text-xs sm:text-sm leading-tight text-center sm:text-left">
                                                                <span className="block sm:hidden">{tab.label.split(' ')[0]}</span>
                                                                <span className="hidden sm:block md:hidden">{tab.label.length > 8 ? tab.label.split(' ')[0] : tab.label}</span>
                                                                <span className="hidden md:block">{tab.label}</span>
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
                                    {activeTab === 'overview' && (
                                        <div className="space-y-3 sm:space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Overview</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                                                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow text-center">
                                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">₹{(
                                                        totalsById.get(String(profileClient._id)) || 0
                                                    ).toFixed(2)}</div>
                                                    <div className="text-xs sm:text-xs md:text-sm text-gray-500 font-medium">Total Sale</div>
                                                </div>
                                                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow text-center">
                                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{bookingsById.get(String(profileClient._id)) || 0}</div>
                                                    <div className="text-xs sm:text-xs md:text-sm text-gray-500 font-medium">Total Visits</div>
                                                </div>
                                                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow text-center">
                                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                                                        {(appointments || []).filter((appt: any) => {
                                                            const rawClientId = appt?.client?._id ?? appt?.client ?? appt?.clientId ?? appt?.client_id;
                                                            return String(rawClientId || '') === String(profileClient?._id) && appt?.status === 'completed';
                                                        }).length}
                                                    </div>
                                                    <div className="text-xs sm:text-xs md:text-sm text-gray-500 font-medium">Completed</div>
                                                </div>
                                                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow text-center">
                                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-red-600 mb-1 sm:mb-2">
                                                        {(appointments || []).filter((appt: any) => {
                                                            const rawClientId = appt?.client?._id ?? appt?.client ?? appt?.clientId ?? appt?.client_id;
                                                            return String(rawClientId || '') === String(profileClient?._id) && appt?.status === 'cancelled';
                                                        }).length}
                                                    </div>
                                                    <div className="text-xs sm:text-xs md:text-sm text-gray-500 font-medium">Cancelled</div>
                                                </div>

                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'client-details' && (
                                        <div className="space-y-3 sm:space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Client Details</h3>

                                            {/* Unified Client Information */}
                                            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                                    <div>
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Full Name</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1">{profileClient.fullName}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Email ID</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1 break-all">{profileClient.email}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Mobile Number</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1">{profileClient.phone}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Gender</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1">{profileClient.gender || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Country</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1">{profileClient.country || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Occupation</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1">{profileClient.occupation || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Online Booking</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1">Allowed</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Birthday Date</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1">{profileClient.birthdayDate ? new Date(profileClient.birthdayDate).toLocaleDateString() : 'Not provided'}</p>
                                                    </div>
                                                    <div className="col-span-1 md:col-span-2">
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Address</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1">{profileClient.address || 'Not provided'}</p>
                                                    </div>
                                                    <div className="col-span-1 md:col-span-2">
                                                        <Label className="text-xs md:text-sm font-medium text-gray-500">Preferences</Label>
                                                        <p className="text-sm md:text-base text-gray-900 mt-1">{profileClient.preferences || 'No preferences recorded.'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'appointments' && (
                                        <div className="space-y-3 sm:space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Appointments</h3>

                                            {/* Horizontal Tabs */}
                                            {(() => {
                                                const clientAppts = (appointments || []).filter((appt: any) => {
                                                    const rawClientId = appt?.client?._id ?? appt?.client ?? appt?.clientId ?? appt?.client_id;
                                                    return String(rawClientId || '') === String(profileClient._id);
                                                });

                                                const now = new Date();
                                                const upcoming = clientAppts.filter((appt: any) => {
                                                    const d = new Date(appt?.date || appt?.appointmentDate || 0);
                                                    // Set appointment time if available to compare accurately
                                                    if (appt.startTime) {
                                                        const [hours, minutes] = appt.startTime.split(':');
                                                        d.setHours(parseInt(hours), parseInt(minutes));
                                                    }
                                                    return d > now;
                                                }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                                                const past = clientAppts.filter((appt: any) => {
                                                    const d = new Date(appt?.date || appt?.appointmentDate || 0);
                                                    if (appt.startTime) {
                                                        const [hours, minutes] = appt.startTime.split(':');
                                                        d.setHours(parseInt(hours), parseInt(minutes));
                                                    }
                                                    return d <= now;
                                                }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                                return (
                                                    <div className="bg-white rounded-lg border">
                                                        <div className="border-b border-gray-200">
                                                            <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 px-2 sm:px-3 md:px-4" aria-label="Tabs">
                                                                <button
                                                                    onClick={() => setAppointmentTab('upcoming')}
                                                                    className={`whitespace-nowrap py-2 sm:py-3 md:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${appointmentTab === 'upcoming'
                                                                        ? 'border-blue-500 text-blue-600'
                                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                                        }`}
                                                                >
                                                                    Upcoming ({upcoming.length})
                                                                </button>
                                                                <button
                                                                    onClick={() => setAppointmentTab('past')}
                                                                    className={`whitespace-nowrap py-2 sm:py-3 md:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${appointmentTab === 'past'
                                                                        ? 'border-blue-500 text-blue-600'
                                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                                        }`}
                                                                >
                                                                    Past ({past.length})
                                                                </button>
                                                            </nav>
                                                        </div>

                                                        <div className="p-3 sm:p-4">
                                                            {appointmentTab === 'upcoming' && (
                                                                <div>
                                                                    {upcoming.length > 0 ? (
                                                                        <div className="space-y-2 sm:space-y-3">
                                                                            {upcoming.map((appt: any, i: number) => (
                                                                                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded gap-2 sm:gap-0 border border-gray-100 hover:border-blue-200 transition-colors">
                                                                                    <div>
                                                                                        <p className="font-medium text-sm sm:text-base text-gray-900">{appt?.serviceName || appt?.service?.name || 'Service'}</p>
                                                                                        <div className="flex gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                                                                                            <span>{new Date(appt.date).toLocaleDateString()}</span>
                                                                                            <span>•</span>
                                                                                            <span>{appt.startTime}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                                                                                        <p className="font-medium text-sm sm:text-base text-gray-900">₹{Number(appt?.totalAmount ?? appt?.amount ?? 0).toFixed(2)}</p>
                                                                                        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                                                                                            {appt.status || 'Scheduled'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center py-6 sm:py-8">
                                                                            <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                                                            <p className="text-gray-500 text-sm">No upcoming appointments</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {appointmentTab === 'past' && (
                                                                <div>
                                                                    {past.length > 0 ? (
                                                                        <div className="space-y-2 sm:space-y-3">
                                                                            {past.map((appt: any, i: number) => (
                                                                                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded gap-2 sm:gap-0 border border-gray-100">
                                                                                    <div>
                                                                                        <p className="font-medium text-sm sm:text-base text-gray-900">{appt?.serviceName || appt?.service?.name || 'Service'}</p>
                                                                                        <div className="flex gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                                                                                            <span>{new Date(appt.date).toLocaleDateString()}</span>
                                                                                            <span>•</span>
                                                                                            <span>{appt.startTime}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                                                                                        <p className="font-medium text-sm sm:text-base text-gray-900">₹{Number(appt?.totalAmount ?? appt?.amount ?? 0).toFixed(2)}</p>
                                                                                        <span className={`inline-block mt-1 text-xs px-2 py-1 rounded capitalize ${appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                                            appt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                                                            }`}>
                                                                                            {appt.status || 'Completed'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center py-6 sm:py-8">
                                                                            <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                                                            <p className="text-gray-500 text-sm">No past appointments</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {activeTab === 'orders' && (
                                        <div className="space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Orders</h3>

                                            <div className="bg-white p-3 sm:p-4 rounded-lg border">
                                                <div className="text-center py-6 sm:py-8">
                                                    <div className="flex justify-center mb-3 sm:mb-4">
                                                        <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
                                                    </div>
                                                    <p className="text-gray-500 text-sm sm:text-base">No orders yet</p>
                                                    <p className="text-xs sm:text-sm text-gray-400 mt-2">Orders will appear here once the client makes a purchase</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'reviews' && (
                                        <div className="space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Reviews</h3>

                                            <div className="bg-white p-3 sm:p-4 rounded-lg border">
                                                <div className="text-center py-6 sm:py-8">
                                                    <div className="flex justify-center mb-3 sm:mb-4">
                                                        <Star className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
                                                    </div>
                                                    <p className="text-gray-500 text-sm sm:text-base">No reviews yet</p>
                                                    <p className="text-xs sm:text-sm text-gray-400 mt-2">Reviews will appear here once the client leaves feedback</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'payment-history' && (
                                        <div className="space-y-6 h-full flex flex-col pr-2" style={{ maxHeight: '65vh', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                                            {/* Total Stats Card */}
                                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden shrink-0 transition-transform hover:scale-[1.01] duration-300">
                                                <div className="relative z-10 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-emerald-100 font-medium mb-1 text-xs uppercase tracking-wide">Total Payment</p>
                                                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">₹{(totalsById.get(String(profileClient._id)) || 0).toFixed(2)}</h3>
                                                    </div>
                                                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner">
                                                        <CreditCard className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                {/* Decorative circles */}
                                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                                <div className="absolute -left-6 -top-6 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl"></div>
                                            </div>

                                            {/* Transaction List */}
                                            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                                                        <Clock className="w-4 h-4 text-emerald-600" />
                                                        Transaction History
                                                    </h4>
                                                </div>

                                                <div className="overflow-y-auto p-2 sm:p-4 space-y-3 flex-1" style={{ scrollbarWidth: 'thin' }}>
                                                    {(() => {
                                                        const items = (appointments || [])
                                                            .filter((appt: any) => {
                                                                const rawClientId = appt?.client?._id ?? appt?.client ?? appt?.clientId ?? appt?.client_id;
                                                                return String(rawClientId || '') === String(profileClient._id) && appt?.status === 'completed';
                                                            })
                                                            .sort((a: any, b: any) => {
                                                                const ad = new Date(a?.date || a?.createdAt || 0).getTime();
                                                                const bd = new Date(b?.date || b?.createdAt || 0).getTime();
                                                                return bd - ad; // newest first
                                                            });

                                                        if (items.length === 0) {
                                                            return (
                                                                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-gray-50/50">
                                                                        <FileText className="w-8 h-8 text-gray-300" />
                                                                    </div>
                                                                    <p className="text-gray-900 font-medium">No payment history</p>
                                                                    <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">Transactions for completed appointments will be listed here.</p>
                                                                </div>
                                                            );
                                                        }

                                                        return items.map((appt: any, idx: number) => {
                                                            const rawDate = appt?.date || appt?.createdAt || '';
                                                            const d = rawDate ? new Date(rawDate) : null;
                                                            const dateStr = d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                                                            const timeStr = appt?.startTime || (d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
                                                            const amount = Number(appt?.totalAmount ?? appt?.amount ?? appt?.price ?? 0) || 0;
                                                            const serviceName = appt?.serviceName || appt?.service?.name || 'Appointment';

                                                            return (
                                                                <div key={appt?._id || appt?.id || idx} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white hover:bg-emerald-50/30 border border-gray-100 rounded-xl transition-all duration-200 hover:shadow-sm">
                                                                    <div className="flex gap-4 items-center">
                                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 group-hover:bg-emerald-200 group-hover:text-emerald-700 transition-colors">
                                                                            <CheckCircle className="w-5 h-5" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-gray-900">{serviceName}</p>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <p className="text-xs text-gray-500 font-medium">{dateStr}</p>
                                                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                                <p className="text-xs text-gray-500">{timeStr}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-left sm:text-right mt-3 sm:mt-0 pl-14 sm:pl-0">
                                                                        <div className="flex items-center sm:justify-end gap-2">
                                                                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Paid</span>
                                                                            <p className="font-bold text-gray-900 text-lg">₹{amount.toFixed(2)}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Client?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedClient?.fullName}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
