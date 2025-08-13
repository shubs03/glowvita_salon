
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@repo/ui/dialog';
import { CheckCircle, Eye, XCircle, Trash2, User, ThumbsUp, Hourglass, BarChart, Plus, FileDown, X } from 'lucide-react';
import { Badge } from '@repo/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';

const doctorsData = [
  {
    id: "DOC-001",
    name: "Dr. Evelyn Reed",
    registrationTimestamp: "2024-05-10T10:00:00Z",
    clinicName: "Serenity Skin Clinic",
    registrationVia: "Admin",
    subscriptionStatus: "Active",
    category: "Dermatologist",
    status: "Approved",
  },
  {
    id: "DOC-002",
    name: "Dr. Samuel Pierce",
    registrationTimestamp: "2024-06-15T14:30:00Z",
    clinicName: "Holistic Health Center",
    registrationVia: "Agent",
    subscriptionStatus: "Inactive",
    category: "Homeopath",
    status: "Pending",
  },
  {
    id: "DOC-003",
    name: "Dr. Chloe Bennet",
    registrationTimestamp: "2024-07-01T09:00:00Z",
    clinicName: "Radiant Dermatology",
    registrationVia: "Admin",
    subscriptionStatus: "Active",
    category: "Dermatologist",
    status: "Approved",
  },
  {
    id: "DOC-004",
    name: "Dr. Marcus Thorne",
    registrationTimestamp: "2024-07-20T11:45:00Z",
    clinicName: "",
    registrationVia: "Agent",
    subscriptionStatus: "Pending",
    category: "Trichologist",
    status: "Rejected",
  },
  {
    id: "DOC-005",
    name: "Dr. Isabella Vance",
    registrationTimestamp: "2024-08-01T16:00:00Z",
    clinicName: "Vance Aesthetics",
    registrationVia: "Admin",
    subscriptionStatus: "Active",
    category: "Aesthetic Dermatologist",
    status: "Pending",
  },
];

type Doctor = typeof doctorsData[0];
type ActionType = 'approve' | 'reject' | 'delete';

