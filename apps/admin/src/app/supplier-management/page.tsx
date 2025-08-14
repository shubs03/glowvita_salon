
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@repo/ui/dialog';
import { Eye, CheckCircle, XCircle, Plus, Box, DollarSign, Hourglass, Search, FileDown, X } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";

// Sample data for suppliers
const suppliersData = [
  {
    id: "SUP-001",
    name: "Global Beauty Supplies",
    contact: "contact@gbs.com",
    products: 125,
    sales: 25430,
    status: "Approved",
  },
  {
    id: "SUP-002",
    name: "Organic Skincare Inc.",
    contact: "sales@organicskin.com",
    products: 45,
    sales: 12810,
    status: "Pending",
  },
  {
    id: "SUP-003",
    name: "Nail Art Creations",
    contact: "orders@nailart.com",
    products: 210,
    sales: 32050,
    status: "Approved",
  },
  {
    id: "SUP-004",
    name: "Modern Hair Tools",
    contact: "info@modernhair.com",
    products: 80,
    sales: 18900,
    status: "Rejected",
  },
  {
    id: "SUP-005",
    name: "Spa Essentials",
    contact: "support@spaessentials.com",
    products: 60,
    sales: 9500,
    status: "Pending",
  },
];

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
  },
];

type Supplier = typeof suppliersData[0];
type SupplierOrder = typeof supplierOrdersData[0];
type ActionType = 'approve' | 'reject';

export default function SupplierManagementPage() {
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
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  
  // New supplier form state
  const [newSupplier, setNewSupplier] = useState({
    firstName: '',
    lastName: '',
    email: '',
    shopName: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    location: ''
  });
  
  const handleNewSupplierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSupplier(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to add the new supplier
    console.log('Adding new supplier:', newSupplier);
    // Reset form and close modal
    setNewSupplier({
      firstName: '',
      lastName: '',
      email: '',
      shopName: '',
      country: 'India',
      state: '',
      city: '',
      pincode: '',
      location: ''
    });
    setIsNewModalOpen(false);
  };

  // Filter and paginate suppliers
  const filteredSuppliers = suppliersData.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                        supplier.contact.toLowerCase().includes(supplierSearch.toLowerCase());
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

  const handleActionClick = (supplier: Supplier, action: ActionType) => {
    setSelectedSupplier(supplier);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const handleViewClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (selectedSupplier && actionType) {
        console.log(`Performing ${actionType} on supplier ${selectedSupplier.name}`);
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
          description: `Are you sure you want to approve the supplier "${selectedSupplier.name}"?`,
          buttonText: 'Approve'
        };
      case 'reject':
        return {
          title: 'Reject Supplier?',
          description: `Are you sure you want to reject the supplier "${selectedSupplier.name}"? This action cannot be undone.`,
          buttonText: 'Reject'
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
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliersData.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliersData.reduce((acc, s) => acc + s.products, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{suppliersData.reduce((acc, s) => acc + s.sales, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{suppliersData.filter(s => s.status === 'Pending').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
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
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.products}</TableCell>
                      <TableCell>₹{supplier.sales.toLocaleString()}</TableCell>
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
                        {supplier.status === "Pending" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'approve')}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'reject')}>
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
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
                          <Button variant="ghost" size="icon" onClick={() => {}}>
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
              variant={actionType === 'reject' ? 'destructive' : 'default'}
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
                  <DialogTitle>Supplier Details: {selectedSupplier?.name}</DialogTitle>
              </DialogHeader>
              {selectedSupplier && (
                  <div className="grid gap-4 py-4 text-sm">
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Supplier ID</span>
                          <span className="col-span-2">{selectedSupplier.id}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Contact</span>
                          <span className="col-span-2">{selectedSupplier.contact}</span>
                      </div>
                       <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Products</span>
                          <span className="col-span-2">{selectedSupplier.products}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Total Sales</span>
                          <span className="col-span-2">${selectedSupplier.sales.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Status</span>
                          <span className="col-span-2">{selectedSupplier.status}</span>
                      </div>
                  </div>
              )}
              <DialogFooter>
                  <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* New Supplier Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Fill in the supplier details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSupplier}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Enter first name"
                    value={newSupplier.firstName}
                    onChange={handleNewSupplierChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Enter last name"
                    value={newSupplier.lastName}
                    onChange={handleNewSupplierChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newSupplier.email}
                  onChange={handleNewSupplierChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shopName">Supplier Shop Name *</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  placeholder="Enter shop name"
                  value={newSupplier.shopName}
                  onChange={handleNewSupplierChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
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
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Enter state"
                    value={newSupplier.state}
                    onChange={handleNewSupplierChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    value={newSupplier.city}
                    onChange={handleNewSupplierChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    placeholder="Enter pincode"
                    value={newSupplier.pincode}
                    onChange={handleNewSupplierChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter location"
                    value={newSupplier.location}
                    onChange={handleNewSupplierChange}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
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
    </div>
  );
}
