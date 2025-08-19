"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { toast } from "sonner";
import { useGetTaxFeeSettingsQuery, useUpdateTaxFeeSettingsMutation } from '@repo/store/services/api';

type FeeType = 'percentage' | 'fixed';

interface FeeSettings {
  platformFee: number;
  serviceTax: number;
  platformFeeType: FeeType;
  serviceTaxType: FeeType;
  platformFeeEnabled: boolean;
  serviceTaxEnabled: boolean;
  _id?: string;
}

export default function TaxAndFeesPage() {
  const { data: currentSettings, isLoading: isFetching } = useGetTaxFeeSettingsQuery();
  const [updateTaxFeeSettings, { isLoading: isUpdating }] = useUpdateTaxFeeSettingsMutation();
  
  const [settings, setSettings] = useState<FeeSettings>({
    platformFee: 15,
    serviceTax: 18,
    platformFeeType: 'percentage',
    serviceTaxType: 'percentage',
    platformFeeEnabled: true,
    serviceTaxEnabled: true
  });

  // Update local state when settings are fetched
  useEffect(() => {
    if (currentSettings) {
      setSettings({
        platformFee: currentSettings.platformFee || 15,
        serviceTax: currentSettings.serviceTax || 18,
        platformFeeType: currentSettings.platformFeeType || 'percentage',
        serviceTaxType: currentSettings.serviceTaxType || 'percentage',
        platformFeeEnabled: currentSettings.platformFeeEnabled ?? true,
        serviceTaxEnabled: currentSettings.serviceTaxEnabled ?? true,
        _id: currentSettings._id
      });
    }
  }, [currentSettings]);

  const handleInputChange = (field: keyof FeeSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: typeof value === 'boolean' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await updateTaxFeeSettings(settings).unwrap();
      toast.success("Tax and fee settings updated successfully");
      
      // Update local state with the returned settings
      if (result) {
        setSettings(prev => ({
          ...prev,
          ...result
        }));
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error?.data?.message || "Failed to update settings");
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tax & Fees Management</h1>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Configure Fees</CardTitle>
              <CardDescription>Configure platform fees and service tax rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Fee Section */}
              <div className="space-y-4 border border-gray-200 p-6 rounded-lg bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold">Platform Fee</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.platformFeeEnabled}
                        onChange={(e) => handleInputChange('platformFeeEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {settings.platformFeeEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Type:</span>
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          platformFeeType: 'percentage'
                        }))}
                        className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                          settings.platformFeeType === 'percentage'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={!settings.platformFeeEnabled}
                      >
                        Percentage (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          platformFeeType: 'fixed'
                        }))}
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                          settings.platformFeeType === 'fixed'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={!settings.platformFeeEnabled}
                      >
                        Fixed Amount (₹)
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="platformFee" className="block text-sm font-medium text-gray-700 mb-1">
                    {settings.platformFeeType === 'percentage' 
                      ? 'Percentage Amount' 
                      : 'Fixed Amount (₹)'}
                  </Label>
                  <div className="relative rounded-md shadow-sm">
                    <Input
                      id="platformFee"
                      type="number"
                      value={settings.platformFee}
                      onChange={(e) => handleInputChange('platformFee', e.target.value)}
                      min="0"
                      step={settings.platformFeeType === 'percentage' ? '0.1' : '1'}
                      className={`block w-full pl-3 pr-12 sm:text-sm rounded-md ${
                        !settings.platformFeeEnabled ? 'bg-gray-100' : ''
                      }`}
                      disabled={!settings.platformFeeEnabled}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {settings.platformFeeType === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Tax Section */}
              <div className="space-y-4 border border-gray-200 p-6 rounded-lg bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold">Service Tax (GST)</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.serviceTaxEnabled}
                        onChange={(e) => handleInputChange('serviceTaxEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {settings.serviceTaxEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Type:</span>
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          serviceTaxType: 'percentage'
                        }))}
                        className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                          settings.serviceTaxType === 'percentage'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={!settings.serviceTaxEnabled}
                      >
                        Percentage (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          serviceTaxType: 'fixed'
                        }))}
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                          settings.serviceTaxType === 'fixed'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={!settings.serviceTaxEnabled}
                      >
                        Fixed Amount (₹)
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="serviceTax" className="block text-sm font-medium text-gray-700 mb-1">
                    {settings.serviceTaxType === 'percentage' 
                      ? 'Percentage Amount' 
                      : 'Fixed Amount (₹)'}
                  </Label>
                  <div className="relative rounded-md shadow-sm">
                    <Input
                      id="serviceTax"
                      type="number"
                      value={settings.serviceTax}
                      onChange={(e) => handleInputChange('serviceTax', e.target.value)}
                      min="0"
                      step={settings.serviceTaxType === 'percentage' ? '0.1' : '1'}
                      className={`block w-full pl-3 pr-12 sm:text-sm rounded-md ${
                        !settings.serviceTaxEnabled ? 'bg-gray-100' : ''
                      }`}
                      disabled={!settings.serviceTaxEnabled}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {settings.serviceTaxType === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Fees Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Active Fees & Taxes</CardTitle>
              <CardDescription>Currently active fees and taxes that will be applied</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Platform Fee</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        settings.platformFeeEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {settings.platformFeeEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{settings.platformFeeType === 'percentage' ? 'Percentage' : 'Fixed Amount'}</TableCell>
                    <TableCell className="text-right">
                      {settings.platformFeeEnabled 
                        ? `${settings.platformFee}${settings.platformFeeType === 'percentage' ? '%' : '₹'}`
                        : '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Service Tax (GST)</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        settings.serviceTaxEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {settings.serviceTaxEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{settings.serviceTaxType === 'percentage' ? 'Percentage' : 'Fixed Amount'}</TableCell>
                    <TableCell className="text-right">
                      {settings.serviceTaxEnabled 
                        ? `${settings.serviceTax}${settings.serviceTaxType === 'percentage' ? '%' : '₹'}`
                        : '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                // Reset to default values
                setSettings(prev => ({
                  platformFee: 15,
                  serviceTax: 18,
                  platformFeeType: 'percentage',
                  serviceTaxType: 'percentage',
                  platformFeeEnabled: prev.platformFeeEnabled,
                  serviceTaxEnabled: prev.serviceTaxEnabled
                }));
              }}
              disabled={isUpdating}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}