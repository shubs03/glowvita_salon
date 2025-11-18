import { Button } from "@repo/ui/button";
import { Mail, Printer, Download, Calendar, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from 'sonner';

interface InvoiceData {
  invoiceNumber: string | number;
  date: string;
  time: string;
  client: any;
  status: string;
  items: any[];
  subtotal: number;
  originalSubtotal?: number;
  discount?: number;
  tax: number;
  platformFee: number;
  total: number;
  balance: number;
  paymentMethod: string | null;
}

interface InvoiceUIProps {
  invoiceData: InvoiceData;
  vendorName: string;
  vendorProfile: any;
  taxRate: number;
  isOrderSaved: boolean;
  onEmailClick: () => void;
  onPrintClick: () => void;
  onDownloadClick: () => void;
  onRebookClick: () => void;
}

export function InvoiceUI({
  invoiceData,
  vendorName,
  vendorProfile,
  taxRate,
  isOrderSaved,
  onEmailClick,
  onPrintClick,
  onDownloadClick,
  onRebookClick
}: InvoiceUIProps) {
  // Get vendor contact info
  const vendorPhone = vendorProfile?.data?.mobile || vendorProfile?.data?.phone || 'N/A';
  const vendorAddress = vendorProfile?.data?.address || 'N/A';

  // Split address into multiple lines if it's too long
  const formatAddress = (address: string) => {
    if (!address || address === 'N/A') return address;
    
    // If address is longer than 50 characters, try to split it into 2-3 lines
    if (address.length > 50) {
      const words = address.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + word).length > 40 && currentLine.length > 0) {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      }
      
      if (currentLine.trim().length > 0) {
        lines.push(currentLine.trim());
      }
      
      return lines.join('<br />');
    }
    
    return address;
  };

  // Determine if item is a product or service
  const isProduct = (item: any) => {
    return item.hasOwnProperty('productName') && item.hasOwnProperty('stock');
  };

  // State for popup dialog
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Handle item click to show popup
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white font-sans print:p-4 rounded-lg print:rounded-none" style={{ minWidth: 'auto' }}>
      {/* Header with Salon Info */}
      <div className="flex justify-between items-start mb-4 print:mb-3 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-xl font-bold text-black print:text-lg">{vendorName}</h1>
          <div className="text-black text-sm mt-1 print:text-xs" dangerouslySetInnerHTML={{ __html: formatAddress(vendorAddress) }} />
          <p className="text-black text-sm mt-1 print:text-xs">Phone: {vendorPhone}</p>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black print:text-xl">INVOICE</h2>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between items-start mb-4 print:mb-3">
        <div>
          <p className="text-black text-sm print:text-xs"><span className="font-semibold">Date:</span> {invoiceData.date}</p>
        </div>
        <div className="text-right">
          <p className="text-black text-sm print:text-xs"><span className="font-semibold">Invoice No:</span> {invoiceData.invoiceNumber}</p>
        </div>
      </div>

      {/* Horizontal line */}
      <div className="border-t border-black my-4 print:my-3"></div>

      {/* Invoice To section */}
      <div className="mb-4 print:mb-3">
        <p className="text-black text-sm print:text-xs"><span className="font-semibold">Invoice To:</span> {invoiceData.client?.fullName || 'N/A'}</p>
      </div>

      {/* Combined Items and Payment Summary Table */}
      <div className="mb-6 print:mb-4">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left text-sm font-bold text-black print:text-xs print:p-1">ITEM DESCRIPTION</th>
              <th className="border border-black p-2 text-right text-sm font-bold text-black print:text-xs print:p-1">₹ PRICE</th>
              <th className="border border-black p-2 text-right text-sm font-bold text-black print:text-xs print:p-1">QTY</th>
              <th className="border border-black p-2 text-right text-sm font-bold text-black print:text-xs print:p-1">₹ TAX</th>
              <th className="border border-black p-2 text-right text-sm font-bold text-black print:text-xs print:p-1">₹ AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item: any, index: number) => (
              <tr 
                key={index} 
                className="border border-black cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <td className="border border-black p-2 print:p-1">
                  <div className="font-semibold text-sm text-black print:text-xs">
                    {isProduct(item) ? item.productName : item.name}
                  </div>
                </td>
                <td className="border border-black p-2 text-right text-sm text-black print:text-xs print:p-1">₹{item.price.toFixed(2)}</td>
                <td className="border border-black p-2 text-right text-sm text-black print:text-xs print:p-1">{item.quantity}</td>
                <td className="border border-black p-2 text-right text-sm text-black print:text-xs print:p-1">₹{((item.price * item.quantity * taxRate) / 100).toFixed(2)}</td>
                <td className="border border-black p-2 text-right text-sm font-semibold text-black print:text-xs print:p-1">₹{item.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
            {/* Payment Summary Rows */}
            <tr className="border border-black">
              <td className="border border-black p-2 text-right font-semibold text-black text-sm print:text-xs print:p-1" colSpan={4}>Subtotal:</td>
              <td className="border border-black p-2 text-right text-sm font-semibold text-black print:text-xs print:p-1">₹{invoiceData.originalSubtotal?.toFixed(2) || invoiceData.subtotal.toFixed(2)}</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-2 text-right font-semibold text-green-600 text-sm print:text-xs print:p-1" colSpan={4}>Discount:</td>
              <td className="border border-black p-2 text-right text-sm font-semibold text-green-600 print:text-xs print:p-1">-₹{(invoiceData.discount || 0).toFixed(2)}</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-2 text-right font-semibold text-black text-sm print:text-xs print:p-1" colSpan={4}>Tax ({taxRate}%):</td>
              <td className="border border-black p-2 text-right text-sm font-semibold text-black print:text-xs print:p-1">₹{invoiceData.tax.toFixed(2)}</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-2 text-right font-semibold text-black text-sm print:text-xs print:p-1" colSpan={4}>Platform Fee:</td>
              <td className="border border-black p-2 text-right text-sm font-semibold text-black print:text-xs print:p-1">₹{invoiceData.platformFee.toFixed(2)}</td>
            </tr>
            <tr className="border border-black bg-gray-200">
              <td className="border border-black p-2 text-right font-bold text-black text-sm print:text-xs print:p-1" colSpan={4}>Total:</td>
              <td className="border border-black p-2 text-right font-bold text-black text-sm print:text-xs print:p-1">₹{invoiceData.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Info and Footer */}
      <div className="border-t-2 border-black pt-4 print:pt-3 mt-auto">
        <p className="text-center text-black font-medium text-sm print:text-xs mb-2">
          {invoiceData.paymentMethod 
            ? `Payment Of ₹${invoiceData.total.toFixed(2)} Received By ${invoiceData.paymentMethod}`
            : `Payment Of ₹${invoiceData.total.toFixed(2)} Is Pending`
          }
        </p>
        <p className="text-center text-xs text-black print:text-xs">
          NOTE: This is computer generated receipt and does not require physical signature.
        </p>
      </div>

      {/* Item Detail Popup */}
      {isPopupOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Item Details</h3>
              <button 
                onClick={() => setIsPopupOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold">Item Name</p>
                <p className="text-sm">{isProduct(selectedItem) ? selectedItem.productName : selectedItem.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Price</p>
                  <p className="text-sm">₹{selectedItem.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Quantity</p>
                  <p className="text-sm">{selectedItem.quantity}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Discount</p>
                  <p className="text-sm">
                    {selectedItem.discount ? (
                      selectedItem.discountType === 'percentage' ? 
                      `${selectedItem.discount}%` : 
                      `₹${selectedItem.discount}`
                    ) : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Total</p>
                  <p className="text-sm">₹{selectedItem.totalPrice.toFixed(2)}</p>
                </div>
              </div>
              
              {selectedItem.staffMember && selectedItem.staffMember.name && (
                <div>
                  <p className="text-sm font-semibold">Staff Member</p>
                  <p className="text-sm">{selectedItem.staffMember.name}</p>
                </div>
              )}
              
              {isProduct(selectedItem) ? (
                <div>
                  <p className="text-sm font-semibold">Stock</p>
                  <p className="text-sm">{selectedItem.stock}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold">Duration</p>
                  <p className="text-sm">{selectedItem.duration} min</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceUI;