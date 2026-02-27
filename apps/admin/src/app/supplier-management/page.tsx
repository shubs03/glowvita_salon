
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@repo/ui/dialog";
import {
  Eye,
  EyeOff,
  Plus,
  Search,
  FileDown,
  X,
  DollarSign,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  Map,
  MapPin,
  MapIcon,
} from "lucide-react";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  useGetSuppliersQuery,
  useGetSupplierOrdersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useCreateSuperDataItemMutation,
  useGetSuperDataQuery,
} from "@repo/store/api";
import { toast } from "sonner";
import { Skeleton } from "@repo/ui/skeleton";
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '../../../../../packages/config/config';
import SupplierEditForm from "../../components/SupplierEditForm";
import { useAppSelector } from "@repo/store/hooks";
import { selectSelectedRegion } from "@repo/store/slices/adminAuthSlice";
import { Badge } from "@repo/ui/badge";


type Supplier = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  shopName: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  location?: { type: string; coordinates: number[]; }; // Changed to match SupplierEditForm expectation
  address: string;
  businessRegistrationNo: string;
  supplierType: string;
  status: string;
  products: number;
  sales: number;
  licenseFiles?: string[];
};

type NewSupplier = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  shopName: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  location: { lat: number; lng: number } | null;
  address: string;
  businessRegistrationNo: string;
  supplierType: string;
  licenseFiles: File[];
  password: string;
  confirmPassword: string;
};

type SupplierOrder = {
  _id?: string;
  id: string;
  supplierId: string;
  supplierName: string;
  productName: string;
  customerName: string;
  amount: number;
  status: string;
  date: string;
  items?: any[];
  shippingAddress?: string;
  contactNumber?: string;
  paymentMethod?: string;
};
type ActionType = "approve" | "reject" | "delete";

