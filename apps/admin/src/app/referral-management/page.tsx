
"use client";

import * as React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { Switch } from '@repo/ui/switch';

const c2cData = [
  { id: 'C2C-001', referrer: 'Alice Johnson', referee: 'Bob Williams', date: '2024-08-01', status: 'Completed', bonus: '₹50' },
  { id: 'C2C-002', referrer: 'Charlie Brown', referee: 'Diana Prince', date: '2024-08-02', status: 'Pending', bonus: '₹50' },
];

const c2vData = [
    { id: 'C2V-001', referrer: 'Clark Kent', vendor: 'Glamour Salon', date: '2024-07-15', status: 'Approved', bonus: '₹500' },
    { id: 'C2V-002', referrer: 'Lois Lane', vendor: 'Modern Cuts', date: '2024-07-20', status: 'Pending', bonus: '₹500' },
];

const v2vData = [
    { id: 'V2V-001', referrer: 'Glamour Salon', vendor: 'Style Hub', date: '2024-06-10', status: 'Paid', bonus: '₹1000' },
    { id: 'V2V-002', referrer: 'The Men\'s Room', vendor: 'Nail Envy', date: '2024-06-25', status: 'Pending', bonus: '₹1000' },
];

type ReferralType = 'C2C' | 'C2V' | 'V2V';

interface RefereeBonusConfig {
    enabled: boolean;
    bonusType: 'discount' | 'amount';
    bonusValue: number;
    creditTime: string; // e.g., "7 days"
}

interface ReferralSettingsConfig {
    bonusType: 'discount' | 'amount';
    bonusValue: number;
    usageLimit: 'unlimited' | 'manual';
    usageCount: number | null;
    creditTime: string; // e.g., "7 days"
    refereeBonus: RefereeBonusConfig;
    minOrders?: number; // C2C specific
    minBookings?: number; // C2V specific
    minPayoutCycle?: number; // V2V specific
}


