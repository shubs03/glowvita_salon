
"use client";

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@repo/ui/dialog';
import { Eye, EyeOff, Plus, Search, FileDown, X, DollarSign, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { addSupplier, selectAllSuppliers } from '@repo/store/slices/supplierSlice';

// Sample data for supplier orders
const supplierOrdersData = [
  {
    id: "ORD-1001",
    supplierId: "SUP-001",
    supplierName: "Global Beauty Supplies",
    productName: "Professional Hair Dryer",
    customerName: "Priya Sharma",
    amount: 12500,
    status: "Completed",
    date: "2025-08-10"
  },
  {
    id: "ORD-1002",
    supplierId: "SUP-001",
    supplierName: "Global Beauty Supplies",
    productName: "Ceramic Hair Straightener",
    customerName: "Rahul Verma",
    amount: 8700,
    status: "Processing",
    date: "2025-08-12"
  },
  {
    id: "ORD-1003",
    supplierId: "SUP-002",
    supplierName: "Organic Skincare Inc.",
    productName: "Aloe Vera Gel",
    customerName: "Anjali Patel",
    amount: 4200,
    status: "Shipped",
    date: "2025-08-11"
  },
  {
    id: "ORD-1004",
    supplierId: "SUP-003",
    supplierName: "Nail Art Creations",
    productName: "Gel Nail Polish Set",
    customerName: "Meera Gupta",
    amount: 6500,
    status: "Delivered",
    date: "2025-08-09"
  },
  {
    id: "ORD-1005",
    supplierId: "SUP-004",
    supplierName: "Modern Hair Tools",
    productName: "Professional Hair Clipper",
    customerName: "Vikram Singh",
    amount: 9500,
    status: "Pending",
    date: "2025-08-13"
  }
];

// Sample data for suppliers
const suppliersData = [
  {
    id: "SUP-001",
    firstName: "John",
    lastName: "Doe",
    shopName: "Global Beauty Supplies",
    businessRegistrationNo: "GSTIN123456789",
    supplierType: "Hair Care",
    status: "Approved",
    contact: "contact@gbs.com",
    products: 125,
    sales: 25430,
  },
  {
    id: "SUP-002",
    firstName: "Michael",
    lastName: "Brown",
    shopName: "Spa Essentials",
    businessRegistrationNo: "GSTIN321654987",
    supplierType: "Spa & Wellness",
    status: "Pending",
    contact: "support@spaessentials.com",
    products: 60,
    sales: 9500,
  },
];

type Supplier = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  shopName: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  location: string;
  address: string;
  businessRegistrationNo: string;
  supplierType: string;
  status: string;
  contact: string;
  products: number;
  sales: number;
  licenseFileName?: string;
};
type SupplierOrder = typeof supplierOrdersData[0];
type ActionType = 'approve' | 'reject' | 'delete';

import stateCityData from '@/lib/state-city.json';

