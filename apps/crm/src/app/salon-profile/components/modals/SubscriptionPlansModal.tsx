import React from "react";
import { SubscriptionPlansDialog as OriginalSubscriptionPlansDialog } from "@/components/SubscriptionPlansDialog";

interface SubscriptionPlansModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: any;
  userType: 'vendor' | 'supplier' | 'doctor';
}

export const SubscriptionPlansModal = ({
  open,
  onOpenChange,
  subscription,
  userType
}: SubscriptionPlansModalProps) => {
  return (
    <OriginalSubscriptionPlansDialog
      open={open}
      onOpenChange={onOpenChange}
      subscription={subscription}
      userType={userType}
    />
  );
};