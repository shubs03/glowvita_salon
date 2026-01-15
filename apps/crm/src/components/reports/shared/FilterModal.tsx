import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Input } from '@repo/ui/input';
import { useGetUniqueClientsQuery, useGetUniqueServicesQuery, useGetUniqueStaffQuery, useGetUniqueProductNamesQuery, useGetUniqueBrandsQuery, useGetUniqueCategoriesQuery } from '@repo/store/api';

import { FilterParams } from './types';

export const FilterModal = ({
    isOpen,
    onClose,
    onApplyFilters,
    cities = [],
    initialFilters = {},
    showStatusFilter = false,
    showBookingTypeFilter = true,
    showUserTypeFilter = false,
    hideClientFilter = false,
    hideServiceFilter = false,
    hideStaffFilter = false,
    hideBookingTypeFilter = false,
    showProductFilter = false,
    showCategoryFilter = false,
    showBrandFilter = false,
    showIsActiveFilter = false,
    showRegionFilter = false,
    showSettlementDateFilters = false
}: {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: FilterParams) => void;
    cities?: string[];
    initialFilters?: FilterParams;
    showStatusFilter?: boolean;
    showBookingTypeFilter?: boolean;
    showUserTypeFilter?: boolean;
    showProductFilter?: boolean;
    showCategoryFilter?: boolean;
    showBrandFilter?: boolean;
    showIsActiveFilter?: boolean;
    showRegionFilter?: boolean;
    hideClientFilter?: boolean;
    hideServiceFilter?: boolean;
    hideStaffFilter?: boolean;
    hideBookingTypeFilter?: boolean;
    showSettlementDateFilters?: boolean;
}) => {
    const [startDate, setStartDate] = useState<string>(initialFilters.startDate || '');
    const [endDate, setEndDate] = useState<string>(initialFilters.endDate || '');
    const [settlementFromDate, setSettlementFromDate] = useState<string>(initialFilters.settlementFromDate || '');
    const [settlementToDate, setSettlementToDate] = useState<string>(initialFilters.settlementToDate || '');
    const [saleType, setSaleType] = useState<string>(initialFilters.saleType || 'all');
    const [client, setClient] = useState<string>(initialFilters.client || 'all');
    const [service, setService] = useState<string>(initialFilters.service || 'all');
    const [staff, setStaff] = useState<string>(initialFilters.staff || 'all');
    const [status, setStatus] = useState<string>(initialFilters.status || 'all');
    const [userType, setUserType] = useState<string>(initialFilters.userType || 'all');
    const [product, setProduct] = useState<string>(initialFilters.product || 'all');
    const [category, setCategory] = useState<string>(initialFilters.category || 'all');
    const [brand, setBrand] = useState<string>(initialFilters.brand || 'all');
    const [region, setRegion] = useState<string>(initialFilters.region || 'all');
    const [isActive, setIsActive] = useState<string>(initialFilters.isActive !== undefined ? (typeof initialFilters.isActive === 'boolean' ? initialFilters.isActive.toString() : initialFilters.isActive) : 'all');

    // Fetch unique values for dropdowns
    const { data: clientsData } = useGetUniqueClientsQuery({});
    const { data: servicesData } = useGetUniqueServicesQuery({});
    const { data: staffData } = useGetUniqueStaffQuery({});
    const { data: productsData } = useGetUniqueProductNamesQuery({});
    const { data: categoriesData } = useGetUniqueCategoriesQuery({});
    const { data: brandsData } = useGetUniqueBrandsQuery({});

    const uniqueClients = clientsData?.data || [];
    const uniqueServices = servicesData?.data || [];
    const uniqueStaff = staffData?.data || [];
    const uniqueProducts = productsData?.data || [];
    const uniqueCategories = categoriesData?.data || [];
    const uniqueBrands = brandsData?.data || [];

    // Limit displayed filter options to 5 with scroll for the rest
    const renderFilterOptions = (options: string[], showAll: boolean = false) => {
        // Ensure options is an array and not a single value
        const validOptions = Array.isArray(options) ? options.filter(opt => typeof opt === 'string' && opt) : [];

        if (showAll || validOptions.length <= 5) {
            return validOptions.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
            ));
        }

        return (
            <div className="max-h-40 overflow-y-auto">
                {validOptions.map((option, index) => (
                    <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
            </div>
        );
    };

    const handleApply = () => {
        const filters = {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            settlementFromDate: settlementFromDate || undefined,
            settlementToDate: settlementToDate || undefined,
            client: client !== 'all' ? client : undefined,
            service: service !== 'all' ? service : undefined,
            staff: staff !== 'all' ? staff : undefined,
            // Only include status filter if showStatusFilter is true
            ...(showStatusFilter && { status: status !== 'all' ? status : undefined }),
            userType: userType !== 'all' ? userType : undefined,
            bookingType: saleType !== 'all' ? saleType : undefined,
            product: product !== 'all' ? product : undefined,
            category: category !== 'all' ? category : undefined,
            brand: brand !== 'all' ? brand : undefined,
            region: region !== 'all' ? region : undefined,
            ...(showIsActiveFilter && { isActive: isActive !== 'all' ? isActive === 'true' : undefined })
        };
        onApplyFilters(filters);
        onClose();
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        setSettlementFromDate('');
        setSettlementToDate('');
        setSaleType('all');
        setClient('all');
        setService('all');
        setStaff('all');
        setStatus('all');
        setUserType('all');
        setProduct('all');
        setCategory('all');
        setBrand('all');
        setRegion('all');
        setIsActive('all');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                    <DialogDescription>
                        Apply filters to refine your report data.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {showSettlementDateFilters && (
                            <>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Settlement From Date</label>
                                    <Input
                                        type="date"
                                        value={settlementFromDate}
                                        onChange={(e) => setSettlementFromDate(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Settlement To Date</label>
                                    <Input
                                        type="date"
                                        value={settlementToDate}
                                        onChange={(e) => setSettlementToDate(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </>
                        )}

                        {showBookingTypeFilter && !hideBookingTypeFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Booking Type</label>
                                <Select value={saleType} onValueChange={setSaleType}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select booking type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="offline">Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showUserTypeFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">User Type</label>
                                <Select value={userType} onValueChange={setUserType}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select user type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="vendor">Vendor</SelectItem>
                                        <SelectItem value="supplier">Supplier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {!hideClientFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Filter by client</label>
                                <Select value={client} onValueChange={setClient}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {renderFilterOptions(uniqueClients)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {!hideServiceFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Filter by service</label>
                                <Select value={service} onValueChange={setService}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {renderFilterOptions(uniqueServices)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {!hideStaffFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Filter by staff</label>
                                <Select value={staff} onValueChange={setStaff}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {renderFilterOptions(uniqueStaff)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showStatusFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Filter by status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showProductFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Filter by product</label>
                                <Select value={product} onValueChange={setProduct}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {renderFilterOptions(uniqueProducts)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showCategoryFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Filter by category</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {renderFilterOptions(uniqueCategories)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showBrandFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Filter by brand</label>
                                <Select value={brand} onValueChange={setBrand}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {renderFilterOptions(uniqueBrands)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showIsActiveFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Filter by active status</label>
                                <Select value={isActive} onValueChange={setIsActive}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select active status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {showRegionFilter && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Filter by region</label>
                                <Select value={region} onValueChange={setRegion}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {renderFilterOptions(cities)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClear}>
                        Clear
                    </Button>
                    <Button onClick={handleApply}>
                        Apply Filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
