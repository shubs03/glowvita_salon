import { Button } from "@repo/ui/button";
import { Mail, Calendar, UserCheck } from "lucide-react";
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
    couponCode?: string;
}

interface AppointmentInvoiceProps {
    invoiceData: InvoiceData;
    vendorName: string;
    vendorProfile: any;
    taxRate: number;
    isOrderSaved: boolean;
    onEmailClick: () => void;
    onRebookClick: () => void;
}

export function AppointmentInvoice({
    invoiceData,
    vendorName,
    vendorProfile,
    taxRate,
    isOrderSaved,
    onEmailClick,
    onRebookClick
}: AppointmentInvoiceProps) {
    // Get vendor contact info
    const vendorPhone = vendorProfile?.data?.phone || vendorProfile?.data?.mobile || 'N/A';
    const vendorAddress = [
        vendorProfile?.data?.address,
        vendorProfile?.data?.city,
        vendorProfile?.data?.state,
        vendorProfile?.data?.pincode
    ].filter(Boolean).join(', ') || 'N/A';

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
        <div id="invoice-content" className="max-w-4xl mx-auto p-4 sm:p-6 bg-white font-sans print:p-0 print:max-w-none print:w-full rounded-lg print:rounded-none" style={{ minWidth: 'auto' }}>
            {/* GlowVita Branding */}
            <div className="bg-gray-900 text-white py-2 px-4 rounded-t-lg -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 print:hidden">
                <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
                        <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="currentColor"/>
                    </svg>
                    <span className="font-bold text-base sm:text-lg tracking-wide">GlowVita Salon</span>
                </div>
                <p className="text-center text-xs mt-1 opacity-90">Professional Salon Management Platform</p>
            </div>

            {/* Header with Salon Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 print:mb-3 border-b-2 border-black pb-4 gap-3 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <h1 className="text-lg sm:text-xl font-bold text-black print:text-lg">{vendorName}</h1>
                    <div className="text-black text-xs sm:text-sm mt-1 print:text-xs" dangerouslySetInnerHTML={{ __html: formatAddress(vendorAddress) }} />
                    <p className="text-black text-xs sm:text-sm mt-1 print:text-xs">Phone: {vendorPhone}</p>
                </div>
                <div className="text-center w-full sm:w-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-black print:text-xl">INVOICE</h2>
                </div>
            </div>

            <style type="text/css" media="print">
                {`
                @page { size: auto; margin: 5mm; }
                html, body {
                    height: auto !important; 
                    overflow: visible !important; 
                    position: static !important;
                }
                body * { visibility: hidden; }
                #invoice-content, #invoice-content * { visibility: visible; }
                #invoice-content { 
                  position: absolute; 
                  left: 0; 
                  top: 0; 
                  width: 100% !important; 
                  max-width: none !important;
                  margin: 0 !important;
                  padding: 10px !important;
                  background: white !important;
                  box-shadow: none !important;
                  border: none !important;
                  min-width: 0 !important;
                  float: none !important;
                  overflow: visible !important;
                }
                .print\\:hidden { display: none !important; }
              `}
            </style>

            {/* Invoice Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 print:mb-3 gap-1 sm:gap-0">
                <div>
                    <p className="text-black text-xs sm:text-sm print:text-xs"><span className="font-semibold">Date:</span> {invoiceData.date}</p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-black text-xs sm:text-sm print:text-xs"><span className="font-semibold">Invoice No:</span> {invoiceData.invoiceNumber}</p>
                </div>
            </div>

            {/* Horizontal line */}
            <div className="border-t border-black my-4 print:my-3"></div>

            {/* Invoice To section */}
            <div className="mb-4 print:mb-3">
                <p className="text-black text-xs sm:text-sm print:text-xs"><span className="font-semibold">Invoice To:</span> {invoiceData.client?.fullName || 'N/A'}</p>
                {invoiceData.client?.phone && (
                    <p className="text-black text-xs sm:text-sm print:text-xs"><span className="font-semibold">Phone:</span> {invoiceData.client.phone}</p>
                )}
            </div>

            {/* Combined Items and Payment Summary Table */}
            <div className="mb-6 print:mb-4 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full border-collapse border border-black min-w-[600px] sm:min-w-0">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-black p-1 sm:p-2 text-left text-xs sm:text-sm font-bold text-black print:text-xs print:p-1">ITEM DESCRIPTION</th>
                            <th className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm font-bold text-black print:text-xs print:p-1">₹ PRICE</th>
                            <th className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm font-bold text-black print:text-xs print:p-1">QTY</th>
                            <th className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm font-bold text-black print:text-xs print:p-1">₹ TAX</th>
                            <th className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm font-bold text-black print:text-xs print:p-1">₹ AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceData.items.map((item: any, index: number) => (
                            <tr
                                key={index}
                                className="border border-black cursor-pointer hover:bg-gray-50"
                                onClick={() => handleItemClick(item)}
                            >
                                <td className="border border-black p-1 sm:p-2 print:p-1">
                                    <div className={`font-semibold text-xs sm:text-sm text-black print:text-xs ${item.type === 'addon' ? 'pl-4' : ''}`}>
                                        {item.type === 'addon' ? '+ ' : ''}
                                        {isProduct(item) ? item.productName : item.name}
                                    </div>
                                </td>
                                <td className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm text-black print:text-xs print:p-1">₹{item.price.toFixed(2)}</td>
                                <td className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm text-black print:text-xs print:p-1">{item.quantity}</td>
                                <td className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm text-black print:text-xs print:p-1">₹{((item.price * item.quantity * taxRate) / 100).toFixed(2)}</td>
                                <td className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm font-semibold text-black print:text-xs print:p-1">₹{item.totalPrice.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="border border-black">
                            <td className="border border-black p-1 sm:p-2 text-right font-semibold text-black text-xs sm:text-sm print:text-xs print:p-1" colSpan={4}>Subtotal:</td>
                            <td className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm font-semibold text-black print:text-xs print:p-1">₹{invoiceData.originalSubtotal?.toFixed(2) || invoiceData.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr className="border border-black">
                            <td className="border border-black p-1 sm:p-2 text-right font-semibold text-black text-xs sm:text-sm print:text-xs print:p-1" colSpan={4}>Tax ({taxRate}%):</td>
                            <td className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm font-semibold text-black print:text-xs print:p-1">₹{invoiceData.tax.toFixed(2)}</td>
                        </tr>
                        <tr className="border border-black">
                            <td className="border border-black p-1 sm:p-2 text-right font-semibold text-black text-xs sm:text-sm print:text-xs print:p-1" colSpan={4}>Platform Fee:</td>
                            <td className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm font-semibold text-black print:text-xs print:p-1">₹{invoiceData.platformFee.toFixed(2)}</td>
                        </tr>
                        <tr className="border border-black">
                            <td className="border border-black p-1 sm:p-2 text-right font-semibold text-green-600 text-xs sm:text-sm print:text-xs print:p-1" colSpan={4}>Discount{invoiceData.couponCode ? `(${invoiceData.couponCode})` : ''}:</td>
                            <td className="border border-black p-1 sm:p-2 text-right text-xs sm:text-sm font-semibold text-green-600 print:text-xs print:p-1">-₹{(invoiceData.discount || 0).toFixed(2)}</td>
                        </tr>
                        <tr className="border border-black bg-gray-200">
                            <td className="border border-black p-1 sm:p-2 text-right font-bold text-black text-xs sm:text-sm print:text-xs print:p-1" colSpan={4}>Total:</td>
                            <td className="border border-black p-1 sm:p-2 text-right font-bold text-black text-xs sm:text-sm print:text-xs print:p-1">₹{invoiceData.total.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Payment Info and Footer */}
            <div className="border-t-2 border-black pt-4 print:pt-3 mt-auto">
                <p className="text-center text-black font-medium text-xs sm:text-sm print:text-xs mb-2 px-2">
                    {invoiceData.paymentMethod
                        ? `Payment Of ₹${invoiceData.total.toFixed(2)} Received By ${invoiceData.paymentMethod}`
                        : `Payment Of ₹${invoiceData.total.toFixed(2)} Is Pending`
                    }
                </p>
                <p className="text-center text-xs sm:text-sm font-semibold text-gray-600 print:text-[10px] uppercase tracking-wider px-2">
                    NOTE: This is computer generated receipt and does not require physical signature.
                </p>
                
                {/* GlowVita Footer Branding */}
                <div className="mt-6 pt-4 border-t border-gray-300 print:hidden">
                    <div className="flex items-center justify-center gap-2 text-gray-900">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
                            <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="currentColor"/>
                        </svg>
                        <span className="font-semibold text-sm">Powered by GlowVita Salon</span>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-1">Professional Salon Management Platform</p>
                    <p className="text-center text-xs text-gray-400 mt-1">www.glowvitasalon.com</p>
                </div>
            </div>


            {/* Item Detail Popup */}
            {isPopupOpen && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden">
                    <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base sm:text-lg font-bold">Item Details</h3>
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

export default AppointmentInvoice;
