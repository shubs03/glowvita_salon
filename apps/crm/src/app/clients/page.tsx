
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Plus, Search, FileDown, Eye, Edit, Trash2, Users, UserPlus, UserX, ShoppingBag } from 'lucide-react';

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  totalBookings: number;
  totalSpent: number;
  status: 'Active' | 'Inactive' | 'New';
};

const mockClients: Client[] = [
  { id: 'CUST-001', name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', lastVisit: '2024-08-15', totalBookings: 5, totalSpent: 850, status: 'Active' },
  { id: 'CUST-002', name: 'Bob Williams', email: 'bob@example.com', phone: '234-567-8901', lastVisit: '2024-07-20', totalBookings: 8, totalSpent: 1200, status: 'Active' },
  { id: 'CUST-003', name: 'Charlie Brown', email: 'charlie@example.com', phone: '345-678-9012', lastVisit: '2024-06-10', totalBookings: 2, totalSpent: 300, status: 'Inactive' },
  { id: 'CUST-004', name: 'Diana Prince', email: 'diana@example.com', phone: '456-789-0123', lastVisit: '2024-08-20', totalBookings: 1, totalSpent: 250, status: 'New' },
];

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>(mockClients);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const filteredClients = useMemo(() => {
        return clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm)
        );
    }, [clients, searchTerm]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredClients.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    const handleOpenModal = (client?: Client) => {
        setSelectedClient(client || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (client: Client) => {
        setSelectedClient(client);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if(selectedClient) {
            setClients(clients.filter(c => c.id !== selectedClient.id));
            setIsDeleteModalOpen(false);
            setSelectedClient(null);
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

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Client Management</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clients.length}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Clients (30d)</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clients.filter(c => c.status === 'New').length}</div>
                        <p className="text-xs text-muted-foreground">New clients this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clients.reduce((acc, c) => acc + c.totalBookings, 0)}</div>
                        <p className="text-xs text-muted-foreground">All time bookings</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Clients</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{clients.filter(c => c.status === 'Inactive').length}</div>
                        <p className="text-xs text-muted-foreground">Clients with no recent activity</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle>All Clients</CardTitle>
                            <CardDescription>View, add, and manage your client list.</CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    type="search" 
                                    placeholder="Search by name, email, or phone..."
                                    className="w-full md:w-80 pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline">
                                <FileDown className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                            <Button onClick={() => handleOpenModal()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Client
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Last Visit</TableHead>
                                    <TableHead>Total Bookings</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map(client => (
                                    <TableRow key={client.id}>
                                        <TableCell className="font-medium">{client.name}</TableCell>
                                        <TableCell>
                                            <div>{client.email}</div>
                                            <div className="text-sm text-muted-foreground">{client.phone}</div>
                                        </TableCell>
                                        <TableCell>{client.lastVisit}</TableCell>
                                        <TableCell>{client.totalBookings}</TableCell>
                                        <TableCell>₹{client.totalSpent.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                                                {client.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(client)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(client)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(client)}>
                                                <Trash2 className="h-4 w-4" />
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
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                        totalItems={filteredClients.length}
                    />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                        <DialogDescription>
                            {selectedClient ? 'Update the details for this client.' : 'Enter the details for the new client.'}
                        </DialogDescription>
                    </DialogHeader>
                    {/* Add form here */}
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Client?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedClient?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
