
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetConsultationsQuery } from '@repo/store/services/api';
import { selectCrmAuth } from '@repo/store/slices/crmAuthSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Plus, Search, FileDown, Eye, Edit, Trash2, CalendarCheck, CalendarX, UserCheck, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';

type Consultation = {
  id: string;
  patientName: string;
  consultationType: 'Video' | 'In-Person';
  date: string;
  time: string;
  duration: number; // in minutes
  cost: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
};

export default function ConsultationsPage() {
    const crmAuth = useSelector(selectCrmAuth);
    const doctorId = crmAuth.user?.id || crmAuth.user?._id;

    // Fetch consultations from API
    const { data: consultationsData, isLoading, error, refetch } = useGetConsultationsQuery(
      doctorId ? { doctorId, limit: 100 } : undefined,
      { skip: !doctorId, refetchOnMountOrArgChange: true }
    );

    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Transform API data to local format
    useEffect(() => {
      if (consultationsData?.data?.consultations) {
        const transformed = consultationsData.data.consultations.map((consultation: any) => {
          // Format date
          const date = new Date(consultation.appointmentDate);
          const formattedDate = date.toISOString().split('T')[0];

          // Map consultation type
          const consultationType = consultation.consultationType === 'video' ? 'Video' : 'In-Person';

          // Map status
          let status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' = 'Pending';
          if (consultation.status === 'completed') {
            status = 'Completed';
          } else if (consultation.status === 'cancelled') {
            status = 'Cancelled';
          } else if (consultation.status === 'confirmed') {
            status = 'Confirmed';
          } else if (consultation.status === 'scheduled') {
            status = 'Confirmed';
          }

          return {
            id: consultation._id,
            patientName: consultation.patientName,
            consultationType,
            date: formattedDate,
            time: consultation.appointmentTime,
            duration: consultation.duration || 30,
            cost: consultation.consultationFee || 0,
            status,
            notes: consultation.reason || consultation.concerns || ''
          };
        });
        setConsultations(transformed);
      }
    }, [consultationsData]);

    const filteredConsultations = useMemo(() => {
        return consultations.filter(consult => 
            consult.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (statusFilter === 'all' || consult.status === statusFilter)
        );
    }, [consultations, searchTerm, statusFilter]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredConsultations.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
    
    const handleOpenModal = (consultation?: Consultation) => {
        setSelectedConsultation(consultation || null);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = (consultation: Consultation) => {
        setSelectedConsultation(consultation);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if(selectedConsultation) {
            setConsultations(consultations.filter(c => c.id !== selectedConsultation.id));
            setIsDeleteModalOpen(false);
            setSelectedConsultation(null);
        }
    };

    const getStatusColor = (status: Consultation['status']) => {
        switch (status) {
          case 'Confirmed': return 'bg-blue-100 text-blue-800';
          case 'Completed': return 'bg-green-100 text-green-800';
          case 'Pending': return 'bg-yellow-100 text-yellow-800';
          case 'Cancelled': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
    };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Manage Consultations</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{consultations.filter(c => c.status === 'Confirmed').length}</div>
                  <p className="text-xs text-muted-foreground">Confirmed consultations</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{consultations.filter(c => c.status === 'Pending').length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-green-600">{consultations.filter(c => c.status === 'Completed').length}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                  <CalendarX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-red-600">{consultations.filter(c => c.status === 'Cancelled').length}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                  <CardTitle>All Consultations</CardTitle>
                  <CardDescription>View, create, and manage all patient consultations.</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                          type="search" 
                          placeholder="Search by patient..."
                          className="w-full md:w-64 pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                  </Select>
                  <Button onClick={() => handleOpenModal()}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Consultation
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
           {isLoading ? (
             <div className="text-center py-8 text-gray-500">
               <div className="animate-pulse">
                 <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                 <p>Loading consultations...</p>
               </div>
             </div>
           ) : error ? (
             <div className="text-center py-8 text-red-500">
               <CalendarX className="h-12 w-12 mx-auto mb-4 text-red-300" />
               <p>Error loading consultations. Please try again.</p>
             </div>
           ) : consultations.length === 0 ? (
             <div className="text-center py-8 text-gray-500">
               <CalendarCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
               <p>No consultations found.</p>
             </div>
           ) : (
             <div className="overflow-x-auto no-scrollbar rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.patientName}</TableCell>
                      <TableCell>{c.consultationType}</TableCell>
                      <TableCell>{c.date} at {c.time}</TableCell>
                      <TableCell>₹{c.cost.toFixed(2)}</TableCell>
                      <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(c.status)}`}>
                              {c.status}
                          </span>
                      </TableCell>
                      <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(c)}>
                              <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(c)}>
                              <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(c)}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
             </div>
           )}
           {!isLoading && !error && consultations.length > 0 && (
            <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredConsultations.length}
            />
           )}
        </CardContent>
      </Card>
    </div>
  );
}