export default function ReferralManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ReferralType | null>(null);

    const [c2cSettings, setC2cSettings] = useState<ReferralSettingsConfig>({
        bonusType: 'amount',
        bonusValue: 50,
        usageLimit: 'unlimited',
        usageCount: null,
        creditTime: '48 hours',
        minOrders: 1,
        refereeBonus: {
            enabled: true,
            bonusType: 'discount',
            bonusValue: 10,
            creditTime: '24 hours',
        },
    });
     const [c2vSettings, setC2vSettings] = useState<ReferralSettingsConfig>({
        bonusType: 'amount',
        bonusValue: 500,
        usageLimit: 'manual',
        usageCount: 100,
        creditTime: '15 days',
        minBookings: 5,
        refereeBonus: {
            enabled: false,
            bonusType: 'amount',
            bonusValue: 200,
            creditTime: '15 days',
        },
    });
     const [v2vSettings, setV2vSettings] = useState<ReferralSettingsConfig>({
        bonusType: 'amount',
        bonusValue: 1000,
        usageLimit: 'unlimited',
        usageCount: null,
        creditTime: '30 days',
        minPayoutCycle: 1,
        refereeBonus: {
            enabled: false,
            bonusType: 'amount',
            bonusValue: 500,
            creditTime: '30 days',
        },
    });
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    
    const handleOpenModal = (type: ReferralType) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType(null);
    };

    const getCurrentSettings = () => {
        switch(modalType) {
            case 'C2C': return c2cSettings;
            case 'C2V': return c2vSettings;
            case 'V2V': return v2vSettings;
            default: return null;
        }
    };
    
    // A temporary state to manage modal inputs
    const [modalSettings, setModalSettings] = useState<ReferralSettingsConfig | null>(null);

    React.useEffect(() => {
        if (isModalOpen && modalType) {
            setModalSettings(getCurrentSettings());
        } else {
            setModalSettings(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, modalType]);

    const handleModalChange = (field: keyof ReferralSettingsConfig, value: any) => {
        if (modalSettings) {
            setModalSettings({ ...modalSettings, [field]: value });
        }
    };
    
    const handleRefereeBonusChange = (field: keyof RefereeBonusConfig, value: any) => {
        if (modalSettings) {
            setModalSettings({
                ...modalSettings,
                refereeBonus: {
                    ...modalSettings.refereeBonus,
                    [field]: value,
                },
            });
        }
    };
    
    const handleSaveChanges = () => {
        if (modalType && modalSettings) {
            switch(modalType) {
                case 'C2C': setC2cSettings(modalSettings); break;
                case 'C2V': setC2vSettings(modalSettings); break;
                case 'V2V': setV2vSettings(modalSettings); break;
            }
        }
        handleCloseModal();
    }


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
    
    const ReferralSettingsComponent = ({ title, settings, onEditClick }: { title: string, settings: ReferralSettingsConfig, onEditClick: () => void }) => {
        const displaySettings: { [key: string]: string } = {
            'Referrer Bonus': settings.bonusType === 'discount' ? `${settings.bonusValue}%` : `₹${settings.bonusValue}`,
            'Usage Limit': settings.usageLimit === 'unlimited' ? 'Unlimited' : `Manual (${settings.usageCount} referrals)`,
            'Referrer Credit Time': settings.creditTime,
        };
        if(settings.minOrders) displaySettings['Min. Orders for Referee'] = String(settings.minOrders);
        if(settings.minBookings) displaySettings['Min. Vendor Bookings'] = String(settings.minBookings);
        if(settings.minPayoutCycle) displaySettings['Min. Vendor Payout Cycle'] = String(settings.minPayoutCycle);
        
        if (settings.refereeBonus.enabled) {
            displaySettings['Referee Bonus'] = settings.refereeBonus.bonusType === 'discount' 
                ? `${settings.refereeBonus.bonusValue}%` 
                : `₹${settings.refereeBonus.bonusValue}`;
            displaySettings['Referee Credit Time'] = settings.refereeBonus.creditTime;
        } else {
            displaySettings['Referee Bonus'] = 'Disabled';
        }

        return (
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
                        {Object.entries(displaySettings).map(([key, value]) => (
                            <div key={key} className="p-3 bg-secondary rounded-lg">
                                <p className="text-muted-foreground">{key}</p>
                                <p className="font-semibold">{value}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
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
                     <ReferralSettingsComponent 
                        title="Settings for C2C referrals"
                        settings={c2cSettings}
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
                     <ReferralSettingsComponent 
                        title="Settings for C2V referrals"
                        settings={c2vSettings}
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
                    <ReferralSettingsComponent 
                        title="Settings for V2V referrals"
                        settings={v2vSettings}
                        onEditClick={() => handleOpenModal('V2V')}
                    />
                    <ReferralTable data={v2vData} headers={['Referral ID', 'Referrer Vendor', 'Referred Vendor', 'Date', 'Status', 'Bonus']} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit {modalType} Referral Settings</DialogTitle>
                     <DialogDescription>
                        Update the settings for the {modalType} referral program.
                    </DialogDescription>
                </DialogHeader>
                {modalSettings && (
                    <div className="grid gap-6 py-4">
                        <div>
                            <Label className='text-base font-semibold'>Referrer Bonus</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="space-y-2">
                                    <Label>Bonus Type</Label>
                                    <Select value={modalSettings.bonusType} onValueChange={(v) => handleModalChange('bonusType', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="amount">Fixed Amount</SelectItem>
                                            <SelectItem value="discount">Discount (%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bonus-value">Bonus Value</Label>
                                    <Input id="bonus-value" type="number" value={modalSettings.bonusValue} onChange={(e) => handleModalChange('bonusValue', Number(e.target.value))} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Usage Limit</Label>
                            <RadioGroup value={modalSettings.usageLimit} onValueChange={(v) => handleModalChange('usageLimit', v)} className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="unlimited" id="unlimited" />
                                    <Label htmlFor="unlimited">Unlimited</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="manual" id="manual" />
                                    <Label htmlFor="manual">Manual Count</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {modalSettings.usageLimit === 'manual' && (
                             <div className="space-y-2">
                                <Label htmlFor="usage-count">Number of Referrals</Label>
                                <Input id="usage-count" type="number" placeholder="e.g., 100" value={modalSettings.usageCount || ''} onChange={(e) => handleModalChange('usageCount', Number(e.target.value))} />
                            </div>
                        )}
                         <div className="space-y-2">
                            <Label htmlFor="credit-time">Credit Time (in days)</Label>
                            <Input id="credit-time" placeholder="e.g., 7" value={modalSettings.creditTime.split(' ')[0]} onChange={(e) => handleModalChange('creditTime', `${e.target.value} days`)} />
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t">
                             <div className="flex items-center justify-between">
                                <Label htmlFor="referee-bonus-toggle" className="text-base font-semibold">Referee Bonus</Label>
                                <Switch id="referee-bonus-toggle" checked={modalSettings.refereeBonus.enabled} onCheckedChange={(c) => handleRefereeBonusChange('enabled', c)} />
                            </div>
                            {modalSettings.refereeBonus.enabled && (
                                <div className='grid gap-4'>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                            <Label>Bonus Type</Label>
                                            <Select value={modalSettings.refereeBonus.bonusType} onValueChange={(v) => handleRefereeBonusChange('bonusType', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="amount">Fixed Amount</SelectItem>
                                                    <SelectItem value="discount">Discount (%)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="referee-bonus-value">Bonus Value</Label>
                                            <Input id="referee-bonus-value" type="number" value={modalSettings.refereeBonus.bonusValue} onChange={(e) => handleRefereeBonusChange('bonusValue', Number(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="referee-credit-time">Credit Time (in days)</Label>
                                        <Input id="referee-credit-time" placeholder="e.g., 7" value={modalSettings.refereeBonus.creditTime.split(' ')[0]} onChange={(e) => handleRefereeBonusChange('creditTime', `${e.target.value} days`)} />
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button type="submit" onClick={handleSaveChanges}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
