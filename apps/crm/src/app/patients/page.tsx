
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Plus, Search, FileDown, Eye, Edit, Trash2, Users, UserPlus, UserX, HeartPulse } from 'lucide-react';
import { Label } from '@repo/ui/label';

type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastConsultation: string;
  totalConsultations: number;
  status: 'Active' | 'Inactive' | 'New';
};

const mockPatients: Patient[] = [
  { id: 'PAT-001', name: 'Alex Johnson', email: 'alex@example.com', phone: '123-456-7890', lastConsultation: '2024-08-15', totalConsultations: 3, status: 'Active' },
  { id: 'PAT-002', name: 'Samantha Miller', email: 'samantha@example.com', phone: '234-567-8901', lastConsultation: '2024-07-20', totalConsultations: 5, status: 'Active' },
  { id: 'PAT-003', name: 'Michael Chen', email: 'michael@example.com', phone: '345-678-9012', lastConsultation: '2024-05-10', totalConsultations: 2, status: 'Inactive' },
  { id: 'PAT-004', name: 'Emily Davis', email: 'emily@example.com', phone: '456-789-0123', lastConsultation: '2024-08-20', totalConsultations: 1, status: 'New' },
];

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>(mockPatients);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const filteredPatients = useMemo(() => {
        return patients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm)
        );
    }, [patients, searchTerm]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredPatients.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    const handleOpenModal = (patient?: Patient) => {
        setSelectedPatient(patient || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if(selectedPatient) {
            setPatients(patients.filter(c => c.id !== selectedPatient.id));
            setIsDeleteModalOpen(false);
            setSelectedPatient(null);
        }
    };
    
    const getStatusColor = (status: Patient['status']) => {
        switch (status) {
          case 'Active': return 'bg-green-100 text-green-800';
          case 'Inactive': return 'bg-gray-100 text-gray-800';
          case 'New': return 'bg-blue-100 text-blue-800';
          default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Patient Management</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patients.length}</div>
                        <p className="text-xs text-muted-foreground">+5 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Patients (30d)</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patients.filter(p => p.status === 'New').length}</div>
                        <p className="text-xs text-muted-foreground">New patients this month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
                        <HeartPulse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patients.reduce((acc, p) => acc + p.totalConsultations, 0)}</div>
                        <p className="text-xs text-muted-foreground">All-time consultations</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Patients</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{patients.filter(p => p.status === 'Inactive').length}</div>
                        <p className="text-xs text-muted-foreground">No recent consultations</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle>All Patients</CardTitle>
                            <CardDescription>View, add, and manage your patient list.</CardDescription>
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
                                Add Patient
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
                                    <TableHead>Last Consultation</TableHead>
                                    <TableHead>Total Consultations</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map(patient => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-medium">{patient.name}</TableCell>
                                        <TableCell>
                                            <div>{patient.email}</div>
                                            <div className="text-sm text-muted-foreground">{patient.phone}</div>
                                        </TableCell>
                                        <TableCell>{patient.lastConsultation}</TableCell>
                                        <TableCell>{patient.totalConsultations}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.status)}`}>
                                                {patient.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(patient)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(patient)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(patient)}>
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
                        totalItems={filteredPatients.length}
                    />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
                        <DialogDescription>
                            {selectedPatient ? 'Update the details for this patient.' : 'Enter the details for the new patient.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" defaultValue={selectedPatient?.name || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={selectedPatient?.email || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" type="tel" defaultValue={selectedPatient?.phone || ''} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Patient?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedPatient?.name}"? This action cannot be undone.
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