export default function DoctorsDermatsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isNewDoctorModalOpen, setIsNewDoctorModalOpen] = useState(false);
    const [isSpecializationModalOpen, setIsSpecializationModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [actionType, setActionType] = useState<ActionType | null>(null);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = doctorsData.slice(firstItemIndex, lastItemIndex);

    const totalPages = Math.ceil(doctorsData.length / itemsPerPage);

    const handleActionClick = (doctor: Doctor, action: ActionType) => {
        setSelectedDoctor(doctor);
        setActionType(action);
        setIsModalOpen(true);
    };

    const handleViewClick = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsViewModalOpen(true);
    };
    
    const handleConfirmAction = () => {
        if (selectedDoctor && actionType) {
            console.log(`Performing ${actionType} on doctor ${selectedDoctor.name}`);
            // API call logic would go here
        }
        setIsModalOpen(false);
        setSelectedDoctor(null);
        setActionType(null);
    };

    const getModalContent = () => {
        if (!actionType || !selectedDoctor) return { title: '', description: '', buttonText: '' };
        switch (actionType) {
            case 'approve':
                return {
                    title: 'Approve Doctor?',
                    description: `Are you sure you want to approve the registration for "${selectedDoctor.name}"?`,
                    buttonText: 'Approve'
                };
            case 'reject':
                return {
                    title: 'Reject Doctor?',
                    description: `Are you sure you want to reject the registration for "${selectedDoctor.name}"? This action cannot be undone.`,
                    buttonText: 'Reject'
                };
            case 'delete':
                 return {
                    title: 'Delete Doctor?',
                    description: `Are you sure you want to permanently delete the registration for "${selectedDoctor.name}"? This action is irreversible.`,
                    buttonText: 'Delete'
                };
            default:
                return { title: '', description: '', buttonText: '' };
        }
    };

    const { title, description, buttonText } = getModalContent();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Doctors & Dermatologists</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Doctors</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">62</div>
            <p className="text-xs text-muted-foreground">Ready for consultations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">12</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Business</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,231.89</div>
            <p className="text-xs text-muted-foreground">+12.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registrations">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="registrations">Doctor Registrations</TabsTrigger>
            <TabsTrigger value="business">Business Generated</TabsTrigger>
        </TabsList>
        <TabsContent value="registrations">
            <Card>
              <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                          <CardTitle>Manage Registrations</CardTitle>
                          <CardDescription>Verify and manage doctor profiles.</CardDescription>
                      </div>
                      <div className="flex gap-2">
                          <Button onClick={() => setIsNewDoctorModalOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add New Doctor
                          </Button>
                          <Button onClick={() => setIsSpecializationModalOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Specialization
                          </Button>
                          <Button variant="outline">
                              <FileDown className="mr-2 h-4 w-4" />
                              Export List
                          </Button>
                      </div>
                  </div>
              </CardHeader>
              <CardContent>
                  <div className="mb-6 p-4 rounded-lg bg-secondary">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <Button variant="ghost" size="sm">
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Input type="text" placeholder="Filter by Doctor Name..." />
                            <Input type="text" placeholder="Filter by Clinic Name..." />
                            <Input type="text" placeholder="Filter by Category..." />
                            <Input type="text" placeholder="Filter by Agent..." />
                        </div>
                    </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr. No</TableHead>
                        <TableHead>Doctor's Name</TableHead>
                        <TableHead>Registration Time</TableHead>
                        <TableHead>Clinic Name</TableHead>
                        <TableHead>Registered Via</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((doctor, index) => (
                        <TableRow key={doctor.id}>
                            <TableCell>{firstItemIndex + index + 1}</TableCell>
                            <TableCell className="font-medium">{doctor.name}</TableCell>
                            <TableCell>{new Date(doctor.registrationTimestamp).toLocaleString()}</TableCell>
                            <TableCell>{doctor.clinicName || 'N/A'}</TableCell>
                            <TableCell>{doctor.registrationVia}</TableCell>
                            <TableCell>
                                <Badge variant={doctor.subscriptionStatus === 'Active' ? 'default' : 'secondary'}>
                                {doctor.subscriptionStatus}
                                </Badge>
                            </TableCell>
                            <TableCell>{doctor.category}</TableCell>
                            <TableCell>
                               <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    doctor.status === "Approved" ? "bg-green-100 text-green-800" :
                                    doctor.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {doctor.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleViewClick(doctor)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View Details</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleActionClick(doctor, 'approve')}>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="sr-only">Approve</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleActionClick(doctor, 'reject')}>
                                    <XCircle className="h-4 w-4 text-orange-600" />
                                    <span className="sr-only">Reject</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleActionClick(doctor, 'delete')}>
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
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={doctorsData.length}
                />
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="business">
             <Card>
                <CardHeader>
                    <CardTitle>Business Generated</CardTitle>
                    <CardDescription>Analytics on revenue from doctor consultations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Charts and detailed reports on business generated will be here.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
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
                    <DialogTitle>Doctor Details: {selectedDoctor?.name}</DialogTitle>
                </DialogHeader>
                {selectedDoctor && (
                    <div className="grid gap-4 py-4 text-sm">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-semibold text-muted-foreground">Doctor ID</span>
                            <span className="col-span-2">{selectedDoctor.id}</span>
                        </div>
                         <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-semibold text-muted-foreground">Clinic</span>
                            <span className="col-span-2">{selectedDoctor.clinicName || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-semibold text-muted-foreground">Category</span>
                            <span className="col-span-2">{selectedDoctor.category}</span>
                        </div>
                         <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-semibold text-muted-foreground">Registered At</span>
                            <span className="col-span-2">{new Date(selectedDoctor.registrationTimestamp).toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-semibold text-muted-foreground">Registered By</span>
                            <span className="col-span-2">{selectedDoctor.registrationVia}</span>
                        </div>
                         <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-semibold text-muted-foreground">Subscription</span>
                            <span className="col-span-2">{selectedDoctor.subscriptionStatus}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-semibold text-muted-foreground">Status</span>
                            <span className="col-span-2">{selectedDoctor.status}</span>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Add New Doctor Modal */}
        <Dialog open={isNewDoctorModalOpen} onOpenChange={setIsNewDoctorModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Doctor</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new doctor.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="doctor-name">Doctor Name</Label>
                        <Input id="doctor-name" placeholder="e.g., Dr. John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="clinic-name">Clinic Name</Label>
                        <Input id="clinic-name" placeholder="e.g., Sunrise Clinic" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact-no">Contact No.</Label>
                        <Input id="contact-no" type="tel" placeholder="e.g., 9876543210" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email-id">Email ID</Label>
                        <Input id="email-id" type="email" placeholder="e.g., john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reg-date">Registration Date</Label>
                        <Input id="reg-date" type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Select>
                            <SelectTrigger id="specialization">
                                <SelectValue placeholder="Select a specialization" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dermatologist">Dermatologist</SelectItem>
                                <SelectItem value="trichologist">Trichologist</SelectItem>
                                <SelectItem value="homeopath">Homeopath</SelectItem>
                                <SelectItem value="aesthetic-dermatologist">Aesthetic Dermatologist</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsNewDoctorModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Doctor</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Add New Specialization Modal */}
        <Dialog open={isSpecializationModalOpen} onOpenChange={setIsSpecializationModalOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Specialization</DialogTitle>
                    <DialogDescription>
                       Add a new specialization for doctors.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="spec-name">Specialization Name</Label>
                        <Input id="spec-name" placeholder="e.g., Cosmetologist" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="spec-desc">Description</Label>
                        <Textarea id="spec-desc" placeholder="A short description of the specialization." />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsSpecializationModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Specialization</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
