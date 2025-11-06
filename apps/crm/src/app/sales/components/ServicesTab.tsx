"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Textarea } from "@repo/ui/textarea";
import { Search, Plus, Minus, Trash2, ShoppingCart, Package, Clock, UserCheck, CheckCircle, X, Mail, Printer, DownloadCloud, Calendar, Paperclip } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useGetCategoriesQuery, useGetVendorServicesQuery, useGetClientsQuery, useCreateClientMutation, useGetVendorProfileQuery, useCreateBillingMutation, useGetStaffQuery } from "@repo/store/api";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { toast } from 'sonner';
import InvoiceUI from "@/components/InvoiceUI";
import html2pdf from 'html2pdf.js';

// Service interface
interface Service {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
  categoryName: string;
  price: number;
  duration: number;
  description: string;
  status: string;
}

// Client interface
interface Client {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  birthdayDate: string;
  gender: 'Male' | 'Female' | 'Other';
  country: string;
  occupation: string;
  profilePicture?: string;
  address: string;
  preferences?: string;
  lastVisit: string;
  totalBookings: number;
  totalSpent: number;
  status: 'Active' | 'Inactive' | 'New';
  createdAt?: string;
  updatedAt?: string;
}

// Cart item interface
interface CartItem extends Service {
  quantity: number;
  totalPrice: number;
  discount?: number;
  discountType?: 'flat' | 'percentage';
  staffMember?: {
    id: string;
    name: string;
  };
}

interface ServicesTabProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedClient: Client | null;
  setSelectedClient: React.Dispatch<React.SetStateAction<Client | null>>;
}

