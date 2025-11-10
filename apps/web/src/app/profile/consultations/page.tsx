"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { AlertCircle, Calendar, CheckCircle, X, Search, Clock, User, Video, MapPin, DollarSign, CalendarCheck, CalendarX, UserCheck } from 'lucide-react';
import { StatCard } from '../../../components/profile/StatCard';
import { Pagination } from '@repo/ui/pagination';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { cn } from '@repo/ui/cn';
import { useGetConsultationsQuery } from '@repo/store/api';
import { useAuth } from '@/hooks/useAuth';

interface Consultation {
  id: string;
  patientName: string;
  consultationType: 'Video' | 'In-Person';
  date: string;
  time: string;
  duration: number;
  cost: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
  doctorName?: string;
  concerns?: string;
  doctorClinic?: string;
  doctorAddress?: string;
}

interface ConsultationCardProps {
  consultation: Consultation;
  onSelect: () => void;
  isSelected: boolean;
}

const ConsultationCard = ({ consultation, onSelect, isSelected }: ConsultationCardProps) => {
    const statusConfig = {
        Completed: { icon: CheckCircle, color: 'text-green-500' },
        Confirmed: { icon: Calendar, color: 'text-blue-500' },
        Pending: { icon: Clock, color: 'text-yellow-500' },
        Cancelled: { icon: X, color: 'text-red-500' },
    };
    const StatusIcon = statusConfig[consultation.status]?.icon || CheckCircle;
    
    // Safely parse the date
    let displayDate = 'Invalid Date';
    try {
        const dateObj = new Date(consultation.date);
        if (!isNaN(dateObj.getTime())) {
            displayDate = dateObj.toLocaleDateString();
        }
    } catch (e) {
        console.error('Error parsing date:', e);
    }
    
    const TypeIcon = consultation.consultationType === 'Video' ? Video : MapPin;
    
    return (
        <button
            onClick={onSelect}
            className={cn(
                "w-full text-left p-4 border rounded-lg transition-all duration-200 hover:shadow-md",
                isSelected ? "bg-primary/10 border-primary shadow-lg" : "bg-card hover:border-gray-300"
            )}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">{consultation.consultationType} Consultation</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{displayDate} at {consultation.time}</p>
                </div>
                <div className={`flex items-center text-xs font-medium gap-1 ${statusConfig[consultation.status]?.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {consultation.status}
                </div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
                with Dr. {consultation.doctorName}
            </div>
        </button>
    );
};

interface ConsultationDetailsProps {
  consultation: Consultation | null;
  onCancelClick: (consultation: Consultation) => void;
}

const ConsultationDetails = ({ consultation, onCancelClick }: ConsultationDetailsProps) => {
    if (!consultation) return (
        <Card className="sticky top-24">
            <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>Select a consultation to see details.</p>
                </div>
            </CardContent>
        </Card>
    );

    const statusConfig = {
        Completed: { color: 'bg-green-100 text-green-800' },
        Confirmed: { color: 'bg-blue-100 text-blue-800' },
        Pending: { color: 'bg-yellow-100 text-yellow-800' },
        Cancelled: { color: 'bg-red-100 text-red-800' },
    };
    
    const isConsultationCancellable = (consultationDate: string) => {
        const now = new Date();
        const consultDate = new Date(consultationDate);
        const hoursDifference = (consultDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursDifference > 24 && (consultation.status === 'Confirmed' || consultation.status === 'Pending');
    };
    
    // Safely parse the date for display
    let displayDate = 'Invalid Date';
    let displayDateTime = 'Invalid Date';
    try {
        const dateObj = new Date(consultation.date);
        if (!isNaN(dateObj.getTime())) {
            displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            displayDateTime = `${displayDate} at ${consultation.time}`;
        }
    } catch (e) {
        console.error('Error parsing date in ConsultationDetails:', e);
    }

    const TypeIcon = consultation.consultationType === 'Video' ? Video : MapPin;

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-xl">{consultation.consultationType} Consultation</CardTitle>
                    </div>
                    <Badge className={cn("text-xs", statusConfig[consultation.status]?.color)}>
                        {consultation.status}
                    </Badge>
                </div>
                <CardDescription>Dr. {consultation.doctorName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Date & Time</p>
                            <p className="text-sm text-muted-foreground">
                                {displayDateTime}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">{consultation.duration} minutes</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Consultation Fee</p>
                            <p className="text-sm text-muted-foreground">₹{consultation.cost.toFixed(2)}</p>
                        </div>
                    </div>
                    {consultation.consultationType === 'In-Person' && consultation.doctorAddress && (
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Clinic Address</p>
                                <p className="text-sm text-muted-foreground">
                                    {consultation.doctorClinic && <span className="font-medium">{consultation.doctorClinic}<br /></span>}
                                    {consultation.doctorAddress}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {consultation.concerns && (
                    <>
                        <div className="space-y-3">
                            <h4 className="font-semibold">Concerns / Reason</h4>
                            <p className="text-sm text-muted-foreground">{consultation.concerns}</p>
                        </div>
                        <Separator />
                    </>
                )}

                {consultation.notes && (
                    <>
                        <div className="space-y-3">
                            <h4 className="font-semibold">Notes</h4>
                            <p className="text-sm text-muted-foreground">{consultation.notes}</p>
                        </div>
                        <Separator />
                    </>
                )}

                <div className="space-y-3">
                    <h4 className="font-semibold">Actions</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {consultation.consultationType === 'Video' && consultation.status === 'Confirmed' && (
                            <Button variant="default" className="justify-start gap-2">
                                <Video className="h-4 w-4"/> Join Video Call
                            </Button>
                        )}
                        <Button 
                            variant="outline" 
                            className="justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" 
                            disabled={!isConsultationCancellable(consultation.date)} 
                            onClick={() => onCancelClick(consultation)}
                        >
                            <X className="h-4 w-4"/> Cancel Consultation
                        </Button>
                        {!isConsultationCancellable(consultation.date) && consultation.status !== 'Cancelled' && consultation.status !== 'Completed' && (
                            <p className="text-xs text-muted-foreground">
                                Consultations can only be cancelled 24 hours before the scheduled time.
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function ConsultationsPage() {
    const { user } = useAuth();
    const userId = user?._id;

    // Fetch consultations using RTK Query directly
    const { data: consultationsData, isLoading, error } = useGetConsultationsQuery(
        userId ? { userId: userId, limit: 100 } : undefined,
        { skip: !userId, refetchOnMountOrArgChange: true }
    );

    console.log('Consultations Data:', consultationsData);

    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [consultationToCancel, setConsultationToCancel] = useState<Consultation | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const hasSetInitialSelection = useRef(false);
    
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
                    patientName: consultation.patientName || `${user?.firstName} ${user?.lastName}`,
                    consultationType,
                    date: formattedDate,
                    time: consultation.appointmentTime,
                    duration: consultation.duration || 30,
                    cost: consultation.consultationFee || 0,
                    status,
                    notes: consultation.reason || consultation.concerns || '',
                    doctorName: consultation.doctorName || 'Doctor',
                    concerns: consultation.concerns || consultation.reason || '',
                    doctorClinic: consultation.doctorClinic || '',
                    doctorAddress: consultation.doctorAddress || ''
                };
            });
            setConsultations(transformed);
            
            if (!hasSetInitialSelection.current && !selectedConsultation && transformed.length > 0) {
                setSelectedConsultation(transformed[0]);
                hasSetInitialSelection.current = true;
            }
        }
    }, [consultationsData, user]);

    const filteredConsultations = useMemo(() => {
        return consultations.filter(consultation =>
            (consultation.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             consultation.consultationType.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === 'all' || consultation.status === statusFilter)
        );
    }, [consultations, searchTerm, statusFilter]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredConsultations.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);

    const handleCancelClick = (consultation: Consultation) => {
        setConsultationToCancel(consultation);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = () => {
        // In a real implementation, this would call an API to cancel the consultation
        setConsultations(consultations.map(consult => 
            consult.id === consultationToCancel!.id ? { ...consult, status: 'Cancelled' } : consult
        ));
        setIsCancelModalOpen(false);
        setConsultationToCancel(null);
        setCancellationReason('');
        if (selectedConsultation?.id === consultationToCancel!.id) {
            setSelectedConsultation(prev => prev ? ({ ...prev, status: 'Cancelled' }) : null);
        }
    };
    
    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                        <p>Loading your consultations...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center text-destructive">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                        <p>Failed to load consultations. Please try again later.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            icon={CalendarCheck} 
                            title="Upcoming" 
                            value={consultations.filter(c => {
                                try {
                                    return new Date(c.date) > new Date() && (c.status === 'Confirmed' || c.status === 'Pending');
                                } catch (e) {
                                    return false;
                                }
                            }).length} 
                            change="Scheduled consultations" 
                        />
                        <StatCard 
                            icon={Clock} 
                            title="Pending" 
                            value={consultations.filter(c => c.status === 'Pending').length} 
                            change="Awaiting confirmation" 
                        />
                        <StatCard 
                            icon={UserCheck} 
                            title="Completed" 
                            value={consultations.filter(c => c.status === 'Completed').length} 
                            change="All time" 
                        />
                        <StatCard 
                            icon={CalendarX} 
                            title="Cancelled" 
                            value={consultations.filter(c => c.status === 'Cancelled').length} 
                            change="All time" 
                        />
                    </div>
                    
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
                        {/* Left Column: Consultations List */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Consultations</CardTitle>
                                    <CardDescription>Select a consultation to view details.</CardDescription>
                                    <div className="pt-4 space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                              type="search"
                                              placeholder="Search by doctor or type..."
                                              className="pl-8"
                                              value={searchTerm}
                                              onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                                    {currentItems.length > 0 ? (
                                        currentItems.map(consult => (
                                            <ConsultationCard 
                                                key={consult.id} 
                                                consultation={consult} 
                                                onSelect={() => setSelectedConsultation(consult)}
                                                isSelected={selectedConsultation?.id === consult.id}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground">No consultations found.</p>
                                            <p className="text-sm text-muted-foreground mt-2">Book your first consultation to see it here.</p>
                                        </div>
                                    )}
                                </CardContent>
                                {filteredConsultations.length > itemsPerPage && (
                                    <div className="px-6 pb-6">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            itemsPerPage={itemsPerPage}
                                            onItemsPerPageChange={setItemsPerPage}
                                            totalItems={filteredConsultations.length}
                                        />
                                    </div>
                                )}
                            </Card>
                        </div>
                        
                        {/* Right Column: Consultation Details */}
                        <div className="lg:col-span-2">
                            <ConsultationDetails consultation={selectedConsultation} onCancelClick={handleCancelClick} />
                        </div>
                    </div>
                </>
            )}

            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Consultation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your consultation with Dr. {consultationToCancel?.doctorName}? Please provide a reason.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancellation-reason">Reason for Cancellation</Label>
                        <Textarea 
                          id="cancellation-reason"
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          placeholder="e.g., Schedule conflict"
                          className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No, Keep It</Button>
                        <Button variant="destructive" onClick={handleConfirmCancel} disabled={!cancellationReason.trim()}>Yes, Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const Separator = () => <hr className="my-4 border-border/50" />;
