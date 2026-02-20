"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Settings, Save, Loader2, Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";
import { useGetWalletSettingsQuery, useUpdateWalletSettingsMutation } from "@repo/store/services/api";

interface WalletSettings {
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  maxDailyWithdrawalAmount: number;
  maxWithdrawalsPerDay: number;
  minAddMoneyAmount: number;
  maxAddMoneyAmount: number;
  withdrawalFeeType: "fixed" | "percentage" | "none";
  withdrawalFeeValue: number;
  cooldownPeriodHours: number;
}

const defaultSettings: WalletSettings = {
  minWithdrawalAmount: 100,
  maxWithdrawalAmount: 50000,
  maxDailyWithdrawalAmount: 100000,
  maxWithdrawalsPerDay: 3,
  minAddMoneyAmount: 10,
  maxAddMoneyAmount: 100000,
  withdrawalFeeType: "none",
  withdrawalFeeValue: 0,
  cooldownPeriodHours: 0,
};

export function WalletSettingsTab() {
  const [settings, setSettings] = useState<WalletSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // RTK Query hooks
  const { data: walletSettingsData, isLoading, isError, error } = useGetWalletSettingsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [updateWalletSettings, { isLoading: isSaving }] = useUpdateWalletSettingsMutation();

  // Load settings from API when data is available
  useEffect(() => {
    if (walletSettingsData?.success && walletSettingsData?.data) {
      setSettings({
        minWithdrawalAmount: walletSettingsData.data.minWithdrawalAmount,
        maxWithdrawalAmount: walletSettingsData.data.maxWithdrawalAmount,
        maxDailyWithdrawalAmount: walletSettingsData.data.maxDailyWithdrawalAmount,
        maxWithdrawalsPerDay: walletSettingsData.data.maxWithdrawalsPerDay,
        minAddMoneyAmount: walletSettingsData.data.minAddMoneyAmount,
        maxAddMoneyAmount: walletSettingsData.data.maxAddMoneyAmount,
        withdrawalFeeType: walletSettingsData.data.withdrawalFeeType,
        withdrawalFeeValue: walletSettingsData.data.withdrawalFeeValue,
        cooldownPeriodHours: walletSettingsData.data.cooldownPeriodHours,
      });
      setHasChanges(false);
    }
  }, [walletSettingsData]);

  // Show error toast if API fails
  useEffect(() => {
    if (isError) {
      const errorMessage = (error as any)?.data?.message || "Failed to load wallet settings";
      toast.error(errorMessage);
    }
  }, [isError, error]);

  const handleSettingChange = (field: keyof WalletSettings, value: number | boolean | string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      const result = await updateWalletSettings(settings).unwrap();
      
      if (result.success) {
        toast.success(result.message || "Wallet settings saved successfully");
        setHasChanges(false);
      } else {
        toast.error(result.message || "Failed to save wallet settings");
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to save wallet settings";
      toast.error(errorMessage);
      console.error("Error saving wallet settings:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Wallet Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure withdrawal limits, fees, and security settings
          </p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Withdrawal Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Withdrawal Limits
          </CardTitle>
          <CardDescription>
            Set minimum and maximum withdrawal amounts per transaction and daily limits
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="minWithdrawal">Minimum Withdrawal (₹)</Label>
            <Input
              id="minWithdrawal"
              type="number"
              value={settings.minWithdrawalAmount}
              onChange={(e) => handleSettingChange("minWithdrawalAmount", Number(e.target.value))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Minimum amount per withdrawal</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxWithdrawal">Maximum Withdrawal (₹)</Label>
            <Input
              id="maxWithdrawal"
              type="number"
              value={settings.maxWithdrawalAmount}
              onChange={(e) => handleSettingChange("maxWithdrawalAmount", Number(e.target.value))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Maximum amount per withdrawal</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxDailyWithdrawal">Daily Withdrawal Limit (₹)</Label>
            <Input
              id="maxDailyWithdrawal"
              type="number"
              value={settings.maxDailyWithdrawalAmount}
              onChange={(e) => handleSettingChange("maxDailyWithdrawalAmount", Number(e.target.value))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Total withdrawal limit per day</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxWithdrawalsPerDay">Max Withdrawals Per Day</Label>
            <Input
              id="maxWithdrawalsPerDay"
              type="number"
              value={settings.maxWithdrawalsPerDay}
              onChange={(e) => handleSettingChange("maxWithdrawalsPerDay", Number(e.target.value))}
              min={1}
            />
            <p className="text-xs text-muted-foreground">Number of withdrawals allowed per day</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooldownPeriod">Cooldown Period (Hours)</Label>
            <Input
              id="cooldownPeriod"
              type="number"
              value={settings.cooldownPeriodHours}
              onChange={(e) => handleSettingChange("cooldownPeriodHours", Number(e.target.value))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Hours between withdrawals (0 = no cooldown)</p>
          </div>
        </CardContent>
      </Card>

      {/* Add Money Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-primary" />
            Add Money Limits
          </CardTitle>
          <CardDescription>
            Configure limits for adding money to wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="minAddMoney">Minimum Add Amount (₹)</Label>
            <Input
              id="minAddMoney"
              type="number"
              value={settings.minAddMoneyAmount}
              onChange={(e) => handleSettingChange("minAddMoneyAmount", Number(e.target.value))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Minimum amount to add per transaction</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAddMoney">Maximum Add Amount (₹)</Label>
            <Input
              id="maxAddMoney"
              type="number"
              value={settings.maxAddMoneyAmount}
              onChange={(e) => handleSettingChange("maxAddMoneyAmount", Number(e.target.value))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Maximum amount to add per transaction</p>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Withdrawal Fees
          </CardTitle>
          <CardDescription>
            Configure fees charged on withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="feeType">Fee Type</Label>
            <select
              id="feeType"
              value={settings.withdrawalFeeType}
              onChange={(e) => handleSettingChange("withdrawalFeeType", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="none">No Fee</option>
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
            </select>
            <p className="text-xs text-muted-foreground">Type of fee to charge</p>
          </div>

          {settings.withdrawalFeeType !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="feeValue">
                Fee Value {settings.withdrawalFeeType === "percentage" ? "(%)" : "(₹)"}
              </Label>
              <Input
                id="feeValue"
                type="number"
                value={settings.withdrawalFeeValue}
                onChange={(e) => handleSettingChange("withdrawalFeeValue", Number(e.target.value))}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                {settings.withdrawalFeeType === "percentage" 
                  ? "Percentage of withdrawal amount" 
                  : "Fixed fee per withdrawal"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
