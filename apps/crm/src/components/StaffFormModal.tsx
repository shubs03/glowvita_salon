
"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/tabs';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Checkbox } from '@repo/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Switch } from '@repo/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { useCreateStaffMutation, useUpdateStaffMutation, useGetWorkingHoursQuery, useGetStaffEarningsQuery, useRecordStaffPayoutMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { vendorNavItems, doctorNavItems } from '@/lib/routes';
import { Eye, EyeOff, Plus, Trash2, Clock, Calendar, RefreshCw, IndianRupee, TrendingUp } from 'lucide-react';

const scrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

interface StaffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff?: any;
    initialTab?: string;
    hideTabs?: boolean;
    onSuccess: () => void;
}

export const StaffFormModal = ({ isOpen, onClose, staff, initialTab = 'personal', hideTabs = false, onSuccess }: StaffFormModalProps) => {
    const { user, role } = useCrmAuth();
    const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
    const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
    const [activeTab, setActiveTab] = useState('personal');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data: workingHoursData } = useGetWorkingHoursQuery(undefined, {
        skip: !isOpen
    });

    const [dateFilter, setDateFilter] = useState('all');

    // Calculate date range based on filter
    const dateRange = React.useMemo(() => {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        switch (dateFilter) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'week':
                // Start of current week (Sunday)
                start.setDate(now.getDate() - now.getDay());
                start.setHours(0, 0, 0, 0);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            case 'month':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                // Last day of month
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'year':
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(11, 31);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                return {}; // All time
        }
        return {
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };
    }, [dateFilter]);

    const [recalculate, setRecalculate] = useState(false);

    const { data: earningsData, isFetching: isFetchingEarnings, refetch: refetchEarnings } = useGetStaffEarningsQuery({
        id: staff?._id,
        ...dateRange,
        recalc: recalculate
    }, {
        skip: !staff?._id || !isOpen
    });

    const handleRecalculate = () => {
        setRecalculate(true);
        toast.info("Recalculating ledger...");
        setTimeout(() => setRecalculate(false), 2000); // Reset after 2 seconds to allow query to fire
    };

    const [recordPayout] = useRecordStaffPayoutMutation();


    const [formData, setFormData] = useState<any>({
        fullName: '',
        position: '',
        mobileNo: '',
        emailAddress: '',
        photo: null,
        description: '',
        salary: '',
        startDate: '',
        endDate: '',
        yearOfExperience: '',
        clientsServed: '',
        commission: false,
        commissionRate: 0,
        permissions: [],
        password: '',
        confirmPassword: '',
        // Individual day availability fields to match Staff model
        sundayAvailable: true,
        sundaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        mondayAvailable: true,
        mondaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        tuesdayAvailable: true,
        tuesdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        wednesdayAvailable: true,
        wednesdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        thursdayAvailable: true,
        thursdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        fridayAvailable: true,
        fridaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        saturdayAvailable: true,
        saturdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        // Block times array to match Staff model
        blockedTimes: [],
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            bankName: '',
            ifscCode: '',
            upiId: '',
        }
    });

    const navItems = role === 'doctor' ? doctorNavItems : vendorNavItems;

    useEffect(() => {
        if (staff) {
            setFormData({
                fullName: staff.fullName || '',
                position: staff.position || '',
                mobileNo: staff.mobileNo || '',
                emailAddress: staff.emailAddress || '',
                photo: staff.photo || null,
                description: staff.description || '',
                salary: staff.salary || '',
                startDate: staff.startDate ? new Date(staff.startDate).toISOString().split('T')[0] : '',
                endDate: staff.endDate ? new Date(staff.endDate).toISOString().split('T')[0] : '',
                yearOfExperience: staff.yearOfExperience || '',
                clientsServed: staff.clientsServed || '',
                commission: staff.commission || false,
                commissionRate: staff.commissionRate || 0,
                permissions: staff.permissions || [],
                password: '',
                confirmPassword: '',
                // Individual day availability fields from Staff model
                sundayAvailable: staff.sundayAvailable !== undefined ? staff.sundayAvailable : true,
                sundaySlots: staff.sundaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                mondayAvailable: staff.mondayAvailable !== undefined ? staff.mondayAvailable : true,
                mondaySlots: staff.mondaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                tuesdayAvailable: staff.tuesdayAvailable !== undefined ? staff.tuesdayAvailable : true,
                tuesdaySlots: staff.tuesdaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                wednesdayAvailable: staff.wednesdayAvailable !== undefined ? staff.wednesdayAvailable : true,
                wednesdaySlots: staff.wednesdaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                thursdayAvailable: staff.thursdayAvailable !== undefined ? staff.thursdayAvailable : true,
                thursdaySlots: staff.thursdaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                fridayAvailable: staff.fridayAvailable !== undefined ? staff.fridayAvailable : true,
                fridaySlots: staff.fridaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                saturdayAvailable: staff.saturdayAvailable !== undefined ? staff.saturdayAvailable : true,
                saturdaySlots: staff.saturdaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                // Block times from Staff model
                blockedTimes: staff.blockedTimes || [],
                bankDetails: staff.bankDetails || {
                    accountHolderName: '',
                    accountNumber: '',
                    bankName: '',
                    ifscCode: '',
                    upiId: '',
                },
            });
        } else {
            // Get salon hours to use as defaults for new staff
            const salonHours = workingHoursData?.workingHoursArray || [];
            const getDayHours = (dayName: string) => {
                const dayData = salonHours.find((h: any) => h.day.toLowerCase() === dayName.toLowerCase());
                if (dayData && dayData.isOpen) {
                    const timeToMinutes = (timeStr: string) => {
                        const [hours, minutes] = timeStr.split(':').map(Number);
                        return hours * 60 + minutes;
                    };
                    return {
                        available: true,
                        slots: [{
                            startTime: dayData.open || '10:00',
                            endTime: dayData.close || '19:00',
                            startMinutes: timeToMinutes(dayData.open || '10:00'),
                            endMinutes: timeToMinutes(dayData.close || '19:00')
                        }]
                    };
                }
                return {
                    available: false,
                    slots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }]
                };
            };

            const sun = getDayHours('sunday');
            const mon = getDayHours('monday');
            const tue = getDayHours('tuesday');
            const wed = getDayHours('wednesday');
            const thu = getDayHours('thursday');
            const fri = getDayHours('friday');
            const sat = getDayHours('saturday');

            // Reset form for new entry
            setFormData({
                fullName: '', position: '', mobileNo: '', emailAddress: '', photo: null, description: '',
                salary: '', startDate: '', endDate: '', yearOfExperience: '', clientsServed: '', commission: false, commissionRate: 0, permissions: [],
                password: '', confirmPassword: '',
                // Individual day availability fields for new staff
                sundayAvailable: sun.available,
                sundaySlots: sun.slots,
                mondayAvailable: mon.available,
                mondaySlots: mon.slots,
                tuesdayAvailable: tue.available,
                tuesdaySlots: tue.slots,
                wednesdayAvailable: wed.available,
                wednesdaySlots: wed.slots,
                thursdayAvailable: thu.available,
                thursdaySlots: thu.slots,
                fridayAvailable: fri.available,
                fridaySlots: fri.slots,
                saturdayAvailable: sat.available,
                saturdaySlots: sat.slots,
                blockedTimes: [],
                bankDetails: { accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '', upiId: '' }
            });
        }
        setActiveTab(initialTab);
    }, [staff, isOpen, workingHoursData, initialTab]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Full Name validation: only words and spaces allowed
        if (name === 'fullName') {
            const regex = /^[a-zA-Z\s]*$/;
            if (!regex.test(value)) return;
        }

        // Mobile Number validation: only 10 digits allowed
        if (name === 'mobileNo') {
            const regex = /^[0-9]*$/;
            if (!regex.test(value)) return;
            if (value.length > 10) return;
        }

        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };


    const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails,
                [name]: value,
            }
        }));
    };

    const [payoutAmount, setPayoutAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [payoutNotes, setPayoutNotes] = useState('');

    const handleRecordPayout = async () => {
        if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            await recordPayout({
                id: staff._id,
                amount: parseFloat(payoutAmount),
                paymentMethod: paymentMethod,
                notes: payoutNotes,
                payoutDate: new Date()
            }).unwrap();

            toast.success("Payout recorded successfully");
            setPayoutAmount('');
            setPaymentMethod('Cash');
            setPayoutNotes('');
            refetchEarnings();
        } catch (error: any) {
            toast.error(error.data?.message || "Failed to record payout");
        }
    };

    const renderEarningsTab = () => {
        if (!staff) return <div className="p-8 text-center text-muted-foreground text-sm font-medium">Earnings details will be available after creating the staff.</div>;

        const summary = earningsData?.summary || { totalEarned: 0, totalPaid: 0, balance: 0, appointmentsCount: 0 };
        const payouts = earningsData?.payouts || [];

        return (
            <div className="space-y-6">
                {/* Date Filter Controls */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRecalculate}
                        disabled={isFetchingEarnings}
                        title="Force recalculate ledger from all history"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingEarnings ? 'animate-spin' : ''}`} />
                        {isFetchingEarnings ? 'Syncing...' : 'Sync History'}
                    </Button>
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        {['today', 'week', 'month', 'year', 'all'].map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setDateFilter(filter)}
                                className={`px-4 py-2 text-xs font-medium border first:rounded-l-lg last:rounded-r-lg ${dateFilter === filter
                                    ? 'z-10 bg-primary text-primary-foreground ring-1 ring-primary'
                                    : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Earned</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center">
                                <IndianRupee className="h-5 w-5 mr-1 text-primary" />
                                {summary.totalEarned.toFixed(2)}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{summary.appointmentsCount} Appointments</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50/50 border-red-200/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-red-600/70">Total Paid</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 flex items-center">
                                <IndianRupee className="h-5 w-5 mr-1" />
                                {summary.totalPaid.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50/50 border-green-200/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-green-600/70">Balance Due</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 flex items-center">
                                <IndianRupee className="h-5 w-5 mr-1" />
                                {summary.balance.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Record New Payout</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="payoutAmount">Payout Amount (₹)</Label>
                                    {summary.balance > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setPayoutAmount(summary.balance.toString())}
                                            className="text-[10px] uppercase font-bold text-primary hover:text-primary/70 transition-colors"
                                        >
                                            Pay Full Balance
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="payoutAmount"
                                    type="number"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    placeholder="Enter amount to pay"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger id="paymentMethod">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Net Banking">Net Banking</SelectItem>
                                        <SelectItem value="NEFT">NEFT</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="Check">Check</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payoutNotes">Notes</Label>
                                <Textarea
                                    id="payoutNotes"
                                    value={payoutNotes}
                                    onChange={(e) => setPayoutNotes(e.target.value)}
                                    placeholder="Extra payment details..."
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                        <DialogFooter className="px-6 pb-6 pt-0">
                            <Button onClick={handleRecordPayout} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Record Payment
                            </Button>
                        </DialogFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Payouts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-y-auto max-h-[250px] no-scrollbar">
                                {payouts.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-[10px]">Date</TableHead>
                                                <TableHead className="text-[10px]">Method</TableHead>
                                                <TableHead className="text-[10px] text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payouts.map((p: any) => (
                                                <TableRow key={p._id}>
                                                    <TableCell className="text-[10px] py-2">{new Date(p.payoutDate).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-[10px] py-2">{p.paymentMethod}</TableCell>
                                                    <TableCell className="text-[10px] py-2 text-right font-medium text-red-600">-₹{p.amount.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-[11px]">No payouts recorded yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Commission History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Recent Commission History (Last 50 Appointments)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-y-auto max-h-[300px]">
                            {(earningsData?.commissionHistory && earningsData.commissionHistory.length > 0) ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-[10px]">Date</TableHead>
                                            <TableHead className="text-[10px]">Client</TableHead>
                                            <TableHead className="text-[10px]">Service</TableHead>
                                            <TableHead className="text-[10px] text-right">Appt. Amount</TableHead>
                                            <TableHead className="text-[10px] text-right">Comm. Rate</TableHead>
                                            <TableHead className="text-[10px] text-right">Comm. Earned</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {earningsData.commissionHistory.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-[10px] py-2">{new Date(item.date).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-[10px] py-2 font-medium">{item.clientName}</TableCell>
                                                <TableCell className="text-[10px] py-2 text-muted-foreground">{item.serviceName}</TableCell>
                                                <TableCell className="text-[10px] py-2 text-right">₹{item.totalAmount?.toFixed(2)}</TableCell>
                                                <TableCell className="text-[10px] py-2 text-right text-muted-foreground">{item.commissionRate}%</TableCell>
                                                <TableCell className="text-[10px] py-2 text-right font-bold text-green-600">+₹{item.commissionAmount?.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground text-xs">
                                    No completed appointments with commissions found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const handleTimingChange = (day: string, field: string, value: any) => {
        if (field === 'isWorking') {
            // Update the availability field for the day
            const availableField = `${day}Available`;
            setFormData((prev: any) => ({
                ...prev,
                [availableField]: value
            }));
        } else {
            // Update the slots for the day
            const slotsField = `${day}Slots`;
            const timeToMinutes = (timeStr: string) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };

            setFormData((prev: any) => {
                const currentSlots = prev[slotsField] || [];
                const updatedSlots = currentSlots.length > 0 ? [...currentSlots] : [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }];

                if (field === 'startTime') {
                    updatedSlots[0] = {
                        ...updatedSlots[0],
                        startTime: value,
                        startMinutes: timeToMinutes(value)
                    };
                } else if (field === 'endTime') {
                    updatedSlots[0] = {
                        ...updatedSlots[0],
                        endTime: value,
                        endMinutes: timeToMinutes(value)
                    };
                }

                return {
                    ...prev,
                    [slotsField]: updatedSlots
                };
            });
        }
    };

    const syncWithSalonTimings = () => {
        const salonHours = workingHoursData?.workingHoursArray || [];
        const timeToMinutes = (timeStr: string) => {
            if (!timeStr) return 0;
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + (minutes || 0);
        };

        const updatedTimings: any = {};
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        days.forEach(day => {
            const dayData = salonHours.find((h: any) => h.day.toLowerCase() === day.toLowerCase());
            if (dayData) {
                updatedTimings[`${day}Available`] = dayData.isOpen;
                if (dayData.isOpen) {
                    updatedTimings[`${day}Slots`] = [{
                        startTime: dayData.open || '10:00',
                        endTime: dayData.close || '19:00',
                        startMinutes: timeToMinutes(dayData.open || '10:00'),
                        endMinutes: timeToMinutes(dayData.close || '19:00')
                    }];
                } else {
                    updatedTimings[`${day}Slots`] = [];
                }
            }
        });

        setFormData((prev: any) => ({
            ...prev,
            ...updatedTimings
        }));
        toast.success("Timings synchronized with salon hours.");
    };

    const handleBlockTimeChange = (index: number, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            blockedTimes: (prev.blockedTimes as any[]).map((entry: any, i: number) => {
                if (i === index) {
                    const updatedEntry = { ...entry, [field]: value };

                    // Auto-calculate minutes when time fields change
                    if (field === 'startTime' || field === 'endTime') {
                        const timeToMinutes = (timeStr: string) => {
                            const [hours, minutes] = timeStr.split(':').map(Number);
                            return hours * 60 + minutes;
                        };

                        if (field === 'startTime') {
                            updatedEntry.startMinutes = timeToMinutes(value);
                        } else if (field === 'endTime') {
                            updatedEntry.endMinutes = timeToMinutes(value);
                        }
                    }

                    return updatedEntry;
                }
                return entry;
            })
        }));
    };

    const addBlockTimeEntry = () => {
        setFormData((prev: any) => ({
            ...prev,
            blockedTimes: [...(prev.blockedTimes as any[]), {
                date: '',
                startTime: '',
                endTime: '',
                startMinutes: 0,
                endMinutes: 0,
                reason: '',
                isRecurring: false,
                recurringType: null,
                isActive: true
            }]
        }));
    };

    const removeBlockTimeEntry = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            blockedTimes: (prev.blockedTimes as any[]).filter((_: any, i: number) => i !== index)
        }));
    };

    const handleCheckboxChange = (permission: string, checked: boolean | string) => {
        const isChecked = typeof checked === 'string' ? checked === 'true' : checked;
        setFormData((prev: any) => ({
            ...prev,
            permissions: isChecked
                ? [...(prev.permissions as string[]), permission]
                : (prev.permissions as string[]).filter(p => p !== permission)
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // If updating and password is provided, validate it
        if (staff && formData.password) {
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                toast.error("Password must contain at least one letter, one number, and one special symbol.");
                return;
            }
        }

        // Mobile Number validation: exactly 10 digits

        // Mobile Number validation: exactly 10 digits
        if (formData.mobileNo.length !== 10) {
            toast.error("Mobile number must be exactly 10 digits.");
            return;
        }

        const payload: any = {
            ...formData,
            vendorId: user._id,
            userType: role === 'doctor' ? 'Doctor' : 'Vendor',
        };

        if (!payload.password) {
            delete payload.password;
        }
        delete payload.confirmPassword;

        console.log('Saving staff data:', {
            availabilityFields: {
                sundayAvailable: payload.sundayAvailable,
                mondayAvailable: payload.mondayAvailable,
            },
            slotsFields: {
                sundaySlots: payload.sundaySlots,
                mondaySlots: payload.mondaySlots,
            },
            blockedTimes: payload.blockedTimes,
            fullPayload: payload
        });

        try {
            if (staff) {
                await updateStaff({ _id: staff._id, ...payload }).unwrap();
                toast.success("Staff member updated successfully.");
            } else {
                await createStaff(payload).unwrap();
                toast.success("Staff member added successfully.");
            }
            onSuccess();
        } catch (error: any) {
            console.error("Failed to save staff member:", error);
            if (error?.status === 409) {
                toast.error(error.data.message || "A staff member with these details already exists.");
            } else {
                toast.error(error?.data?.message || "Failed to save staff member.");
            }
        }
    };

    const handleNextTab = () => {
        if (activeTab === 'personal') setActiveTab('employment');
        else if (activeTab === 'employment') setActiveTab('commission');
        else if (activeTab === 'commission') setActiveTab('bank');
        else if (activeTab === 'bank') setActiveTab('permissions');
        else if (activeTab === 'permissions') setActiveTab('timing');
        else if (activeTab === 'timing') setActiveTab('blockTime');
        else if (activeTab === 'blockTime' && staff) setActiveTab('earnings');
    }

    const handlePreviousTab = () => {
        if (activeTab === 'employment') setActiveTab('personal');
        else if (activeTab === 'commission') setActiveTab('employment');
        else if (activeTab === 'bank') setActiveTab('commission');
        else if (activeTab === 'permissions') setActiveTab('bank');
        else if (activeTab === 'timing') setActiveTab('permissions');
        else if (activeTab === 'blockTime') setActiveTab('timing');
        else if (activeTab === 'earnings') setActiveTab('blockTime');
    }

    const renderPersonalTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" name="position" value={formData.position} onChange={handleInputChange} required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="mobileNo">Mobile Number</Label>
                    <Input id="mobileNo" name="mobileNo" type="tel" value={formData.mobileNo} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input id="emailAddress" name="emailAddress" type="email" value={formData.emailAddress} onChange={handleInputChange} required />
                </div>
            </div>
            {staff && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Change Password (optional)</Label>
                        <div className="relative">
                            <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                <Input id="photo" type="file" onChange={handleFileChange} />
                {formData.photo && <img src={formData.photo} alt="Staff preview" className="w-20 h-20 rounded-full object-cover mt-2" />}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} />
            </div>
        </div>
    );

    const renderEmploymentTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="salary">Salary (per month)</Label>
                    <Input id="salary" name="salary" type="number" value={formData.salary} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="yearOfExperience">Years of Experience</Label>
                    <Input id="yearOfExperience" name="yearOfExperience" type="number" value={formData.yearOfExperience} onChange={handleInputChange} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="clientsServed">Clients Served</Label>
                <Input id="clientsServed" name="clientsServed" type="number" value={formData.clientsServed} onChange={handleInputChange} />
            </div>
        </div>
    );

    const renderCommissionTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="space-y-1">
                    <Label htmlFor="commission" className="text-base font-semibold">Enable Commission</Label>
                    <p className="text-sm text-muted-foreground">Enable automatic commission calculation for this staff member.</p>
                </div>
                <Switch
                    id="commission"
                    checked={formData.commission}
                    onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, commission: checked }))}
                />
            </div>

            {formData.commission && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="space-y-2">
                        <Label htmlFor="commissionRate" className="font-semibold text-sm flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                            Global Commission Rate (%)
                        </Label>
                        <div className="relative">
                            <Input
                                id="commissionRate"
                                type="number"
                                placeholder="e.g. 10"
                                value={formData.commissionRate}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                                className="pr-12 text-lg h-12 font-bold"
                                min="0"
                                max="100"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted-foreground font-bold text-lg">
                                %
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This staff member will earn {formData.commissionRate}% of the service value for every completed appointment assigned to them.
                        </p>
                    </div>

                    {staff && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Earnings Summary</h4>
                                <Button variant="ghost" size="sm" onClick={() => setActiveTab('earnings')} className="text-primary hover:text-primary/80 h-auto p-0 flex items-center gap-1">
                                    Full Ledger <Eye className="h-3 w-3" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-green-50 rounded-md border border-green-100">
                                    <p className="text-[10px] text-green-600 font-bold uppercase">Balance Due</p>
                                    <p className="text-xl font-bold text-green-700 flex items-center">
                                        <IndianRupee className="h-4 w-4 mr-0.5" />
                                        {(earningsData?.summary?.balance || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                                    <p className="text-[10px] text-blue-600 font-bold uppercase">Total Earned</p>
                                    <p className="text-xl font-bold text-blue-700 flex items-center">
                                        <IndianRupee className="h-4 w-4 mr-0.5" />
                                        {(earningsData?.summary?.totalEarned || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!formData.commission && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                        <TrendingUp className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Commission is Disabled</p>
                    <p className="text-xs text-gray-500 max-w-[250px] mt-1">
                        Turn on the switch above to start tracking performance-based earnings for this staff member.
                    </p>
                </div>
            )}
        </div>
    );

    const renderBankDetailsTab = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input id="accountHolderName" name="accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleBankDetailsChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" value={formData.bankDetails.accountNumber} onChange={handleBankDetailsChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" value={formData.bankDetails.bankName} onChange={handleBankDetailsChange} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input id="ifscCode" name="ifscCode" value={formData.bankDetails.ifscCode} onChange={handleBankDetailsChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input id="upiId" name="upiId" value={formData.bankDetails.upiId} onChange={handleBankDetailsChange} />
                </div>
            </div>
        </div>
    );

    const renderPermissionsTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-md">
                {navItems.map((item) => (
                    <div key={item.permission} className="flex items-center space-x-2">
                        <Checkbox
                            id={item.permission}
                            checked={(formData.permissions as string[]).includes(item.permission)}
                            onCheckedChange={(checked) => handleCheckboxChange(item.permission, checked as boolean)}
                        />
                        <Label htmlFor={item.permission} className="text-sm font-medium">
                            {item.title}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTimingTab = () => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayLabels = {
            sunday: 'Sunday',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday'
        };

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <h4 className="font-semibold">Weekly Working Hours</h4>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={syncWithSalonTimings}
                        disabled={!workingHoursData}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync with Salon
                    </Button>
                </div>

                <div className="space-y-3">
                    {days.map(day => {
                        const availableField = `${day}Available`;
                        const slotsField = `${day}Slots`;
                        const isAvailable = formData[availableField];
                        const slots = formData[slotsField] || [];
                        const currentSlot = slots.length > 0 ? slots[0] : { startTime: '10:00', endTime: '19:00' };

                        return (
                            <div key={day} className="border p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    {/* Day Name and Toggle */}
                                    <div className="flex items-center space-x-3">
                                        <Switch
                                            checked={isAvailable}
                                            onCheckedChange={(checked) => handleTimingChange(day, 'isWorking', checked)}
                                        />
                                        <Label className="font-medium min-w-[80px]">{(dayLabels as any)[day]}</Label>
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <Label htmlFor={`${day}-start`} className="text-sm text-gray-600">Start Time</Label>
                                        <Input
                                            id={`${day}-start`}
                                            type="time"
                                            value={currentSlot.startTime || ''}
                                            onChange={(e) => handleTimingChange(day, 'startTime', e.target.value)}
                                            disabled={!isAvailable}
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* End Time */}
                                    <div>
                                        <Label htmlFor={`${day}-end`} className="text-sm text-gray-600">End Time</Label>
                                        <Input
                                            id={`${day}-end`}
                                            type="time"
                                            value={currentSlot.endTime || ''}
                                            onChange={(e) => handleTimingChange(day, 'endTime', e.target.value)}
                                            disabled={!isAvailable}
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Working Hours Display */}
                                    <div className="text-sm text-gray-500">
                                        {isAvailable ? (
                                            <span>
                                                {currentSlot.startTime && currentSlot.endTime
                                                    ? `${currentSlot.startTime} - ${currentSlot.endTime}`
                                                    : 'Set times'}
                                            </span>
                                        ) : (
                                            <span className="text-red-500">Off</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderBlockTimeTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <h4 className="font-semibold">Block Time Entries</h4>
                </div>
                <Button type="button" onClick={addBlockTimeEntry} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block Time
                </Button>
            </div>

            {formData.blockedTimes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No block time entries. Click "Add Block Time" to create one.
                </div>
            ) : (
                <div className="space-y-4">
                    {formData.blockedTimes.map((entry: any, index: number) => (
                        <div key={index} className="border p-4 rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                                <h5 className="font-medium">Block Time Entry {index + 1}</h5>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeBlockTimeEntry(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor={`block-date-${index}`}>Date</Label>
                                    <Input
                                        id={`block-date-${index}`}
                                        type="date"
                                        value={entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : entry.date}
                                        onChange={(e) => handleBlockTimeChange(index, 'date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`block-start-${index}`}>Start Time</Label>
                                    <Input
                                        id={`block-start-${index}`}
                                        type="time"
                                        value={entry.startTime}
                                        onChange={(e) => handleBlockTimeChange(index, 'startTime', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`block-end-${index}`}>End Time</Label>
                                    <Input
                                        id={`block-end-${index}`}
                                        type="time"
                                        value={entry.endTime}
                                        onChange={(e) => handleBlockTimeChange(index, 'endTime', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor={`block-reason-${index}`}>Reason</Label>
                                <Textarea
                                    id={`block-reason-${index}`}
                                    value={entry.reason || ''}
                                    onChange={(e) => handleBlockTimeChange(index, 'reason', e.target.value)}
                                    placeholder="Reason for block time (e.g., Lunch break, Meeting, etc.)"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <style>{scrollbarStyle}</style>
            <DialogContent
                className="sm:max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()} // Also prevent Escape key for consistency based on "only Cancel button closes"
            >
                <DialogHeader>
                    <DialogTitle>{staff ? (hideTabs ? 'Staff Earnings' : 'Edit Staff Member') : 'Add Staff Member'}</DialogTitle>
                    <DialogDescription>
                        {hideTabs ? `View earnings and payout history for ${staff.fullName}` : (staff ? "Edit the details of the staff member." : "Add a new staff member to your team.")}
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {!hideTabs && (
                            <TabsList className={`grid w-full ${staff ? 'grid-cols-8' : 'grid-cols-7'} mb-8`}>
                                <TabsTrigger value="personal">Personal</TabsTrigger>
                                <TabsTrigger value="employment">Job</TabsTrigger>
                                <TabsTrigger value="commission">Commission</TabsTrigger>
                                <TabsTrigger value="bank">Bank</TabsTrigger>
                                <TabsTrigger value="permissions">Access</TabsTrigger>
                                <TabsTrigger value="timing">Timing</TabsTrigger>
                                <TabsTrigger value="blockTime">Block</TabsTrigger>
                                {staff && <TabsTrigger value="earnings">Earnings</TabsTrigger>}
                            </TabsList>
                        )}
                        <TabsContent value="personal" className="py-4">
                            {renderPersonalTab()}
                        </TabsContent>
                        <TabsContent value="employment" className="py-4">
                            {renderEmploymentTab()}
                        </TabsContent>
                        <TabsContent value="commission" className="py-4">
                            {renderCommissionTab()}
                        </TabsContent>
                        <TabsContent value="bank" className="py-4">
                            {renderBankDetailsTab()}
                        </TabsContent>
                        <TabsContent value="earnings" className="py-4">
                            {renderEarningsTab()}
                        </TabsContent>
                        <TabsContent value="permissions" className="py-4">
                            {renderPermissionsTab()}
                        </TabsContent>
                        <TabsContent value="timing" className="py-4">
                            {renderTimingTab()}
                        </TabsContent>
                        <TabsContent value="blockTime" className="py-4">
                            {renderBlockTimeTab()}
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isCreating || isUpdating}>
                            Cancel
                        </Button>
                        {activeTab !== 'personal' && (
                            <Button type="button" variant="outline" onClick={handlePreviousTab}>
                                Previous
                            </Button>
                        )}
                        {((activeTab !== 'blockTime' && !staff) || (activeTab !== 'earnings' && staff)) ? (
                            <Button type="button" onClick={handleNextTab}>Next</Button>
                        ) : (
                            <Button type="button" onClick={handleSubmit} disabled={isCreating || isUpdating}>
                                {isCreating || isUpdating ? 'Saving...' : 'Save Staff'}
                            </Button>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
