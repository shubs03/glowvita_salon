"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Textarea } from "@repo/ui/textarea";
import { Search, Plus, Minus, Trash2, ShoppingCart, UserCheck, CheckCircle, X, Mail, Printer, DownloadCloud, Calendar, Paperclip } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useGetAdminProductCategoriesQuery, useGetCrmProductsQuery, useGetSupplierProductsQuery, useGetClientsQuery, useCreateClientMutation, useGetVendorProfileQuery, useCreateBillingMutation, useGetStaffQuery, useGetCurrentSupplierProfileQuery } from "@repo/store/api";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { toast } from 'sonner';
import InvoiceUI from "@/components/InvoiceUI";
// Dynamically import html2pdf to avoid compilation issues
let html2pdf: any;
if (typeof window !== 'undefined') {
  html2pdf = require('html2pdf.js').default;
}

// Product interface

// Updated to remove client-side invoice number generation
interface Product {
  _id: string;
  productImage: string;
  productName: string;
  price: number;
  salePrice: number;
  category: string;
  categoryDescription?: string;
  stock: number;
  isActive: boolean;
  description?: string;
  status: 'pending' | 'approved' | 'disapproved';
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
interface CartItem extends Product {
  quantity: number;
  totalPrice: number;
  discount?: number;
  discountType?: 'flat' | 'percentage';
  staffMember?: {
    id: string;
    name: string;
  };
}

interface ProductsTabProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedClient: Client | null;
  setSelectedClient: React.Dispatch<React.SetStateAction<Client | null>>;
}

