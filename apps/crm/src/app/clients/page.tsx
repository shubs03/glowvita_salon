"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Skeleton } from "@repo/ui/skeleton";
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select } from '@repo/ui/select';
import { Plus, Search, FileDown, Eye, Edit, Trash2, Users, UserPlus, UserX, ShoppingBag, Calendar, User, Star, CreditCard, Package, PieChart, MessageCircle, Clock, Scissors, UserCheck, FileText, Timer, Briefcase, CheckCircle, AlertTriangle } from 'lucide-react';
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
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewClient, setViewClient] = useState<Client | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileClient, setProfileClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [appointmentTab, setAppointmentTab] = useState('upcoming');
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [selectedClientForAppointment, setSelectedClientForAppointment] = useState<Client | null>(null);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
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
            totalsById.set(clientId, (totalsById.get(clientId) || 0) + amount);
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveClient = async () => {
        try {
            // Validate phone: exactly 10 digits
            if (!formData.phone || formData.phone.trim().length !== 10) {
                toast.error('Phone number must be exactly 10 digits.');
                return;
            }
            const gender = (formData.gender as 'Male' | 'Female' | 'Other') || 'Other';
            
            const clientData = {
                fullName: formData.fullName.trim(),
                // Email is optional; omit when empty
                email: formData.email.trim() || undefined,
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
    
    const handleViewClick = (client: Client) => {
        setViewClient(client);
        setIsViewModalOpen(true);
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
        if(selectedClient) {
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

    if(isOfflineLoading || isOnlineLoading) {
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
                            <div className="overflow-x-auto rounded-lg">
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

    if(isOfflineError || isOnlineError) {
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
                            <Button variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-700">
                                <FileDown className="mr-2 h-4 w-4" />
                                Export
                            </Button>
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
                                                <div className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white ${
                                                    client.status === 'Active' ? 'bg-green-500' : client.status === 'New' ? 'bg-blue-500' : 'bg-gray-400'
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
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                client.status === 'Active' 
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
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600" onClick={() => handleViewClick(client)}>
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
                                        accept="image/*"
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
                            <p className="text-xs text-gray-500 text-center">Click the circle to upload a photo</p>
                        </div>
                        
                        {/* Full Name and Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input 
                                    id="fullName" 
                                    name="fullName" 
                                    value={formData.fullName} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
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
                                    <option value="">Select Gender</option>
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
                                    placeholder="e.g., India"
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
                                placeholder="e.g., Software Engineer"
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
                                placeholder="Enter full address"
                                rows={3}
                            />
                        </div>
                        {/* Preferences */}
                        <div className="space-y-2">
                            <Label htmlFor="preferences">Nxotes</Label>
                            <Textarea
                                id="preferences"
                                name="preferences"
                                value={formData.preferences}
                                onChange={handleInputChange}
                                placeholder="Enter any client preferences or notes"
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

            {/* View Client Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0 border-b pb-3">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Eye className="w-3 h-3 text-blue-600" />
                            </div>
                            Client Profile
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 text-sm">
                            Profile information for {viewClient?.fullName}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {viewClient && (
                        <div className="flex-1 overflow-y-auto pr-1" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
                            <div className="space-y-6 py-3">
                                {/* Profile Header Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <img 
                                                src={viewClient.profilePicture || `https://placehold.co/80x80.png?text=${viewClient.fullName[0]}`} 
                                                alt={viewClient.fullName} 
                                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" 
                                            />
                                            <div className={`absolute -bottom-0 -right-0 w-4 h-4 rounded-full border-2 border-white ${
                                                viewClient.status === 'Active' ? 'bg-green-500' : viewClient.status === 'New' ? 'bg-blue-500' : 'bg-gray-400'
                                            }`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{viewClient.fullName}</h3>
                                            <p className="text-gray-600 mb-2">{viewClient.occupation}</p>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                viewClient.status === 'Active' 
                                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                                    : viewClient.status === 'New'
                                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                                    viewClient.status === 'Active' ? 'bg-green-500' : viewClient.status === 'New' ? 'bg-blue-500' : 'bg-gray-500'
                                                }`}></div>
                                                {viewClient.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Contact Information Card */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-3">
                                            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2">
                                                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</Label>
                                                <p className="text-sm text-gray-900 font-medium">{viewClient.email}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</Label>
                                                <p className="text-sm text-gray-900 font-medium">{viewClient.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Information Card */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-3">
                                            <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-2">
                                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-900">Personal Details</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Birthday</Label>
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {viewClient.birthdayDate ? new Date(viewClient.birthdayDate).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    }) : 'Not provided'}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</Label>
                                                <p className="text-sm text-gray-900 font-medium">{viewClient.gender || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Country</Label>
                                                <p className="text-sm text-gray-900 font-medium">{viewClient.country || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address and Occupation */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Address Card */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-3">
                                            <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-2">
                                                <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-900">Address</h4>
                                        </div>
                                        <p className="text-sm text-gray-900 leading-relaxed">{viewClient.address || 'Not provided'}</p>
                                    </div>

                                    {/* Business Information Card */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-3">
                                            <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center mr-2">
                                                <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0h8" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-900">Business Details</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Occupation</Label>
                                                <p className="text-sm text-gray-900 font-medium">{viewClient.occupation || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Visit</Label>
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {new Date(viewClient.lastVisit).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center mr-2">
                                            <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-900">Client Statistics</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <p className="text-2xl font-bold text-green-600">{bookingsById.get(String(viewClient._id)) || 0}</p>
                                            <p className="text-xs text-green-700 font-medium">Total Bookings</p>
                                        </div>
                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                            <p className="text-2xl font-bold text-blue-600">₹{(
                                                totalsById.get(String(viewClient._id)) || 0
                                            ).toFixed(2)}</p>
                                            <p className="text-xs text-blue-700 font-medium">Total Spent</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter className="flex-shrink-0 border-t pt-3 bg-gray-50 rounded-b-lg">
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsViewModalOpen(false)}
                            className="w-full sm:w-auto px-4 py-2 text-sm"
                        >
                            Close
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
                                    <div className="space-y-2 max-h-64 overflow-y-auto" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
                                        {filteredClientsForAppointment.map((client: Client) => (
                                            <div 
                                                key={client._id} 
                                                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                                    selectedClientForAppointment?._id === client._id 
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
                                                        className={`w-full text-left px-1 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                                                            activeTab === tab.id
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
                                        <div className="space-y-3 sm:space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
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
                                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{Math.floor((bookingsById.get(String(profileClient._id)) || 0) * 0.8)}</div>
                                                    <div className="text-xs sm:text-xs md:text-sm text-gray-500 font-medium">Completed</div>
                                                </div>
                                                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow text-center">
                                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{Math.floor((bookingsById.get(String(profileClient._id)) || 0) * 0.1)}</div>
                                                    <div className="text-xs sm:text-xs md:text-sm text-gray-500 font-medium">Cancelled</div>
                                                </div>
                                                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow text-center">
                                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">{Math.floor((bookingsById.get(String(profileClient._id)) || 0) * 0.1)}</div>
                                                    <div className="text-xs sm:text-xs md:text-sm text-gray-500 font-medium">No Show</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'client-details' && (
                                        <div className="space-y-3 sm:space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
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
                                        <div className="space-y-3 sm:space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
                                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Appointments</h3>
                                        
                                        {/* Horizontal Tabs */}
                                        <div className="bg-white rounded-lg border">
                                            <div className="border-b border-gray-200">
                                                <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 px-2 sm:px-3 md:px-4" aria-label="Tabs">
                                                    <button
                                                        onClick={() => setAppointmentTab('upcoming')}
                                                        className={`whitespace-nowrap py-2 sm:py-3 md:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                                                            appointmentTab === 'upcoming'
                                                                ? 'border-blue-500 text-blue-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        Upcoming (0)
                                                    </button>
                                                    <button
                                                        onClick={() => setAppointmentTab('past')}
                                                        className={`whitespace-nowrap py-2 sm:py-3 md:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                                                            appointmentTab === 'past'
                                                                ? 'border-blue-500 text-blue-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        Past ({bookingsById.get(String(profileClient._id)) || 0})
                                                    </button>
                                                </nav>
                                            </div>
                                            
                                            <div className="p-3 sm:p-4">
                                                {appointmentTab === 'upcoming' && (
                                                    <div>
                                                        <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No upcoming appointments</p>
                                                    </div>
                                                )}
                                                
                                                {appointmentTab === 'past' && (
                                                    <div>
                                                        {(bookingsById.get(String(profileClient._id)) || 0) > 0 ? (
                                                            <div className="space-y-2 sm:space-y-3">
                                                                {Array.from({ length: Math.min(bookingsById.get(String(profileClient._id)) || 0, 3) }, (_, i) => (
                                                                    <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded gap-2 sm:gap-0">
                                                                        <div>
                                                                            <p className="font-medium text-sm sm:text-base">Haircut & Styling</p>
                                                                            <p className="text-xs sm:text-sm text-gray-500">{new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                                                        </div>
                                                                        <div className="text-left sm:text-right">
                                                                            <p className="font-medium text-sm sm:text-base">₹{Math.floor(Math.random() * 500) + 200}</p>
                                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No past appointments</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    )}

                                    {activeTab === 'orders' && (
                                        <div className="space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Orders</h3>
                                        
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="bg-white p-3 sm:p-4 rounded-lg border">
                                                <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2 sm:gap-0">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">Order #851</h4>
                                                        <p className="text-xs sm:text-sm text-gray-500">23 Jun 2025 11:24AM</p>
                                                    </div>
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs self-start sm:self-auto">Completed</span>
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600">
                                                    <p>Items Qty: 1</p>
                                                    <p className="font-medium">Total: ₹120</p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-3 sm:p-4 rounded-lg border">
                                                <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2 sm:gap-0">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">Order #850</h4>
                                                        <p className="text-xs sm:text-sm text-gray-500">23 Jun 2025 10:58AM</p>
                                                    </div>
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs self-start sm:self-auto">Completed</span>
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600">
                                                    <p>Items Qty: 1</p>
                                                    <p className="font-medium">Total: ₹300</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    )}

                                    {activeTab === 'reviews' && (
                                        <div className="space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
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
                                        <div className="space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment History</h3>
                                        
                                        <div className="bg-white p-3 sm:p-4 rounded-lg border">
                                            <div className="mb-3 sm:mb-4">
                                                <h4 className="text-base sm:text-lg font-semibold text-gray-900">Total Payment</h4>
                                                <p className="text-xl sm:text-2xl font-bold text-green-600">₹{(
                                                    totalsById.get(String(profileClient._id)) || 0
                                                ).toFixed(2)}</p>
                                            </div>
                                            
                                            <div className="space-y-2 sm:space-y-3">
                                                {(() => {
                                                    const items = (appointments || [])
                                                        .filter((appt: any) => {
                                                            const rawClientId = appt?.client?._id ?? appt?.client ?? appt?.clientId ?? appt?.client_id;
                                                            return String(rawClientId || '') === String(profileClient._id);
                                                        })
                                                        .sort((a: any, b: any) => {
                                                            const ad = new Date(a?.date || a?.createdAt || 0).getTime();
                                                            const bd = new Date(b?.date || b?.createdAt || 0).getTime();
                                                            return bd - ad; // newest first
                                                        });

                                                    if (items.length === 0) {
                                                        return (
                                                            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No payment history</p>
                                                        );
                                                    }

                                                    return items.map((appt: any, idx: number) => {
                                                        const rawDate = appt?.date || appt?.createdAt || '';
                                                        const d = rawDate ? new Date(rawDate) : null;
                                                        const dateStr = d ? d.toLocaleDateString() : '';
                                                        const timeStr = appt?.startTime || (d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
                                                        const amount = Number(appt?.totalAmount ?? appt?.amount ?? appt?.price ?? 0) || 0;
                                                        const statusRaw = (appt?.paymentStatus || (appt?.status === 'completed' ? 'paid' : appt?.status || 'pending')) + '';
                                                        const status = statusRaw.toLowerCase();
                                                        const isPaid = status === 'paid' || appt?.status === 'completed';
                                                        const serviceName = appt?.serviceName || appt?.service?.name || 'Appointment';

                                                        return (
                                                            <div key={appt?._id || appt?.id || idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 rounded gap-2 sm:gap-0">
                                                                <div>
                                                                    <p className="text-xs sm:text-sm text-gray-500">{dateStr}</p>
                                                                    {timeStr && <p className="text-xs sm:text-sm text-gray-500">{timeStr}</p>}
                                                                    <p className="font-medium text-sm sm:text-base">{serviceName}</p>
                                                                </div>
                                                                <div className="text-left sm:text-right">
                                                                    <span className={`${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded text-xs`}>{isPaid ? 'paid' : status || 'pending'}</span>
                                                                    <p className={`font-bold mt-1 text-sm sm:text-base ${isPaid ? 'text-green-600' : 'text-gray-700'}`}>₹{amount.toFixed(2)}</p>
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