const SupplierPageSkeleton = () => (
  <div className="p-4 sm:p-6 lg:p-8">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-8 w-64" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-20 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-5 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-40" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-20" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-5 w-24" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function SupplierManagementPage() {
  const selectedRegion = useAppSelector(selectSelectedRegion);
  const {
    data: suppliers = [],
    isLoading,
    isError,
    refetch,
  } = useGetSuppliersQuery(selectedRegion);
  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  // Add SuperData query to fetch supplier types
  const { data: superData = [], isLoading: isSuperDataLoading } = useGetSuperDataQuery(undefined);

  // State for Suppliers Tab
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierStatusFilter, setSupplierStatusFilter] = useState("all");

  // State for Orders Tab
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isOrderViewModalOpen, setIsOrderViewModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [licensePreviews, setLicensePreviews] = useState<string[]>([]);
  const [editLicensePreviews, setEditLicensePreviews] = useState<string[]>([]);
  const [newLicenseFiles, setNewLicenseFiles] = useState<File[]>([]);
  const [removedLicenseFiles, setRemovedLicenseFiles] = useState<string[]>([]); // Track removed files
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(
    null
  );
  const [actionType, setActionType] = useState<ActionType | null>(null);

  // Map states
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [authError, setAuthError] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Inventory modal state
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("all");

  // Fetch Supplier Orders
  const { data: supplierOrders = [], isLoading: isOrdersLoading } = useGetSupplierOrdersQuery({
    regionId: selectedRegion,
    status: orderStatusFilter,
  });

  const initialNewSupplierState: NewSupplier = {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    shopName: "",
    country: "India",
    state: "",
    city: "",
    pincode: "",
    location: null,
    address: "",
    businessRegistrationNo: "",
    supplierType: "",
    licenseFiles: [],
    password: "",
    confirmPassword: "",
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSupplier, setNewSupplier] = useState<NewSupplier>(initialNewSupplierState);

  const [showPassword, setShowPassword] = useState(false);

  // Google Maps API key
  const rawApiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const GOOGLE_MAPS_API_KEY = rawApiKey.toString().trim().replace(/['"“”]/g, '');


  // Get supplier types from SuperData where type is "supplier"
  const supplierTypes = useMemo(() => {
    return superData
      .filter((item: any) => item.type === "supplier")
      .map((item: any) => ({
        id: item._id,
        name: item.name,
      }));
  }, [superData]);

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    // Suppress Google Maps IntersectionObserver internal error
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('IntersectionObserver')) return;
      originalError.apply(console, args);
    };

    const checkGoogleMaps = () => {
      if ((window as any).google?.maps) {
        setIsGoogleMapsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    const scriptId = 'google-maps-native-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if (checkGoogleMaps()) return;

      const checkInterval = setInterval(() => {
        if (checkGoogleMaps()) {
          clearInterval(checkInterval);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry&v=weekly`;
    script.async = true;
    script.defer = true;

    (window as any).gm_authFailure = () => {
      console.error("Google Maps API Key Authentication Failure - This usually means the API Key is invalid, has no billing, or is restricted incorrectly.");
      toast.error("Google Maps Authentication Failed. Please check your API key.");
      setAuthError(true);
    };

    script.onload = () => setIsGoogleMapsLoaded(true);
    document.head.appendChild(script);

    return () => {
      console.error = originalError;
    };
  }, []);

  // Initialize map when modal opens
  useEffect(() => {
    if (!isMapOpen || !isGoogleMapsLoaded || !GOOGLE_MAPS_API_KEY) return;

    const initMap = () => {
      if (!mapContainer.current || !window.google) return;

      if (map.current) {
        google.maps.event.clearInstanceListeners(map.current);
      }

      const center = newSupplier.location
        ? { lat: newSupplier.location.lat, lng: newSupplier.location.lng }
        : { lat: 23.2599, lng: 77.4126 };

      // Ensure container still exists and has height
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect();
        if (rect.height === 0) {
          setTimeout(initMap, 200);
          return;
        }
      } else {
        return;
      }

      // Create new map
      map.current = new google.maps.Map(mapContainer.current, {
        center,
        zoom: newSupplier.location ? 15 : 5,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
      });

      geocoder.current = new google.maps.Geocoder();
      autocompleteService.current = new google.maps.places.AutocompleteService();
      placesService.current = new google.maps.places.PlacesService(map.current);

      // Remove existing marker
      if (marker.current) {
        marker.current.setMap(null);
      }

      // Add marker if location exists
      if (newSupplier.location) {
        marker.current = new google.maps.Marker({
          position: center,
          map: map.current,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        marker.current.addListener('dragend', () => {
          const position = marker.current!.getPosition();
          if (position) {
            setNewSupplier(prev => ({ ...prev, location: { lat: position.lat(), lng: position.lng() } }));
            fetchAddress({ lat: position.lat(), lng: position.lng() });
          }
        });
      }

      // Handle map clicks
      map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setNewSupplier(prev => ({ ...prev, location: { lat, lng } }));

        // Remove existing marker and add new one
        if (marker.current) {
          marker.current.setMap(null);
        }
        if (map.current) {
          marker.current = new google.maps.Marker({
            position: { lat, lng },
            map: map.current,
            draggable: true,
            animation: google.maps.Animation.DROP,
          });

          marker.current.addListener('dragend', () => {
            const position = marker.current!.getPosition();
            if (position) {
              setNewSupplier(prev => ({ ...prev, location: { lat: position.lat(), lng: position.lng() } }));
              fetchAddress({ lat: position.lat(), lng: position.lng() });
            }
          });
        }

        fetchAddress({ lat, lng });
      });
    };

    // Initialize with a larger delay to ensure DOM is ready and modal animation finished
    const timeoutId = setTimeout(initMap, 500);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (marker.current) {
        marker.current.setMap(null);
      }
    };
  }, [isMapOpen, isGoogleMapsLoaded]);

  // Search for locations using Google Places Autocomplete
  const handleSearch = async (query: string) => {
    if (!query || !autocompleteService.current) {
      setSearchResults([]);
      return;
    }

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'IN' },
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions.map(p => ({
              description: p.description,
              place_id: p.place_id,
            })));
          } else {
            setSearchResults([]);
          }
        }
      );
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    }
  };

  // Fetch address details based on coordinates
  const fetchAddress = async (location: { lat: number; lng: number }) => {
    if (!geocoder.current) return;

    try {
      geocoder.current.geocode({ location }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const address = result.formatted_address;

          let state = '';
          let city = '';

          result.address_components.forEach((component) => {
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
          });

          setNewSupplier(prev => ({
            ...prev,
            address,
            state: state || prev.state,
            city: city || prev.city
          }));
        }
      });
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Handle selection of a search result
  const handleSearchResultSelect = (result: any) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: result.place_id,
        fields: ['geometry', 'formatted_address', 'address_components'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const newLocation = { lat, lng };

          let state = '';
          let city = '';

          place.address_components?.forEach((component) => {
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
          });

          setNewSupplier(prev => ({
            ...prev,
            location: newLocation,
            address: place.formatted_address || result.description,
            state: state || prev.state,
            city: city || prev.city,
          }));

          // Update map
          if (map.current) {
            map.current.setCenter({ lat, lng });
            map.current.setZoom(15);
          }

          // Update marker
          if (marker.current) {
            marker.current.setPosition({ lat, lng });
          }

          // Clear search
          setSearchResults([]);
          setSearchQuery('');
        }
      }
    );
  };

  const handleNewSupplierChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "mobile" || name === "pincode") {
      const numericValue = value.replace(/\D/g, "");
      const maxLength = name === "mobile" ? 10 : 6;
      if (numericValue.length <= maxLength) {
        setNewSupplier((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setNewSupplier((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSupplierTypeChange = (value: string) => {
    setNewSupplier((prev) => ({ ...prev, supplierType: value }));
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    let licenseFilesBase64: string[] = [];
    if (newSupplier.licenseFiles && newSupplier.licenseFiles.length > 0) {
      licenseFilesBase64 = await toBase64Multiple(newSupplier.licenseFiles);
    }

    // Remove licenseFiles from newSupplier object to avoid sending File objects to the API
    const { licenseFiles, ...supplierData } = newSupplier;

    try {
      // Create the supplier first
      const supplierResult = await createSupplier({
        ...supplierData,
        licenseFiles: licenseFilesBase64,
      }).unwrap();

      toast.success("Supplier added successfully!");
      setNewSupplier(initialNewSupplierState);
      setLicensePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsNewModalOpen(false);
    } catch (error: any) {
      console.error("Failed to add supplier", error);
      toast.error("Failed to add supplier.");
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const toBase64Multiple = (files: File[]) =>
    Promise.all(files.map(file => toBase64(file)));


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const previewUrls: string[] = [];

      files.forEach(file => {
        if (!file.type.startsWith("image/")) {
          alert("Please upload only image files (JPEG, PNG, etc.)");
          return;
        }

        validFiles.push(file);
        previewUrls.push(URL.createObjectURL(file));
      });

      setLicensePreviews(prev => [...prev, ...previewUrls]);
      setNewSupplier((prev) => ({ ...prev, licenseFiles: [...prev.licenseFiles, ...validFiles] }));
    }
  };

  useEffect(() => {
    return () => {
      licensePreviews.forEach(preview => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [licensePreviews]);

  // Filter and paginate suppliers
  const filteredSuppliers = suppliers.filter((supplier: Supplier) => {
    const fullName = `${supplier.firstName} ${supplier.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(supplierSearch.toLowerCase()) ||
      supplier.shopName.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      (supplier.businessRegistrationNo &&
        supplier.businessRegistrationNo
          .toLowerCase()
          .includes(supplierSearch.toLowerCase()));
    const matchesStatus =
      supplierStatusFilter === "all" ||
      supplier.status === supplierStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredSuppliers.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  // Filter and paginate orders
  const filteredOrders = supplierOrders.filter((order: SupplierOrder) => {
    const matchesSearch =
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus =
      orderStatusFilter === "all" || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const lastOrderIndex = currentOrdersPage * ordersPerPage;
  const firstOrderIndex = lastOrderIndex - ordersPerPage;
  const currentOrders = filteredOrders.slice(firstOrderIndex, lastOrderIndex);
  const totalOrdersPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Sample product data for the selected supplier
  const [supplierProductsData] = useState([
    {
      id: "prod_1",
      name: "Product 1",
      sku: "SKU001",
      price: 1999,
      stock: 50,
      status: "in_stock",
      category: "Skincare",
    },
    {
      id: "prod_2",
      name: "Product 2",
      sku: "SKU002",
      price: 2999,
      stock: 25,
      status: "low_stock",
      category: "Haircare",
    },
    {
      id: "prod_3",
      name: "Product 3",
      sku: "SKU003",
      price: 1499,
      stock: 0,
      status: "out_of_stock",
      category: "Makeup",
    },
  ]);

  const filteredInventory = supplierProductsData.filter((product) => {
    if (!product || typeof product !== "object") return false;
    const name = product.name || "";
    const status = product.status || "";

    const matchesSearch = name
      .toString()
      .toLowerCase()
      .includes(inventorySearch.toLowerCase());
    const matchesStatus =
      inventoryStatusFilter === "all" || status === inventoryStatusFilter;
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
  };

  const handleViewOrderClick = (order: SupplierOrder) => {
    setSelectedOrder(order);
    setIsOrderViewModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (selectedSupplier && actionType) {
      try {
        if (actionType === "delete") {
          await deleteSupplier(selectedSupplier._id).unwrap();
          toast.success(`Supplier "${selectedSupplier.shopName}" deleted.`);
        } else {
          const newStatus = actionType === "approve" ? "Approved" : "Rejected";
          await updateSupplier({
            id: selectedSupplier._id,
            status: newStatus,
          }).unwrap();
          toast.success(
            `Supplier "${selectedSupplier.shopName}" status updated to ${newStatus}.`
          );
        }
      } catch (error) {
        toast.error(
          `Failed to perform action on ${selectedSupplier.shopName}.`
        );
      }
    }
    setIsActionModalOpen(false);
    setSelectedSupplier(null);
    setActionType(null);
  };

  const getModalContent = () => {
    if (!actionType || !selectedSupplier)
      return { title: "", description: "", buttonText: "" };
    switch (actionType) {
      case "approve":
        return {
          title: "Approve Supplier?",
          description: `Are you sure you want to approve the supplier "${selectedSupplier.shopName}"?`,
          buttonText: "Approve",
        };
      case "reject":
        return {
          title: "Reject Supplier?",
          description: `Are you sure you want to reject the supplier "${selectedSupplier.shopName}"? This action cannot be undone.`,
          buttonText: "Reject",
        };
      case "delete":
        return {
          title: "Delete Supplier?",
          description: `Are you sure you want to permanently delete the supplier "${selectedSupplier.shopName}"? This action is irreversible.`,
          buttonText: "Delete",
        };
      default:
        return { title: "", description: "", buttonText: "" };
    }
  };

  const { title, description, buttonText } = getModalContent();

  if (isLoading) return <SupplierPageSkeleton />;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-semibold text-destructive mb-2">
          Failed to Fetch Suppliers
        </h2>
        <p className="text-muted-foreground mb-4">
          There was an error while trying to retrieve the data.
        </p>
        <Button onClick={() => refetch()}>
          <XCircle className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold font-headline">
          Supplier Management
        </h1>
        {selectedRegion && selectedRegion !== 'all' && (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            Region Filtered
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Suppliers
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.reduce((acc: number, s: Supplier) => acc + s.products, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all suppliers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{suppliers.reduce((acc: number, s: Supplier) => acc + s.sales, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All-time sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {suppliers.filter((s: Supplier) => s.status === "Pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isOrdersLoading ? <Skeleton className="h-8 w-16" /> : supplierOrders.length}
            </div>
            <p className="text-xs text-muted-foreground">Total supplier orders</p>
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
                  <CardDescription>
                    Manage suppliers and their product listings.
                  </CardDescription>
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
                  <Select
                    value={supplierStatusFilter}
                    onValueChange={setSupplierStatusFilter}
                  >
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
                    {currentItems.length > 0 ? (
                      currentItems.map((supplier: Supplier, index: number) => (
                        <TableRow key={supplier._id}>
                          <TableCell className="font-medium">
                            {supplier.firstName}
                          </TableCell>
                          <TableCell>{supplier.lastName}</TableCell>
                          <TableCell>{supplier.shopName}</TableCell>
                          <TableCell>
                            {supplier.businessRegistrationNo}
                          </TableCell>
                          <TableCell>{supplier.supplierType}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${supplier.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : supplier.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                                }`}
                            >
                              {supplier.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col gap-1">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewClick(supplier)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View Details</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    // Reset edit modal states when opening
                                    setEditLicensePreviews([]);
                                    setNewLicenseFiles([]);
                                    setRemovedLicenseFiles([]);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleActionClick(supplier, "approve")
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="sr-only">Approve</span>
                                </Button>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleActionClick(supplier, "reject")
                                  }
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  <span className="sr-only">Reject</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleActionClick(supplier, "delete")
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No suppliers found.
                        </TableCell>
                      </TableRow>
                    )}
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
                totalItems={filteredSuppliers.length}
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
                  <CardDescription>
                    View and manage all supplier orders.
                  </CardDescription>
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
                  <Select
                    value={orderStatusFilter}
                    onValueChange={setOrderStatusFilter}
                  >
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
                    {isOrdersLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : currentOrders.length > 0 ? (
                      currentOrders.map((order: SupplierOrder) => (
                        <TableRow key={order._id || order.id}>
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.supplierName}</TableCell>
                          <TableCell>{order.productName}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>
                            ₹{order.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === "Completed" || order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Processing" || order.status === "Shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                            >
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewOrderClick(order)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Order</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
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
            <Button
              variant="secondary"
              onClick={() => setIsActionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionType === "reject" || actionType === "delete"
                  ? "destructive"
                  : "default"
              }
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
            <DialogTitle>
              Supplier Details: {selectedSupplier?.shopName}
            </DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  First Name
                </span>
                <span className="col-span-2">{selectedSupplier.firstName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Last Name
                </span>
                <span className="col-span-2">{selectedSupplier.lastName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Shop Name
                </span>
                <span className="col-span-2">{selectedSupplier.shopName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Business Reg No
                </span>
                <span className="col-span-2">
                  {selectedSupplier.businessRegistrationNo}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Supplier Type
                </span>
                <span className="col-span-2">
                  {selectedSupplier.supplierType}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Contact
                </span>
                <span className="col-span-2">{selectedSupplier.email}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Status
                </span>
                <span className="col-span-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedSupplier.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : selectedSupplier.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
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

      {/* Edit Supplier Modal */}
      {/* Edit Supplier Modal - Replaced with Component */}
      {selectedSupplier && (
        <SupplierEditForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          supplier={selectedSupplier}
          refetch={refetch}
        />
      )}

      {/* View Inventory Modal */}
      <Dialog
        open={isInventoryModalOpen}
        onOpenChange={setIsInventoryModalOpen}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Product Inventory: {selectedSupplier?.shopName}
            </DialogTitle>
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
              <Select
                value={inventoryStatusFilter}
                onValueChange={setInventoryStatusFilter}
              >
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
                      <TableCell className="font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {product.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredInventory.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsInventoryModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Supplier Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={(open) => {
        setIsNewModalOpen(open);
        if (!open) {
          // Reset form when closing
          setNewSupplier(initialNewSupplierState);
          setLicensePreviews([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Add New Supplier
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Fill in the supplier details below. All fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSupplier} className="space-y-6 py-2">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
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
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
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
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
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
                    <Label
                      htmlFor="mobile"
                      className="text-sm font-medium text-gray-700"
                    >
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
                      placeholder="12345 67890"
                    />
                    {newSupplier.mobile && newSupplier.mobile.length !== 10 && (
                      <p className="text-sm text-red-500">
                        Mobile number must be 10 digits
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Business Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="shopName"
                        className="text-sm font-medium text-gray-700"
                      >
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
                      <Label
                        htmlFor="businessRegistrationNo"
                        className="text-sm font-medium text-gray-700"
                      >
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
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700"
                    >
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
                      <Label
                        htmlFor="country"
                        className="text-sm font-medium text-gray-700"
                      >
                        Country <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        value={newSupplier.country}
                        onChange={handleNewSupplierChange}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="state"
                        className="text-sm font-medium text-gray-700"
                      >
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={newSupplier.state}
                        onChange={handleNewSupplierChange}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="city"
                        className="text-sm font-medium text-gray-700"
                      >
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={newSupplier.city}
                        onChange={handleNewSupplierChange}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                      <Label
                        htmlFor="pincode"
                        className="text-sm font-medium text-gray-700"
                      >
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
                      />
                      {newSupplier.pincode &&
                        newSupplier.pincode.length !== 6 && (
                          <p className="text-sm text-red-500">
                            Pincode must be 6 digits
                          </p>
                        )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor="location"
                        className="text-sm font-medium text-gray-700"
                      >
                        Location
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={newSupplier.location ? `${newSupplier.location.lat}, ${newSupplier.location.lng}` : ''}
                          placeholder="Select location from map"
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsMapOpen(true)}
                        >
                          <Map className="mr-2 h-4 w-4" /> Choose from Map
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Business Documents
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="licenseFile"
                      className="block text-sm font-medium text-gray-700"
                    >
                      License/Certification (Image, max 5MB){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1">
                      <div className="mb-4">
                        <label
                          htmlFor="licenseFile"
                          className="relative flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              className="w-8 h-8 mb-4 text-gray-500"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 16"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                              />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
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
                            className="hidden"
                            multiple
                            onChange={handleFileChange}
                            ref={fileInputRef}
                          />
                        </label>
                      </div>

                      {/* Show license file previews for new supplier */}
                      <div className="flex flex-wrap gap-2">
                        {licensePreviews.map((preview, index) => (
                          <div key={`license-${preview}-${index}`} className="w-24 h-24 border rounded-lg overflow-hidden relative">
                            <img
                              src={preview}
                              alt={`License preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove the preview
                                setLicensePreviews(prev => prev.filter((_, i) => i !== index));
                                // Remove the file from newSupplier
                                setNewSupplier(prev => ({
                                  ...prev,
                                  licenseFiles: prev.licenseFiles.filter((_, i) => i !== index)
                                }));
                                // Revoke the object URL
                                URL.revokeObjectURL(preview);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {newSupplier.licenseFiles.length > 0 && (
                      <p className="mt-1 text-sm text-gray-600">
                        Selected {newSupplier.licenseFiles.length} file(s)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="supplierType"
                      className="text-sm font-medium text-gray-700"
                    >
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
                        {supplierTypes.map((type: { id: string; name: string; description?: string }) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                            {type.description && ` - ${type.description}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isSuperDataLoading && (
                      <p className="text-sm text-gray-500">Loading supplier types...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Account Security (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
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
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-700"
                    >
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Supplier</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Order Modal */}
      <Dialog
        open={isOrderViewModalOpen}
        onOpenChange={setIsOrderViewModalOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details: {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Order ID
                </span>
                <span className="col-span-2">{selectedOrder.id}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Supplier
                </span>
                <span className="col-span-2">
                  {selectedOrder.supplierName} ({selectedOrder.supplierId})
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Product
                </span>
                <span className="col-span-2">{selectedOrder.productName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Customer
                </span>
                <span className="col-span-2">{selectedOrder.customerName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Amount
                </span>
                <span className="col-span-2">
                  ₹{selectedOrder.amount.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Status
                </span>
                <span className="col-span-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedOrder.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : selectedOrder.status === "Processing"
                        ? "bg-blue-100 text-blue-800"
                        : selectedOrder.status === "Shipped"
                          ? "bg-purple-100 text-purple-800"
                          : selectedOrder.status === "Delivered"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {selectedOrder.status}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Order Date
                </span>
                <span className="col-span-2">
                  {new Date(selectedOrder.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsOrderViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map Modal */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl rounded-3xl">
          <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Supplier Logistics Mapper</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  Pin the warehouse or office location for efficient delivery routing.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Floating Search Bar with Glassmorphism */}
            <div className="absolute top-6 left-6 right-6 z-[100] max-w-md">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <Input
                  placeholder="Seach warehouse address..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full h-14 pl-12 pr-6 rounded-2xl border-none shadow-2xl bg-white/90 backdrop-blur-xl text-lg font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-primary transition-all"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-h-[350px] overflow-y-auto overflow-x-hidden p-2 z-[110] animate-in slide-in-from-top-2 duration-200">
                    {searchResults.map((result: any) => (
                      <div
                        key={result.place_id}
                        className="group flex items-start gap-3 p-4 hover:bg-primary/5 cursor-pointer rounded-xl transition-all border-b border-slate-50 last:border-0"
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        <div className="mt-0.5 p-2 rounded-full bg-slate-100 group-hover:bg-primary/10 text-slate-500 group-hover:text-primary transition-colors">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800 group-hover:text-primary truncate transition-colors">
                            {result.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative bg-slate-100">
              <div
                ref={mapContainer}
                className="w-full h-full"
              />
              <div className="absolute bottom-6 left-6 z-50">
                <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-bold text-slate-700 font-headline uppercase tracking-wider">Logistics Radar</span>
                </div>
              </div>

              {authError && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-[200]">
                  <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                      <MapPin className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 font-headline">Map Service Unavailable</h3>
                    <p className="text-slate-500 text-sm mb-6">
                      Google Maps API is currently unavailable. Please verify your billing and API credentials.
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="w-full rounded-xl bg-red-600 hover:bg-red-700 h-12 text-lg font-headline"
                      type="button"
                    >
                      Reload Map
                    </Button>
                  </div>
                </div>
              )}

              {!isGoogleMapsLoaded && !authError && (
                <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center z-[150]">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
                  </div>
                  <p className="mt-6 text-lg font-bold text-slate-800 tracking-tight font-headline">Booting Logistics System...</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {newSupplier.location && (
                <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Location Calibrated</div>
                  <div className="text-xs font-mono font-bold text-slate-800">
                    {newSupplier.location.lat.toFixed(4)}, {newSupplier.location.lng.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setIsMapOpen(false)} className="rounded-xl h-12 px-6 font-bold text-slate-600 hover:bg-slate-200 transition-all font-headline">
                Discard
              </Button>
              <Button
                onClick={() => setIsMapOpen(false)}
                disabled={!newSupplier.location}
                className="rounded-xl h-12 px-8 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-headline"
              >
                Confirm Dispatch Point
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