export default function ProductsTab({
  cart,
  setCart,
  selectedClient,
  setSelectedClient
}: ProductsTabProps) {
  const { user } = useCrmAuth();
  const VENDOR_ID = user?._id || "";
  const userRole = user?.role;
  
  // Fetch profile based on user role
  const { data: vendorProfile } = useGetVendorProfileQuery(undefined, {
    skip: !user?._id || userRole === 'supplier'
  });
  
  const { data: supplierProfile } = useGetCurrentSupplierProfileQuery(undefined, {
    skip: !user?._id || userRole !== 'supplier'
  });
  
  // Get business name from profile based on user role
  const businessName = userRole === 'supplier' 
    ? (supplierProfile?.data?.shopName || "Your Supplier Business")
    : (vendorProfile?.data?.businessName || vendorProfile?.data?.shopName || "Your Salon");
  
  // Product listing states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  
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
  
  // Fetch products with better loading state
  // Use different endpoints for vendors and suppliers
  const { data: crmProductsData, isLoading: crmProductsLoading, isFetching: crmProductsFetching } = useGetCrmProductsQuery(
    { vendorId: VENDOR_ID },
    { skip: !VENDOR_ID || userRole === 'supplier' }
  );
  
  const { data: supplierProductsData, isLoading: supplierProductsLoading, isFetching: supplierProductsFetching } = useGetSupplierProductsQuery(
    undefined,
    { skip: !VENDOR_ID || userRole !== 'supplier' }
  );
  
  // Use appropriate data based on user role and extract the data array
  const productsData = userRole === 'supplier' 
    ? (supplierProductsData?.data || supplierProductsData) 
    : (crmProductsData?.data || crmProductsData);
  const productsLoading = userRole === 'supplier' ? supplierProductsLoading : crmProductsLoading;
  const productsFetching = userRole === 'supplier' ? supplierProductsFetching : crmProductsFetching;
  
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
  const { data: categoriesData = [] } = useGetAdminProductCategoriesQuery({});
  const categories = categoriesData?.data || [];
  
  // Fetch staff members
  const { data: staffData = [] } = useGetStaffQuery({});
  
  // Filter products based on search and category
  useEffect(() => {
    if (productsData) {
      let filtered = productsData as Product[];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(product => 
          product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply category filter
      if (selectedCategory !== "all") {
        const selectedCategoryName = categories.find((cat: any) => cat._id === selectedCategory)?.name;
        if (selectedCategoryName) {
          filtered = filtered.filter(product => product.category === selectedCategoryName);
        }
      }
      
      setProducts(filtered);
    }
  }, [productsData, searchTerm, selectedCategory, categories]);
  
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
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item._id === product._id 
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
            ...product,
            quantity: 1,
            totalPrice: product.price
          }
        ];
      }
    });
    
    toast.success(`${product.productName} added to cart`);
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
      const itemTotal = item.price * item.quantity;
      if (item.discountType === 'flat') {
        return sum + (item.discount || 0);
      } else if (item.discountType === 'percentage') {
        return sum + (itemTotal * (item.discount || 0) / 100);
      }
      return sum;
    }, 0);
  }, [cart]);
  
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);
  
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

  // Handle save order with improved timeout handling
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
        // Removed invoiceNumber generation since it's now handled by the backend
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
          itemType: "Product",
          name: item.productName,
          description: item.description,
          category: {
            categoryName: item.category
          },
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          stock: item.stock,
          productImage: item.productImage,
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
      
      // Execute the billing mutation with proper error handling and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      let result: any;
      try {
        result = await createBilling(billingData).unwrap();
        clearTimeout(timeoutId);
      } catch (error: any) {
        clearTimeout(timeoutId);
        throw error;
      }
      
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
      // More specific error handling
      if (error?.name === 'AbortError') {
        toast.error("Request timeout. Please check your connection and try again.");
      } else if (error?.data?.message) {
        toast.error(`Failed to save billing record: ${error.data.message}`);
      } else if (error?.message) {
        toast.error(`Failed to save billing record: ${error.message}`);
      } else {
        toast.error("Failed to save billing record. Please check your connection and try again.");
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
  
  // Handle email sending with improved error handling
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
        
        // Generate PDF as blob with timeout handling
        const pdfController = new AbortController();
        const pdfTimeoutId = setTimeout(() => pdfController.abort(), 60000); // 60 second timeout for PDF generation
        
        try {
          pdfBlob = await html2pdf().set(pdfOptions).from(invoiceElement).outputPdf('blob');
        } catch (pdfError) {
          if (pdfController.signal.aborted) {
            throw new Error('PDF generation timed out');
          }
          throw pdfError;
        } finally {
          clearTimeout(pdfTimeoutId);
        }
      }
      
      // Send email using API endpoint (only plain text message, no HTML content)
      const formData = new FormData();
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.message); // Still using html field but with plain text content
      
      if (pdfBlob) {
        formData.append('attachment', pdfBlob, `Sales_Invoice_${invoiceData.invoiceNumber}.pdf`);
      }
      
      // Send email using API endpoint with proper timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
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
      } else if (error.name === 'TypeError') {
        toast.error('Email sending failed. Please check your connection and try again.');
      } else {
        toast.error(`Failed to send email: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Handle email click
  const onEmailClick = () => {
    // Pre-fill email data
    const clientEmail = invoiceData?.client?.email || '';
    const subject = `Sales Invoice ${invoiceData?.invoiceNumber} From ${businessName}`;
    const message = `Hi ${invoiceData?.client?.fullName || 'Customer'}, Please see attached sales invoice ${invoiceData?.invoiceNumber}. Thank you. ${businessName}`;
    
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
        
        // Generate and download PDF automatically with timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        try {
          await html2pdf().set(pdfOptions).from(invoiceElement).save();
          toast.success('Invoice downloaded successfully');
        } catch (error) {
          if (controller.signal.aborted) {
            toast.error('Download timed out. Please try again.');
          } else {
            toast.error('Failed to download invoice');
          }
          console.error('Download error:', error);
        } finally {
          clearTimeout(timeoutId);
        }
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Side - Product Listing */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Browse and select products to add to the cart</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
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
          
          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.productName}</div>
                        </div>
                      </TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          onClick={() => addToCart(product)}
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
                      <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
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
                      <div className="text-sm">Add products from the catalog</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="cursor-pointer text-green-600 p-2 rounded" onClick={() => handleEditItemClick(item)}>
                          <div className="font-medium">{item.productName}</div>
                        </div>
                      </TableCell>
                      <TableCell>₹{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>₹{item.totalPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeFromCart(item._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={clearCart}
              disabled={cart.length === 0}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
            <Button 
              onClick={processPayment}
              disabled={cart.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Options Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Options</DialogTitle>
            <DialogDescription>
              Select a payment method to complete the transaction
            </DialogDescription>
          </DialogHeader>
          
          {paymentStep === 'options' && (
            <div className="space-y-4">
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handlePaymentMethodSelect('Cash')}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Cash</div>
                    <div className="text-sm text-muted-foreground">Pay with cash</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handlePaymentMethodSelect('Card')}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Card</div>
                    <div className="text-sm text-muted-foreground">Credit or debit card</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handlePaymentMethodSelect('Net Banking')}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Net Banking</div>
                    <div className="text-sm text-muted-foreground">Bank transfer</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handlePaymentMethodSelect('UPI')}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">UPI</div>
                    <div className="text-sm text-muted-foreground">Unified Payments Interface</div>
                  </div>
                </div>
              </Button>
            </div>
          )}
          
          {paymentStep === 'link' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Generate Payment Link</h3>
                <p className="text-muted-foreground text-sm">
                  A payment link will be generated and sent to the client's email or phone number.
                </p>
              </div>
              <Button 
                className="w-full"
                onClick={handleGeneratePaymentLink}
              >
                Generate Payment Link
              </Button>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPaymentDialogOpen(false);
                setPaymentStep('options');
                setSelectedPaymentMethod(null);
              }}
            >
              Cancel
            </Button>
            {paymentStep === 'options' && (
              <Button 
                onClick={handleSaveOrder}
                disabled={!selectedPaymentMethod}
              >
                Save Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Client Modal */}
      <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter client details to add them to your client list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={clientFormData.fullName}
                  onChange={handleClientInputChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={clientFormData.phone}
                  onChange={handleClientInputChange}
                  placeholder="1234567890"
                  maxLength={10}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={clientFormData.email}
                onChange={handleClientInputChange}
                placeholder="john@example.com"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={clientFormData.gender} 
                  onValueChange={(value) => handleClientSelectChange('gender', value)}
                >
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
              
              <div>
                <Label htmlFor="birthdayDate">Birthday</Label>
                <Input
                  id="birthdayDate"
                  name="birthdayDate"
                  type="date"
                  value={clientFormData.birthdayDate}
                  onChange={handleClientInputChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={clientFormData.address}
                onChange={handleClientInputChange}
                placeholder="123 Main St, City, State"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={clientFormData.country}
                  onChange={handleClientInputChange}
                  placeholder="India"
                />
              </div>
              
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={clientFormData.occupation}
                  onChange={handleClientInputChange}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="preferences">Preferences</Label>
              <Textarea
                id="preferences"
                name="preferences"
                value={clientFormData.preferences}
                onChange={handleClientInputChange}
                placeholder="Client preferences and notes"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddClientModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveClient}
              disabled={isCreatingClient || !clientFormData.fullName || !clientFormData.phone || clientFormData.phone.length !== 10}
            >
              {isCreatingClient ? 'Saving...' : 'Save Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Cart Item Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Modify quantity, discount, and staff assignment
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Item</Label>
                <div className="font-medium">{editingItem.productName}</div>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    value={editFormData.discount}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="discountType">Type</Label>
                  <Select 
                    value={editFormData.discountType} 
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, discountType: value as 'flat' | 'percentage' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat (₹)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="staffMember">Staff Member</Label>
                <Select 
                  value={editFormData.staffMemberId} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, staffMemberId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {staffData.map((staff: any) => (
                      <SelectItem key={staff._id} value={staff._id}>
                        {staff.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEditedItem}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>
              Review and send the invoice to your client
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {invoiceData && (
              <div>
                <InvoiceUI 
                  invoiceData={invoiceData}
                  vendorName={businessName}
                  vendorProfile={vendorProfile || supplierProfile}
                  taxRate={taxRate}
                  isOrderSaved={isOrderSaved}
                  onEmailClick={onEmailClick}
                  onPrintClick={onPrintClick}
                  onDownloadClick={onDownloadClick}
                  onRebookClick={onRebookClick}
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={onEmailClick}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button 
                variant="outline" 
                onClick={onPrintClick}
                className="flex-1"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                variant="outline" 
                onClick={onDownloadClick}
                className="flex-1"
              >
                <DownloadCloud className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsInvoiceDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={onRebookClick}
            >
              New Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Invoice via Email</DialogTitle>
            <DialogDescription>
              Send the invoice to your client's email address
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                value={emailData.to}
                onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                placeholder="client@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Sales Invoice"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Dear client, please find attached your sales invoice."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
            >
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden Invoice for PDF Generation */}
      <div id="invoice-to-pdf" className="hidden">
        {invoiceData && (
          <InvoiceUI 
            invoiceData={invoiceData}
            vendorName={businessName}
            vendorProfile={vendorProfile || supplierProfile}
            taxRate={taxRate}
            isOrderSaved={isOrderSaved}
            onEmailClick={onEmailClick}
            onPrintClick={onPrintClick}
            onDownloadClick={onDownloadClick}
            onRebookClick={onRebookClick}
          />
        )}
      </div>
    </div>
  );
}