"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { PlatformCollectionsReportTable } from "../tables";

interface PlatformCollectionsReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PlatformCollectionsReportDialog = ({
    isOpen,
    onClose
}: PlatformCollectionsReportDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Platform Collections Report (Products)</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <PlatformCollectionsReportTable />
                </div>
            </DialogContent>
        </Dialog>
    );
};
