import { Button } from "@repo/ui/button";
import { Copy, FileSpreadsheet, FileText, Printer } from 'lucide-react';

export const ExportOptions = ({ onExport, tableName }: { onExport: (format: string) => void; tableName: string; }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => onExport('copy')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('print')}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>
    );
};