export default function SupplierManagementPage() {
  const dispatch = useDispatch();
  const suppliers = useSelector(selectAllSuppliers);
  
  // State for Suppliers Tab
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierStatusFilter, setSupplierStatusFilter] = useState('all');
  
  // State for Orders Tab
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  
  // Modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isOrderViewModalOpen, setIsOrderViewModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  // Inventory modal state
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('all');
  
  // New supplier form state
  interface State {
    state: string;
    districts: string[];
  }

  const states: State[] = stateCityData.states;
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSupplier, setNewSupplier] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    shopName: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    location: '',
    address: '',
    businessRegistrationNo: '',
    supplierType: '',
    licenseFile: null as File | null,
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  
  const supplierTypes = [
    'Hair Care',
    'Skin Care',
    'Nail Care',
    'Beauty Tools & Equipment',
    'Spa & Wellness',
    'Makeup Products',
    'Hygiene & Cleaning'
  ];
  
  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      const stateData = states.find(s => s.state === selectedState);
      setCities(stateData ? stateData.districts : []);
      
      // Update the state in newSupplier
      setNewSupplier(prev => ({
        ...prev,
        state: selectedState,
        city: '' // Reset city when state changes
      }));
    } else {
      setCities([]);
    }
  }, [selectedState, states]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
  };

  const handleCityChange = (value: string) => {
    setNewSupplier(prev => ({
      ...prev,
      city: value
    }));
  };

  const handleNewSupplierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs (mobile and pincode)
    if (name === 'mobile' || name === 'pincode') {
      // Only allow numbers and limit length
      const numericValue = value.replace(/\D/g, '');
      const maxLength = name === 'mobile' ? 10 : 6;
      if (numericValue.length > maxLength) return;
      
      setNewSupplier(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }
    
    setNewSupplier(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSupplierTypeChange = (value: string) => {
    setNewSupplier(prev => ({
      ...prev,
      supplierType: value
    }));
  };
  
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create form data to handle file upload
    const formData = new FormData();
    
    // Add all form fields to formData
    Object.entries(newSupplier).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    
    // Create a new supplier object with the form data
    const newSupplierData = {
      ...newSupplier,
      products: 0, // Initialize with 0 products
      sales: 0,    // Initialize with 0 sales
      status: "Pending", // Default status
      contact: newSupplier.email, // Using email as contact if contact is not provided
    };

    // Dispatch the addSupplier action
    dispatch(addSupplier(newSupplierData));
    console.log('New supplier added:', newSupplierData);
    
    // Reset form and close modal
    setNewSupplier({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      shopName: '',
      country: 'India',
      state: '',
      city: '',
      pincode: '',
      location: '',
      address: '',
      businessRegistrationNo: '',
      supplierType: '',
      licenseFile: null,
      password: '',
      confirmPassword: ''
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsNewModalOpen(false);
  };

  const [licensePreview, setLicensePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLicensePreview(previewUrl);
      
      setNewSupplier(prev => ({
        ...prev,
        licenseFile: file
      }));
    }
  };

  // Clean up preview URL when component unmounts or when file changes
  useEffect(() => {
    return () => {
      if (licensePreview) {
        URL.revokeObjectURL(licensePreview);
      }
    };
  }, [licensePreview]);

  // Filter and paginate suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const fullName = `${supplier.firstName} ${supplier.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(supplierSearch.toLowerCase()) ||
                        supplier.shopName.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                        (supplier.businessRegistrationNo && supplier.businessRegistrationNo.toLowerCase().includes(supplierSearch.toLowerCase())) ||
                        (supplier.contact && supplier.contact.toLowerCase().includes(supplierSearch.toLowerCase()));
    const matchesStatus = supplierStatusFilter === 'all' || supplier.status === supplierStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredSuppliers.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  // Filter and paginate orders
  const filteredOrders = supplierOrdersData.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        order.supplierName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        order.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        order.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const lastOrderIndex = currentOrdersPage * ordersPerPage;
  const firstOrderIndex = lastOrderIndex - ordersPerPage;
  const currentOrders = filteredOrders.slice(firstOrderIndex, lastOrderIndex);
  const totalOrdersPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  // Sample product data for the selected supplier
  const [supplierProductsData] = useState([
    {
      id: 'prod_1',
      name: 'Product 1',
      sku: 'SKU001',
      price: 1999,
      stock: 50,
      status: 'in_stock',
      category: 'Skincare'
    },
    {
      id: 'prod_2',
      name: 'Product 2',
      sku: 'SKU002',
      price: 2999,
      stock: 25,
      status: 'low_stock',
      category: 'Haircare'
    },
    {
      id: 'prod_3',
      name: 'Product 3',
      sku: 'SKU003',
      price: 1499,
      stock: 0,
      status: 'out_of_stock',
      category: 'Makeup'
    }
  ]);

  const filteredInventory = supplierProductsData.filter(product => {
    if (!product || typeof product !== 'object') return false;
    const name = product.name || '';
    const status = product.status || '';
    
    const matchesSearch = name.toString().toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesStatus = inventoryStatusFilter === 'all' || status === inventoryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleActionClick = (supplier: Supplier, action: ActionType) => {
    setSelectedSupplier(supplier);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const handleViewClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };
  
  const handleInventoryClick = (supplier: Supplier) => {
      setSelectedSupplier(supplier);
      setIsInventoryModalOpen(true);
  }

  const handleViewOrderClick = (order: SupplierOrder) => {
    setSelectedOrder(order);
    setIsOrderViewModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (selectedSupplier && actionType) {
        console.log(`Performing ${actionType} on supplier ${selectedSupplier.shopName}`);
        // API call logic would go here
    }
    setIsActionModalOpen(false);
    setSelectedSupplier(null);
    setActionType(null);
  };

  const getModalContent = () => {
    if (!actionType || !selectedSupplier) return { title: '', description: '', buttonText: '' };
    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve Supplier?',
          description: `Are you sure you want to approve the supplier "${selectedSupplier.shopName}"?`,
          buttonText: 'Approve'
        };
      case 'reject':
        return {
          title: 'Reject Supplier?',
          description: `Are you sure you want to reject the supplier "${selectedSupplier.shopName}"? This action cannot be undone.`,
          buttonText: 'Reject'
        };
       case 'delete':
        return {
          title: 'Delete Supplier?',
          description: `Are you sure you want to permanently delete the supplier "${selectedSupplier.shopName}"? This action is irreversible.`,
          buttonText: 'Delete'
        };
      default:
        return { title: '', description: '', buttonText: '' };
    }
  };

  const { title, description, buttonText } = getModalContent();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-headline">Supplier Management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.reduce((acc, s) => acc + s.products, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{suppliers.reduce((acc, s) => acc + s.sales, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{suppliers.filter(s => s.status === 'Pending').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">All-time orders</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="suppliers">All Suppliers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>All Suppliers</CardTitle>
                  <CardDescription>Manage suppliers and their product listings.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search suppliers..."
                      className="w-full pl-8"
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                    />
                  </div>
                  <Select value={supplierStatusFilter} onValueChange={setSupplierStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setIsNewModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                  </Button>
                </div>
              </div>
            </CardHeader>

          <CardContent>
            <div className="overflow-x-auto no-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Business Reg No</TableHead>
                    <TableHead>Supplier Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{supplier.firstName}</TableCell>
                      <TableCell>{supplier.lastName}</TableCell>
                      <TableCell>{supplier.shopName}</TableCell>
                      <TableCell>{supplier.businessRegistrationNo}</TableCell>
                      <TableCell>{supplier.supplierType}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            supplier.status === "Approved" ? "bg-green-100 text-green-800" :
                            supplier.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                        }`}>
                          {supplier.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewClick(supplier)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'approve')}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Approve</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'reject')}>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Reject</span>
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'delete')}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={suppliersData.length}
            />
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Supplier Orders</CardTitle>
                  <CardDescription>View and manage all supplier orders.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search orders..."
                      className="w-full pl-8"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.supplierName}</TableCell>
                        <TableCell>{order.productName}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'Delivered' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewOrderClick(order)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Order</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                className="mt-4"
                currentPage={currentOrdersPage}
                totalPages={totalOrdersPages}
                onPageChange={setCurrentOrdersPage}
                itemsPerPage={ordersPerPage}
                onItemsPerPageChange={setOrdersPerPage}
                totalItems={filteredOrders.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Confirmation Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'reject' || actionType === 'delete' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
            >
              {buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Supplier Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Supplier Details: {selectedSupplier?.shopName}</DialogTitle>
              </DialogHeader>
              {selectedSupplier && (
                  <div className="grid gap-4 py-4 text-sm">
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">First Name</span>
                          <span className="col-span-2">{selectedSupplier.firstName}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Last Name</span>
                          <span className="col-span-2">{selectedSupplier.lastName}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Shop Name</span>
                          <span className="col-span-2">{selectedSupplier.shopName}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Business Reg No</span>
                          <span className="col-span-2">{selectedSupplier.businessRegistrationNo}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Supplier Type</span>
                          <span className="col-span-2">{selectedSupplier.supplierType}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Contact</span>
                          <span className="col-span-2">{selectedSupplier.contact}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Status</span>
                          <span className="col-span-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              selectedSupplier.status === "Approved" ? "bg-green-100 text-green-800" :
                              selectedSupplier.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {selectedSupplier.status}
                            </span>
                          </span>
                      </div>
                  </div>
              )}
              <DialogFooter>
                  <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* View Inventory Modal */}
        <Dialog open={isInventoryModalOpen} onOpenChange={setIsInventoryModalOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Product Inventory: {selectedSupplier?.shopName}</DialogTitle>
                    <DialogDescription>
                        A list of all products from this supplier.
                    </DialogDescription>
                </DialogHeader>
                 <div className="py-4 space-y-4">
                     <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by product name..."
                                className="w-full pl-8"
                                value={inventorySearch}
                                onChange={(e) => setInventorySearch(e.target.value)}
                            />
                        </div>
                        <Select value={inventoryStatusFilter} onValueChange={setInventoryStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="In Stock">In Stock</SelectItem>
                                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="overflow-x-auto no-scrollbar rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product ID</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInventory.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                product.status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {product.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredInventory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            No products found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsInventoryModalOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


      {/* New Supplier Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Add New Supplier</DialogTitle>
            <DialogDescription className="text-gray-600">
              Fill in the supplier details below. All fields marked with <span className="text-red-500">*</span> are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSupplier} className="space-y-6 py-2">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={newSupplier.firstName}
                      onChange={handleNewSupplierChange}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={newSupplier.lastName}
                      onChange={handleNewSupplierChange}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newSupplier.email}
                      onChange={handleNewSupplierChange}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                      Mobile <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={newSupplier.mobile}
                      onChange={handleNewSupplierChange}
                      className="w-full"
                      required
                      minLength={10}
                      maxLength={10}
                      pattern="\d{10}"
                      title="Please enter a valid 10-digit mobile number"
                      placeholder="1234567890"
                    />
                    {newSupplier.mobile && newSupplier.mobile.length !== 10 && (
                      <p className="text-sm text-red-500">Mobile number must be 10 digits</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopName" className="text-sm font-medium text-gray-700">
                        Shop Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="shopName"
                        name="shopName"
                        value={newSupplier.shopName}
                        onChange={handleNewSupplierChange}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessRegistrationNo" className="text-sm font-medium text-gray-700">
                        Business Registration No.
                      </Label>
                      <Input
                        id="businessRegistrationNo"
                        name="businessRegistrationNo"
                        value={newSupplier.businessRegistrationNo}
                        onChange={handleNewSupplierChange}
                        className="w-full"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={newSupplier.address}
                      onChange={handleNewSupplierChange}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        name="country" 
                        value={newSupplier.country}
                        onValueChange={(value) => setNewSupplier(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="USA">USA</SelectItem>
                          <SelectItem value="UK">UK</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={selectedState}
                        onValueChange={handleStateChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {states.map((state) => (
                            <SelectItem key={state.state} value={state.state}>
                              {state.state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newSupplier.city}
                        onValueChange={handleCityChange}
                        disabled={!selectedState}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">
                        Pincode <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter 6-digit pincode"
                        value={newSupplier.pincode}
                        onChange={handleNewSupplierChange}
                        className="w-full"
                        required
                        minLength={6}
                        maxLength={6}
                        pattern="\d{6}"
                        title="Please enter a valid 6-digit pincode"
                      />
                      {newSupplier.pincode && newSupplier.pincode.length !== 6 && (
                        <p className="text-sm text-red-500">Pincode must be 6 digits</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Location (Optional)
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="Enter location"
                        value={newSupplier.location}
                        onChange={handleNewSupplierChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Documents</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseFile" className="block text-sm font-medium text-gray-700">
                      License/Certification (Image, max 5MB) <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1 flex items-center gap-4">
                      <div className="flex-1">
                        <label
                          htmlFor="licenseFile"
                          className="relative flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, JPEG (MAX. 5MB)
                            </p>
                          </div>
                          <input
                            id="licenseFile"
                            name="licenseFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {licensePreview && (
                        <div className="w-24 h-24 border rounded-lg overflow-hidden">
                          <img 
                            src={licensePreview} 
                            alt="License preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    {newSupplier.licenseFile && (
                      <p className="mt-1 text-sm text-gray-600">
                        Selected: {newSupplier.licenseFile.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supplierType" className="text-sm font-medium text-gray-700">
                      Supplier Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newSupplier.supplierType}
                      onValueChange={handleSupplierTypeChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier type" />
                      </SelectTrigger>
                      <SelectContent>
                        {supplierTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Password Section */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Security (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={newSupplier.password}
                        onChange={handleNewSupplierChange}
                        className="w-full pr-10"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={newSupplier.confirmPassword}
                        onChange={handleNewSupplierChange}
                        className="w-full pr-10"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="bg-gray-50 px-4 py-3 sm:px-6 rounded-b-lg">
              <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Supplier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Order Modal */}
      <Dialog open={isOrderViewModalOpen} onOpenChange={setIsOrderViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details: {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Order ID</span>
                <span className="col-span-2">{selectedOrder.id}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Supplier</span>
                <span className="col-span-2">{selectedOrder.supplierName} ({selectedOrder.supplierId})</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Product</span>
                <span className="col-span-2">{selectedOrder.productName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Customer</span>
                <span className="col-span-2">{selectedOrder.customerName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Amount</span>
                <span className="col-span-2">₹{selectedOrder.amount.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Status</span>
                <span className="col-span-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                    selectedOrder.status === 'Delivered' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Order Date</span>
                <span className="col-span-2">{new Date(selectedOrder.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsOrderViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

