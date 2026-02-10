import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToExcel = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;

  const table = tableRef.current.querySelector('table');
  if (!table) return;

  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToCSV = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;

  const table = tableRef.current.querySelector('table');
  if (!table) return;

  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  XLSX.writeFile(wb, `${fileName}.csv`);
};

export const exportToPDF = async (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;

  // Get only the table element, not the entire container
  const table = tableRef.current.querySelector('table');
  if (!table) return;

  // Use html2canvas to capture only the table
  const canvas = await html2canvas(table);
  const imgData = canvas.toDataURL('image/png');

  // Create PDF
  const pdf = new jsPDF();
  const imgWidth = pdf.internal.pageSize.getWidth() - 20; // Add some margins
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight); // Add margins
  pdf.save(`${fileName}.pdf`);
};

export const copyToClipboard = (tableRef: React.RefObject<HTMLDivElement>) => {
  if (!tableRef.current) return;

  const table = tableRef.current.querySelector('table');
  if (!table) return;

  // Get table HTML
  const range = document.createRange();
  range.selectNode(table);
  window.getSelection()?.removeAllRanges();
  window.getSelection()?.addRange(range);
  document.execCommand('copy');
  window.getSelection()?.removeAllRanges();

  // Show success message (you might want to implement a toast notification)
  alert('Table copied to clipboard!');
};

export const printTable = (tableRef: React.RefObject<HTMLDivElement>) => {
  if (!tableRef.current) return;

  // Get only the table element, not the entire container
  const table = tableRef.current.querySelector('table');
  if (!table) return;

  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Print Report</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};