export default function ServicesTab({
  cart,
  setCart,
  selectedClient,
  setSelectedClient
}: ServicesTabProps) {
  const { user } = useCrmAuth();
  const VENDOR_ID = user?._id || "";
  const invoiceRef = useRef<any>(null);
  
  // Fetch vendor profile
  const { data: vendorProfile } = useGetVendorProfileQuery(undefined, {
    skip: !user?._id
  });
  
  // Get vendor name from profile
  const vendorName = vendorProfile?.data?.businessName || vendorProfile?.data?.shopName || "Your Salon";
  
  // Service listing states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState<Service[]>([]);
  
  // Client selection states
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  
  // Client form state
  const [clientFormData, setClientFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthdayDate: "",
    gender: "" as 'Male' | 'Female' | 'Other' | '',
    country: "",
    occupation: "",
    profilePicture: "",
    address: "",
    preferences: ""
  });
  
  const [taxRate, setTaxRate] = useState(0); // 0% tax rate
  
  // Fetch services with better loading state
  const { data: servicesData, isLoading: servicesLoading, isFetching: servicesFetching } = useGetVendorServicesQuery(
    { vendorId: VENDOR_ID },
    { skip: !VENDOR_ID }
  );
  
  // Fetch clients
  const { data: clientList = [], isLoading: clientsLoading } = useGetClientsQuery({
    search: '',
    status: '',
    page: 1,
    limit: 100
  }, {
    skip: !user?._id,
  });
  
  // Create client mutation
  const [createClient, { isLoading: isCreatingClient }] = useCreateClientMutation();
  
  // Create billing mutation
  const [createBilling, { isLoading: isCreatingBilling }] = useCreateBillingMutation();
  
  // Fetch categories
  const { data: categories = [] } = useGetCategoriesQuery(undefined);
  
  // Fetch staff members
  const { data: staffData = [] } = useGetStaffQuery({});
  
  // Filter services based on search and category
  useEffect(() => {
    if (servicesData?.services) {
      let filtered = servicesData.services as Service[];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(service => 
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply category filter
      if (selectedCategory !== "all") {
        filtered = filtered.filter(service => service.category?._id === selectedCategory);
      }
      
      setServices(filtered);
    }
  }, [servicesData, searchTerm, selectedCategory]);
  
  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    return clientList.filter((client: Client) => 
      client.fullName.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
      client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.phone.includes(clientSearchTerm)
    );
  }, [clientList, clientSearchTerm]);
  
  // Handle client selection
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearchTerm("");
    setIsSearchFocused(false);
  };
  
  // Handle remove selected client
  const handleRemoveSelectedClient = () => {
    setSelectedClient(null);
  };
  
  // Handle client form input change
  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Allow only digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setClientFormData(prev => ({ ...prev, phone: digitsOnly }));
      return;
    }
    setClientFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle client file change for profile picture
  const handleClientFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle client select change
  const handleClientSelectChange = (name: string, value: string) => {
    setClientFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle save new client
  const handleSaveClient = async () => {
    try {
      // Validate phone: exactly 10 digits
      if (!clientFormData.phone || clientFormData.phone.trim().length !== 10) {
        toast.error('Phone number must be exactly 10 digits.');
        return;
      }
      
      const gender = (clientFormData.gender as 'Male' | 'Female' | 'Other') || 'Other';
      
      const clientData = {
        fullName: clientFormData.fullName.trim(),
        // Email is optional; omit when empty
        email: clientFormData.email.trim() || undefined,
        phone: clientFormData.phone.trim(),
        birthdayDate: clientFormData.birthdayDate,
        gender: gender,
        country: clientFormData.country.trim(),
        occupation: clientFormData.occupation.trim(),
        profilePicture: clientFormData.profilePicture,
        address: clientFormData.address.trim(),
        preferences: clientFormData.preferences.trim()
      };
      
      // Create new client
      const result: any = await createClient(clientData).unwrap();
      toast.success("Client created successfully.");
      
      // Select the newly created client
      if (result?.data) {
        setSelectedClient(result.data);
      }
      
      // Reset form and close modal
      setClientFormData({
        fullName: "",
        email: "",
        phone: "",
        birthdayDate: "",
        gender: "",
        country: "",
        occupation: "",
        profilePicture: "",
        address: "",
        preferences: ""
      });
      setIsAddClientModalOpen(false);
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to save client.";
      toast.error(errorMessage);
    }
  };
  
  // Add item to cart
  const addToCart = (service: Service) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === service._id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item._id === service._id 
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.price
              } 
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            ...service,
            quantity: 1,
            totalPrice: service.price
          }
        ];
      }
    });
    
    toast.success(`${service.name} added to cart`);
  };
  
  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item._id === id 
          ? { 
              ...item, 
              quantity,
              totalPrice: quantity * item.price
            } 
          : item
      )
    );
  };
  
  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item._id !== id));
    toast.success("Item removed from cart");
  };
  
  // Calculate cart totals
  const originalSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);
  
  const totalDiscount = useMemo(() => {
    return cart.reduce((sum, item) => {
      // Only calculate discount for items that actually have a discount applied
      if (item.discount && item.discount > 0) {
        const itemTotal = item.price * item.quantity;
        if (item.discountType === 'flat') {
          return sum + item.discount;
        } else if (item.discountType === 'percentage') {
          return sum + (itemTotal * item.discount / 100);
        }
      }
      return sum;
    }, 0);
  }, [cart]);
  
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.totalPrice, 0), [cart]);
  const taxAmount = useMemo(() => (subtotal * taxRate) / 100, [subtotal, taxRate]);
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };
  
  // Process payment
  const processPayment = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    
    // Check if client is selected
    if (!selectedClient) {
      toast.error("Please select a client before proceeding to payment");
      return;
    }
    
    // Show payment options dialog
    setIsPaymentDialogOpen(true);
  };

  // State for payment dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'options' | 'method' | 'link'>('options');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Handle save order with timeout
  const handleSaveOrder = async () => {
    // Check if payment method is selected for Save Order
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    try {
      toast.loading("Saving order...");
      
      // Prepare billing data according to the Billing model
      const billingData = {
        vendorId: VENDOR_ID,
        clientId: selectedClient?._id,
        clientInfo: {
          fullName: selectedClient?.fullName,
          email: selectedClient?.email,
          phone: selectedClient?.phone,
          profilePicture: selectedClient?.profilePicture,
          address: selectedClient?.address
        },
        items: cart.map(item => ({
          itemId: item._id,
          itemType: "Service",
          name: item.name,
          description: item.description,
          category: {
            categoryId: item.category?._id,
            categoryName: item.category?.name
          },
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          duration: item.duration,
          discount: item.discount,
          discountType: item.discountType,
          staffMember: item.staffMember
        })),
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        platformFee: 0, // You can adjust this as needed
        totalAmount: total,
        balance: total,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: "Completed",
        billingType: "Counter Bill"
      };
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 second timeout
      );
      
      // Execute the billing mutation and get the promise
      const billingPromise = createBilling(billingData);
      
      // Race the API call against the timeout
      const result: any = await Promise.race([
        billingPromise.unwrap(), // Call unwrap on the promise, not directly in the race
        timeoutPromise
      ]);
      
      // Prepare invoice data for display
      const invoice = {
        invoiceNumber: result.data?.invoiceNumber || "N/A",
        date: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        client: selectedClient,
        status: "Completed",
        items: cart,
        subtotal: subtotal,
        originalSubtotal: originalSubtotal,
        discount: totalDiscount,
        tax: taxAmount,
        platformFee: 0, // You can adjust this as needed
        total: total,
        balance: total,
        paymentMethod: selectedPaymentMethod
      };
      
      setInvoiceData(invoice);
      setIsInvoiceDialogOpen(true);
      setIsOrderSaved(true);
      
      // Show success toast
      toast.dismiss(); // Dismiss loading toast
      toast.success("Order saved successfully!");
      
      // Clear cart and reset
      clearCart();
      setSelectedPaymentMethod(null);
      setIsPaymentDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to save billing record:", error);
      toast.dismiss(); // Dismiss loading toast
      if (error.message === 'Request timeout') {
        toast.error("Request timeout. Please check your connection and try again.");
      } else {
        toast.error("Failed to save billing record: " + (error?.data?.message || error?.message || "Unknown error"));
      }
    }
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    if (method === 'Net Banking') {
      setPaymentStep('link');
    } else {
      // For other methods, you might want to show a payment form or process immediately
      toast.success(`Processing payment via ${method}`);
      setIsPaymentDialogOpen(false);
      clearCart();
      setPaymentStep('options');
      setSelectedPaymentMethod(null);
    }
  };

  // Handle generate Net Banking
  const handleGeneratePaymentLink = () => {
    // In a real app, this would generate a Net Banking
    toast.success("Net Banking generated and sent to client!");
    setIsPaymentDialogOpen(false);
    clearCart();
    setPaymentStep('options');
    setSelectedPaymentMethod(null);
  };

  // State for invoice dialog
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isOrderSaved, setIsOrderSaved] = useState(false);
  
  // State for email dialog
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    from: '',
    subject: '',
    message: ''
  });
  
  // State for edit cart item dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    quantity: 1,
    discount: 0,
    discountType: 'flat' as 'flat' | 'percentage',
    staffMemberId: 'none'
  });
  
  // Email response type
  interface EmailResponse {
    success: boolean;
    error?: string;
    messageId?: string;
  }
  
  // Handle email sending
  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Show loading toast
    toast.loading('Sending email...');
    
    try {
      // Generate PDF from InvoiceUI component
      const invoiceElement = document.getElementById('invoice-to-pdf');
      let pdfBlob: Blob | null = null;
      
      if (invoiceElement) {
        const pdfOptions: any = {
          margin: 5,
          filename: `Sales_Invoice_${invoiceData.invoiceNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.8 },
          html2canvas: { scale: 1.5, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Generate PDF as blob
        pdfBlob = await html2pdf().set(pdfOptions).from(invoiceElement).outputPdf('blob');
      }
      
      // Send email using API endpoint (only plain text message, no HTML content)
      const formData = new FormData();
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.message); // Still using html field but with plain text content
      
      if (pdfBlob) {
        formData.append('attachment', pdfBlob, `Sales_Invoice_${invoiceData.invoiceNumber}.pdf`);
      }
      
      // Send email using API endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const result: any = await response.json();
      
      // Dismiss loading toast
      toast.dismiss();
      
      if (response.ok && result.success) {
        toast.success(`Email sent to ${emailData.to}`);
        setIsEmailDialogOpen(false);
        
        // Reset email form
        setEmailData({
          to: '',
          from: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(`Failed to send email: ${result.error || result.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      toast.dismiss(); // Dismiss loading toast
      if (error.name === 'AbortError') {
        toast.error('Email sending timed out. Please check your connection and try again.');
      } else {
        toast.error(`Failed to send email: ${error.message}`);
      }
    }
  };

  // Handle email click
  const onEmailClick = () => {
    // Pre-fill email data
    const clientEmail = invoiceData?.client?.email || '';
    const subject = `Sales Invoice ${invoiceData?.invoiceNumber} From ${vendorName}`;
    const message = `Hi ${invoiceData?.client?.fullName || 'Customer'}, Please see attached sales invoice ${invoiceData?.invoiceNumber}. Thank you. ${vendorName}`;
    
    setEmailData({
      to: clientEmail,
      from: '', // Keep empty by default as requested
      subject: subject,
      message: message
    });
    
    setIsEmailDialogOpen(true);
  };

  // Handle print click
  const onPrintClick = () => {
    // Print functionality
    window.print();
  };

  // Handle download click
  const onDownloadClick = async () => {
    try {
      // Generate PDF from InvoiceUI component
      const invoiceElement = document.getElementById('invoice-to-pdf');
      if (invoiceElement) {
        const pdfOptions: any = {
          margin: 5,
          filename: `Sales_Invoice_${invoiceData.invoiceNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.8 },
          html2canvas: { scale: 1.5, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Generate and download PDF automatically
        await html2pdf().set(pdfOptions).from(invoiceElement).save();
        toast.success('Invoice downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error('Download error:', error);
    }
  };

  // Handle rebook click
  const onRebookClick = () => {
    // Clear all invoice data and close dialog
    setInvoiceData(null);
    setIsInvoiceDialogOpen(false);
    setIsOrderSaved(false);
    // Reset payment related state
    setSelectedPaymentMethod(null);
    setIsPaymentDialogOpen(false);
    setPaymentStep('options');
    // Clear cart
    setCart([]);
    // Clear selected client
    setSelectedClient(null);
  };
  
  // Handle edit cart item click
  const handleEditItemClick = (item: CartItem) => {
    setEditingItem(item);
    setEditFormData({
      quantity: item.quantity || 1,
      discount: item.discount || 0,
      discountType: item.discountType || 'flat',
      staffMemberId: item.staffMember?.id || 'none'
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle save edited item
  const handleSaveEditedItem = () => {
    if (!editingItem) return;
    
    // Check if discount is greater than 0, then staff member is required
    if (editFormData.discount > 0 && editFormData.staffMemberId === 'none') {
      toast.error('Staff member is required');
      return;
    }
    
    // Find staff member name
    const selectedStaff = editFormData.staffMemberId !== 'none' ? 
      staffData.find((staff: any) => staff._id === editFormData.staffMemberId) : null;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item._id === editingItem._id 
          ? { 
              ...item, 
              quantity: editFormData.quantity,
              totalPrice: calculateItemTotalPrice(item, editFormData.quantity, editFormData.discount, editFormData.discountType),
              discount: editFormData.discount,
              discountType: editFormData.discountType,
              staffMember: selectedStaff ? { id: selectedStaff._id, name: selectedStaff.fullName } : undefined
            } 
          : item
      )
    );
    
    setIsEditDialogOpen(false);
    setEditingItem(null);
    toast.success('Item updated successfully');
  };
  
  // Calculate item total price with discount
  const calculateItemTotalPrice = (item: CartItem, quantity: number, discount: number, discountType: 'flat' | 'percentage') => {
    const basePrice = item.price * quantity;
    if (discountType === 'flat') {
      return Math.max(0, basePrice - discount);
    } else {
      return basePrice * (1 - discount / 100);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Service Listing */}
      <Card>
        <CardHeader>
          <CardTitle>Service Catalog</CardTitle>
          <CardDescription>Browse and select services to add to the cart</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Services Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicesLoading || servicesFetching ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                        Loading services...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {service.categoryName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{service.price.toFixed(2)}</TableCell>
                      <TableCell>{service.duration} min</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          onClick={() => addToCart(service)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Right Side - Billing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Review items and process payment</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Client Selection */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Client Selection
            </h3>
            
            {/* Search Box */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  type="search" 
                  placeholder="Search clients by name, email, or phone..."
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
              </div>
            </div>
            
            {/* Selected Client Display */}
            {selectedClient && (
              <div className="mb-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <img 
                        src={selectedClient.profilePicture || `https://placehold.co/32x32.png?text=${selectedClient.fullName[0]}`} 
                        alt={selectedClient.fullName} 
                        className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" 
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{selectedClient.fullName}</p>
                        <p className="text-xs text-gray-600">{selectedClient.phone}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRemoveSelectedClient}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show when search is focused or has content */}
            {(isSearchFocused || clientSearchTerm) && (
              <div className="space-y-3">
                {/* Add New Client Button */}
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="w-full border-gray-300 hover:bg-gray-50 text-sm h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Client
                </Button>
                
                {/* Client List */}
                <div className="space-y-2 max-h-48 overflow-y-auto" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
                  {filteredClients.map((client: Client) => (
                    <div 
                      key={client._id} 
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedClient?._id === client._id 
                          ? 'bg-blue-50 border-blue-300 shadow-md' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleSelectClient(client)}
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={client.profilePicture || `https://placehold.co/32x32.png?text=${client.fullName[0]}`} 
                          alt={client.fullName} 
                          className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" 
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{client.fullName}</p>
                          <p className="text-xs text-gray-600">{client.phone}</p>
                        </div>
                        {selectedClient?._id === client._id && (
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Cart Items */}
          <div className="rounded-md border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="mx-auto h-12 w-12 opacity-50 mb-2" />
                      <div>Your cart is empty</div>
                      <div className="text-sm">Add services from the catalog</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="cursor-pointer text-green-600 p-2 rounded" onClick={() => handleEditItemClick(item)}>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.duration} min
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="mx-2 w-8 text-center">{item.quantity}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>₹{item.totalPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Order Summary */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{originalSubtotal.toFixed(2)}</span>
            </div>
            
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Tax ({taxRate}%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={clearCart}
                disabled={cart.length === 0}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button 
                onClick={processPayment}
                disabled={cart.length === 0}
                className="flex-1"
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add New Client Modal */}
      <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter the details for the new client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Profile Picture */}
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700 text-center mb-2">Profile Photo</p>
                  <div className="relative">
                    {clientFormData.profilePicture ? (
                      <img 
                        src={clientFormData.profilePicture} 
                        alt="Profile Preview" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mx-auto"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                        <span className="text-2xl text-gray-500">
                          {clientFormData.fullName ? clientFormData.fullName.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                    )}
                    <label 
                      htmlFor="profilePicture" 
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer shadow-md hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    <input 
                      id="profilePicture" 
                      type="file" 
                      accept="image/*"
                      onChange={handleClientFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Full Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  value={clientFormData.fullName} 
                  onChange={handleClientInputChange} 
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={clientFormData.email} 
                  onChange={handleClientInputChange} 
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            {/* Phone and Birthday */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  value={clientFormData.phone} 
                  onChange={handleClientInputChange}
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  title="Phone number must be exactly 10 digits"
                  onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthdayDate">Birthday Date</Label>
                <Input 
                  id="birthdayDate" 
                  name="birthdayDate" 
                  type="date" 
                  value={clientFormData.birthdayDate} 
                  onChange={handleClientInputChange} 
                />
              </div>
            </div>
            
            {/* Gender and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={clientFormData.gender} onValueChange={(value) => handleClientSelectChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  name="country" 
                  value={clientFormData.country} 
                  onChange={handleClientInputChange} 
                  placeholder="e.g., India"
                />
              </div>
            </div>
            
            {/* Occupation */}
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input 
                id="occupation" 
                name="occupation" 
                value={clientFormData.occupation} 
                onChange={handleClientInputChange} 
                placeholder="e.g., Software Engineer"
              />
            </div>
            
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                name="address" 
                value={clientFormData.address} 
                onChange={handleClientInputChange} 
                placeholder="Enter full address"
                rows={3}
              />
            </div>
            
            {/* Preferences */}
            <div className="space-y-2">
              <Label htmlFor="preferences">Preferences</Label>
              <Textarea
                id="preferences"
                name="preferences"
                value={clientFormData.preferences}
                onChange={handleClientInputChange}
                placeholder="Enter any client preferences or notes"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsAddClientModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveClient} disabled={isCreatingClient}>
              {isCreatingClient ? 'Saving...' : 'Save Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Options Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={(open) => {
        setIsPaymentDialogOpen(open);
        if (!open) {
          // Reset when dialog is closed
          setPaymentStep('options');
          setSelectedPaymentMethod(null);
        }
      }}>
        <DialogContent className="max-w-md">
          {paymentStep === 'options' && (
            <>
              <DialogHeader>
                <DialogTitle>Payment Options</DialogTitle>
                <DialogDescription className="text-center py-2">
                  <div className="text-lg font-bold">Total Amount: ₹{total.toFixed(2)}</div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveOrder}
                    className="flex-1"
                    disabled={!selectedPaymentMethod}
                  >
                    Save Order
                  </Button>
                </div>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Payment Methods</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {['Cash', 'QR Code', 'Debit Card', 'Credit Card', 'Net Banking'].map((method) => (
                    <Button
                      key={method}
                      variant={selectedPaymentMethod === method ? "default" : "outline"}
                      className="flex-1 text-xs h-16 flex-col justify-center items-center gap-1"
                      onClick={() => setSelectedPaymentMethod(method)}
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {paymentStep === 'method' && (
            <>
              <DialogHeader>
                <DialogTitle>Select Payment Method</DialogTitle>
                <DialogDescription>
                  Total Amount: <span className="font-bold">₹{total.toFixed(2)}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-3">
                {['Cash', 'QR Code', 'Debit Card', 'Credit Card', 'Net Banking'].map((method) => (
                  <Button
                    key={method}
                    variant={selectedPaymentMethod === method ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handlePaymentMethodSelect(method)}
                  >
                    {method}
                  </Button>
                ))}
              </div>
              
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setPaymentStep('options')}
                >
                  Back
                </Button>
              </DialogFooter>
            </>
          )}
          
          {paymentStep === 'link' && (
            <>
              <DialogHeader>
                <DialogTitle>Generate Net Banking</DialogTitle>
                <DialogDescription>
                  Total Amount: <span className="font-bold">₹{total.toFixed(2)}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="client-phone">Client Phone Number</Label>
                    <Input
                      id="client-phone"
                      type="tel"
                      placeholder="Enter client's phone number"
                      className="mt-1"
                      value={selectedClient?.phone || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-email">Client Email (Optional)</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="Enter client's email"
                      className="mt-1"
                      value={selectedClient?.email || ''}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setPaymentStep('options')}
                >
                  Back
                </Button>
                <Button onClick={handleGeneratePaymentLink}>
                  Generate Link
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Invoice Summary Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={(open) => {
        setIsInvoiceDialogOpen(open);
        if (!open) {
          setInvoiceData(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {invoiceData && (
            <>
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-xl font-bold text-center text-gray-900">Invoice Summary</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
                {/* Left Section - Invoice Info & Actions */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold">{invoiceData.invoiceNumber}</h2>
                        <p className="text-blue-100 text-sm mt-1">
                          {isOrderSaved 
                            ? `Saved on ${invoiceData.date} at ${vendorName} by ${invoiceData.client?.fullName || 'Client'}`
                            : `Saved Unpaid on ${invoiceData.date} at ${vendorName} by ${invoiceData.client?.fullName || 'Client'}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        invoiceData.status === "Completed" 
                          ? "bg-green-500 text-white" 
                          : "bg-yellow-500 text-gray-900"
                      }`}>
                        {invoiceData.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Quick Actions</h3>
                    <div className="space-y-3">
                      {/* Rebook button on its own line */}
                      <div className="w-full">
                        <Button 
                          className="w-full py-2 text-sm"
                          onClick={() => {
                            // Clear all invoice data and close dialog
                            setInvoiceData(null);
                            setIsInvoiceDialogOpen(false);
                            setIsOrderSaved(false);
                            // Reset payment related state
                            setSelectedPaymentMethod(null);
                            setIsPaymentDialogOpen(false);
                            setPaymentStep('options');
                            // Clear cart
                            setCart([]);
                            // Clear selected client
                            setSelectedClient(null);
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Rebook
                        </Button>
                      </div>
                      
                      {/* Other buttons in a row below */}
                      <div className="grid grid-cols-3 gap-3">
                        <Button 
                          className="w-full py-2 text-sm" 
                          variant="outline"
                          onClick={() => {
                            // Pre-fill email data
                            const clientEmail = invoiceData.client?.email || '';
                            const subject = `Sales Invoice ${invoiceData.invoiceNumber} From ${vendorName}`;
                            const message = `Hi ${invoiceData.client?.fullName || 'Customer'}, Please see attached sales invoice ${invoiceData.invoiceNumber}. Thank you. ${vendorName}`;
                            
                            setEmailData({
                              to: clientEmail,
                              from: '', // Keep empty by default as requested
                              subject: subject,
                              message: message
                            });
                            
                            setIsEmailDialogOpen(true);
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full py-2 text-sm"
                          onClick={() => {
                            // Print functionality - show professional invoice
                            window.print();
                          }}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full py-2 text-sm"
                          onClick={onDownloadClick}
                        >
                          <DownloadCloud className="h-5 w-5 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Client Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-dashed border-gray-300 rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden">
                          {invoiceData.client?.profilePicture ? (
                            <img 
                              src={invoiceData.client.profilePicture} 
                              alt={invoiceData.client.fullName || 'Client'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCheck className="h-8 w-8 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{invoiceData.client?.fullName || 'N/A'}</p>
                          <p className="text-gray-600 text-sm flex items-center mt-1">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              {invoiceData.client?.phone || 'No phone'}
                            </span>
                          </p>
                          <p className="text-gray-600 text-sm flex items-center">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              {invoiceData.client?.email || 'No email'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Section - Invoice Details */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Invoice Details</h3>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 text-xs">Invoice Number</p>
                        <p className="font-semibold text-sm">{invoiceData.invoiceNumber}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 text-xs">Date</p>
                        <p className="font-semibold text-sm">{invoiceData.date}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 text-xs">Payment Method</p>
                        <p className="font-semibold text-sm">{invoiceData.paymentMethod || 'Not specified'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 text-xs">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          invoiceData.status === "Completed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {invoiceData.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Services</h4>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded">
                        {invoiceData.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                                  {item.duration} min
                                </span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                                  {item.categoryName || 'General'}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-full">
                                  Qty: {item.quantity}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-full">
                                  Discount: {item.discount ? (item.discountType === 'percentage' ? `${item.discount}%` : `₹${item.discount}`) : '0'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              {item.discount && item.discount > 0 && (
                                <p className="text-xs text-gray-500 line-through">₹{(item.price * item.quantity).toFixed(2)}</p>
                              )}
                              <p className="font-semibold text-gray-900">₹{item.totalPrice.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Subtotal</span>
                        <span className="font-medium">₹{invoiceData.originalSubtotal?.toFixed(2) || invoiceData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-600 text-sm font-medium">Discount</span>
                        <span className="font-medium text-green-600">-₹{(invoiceData.discount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Tax ({taxRate}%)</span>
                        <span className="font-medium">₹{invoiceData.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Platform Fee</span>
                        <span className="font-medium">₹{invoiceData.platformFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-lg text-gray-900">₹{invoiceData.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-semibold text-gray-900">Balance</span>
                        <span className="font-bold text-lg text-red-600">₹{invoiceData.balance.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setIsInvoiceDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Invoice via Email</DialogTitle>
            <DialogDescription>
              Send the invoice to your client via email
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input 
                id="to" 
                type="email" 
                placeholder="client@example.com" 
                value={emailData.to}
                onChange={(e) => setEmailData({...emailData, to: e.target.value})}
              />
            </div>
            
            {/* <div className="space-y-2">
              <Label htmlFor="from">Your Email (Optional)</Label>
              <Input 
                id="from" 
                type="email" 
                placeholder="your@email.com" 
                value={emailData.from}
                onChange={(e) => setEmailData({...emailData, from: e.target.value})}
              />
            </div> */}
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="Sales Invoice" 
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Enter your message" 
                rows={5}
                value={emailData.message}
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
              />
            </div>
            
            <div className="text-sm text-muted-foreground flex items-center">
              <Paperclip className="h-4 w-4 mr-1" />
              <p>Sales Invoice {invoiceData?.invoiceNumber}.PDF will be attached</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Cart Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Cart Item</DialogTitle>
            <DialogDescription>
              Modify item details
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <div className="py-4 space-y-4">
              <div>
                <h3 className="font-medium">{editingItem.name}</h3>
                <p className="text-sm text-muted-foreground">₹{editingItem.price.toFixed(2)}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData({...editFormData, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <div className="flex gap-2">
                  <Input 
                    id="discount" 
                    type="number" 
                    min="0" 
                    value={editFormData.discount}
                    onChange={(e) => setEditFormData({...editFormData, discount: parseFloat(e.target.value) || 0})}
                    className="flex-1"
                  />
                  <Select 
                    value={editFormData.discountType} 
                    onValueChange={(value) => setEditFormData({...editFormData, discountType: value as 'flat' | 'percentage'})}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">₹</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staffMember">
                  Staff Member 
                  {editFormData.discount > 0 && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Select 
                  value={editFormData.staffMemberId} 
                  onValueChange={(value) => setEditFormData({...editFormData, staffMemberId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select staff member</SelectItem>
                    {staffData.map((staff: any) => (
                      <SelectItem key={staff._id} value={staff._id}>
                        {staff.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>₹{calculateItemTotalPrice(editingItem, editFormData.quantity, editFormData.discount, editFormData.discountType).toFixed(2)}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedItem}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden print area for professional invoice */}
      <div className="hidden print:block">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:block,
            .print\\:block * {
              visibility: visible;
            }
            .print\\:block {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
        {invoiceData && (
          <InvoiceUI
            invoiceData={invoiceData}
            vendorName={vendorName}
            vendorProfile={vendorProfile}
            taxRate={taxRate}
            isOrderSaved={isOrderSaved}
            onEmailClick={() => {}}
            onPrintClick={() => {}}
            onDownloadClick={() => {}}
            onRebookClick={() => {}}
          />
        )}
      </div>
      
      {/* Hidden PDF generation area */}
      <div className="hidden">
        {invoiceData && (
          <div id="invoice-to-pdf">
            <InvoiceUI
              invoiceData={invoiceData}
              vendorName={vendorName}
              vendorProfile={vendorProfile}
              taxRate={taxRate}
              isOrderSaved={isOrderSaved}
              onEmailClick={() => {}}
              onPrintClick={() => {}}
              onDownloadClick={() => {}}
              onRebookClick={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
