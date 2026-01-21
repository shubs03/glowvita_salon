"use client";

import React from 'react';
import { Button } from "@repo/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { FileDown, Copy, FileText, FileSpreadsheet, Printer, File as FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

interface Column {
    header: string;
    key: string;
    transform?: (value: any, item: any) => string;
}

interface ExportButtonsProps {
    data: any[];
    columns: Column[];
    filename?: string;
    title?: string;
    className?: string;
}

export function ExportButtons({
    data,
    columns,
    filename = 'export',
    title = 'Export Data',
    className = '',
}: ExportButtonsProps) {

    const getExportData = () => {
        return data.map(item => {
            const row: any = {};
            columns.forEach(col => {
                let value = item[col.key];
                if (col.transform) {
                    value = col.transform(value, item);
                }
                row[col.header] = value;
            });
            return row;
        });
    };

    const handleCopy = () => {
        const exportData = getExportData();
        if (exportData.length === 0) {
            toast.error('No data to copy');
            return;
        }

        const headers = columns.map(col => col.header).join('\t');
        const rows = exportData.map(row =>
            columns.map(col => row[col.header]).join('\t')
        ).join('\n');

        const text = `${headers}\n${rows}`;

        navigator.clipboard.writeText(text)
            .then(() => toast.success('Data copied to clipboard'))
            .catch(err => {
                console.error('Failed to copy data:', err);
                toast.error('Failed to copy data');
            });
    };

    const handleExcel = () => {
        const exportData = getExportData();
        if (exportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        saveAs(dataBlob, `${filename}_${new Date().getTime()}.xlsx`);
        toast.success('Excel file downloaded');
    };

    const handleCSV = () => {
        const exportData = getExportData();
        if (exportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        saveAs(dataBlob, `${filename}_${new Date().getTime()}.csv`);
        toast.success('CSV file downloaded');
    };

    const handlePDF = () => {
        const exportData = getExportData();
        if (exportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);

        // Simple table rendering manually if autoTable is missing
        // We'll try to use a basic approach
        let y = 30;
        const margin = 14;
        const pageWidth = doc.internal.pageSize.getWidth();
        const cellWidth = (pageWidth - margin * 2) / columns.length;

        // Headers
        doc.setFont('helvetica', 'bold');
        columns.forEach((col, i) => {
            doc.text(col.header, margin + (i * cellWidth), y);
        });

        y += 7;
        doc.line(margin, y - 5, pageWidth - margin, y - 5);

        // Rows
        doc.setFont('helvetica', 'normal');
        exportData.forEach((row, rowIndex) => {
            if (y > 280) {
                doc.addPage();
                y = 20;
                // Redraw headers on new page
                doc.setFont('helvetica', 'bold');
                columns.forEach((col, i) => {
                    doc.text(col.header, margin + (i * cellWidth), y);
                });
                y += 7;
                doc.line(margin, y - 5, pageWidth - margin, y - 5);
                doc.setFont('helvetica', 'normal');
            }

            columns.forEach((col, i) => {
                const text = String(row[col.header] || '');
                // Proper text truncation using splitTextToSize
                const lines = doc.splitTextToSize(text, cellWidth - 2);
                const truncatedText = lines[0] + (lines.length > 1 ? '...' : '');
                doc.text(truncatedText, margin + (i * cellWidth), y);
            });
            y += 7;
        });

        doc.save(`${filename}_${new Date().getTime()}.pdf`);
        toast.success('PDF file downloaded');
    };

    const handlePrint = () => {
        const exportData = getExportData();
        if (exportData.length === 0) {
            toast.error('No data to print');
            return;
        }

        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-size: 12px; }
                    th { background-color: #f4f4f4; font-weight: bold; }
                    tr:nth-child(even) { background-color: #fafafa; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <table>
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col.header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${exportData.map(row => `
                            <tr>
                                ${columns.map(col => `<td>${row[col.header] || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p style="margin-top: 20px; font-size: 10px; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
            </body>
            </html>
        `;

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(content);
            doc.close();

            // Wait for styles/content to load before printing
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                // Remove the iframe after a delay
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={className}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCSV}>
                    <FileIcon className="mr-2 h-4 w-4" />
                    CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
