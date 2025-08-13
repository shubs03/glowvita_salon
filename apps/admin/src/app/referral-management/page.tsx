
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Settings, User, Users, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

const c2cData = [
  { id: 'C2C-001', referrer: 'Alice Johnson', referee: 'Bob Williams', date: '2024-08-01', status: 'Completed', bonus: 50 },
  { id: 'C2C-002', referrer: 'Charlie Brown', referee: 'Diana Prince', date: '2024-08-02', status: 'Pending', bonus: 50 },
];

const c2vData = [
    { id: 'C2V-001', referrer: 'Clark Kent', vendor: 'Glamour Salon', date: '2024-07-15', status: 'Approved', bonus: 500 },
    { id: 'C2V-002', referrer: 'Lois Lane', vendor: 'Modern Cuts', date: '2024-07-20', status: 'Pending', bonus: 500 },
];

const v2vData = [
    { id: 'V2V-001', referrer: 'Glamour Salon', vendor: 'Style Hub', date: '2024-06-10', status: 'Paid', bonus: 1000 },
    { id: 'V2V-002', referrer: 'The Men\'s Room', vendor: 'Nail Envy', date: '2024-06-25', status: 'Pending', bonus: 1000 },
];

export default function ReferralManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'C2C' | 'C2V' | 'V2V' | null>(null);
    
    // Pagination states - could be separated further if needed
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    
    const handleOpenModal = (type: 'C2C' | 'C2V' | 'V2V') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType(null);
    };

    const ReferralTable = ({ data, headers }: { data: any[], headers: string[] }) => (
         <>
            <div className="overflow-x-auto no-scrollbar">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id}>
                                {Object.values(item).map((value: any, index: number) => <TableCell key={index}>{value}</TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={Math.ceil(data.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={data.length}
            />
        </>
    );
    
    const ReferralSettings = ({ title, settings, onEditClick }: { title: string, settings: { [key: string]: string }, onEditClick: () => void }) => (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Referral Settings</CardTitle>
                    <CardDescription>{title}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={onEditClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Settings
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {Object.entries(settings).map(([key, value]) => (
                        <div key={key} className="p-3 bg-secondary rounded-lg">
                            <p className="text-muted-foreground">{key}</p>
                            <p className="font-semibold">{value}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Referral Management</h1>
      
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">C2C Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">C2V Referrals</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div>
            <p className="text-xs text-muted-foreground">+8 new vendors this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">V2V Referrals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+5 since last week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="c2c">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="c2c">C2C</TabsTrigger>
            <TabsTrigger value="c2v">C2V</TabsTrigger>
            <TabsTrigger value="v2v">V2V</TabsTrigger>
        </TabsList>
        <TabsContent value="c2c">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>C2C Referral Program</CardTitle>
                    <CardDescription>Track referrals made by customers to other customers.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ReferralSettings 
                        title="Settings for C2C referrals"
                        settings={{
                            'Referral Bonus': '₹50',
                            'Bonus Type': 'Wallet Credit',
                            'Min. Orders for Referee': '1',
                            'Validity (Days)': '30',
                        }}
                        onEditClick={() => handleOpenModal('C2C')}
                    />
                    <ReferralTable data={c2cData} headers={['Referral ID', 'Referrer', 'Referee', 'Date', 'Status', 'Bonus']} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="c2v">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>C2V Referral Program</CardTitle>
                    <CardDescription>Track vendors referred by customers.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ReferralSettings 
                        title="Settings for C2V referrals"
                        settings={{
                            'Referral Bonus': '₹500',
                            'Bonus Type': 'Payout',
                            'Verification Status': 'Approved',
                            'Min. Bookings': '5',
                        }}
                         onEditClick={() => handleOpenModal('C2V')}
                    />
                    <ReferralTable data={c2vData} headers={['Referral ID', 'Referrer Customer', 'Referred Vendor', 'Date', 'Status', 'Bonus']} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="v2v">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>V2V Referral Program</CardTitle>
                    <CardDescription>Track vendors referred by other vendors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReferralSettings 
                        title="Settings for V2V referrals"
                        settings={{
                            'Referral Bonus': '₹1000',
                            'Bonus Type': 'Payout',
                            'Subscription Plan': 'Premium',
                             'Min. Payout Cycle': '1',
                        }}
                        onEditClick={() => handleOpenModal('V2V')}
                    />
                    <ReferralTable data={v2vData} headers={['Referral ID', 'Referrer Vendor', 'Referred Vendor', 'Date', 'Status', 'Bonus']} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit {modalType} Referral Settings</DialogTitle>
                     <DialogDescription>
                        Update the settings for the {modalType} referral program.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="bonus-amount">Referral Bonus (₹)</Label>
                        <Input id="bonus-amount" type="number" defaultValue={modalType === 'C2C' ? 50 : modalType === 'C2V' ? 500 : 1000} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bonus-type">Bonus Type</Label>
                        <Input id="bonus-type" defaultValue={modalType === 'C2C' ? 'Wallet Credit' : 'Payout'} />
                    </div>
                    {modalType === 'C2C' && (
                         <div className="space-y-2">
                            <Label htmlFor="min-orders">Min. Orders for Referee</Label>
                            <Input id="min-orders" type="number" defaultValue="1" />
                        </div>
                    )}
                     {modalType === 'C2V' && (
                         <div className="space-y-2">
                            <Label htmlFor="min-bookings">Min. Bookings</Label>
                            <Input id="min-bookings" type="number" defaultValue="5" />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button type="submit" onClick={handleCloseModal}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
