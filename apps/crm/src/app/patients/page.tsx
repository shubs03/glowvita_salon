"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetPatientsQuery, useCreatePatientMutation, useUpdatePatientMutation, useDeletePatientMutation } from '@repo/store/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Plus, Search, FileDown, Eye, Edit, Trash2, Users, UserPlus, UserX, HeartPulse } from 'lucide-react';
import { Toaster, toast } from 'sonner';

type Patient = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  lastConsultation?: string;
  totalConsultations?: number;
  status?: 'Active' | 'Inactive' | 'New';
  birthdayDate?: string;
  gender?: 'Male' | 'Female' | 'Other';
  country?: string;
  occupation?: string;
  profileImage?: string;
  address?: string;
  notes?: string;
};

export default function PatientsPage() {
    const { data: patients = [], isLoading, isError, refetch } = useGetPatientsQuery(void 0, { refetchOnMountOrArgChange: true });
    const [createPatient] = useCreatePatientMutation();
    const [updatePatient] = useUpdatePatientMutation();
    const [deletePatient] = useDeletePatientMutation();
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    
    // Form state for patient details
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        birthdayDate: '',
        gender: '',
        country: '',
        occupation: '',
        profileImage: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        refetch();
    }, [refetch]);

    const filteredPatients = useMemo(() => {
        return patients.filter((patient: Patient) => 
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm)
        );
    }, [patients, searchTerm]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredPatients.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    const handleOpenModal = (patient?: Patient, viewMode: boolean = false) => {
        if (patient) {
            setFormData({
                fullName: patient.name,
                email: patient.email,
                phone: patient.phone,
                birthdayDate: patient.birthdayDate || '',
                gender: patient.gender || '',
                country: patient.country || '',
                occupation: patient.occupation || '',
                profileImage: patient.profileImage || '',
                address: patient.address || '',
                notes: patient.notes || ''
            });
        } else {
            // Reset form data for new patient
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                birthdayDate: '',
                gender: '',
                country: '',
                occupation: '',
                profileImage: '',
                address: '',
                notes: ''
            });
        }
        setIsViewMode(viewMode);
        setSelectedPatient(patient || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if(selectedPatient) {
            try {
                await deletePatient(selectedPatient._id || selectedPatient.id).unwrap();
                setIsDeleteModalOpen(false);
                setSelectedPatient(null);
            } catch (error) {
                console.error('Failed to delete patient:', error);
                alert('Failed to delete patient');
            }
        }
    };
    
    // Handle form input changes
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

    // Handle select input changes
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file input changes for profile picture
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle saving patient data
    const handleSavePatient = async () => {
        // Validate required fields (all fields except address, occupation, notes, and profileImage)
        if (!formData.fullName || !formData.email || !formData.phone || !formData.birthdayDate || !formData.gender || !formData.country) {
            toast.error('Please fill in all required fields (marked with *).');
            return;
        }
        
        // Check for duplicate email or phone
        const existingPatient = patients.find((patient: Patient) => {
            if (selectedPatient) {
                // When editing, exclude the current patient from duplicate check
                return (patient._id !== selectedPatient._id && patient.id !== selectedPatient.id) && 
                       (patient.email === formData.email || patient.phone === formData.phone);
            }
            // When creating new patient, check against all existing patients
            return patient.email === formData.email || patient.phone === formData.phone;
        });
        
        if (existingPatient) {
            // Check which field is duplicate and show specific message
            if (existingPatient.email === formData.email) {
                toast.error('Email is already exist');
                return;
            }
            if (existingPatient.phone === formData.phone) {
                toast.error('Phone no is already exit');
                return;
            }
        }
        
        const patientData = {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            birthdayDate: formData.birthdayDate,
            gender: formData.gender,
            country: formData.country,
            occupation: formData.occupation,
            profileImage: formData.profileImage,
            address: formData.address,
            notes: formData.notes
        };
        
        try {
            if (selectedPatient) {
                // Update existing patient
                await updatePatient({ id: selectedPatient._id || selectedPatient.id, ...patientData }).unwrap();
                toast.success('Patient updated successfully!');
            } else {
                // Create new patient
                await createPatient(patientData).unwrap();
                toast.success('New patient created successfully!');
            }
            
            setIsModalOpen(false);
            // Reset form data
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                birthdayDate: '',
                gender: '',
                country: '',
                occupation: '',
                profileImage: '',
                address: '',
                notes: ''
            });
        } catch (error) {
            console.error('Failed to save patient:', error);
            toast.error('Failed to save patient. Please try again.');
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

    if (isLoading) {
        return <div className="p-4 sm:p-6 lg:p-8">Loading patients...</div>;
    }

    if (isError) {
        return <div className="p-4 sm:p-6 lg:p-8">Error loading patients. Please try again later.</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Toaster />
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
                        <div className="text-2xl font-bold">{patients.filter((p: Patient) => p.status === 'New').length}</div>
                        <p className="text-xs text-muted-foreground">New patients this month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
                        <HeartPulse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patients.reduce((acc: number, p: Patient) => acc + (p.totalConsultations || 0), 0)}</div>
                        <p className="text-xs text-muted-foreground">All-time consultations</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Patients</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{patients.filter((p: Patient) => p.status === 'Inactive').length}</div>
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
                                    <TableHead>Contact & Details</TableHead>
                                    <TableHead>Last Consultation</TableHead>
                                    <TableHead>Total Consultations</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map((patient: Patient) => (
                                    <TableRow key={patient._id || patient.id}>
                                        <TableCell className="font-medium">{patient.name}</TableCell>
                                        <TableCell>
                                            <div>{patient.email}</div>
                                            <div className="text-sm text-muted-foreground">{patient.phone}</div>
                                        </TableCell>
                                        <TableCell>{patient.lastConsultation ? new Date(patient.lastConsultation).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell>{patient.totalConsultations || 0}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.status)}`}>
                                                {patient.status || 'New'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(patient, true)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(patient, false)}>
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isViewMode ? 'View Patient' : selectedPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
                        <DialogDescription>
                            {isViewMode ? 'View the details for this patient.' : selectedPatient ? 'Update the details for this patient.' : 'Enter the details for the new patient.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {/* Profile Picture */}
                        <div className="space-y-2">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <p className="text-sm font-medium text-gray-700 text-center mb-2">Profile Photo</p>
                                    {isViewMode ? (
                                        <div className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                            {formData.profileImage ? (
                                                <img 
                                                    src={formData.profileImage} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <Users className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                    <span className="text-xs text-gray-500">No Photo</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <input 
                                                id="profileImage" 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                disabled={isViewMode}
                                            />
                                            <label 
                                                htmlFor="profileImage" 
                                                className={`cursor-pointer block ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-200 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-blue-50">
                                                    {formData.profileImage ? (
                                                        <img 
                                                            src={formData.profileImage} 
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
                                            {formData.profileImage && !isViewMode && (
                                                <div className="absolute -top-1 -right-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                                                        className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors duration-200"
                                                        title="Remove photo"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 text-center">Click the circle to upload a photo</p>
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
                                    placeholder="e.g., John Doe"
                                    required
                                    readOnly={isViewMode}
                                    className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    readOnly={isViewMode}
                                    className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="phone" 
                                    name="phone" 
                                    type="tel" 
                                    value={formData.phone} 
                                    onChange={handleInputChange}
                                    placeholder="e.g., 123-456-7890"
                                    required
                                    readOnly={isViewMode}
                                    className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="country" 
                                    name="country" 
                                    value={formData.country} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g., USA"
                                    required
                                    readOnly={isViewMode}
                                    className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                                />
                            </div>
                        </div>
                        
                        {/* Birthday and Gender */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="birthdayDate">Birthday <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="birthdayDate" 
                                    name="birthdayDate" 
                                    type="date" 
                                    value={formData.birthdayDate} 
                                    onChange={handleInputChange}
                                    required
                                    readOnly={isViewMode}
                                    className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                                {isViewMode ? (
                                    <Input 
                                        id="gender" 
                                        name="gender" 
                                        value={formData.gender} 
                                        readOnly
                                        className="bg-gray-100 cursor-not-allowed"
                                    />
                                ) : (
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={(e) => handleSelectChange('gender', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                )}
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
                                readOnly={isViewMode}
                                className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
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
                                readOnly={isViewMode}
                                className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                            />
                        </div>
                        
                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Enter any patient notes or preferences"
                                rows={3}
                                readOnly={isViewMode}
                                className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        {isViewMode ? (
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
                        ) : (
                            <>
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleSavePatient}>Save</Button>
                            </>
                        )}
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