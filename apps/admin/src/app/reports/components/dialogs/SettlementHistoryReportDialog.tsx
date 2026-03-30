"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { SettlementHistoryReportTable } from "../tables";

interface SettlementHistoryReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettlementHistoryReportDialog = ({
    isOpen,
    onClose
}: SettlementHistoryReportDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Settlement Payment History Report</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <SettlementHistoryReportTable />
                </div>
            </DialogContent>
        </Dialog>
    );
};
