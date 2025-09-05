"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { LogOut } from "lucide-react";

interface LogoutConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: LogoutConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-destructive" />
            <DialogTitle>Confirm Logout</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to log out? You will need to sign in again to
            access your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Log out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
