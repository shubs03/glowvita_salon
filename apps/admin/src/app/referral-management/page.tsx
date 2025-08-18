
"use client";

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import {
  openModal,
  closeModal,
  updateModalSettings,
  setPagination,
  setC2CSettings,
  setC2VSettings,
  setV2VSettings,
} from '../../../../../packages/store/src/slices/Admin/refferalSlice';
import {
  useGetReferralsQuery,
  useUpdateSettingsMutation,
  useGetSettingsQuery,
} from '../../../../../packages/store/src/services/api';
import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';

// Define default settings structure
const getDefaultSettings = () => ({
  referrerBonus: {
    bonusType: 'amount' as const,
    bonusValue: 0,
    creditTime: '7 days',
  },
  refereeBonus: {
    enabled: false,
    bonusType: 'amount' as const,
    bonusValue: 0,
    creditTime: '7 days',
  },
  usageLimit: 'unlimited' as const,
  usageCount: 0,
  minOrders: 0,
  minBookings: 0,
  minPayoutCycle: 0,
});

export default function ReferralManagementPage() {
  const dispatch = useDispatch();
  const { c2cSettings, c2vSettings, v2vSettings, modal, pagination } = useAppSelector(
      (state) => selectRootState(state).refferal
    );
  const [updateSettings] = useUpdateSettingsMutation();

  const { data: c2cSettingsData, isLoading: c2cSettingsLoading } = useGetSettingsQuery('C2C');
  const { data: c2vSettingsData, isLoading: c2vSettingsLoading } = useGetSettingsQuery('C2V');
  const { data: v2vSettingsData, isLoading: v2vSettingsLoading } = useGetSettingsQuery('V2V');

  const { data: c2cReferrals, isLoading: c2cReferralsLoading } = useGetReferralsQuery('C2C');
  const { data: c2vReferrals, isLoading: c2vReferralsLoading } = useGetReferralsQuery('C2V');
  const { data: v2vReferrals, isLoading: v2vReferralsLoading } = useGetReferralsQuery('V2V');

  // Update Redux store with fetched settings
  React.useEffect(() => {
    if (c2cSettingsData && !c2cSettingsLoading) {
      dispatch(setC2CSettings(c2cSettingsData));
    }
    if (c2vSettingsData && !c2vSettingsLoading) {
      dispatch(setC2VSettings(c2vSettingsData));
    }
    if (v2vSettingsData && !v2vSettingsLoading) {
      dispatch(setV2VSettings(v2vSettingsData));
    }
  }, [c2cSettingsData, c2vSettingsData, v2vSettingsData, c2cSettingsLoading, c2vSettingsLoading, v2vSettingsLoading, dispatch]);

  const handleOpenModal = (type: string) => {
    const currentSettings = type === 'C2C' ? c2cSettings : type === 'C2V' ? c2vSettings : v2vSettings;
    // Merge with default settings to ensure all properties exist
    const settings = {
      ...getDefaultSettings(),
      ...currentSettings,
      referrerBonus: {
        ...getDefaultSettings().referrerBonus,
        ...(currentSettings?.referrerBonus || {}),
      },
      refereeBonus: {
        ...getDefaultSettings().refereeBonus,
        ...(currentSettings?.refereeBonus || {}),
      },
    };
    dispatch(openModal({ type, settings }));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleReferrerBonusChange = (field: string, value: string | number) => {
    dispatch(updateModalSettings({
      referrerBonus: {
        ...modal.settings.referrerBonus,
        [field]: value,
      },
    }));
  };

  const handleRefereeBonusChange = (field: string, value: string | number | boolean) => {
    dispatch(updateModalSettings({
      refereeBonus: {
        ...modal.settings.refereeBonus,
        [field]: value,
      },
    }));
  };

  const handleModalChange = (field: string, value: string | number) => {
    dispatch(updateModalSettings({ [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (modal.modalType && modal.settings) {
      const result = await updateSettings({
        referralType: modal.modalType,
        settings: modal.settings,
      });
      if (result.data) {
        switch (modal.modalType) {
          case 'C2C':
            dispatch(setC2CSettings(result.data.settings));
            break;
          case 'C2V':
            dispatch(setC2VSettings(result.data.settings));
            break;
          case 'V2V':
            dispatch(setV2VSettings(result.data.settings));
            break;
        }
      }
      dispatch(closeModal());
    }
  };

  interface ReferralTableProps {
    data?: any[];
    headers: string[];
    isLoading: boolean;
  }

  const ReferralTable: React.FC<ReferralTableProps> = ({ data = [], headers, isLoading }) => (
    <>
      <div className="overflow-x-auto no-scrollbar">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header: string) => <TableHead key={header}>{header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="text-center">No referrals found</TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item?.referralId || index}>
                  <TableCell>{item?.referralId || 'N/A'}</TableCell>
                  <TableCell>{item?.referrer || 'N/A'}</TableCell>
                  <TableCell>{item?.referee || 'N/A'}</TableCell>
                  <TableCell>{item?.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{item?.status || 'N/A'}</TableCell>
                  <TableCell>{item?.bonus || 'N/A'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        className="mt-4"
        currentPage={pagination.currentPage}
        totalPages={Math.ceil(data.length / pagination.itemsPerPage)}
        onPageChange={(page) => dispatch(setPagination({ currentPage: page }))}
        itemsPerPage={pagination.itemsPerPage}
        onItemsPerPageChange={(items) => dispatch(setPagination({ itemsPerPage: items }))}
        totalItems={data.length}
      />
    </>
  );

  interface ReferralSettings {
    referrerBonus: {
      bonusType: 'discount' | 'amount';
      bonusValue: number;
      creditTime: string;
    };
    refereeBonus: {
      enabled: boolean;
      bonusType: 'discount' | 'amount';
      bonusValue: number;
      creditTime: string;
    };
    usageLimit: 'unlimited' | 'manual';
    usageCount?: number;
    minOrders?: number;
    minBookings?: number;
    minPayoutCycle?: number;
  }

  interface ReferralSettingsComponentProps {
    title: string;
    settings: ReferralSettings | null;
    onEditClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isLoading: boolean;
  }
  
  const ReferralSettingsComponent: React.FC<ReferralSettingsComponentProps> = ({
    title,
    settings,
    onEditClick,
    isLoading,
  }) => {
    if (!settings) {
      return (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Referral Settings</CardTitle>
              <CardDescription>{title}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onEditClick} disabled={isLoading}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Settings
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center">No settings available - Click "Edit Settings" to configure</div>
          </CardContent>
        </Card>
      );
    }

    // Safe access with fallbacks
    const referrerBonus = settings.referrerBonus || getDefaultSettings().referrerBonus;
    const refereeBonus = settings.refereeBonus || getDefaultSettings().refereeBonus;

    const displaySettings: Record<string, string> = {
      'Referrer Bonus': referrerBonus.bonusType === 'discount'
        ? `${referrerBonus.bonusValue || 0}%`
        : `₹${referrerBonus.bonusValue || 0}`,
      'Referrer Credit Time': referrerBonus.creditTime || 'Not set',
      'Usage Limit': settings.usageLimit === 'unlimited'
        ? 'Unlimited'
        : `Manual (${settings.usageCount || 0} referrals)`,
    };
    
    if (settings.minOrders) displaySettings['Min. Orders for Referee'] = String(settings.minOrders);
    if (settings.minBookings) displaySettings['Min. Vendor Bookings'] = String(settings.minBookings);
    if (settings.minPayoutCycle) displaySettings['Min. Vendor Payout Cycle'] = String(settings.minPayoutCycle);
    
    if (refereeBonus.enabled) {
      displaySettings['Referee Bonus'] = refereeBonus.bonusType === 'discount'
        ? `${refereeBonus.bonusValue || 0}%`
        : `₹${refereeBonus.bonusValue || 0}`;
      displaySettings['Referee Credit Time'] = refereeBonus.creditTime || 'Not set';
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
          <Button variant="outline" size="sm" onClick={onEditClick} disabled={isLoading}>
            <Settings className="mr-2 h-4 w-4" />
            Edit Settings
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center">Loading settings...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(displaySettings).map(([key, value]) => (
                <div key={key} className="p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">{key}</p>
                  <p className="font-semibold">{value}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
            <div className="text-2xl font-bold">{c2cReferralsLoading ? '...' : (c2cReferrals?.length || 0)}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">C2V Referrals</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c2vReferralsLoading ? '...' : (c2vReferrals?.length || 0)}</div>
            <p className="text-xs text-muted-foreground">+8 new vendors this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">V2V Referrals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{v2vReferralsLoading ? '...' : (v2vReferrals?.length || 0)}</div>
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
                isLoading={c2cSettingsLoading}
              />
              <ReferralTable 
                data={c2cReferrals || []} 
                headers={['Referral ID', 'Referrer', 'Referee', 'Date', 'Status', 'Bonus']} 
                isLoading={c2cReferralsLoading}
              />
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
                isLoading={c2vSettingsLoading}
              />
              <ReferralTable 
                data={c2vReferrals || []} 
                headers={['Referral ID', 'Referrer Customer', 'Referred Vendor', 'Date', 'Status', 'Bonus']} 
                isLoading={c2vReferralsLoading}
              />
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
                isLoading={v2vSettingsLoading}
              />
              <ReferralTable 
                data={v2vReferrals || []} 
                headers={['Referral ID', 'Referrer Vendor', 'Referred Vendor', 'Date', 'Status', 'Bonus']} 
                isLoading={v2vReferralsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={modal.isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {modal.modalType} Referral Settings</DialogTitle>
            <DialogDescription>
              Update the settings for the {modal.modalType} referral program.
            </DialogDescription>
          </DialogHeader>
          {modal.settings && (
            <div className="grid gap-6 py-4">
              <div>
                <Label className='text-base font-semibold'>Referrer Bonus</Label>
                <div className="grid gap-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bonus Type</Label>
                      <Select
                        value={modal.settings.referrerBonus?.bonusType || 'amount'}
                        onValueChange={(v) => handleReferrerBonusChange('bonusType', v)}
                      >
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
                      <Input
                        id="bonus-value"
                        type="number"
                        value={modal.settings.referrerBonus?.bonusValue || 0}
                        onChange={(e) => handleReferrerBonusChange('bonusValue', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit-time">Credit Time (in days)</Label>
                    <Input
                      id="credit-time"
                      placeholder="e.g., 7"
                      value={modal.settings.referrerBonus?.creditTime?.split(' ')[0] || '7'}
                      onChange={(e) => handleReferrerBonusChange('creditTime', `${e.target.value} days`)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <RadioGroup
                  value={modal.settings.usageLimit || 'unlimited'}
                  onValueChange={(v) => handleModalChange('usageLimit', v)}
                  className="flex space-x-4"
                >
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
              {modal.settings.usageLimit === 'manual' && (
                <div className="space-y-2">
                  <Label htmlFor="usage-count">Number of Referrals</Label>
                  <Input
                    id="usage-count"
                    type="number"
                    placeholder="e.g., 100"
                    value={modal.settings.usageCount || ''}
                    onChange={(e) => handleModalChange('usageCount', Number(e.target.value))}
                  />
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Referee Bonus</Label>
                  <Switch
                    id="referee-bonus-toggle"
                    checked={modal.settings.refereeBonus?.enabled || false}
                    onCheckedChange={(c) => handleRefereeBonusChange('enabled', c)}
                  />
                </div>
                {modal.settings.refereeBonus?.enabled && (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bonus Type</Label>
                        <Select
                          value={modal.settings.refereeBonus?.bonusType || 'amount'}
                          onValueChange={(v) => handleRefereeBonusChange('bonusType', v)}
                        >
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
                        <Input
                          id="referee-bonus-value"
                          type="number"
                          value={modal.settings.refereeBonus?.bonusValue || 0}
                          onChange={(e) => handleRefereeBonusChange('bonusValue', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referee-credit-time">Credit Time (in days)</Label>
                      <Input
                        id="referee-credit-time"
                        placeholder="e.g., 7"
                        value={modal.settings.refereeBonus?.creditTime?.split(' ')[0] || '7'}
                        onChange={(e) => handleRefereeBonusChange('creditTime', `${e.target.value} days`)}
                      />
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
