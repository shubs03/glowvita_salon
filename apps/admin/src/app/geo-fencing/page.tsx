"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Skeleton } from "@repo/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Map,
  MapPin,
  Globe,
  Rows,
  Search,
} from "lucide-react";
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from "../../../../../packages/config/config";

const rawApiKey = NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_API_KEY = rawApiKey.toString().trim().replace(/['"“”]/g, '');
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { selectRootState } from "@repo/store/store";
import {
  openFenceModal,
  closeFenceModal,
  openViewFenceModal,
  closeViewFenceModal,
  openDeleteFenceModal,
  closeDeleteFenceModal,
} from "@repo/store/slices/geoFencingSlice";
import {
  useGetGeoFencesQuery,
  useCreateGeoFenceMutation,
  useUpdateGeoFenceMutation,
  useDeleteGeoFenceMutation,
} from "@repo/store/api";
// Mapbox access token setter removed as we are using Google Maps

interface Fence {
  _id?: string;
  id: string;
  name: string;
  city: string;
  coordinates: GeoJSON.Feature<GeoJSON.Polygon>;
  createdAt: string;
}

interface SearchResult {
  description: string;
  place_id: string;
}

interface GeoFencingState {
  isModalOpen: boolean;
  isViewModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedFence: Fence | null;
  isEditMode: boolean;
}

export default function GeoFencingPage() {
  const dispatch = useAppDispatch();
  const { isModalOpen, isViewModalOpen, isDeleteModalOpen, selectedFence, isEditMode } = useAppSelector(
    (state: any): GeoFencingState => selectRootState(state).geoFencing
  );

  // RTK Query hooks
  const { data, isLoading, error } = useGetGeoFencesQuery(undefined);
  const fences: Fence[] = data?.geoFences?.map((item: any) => ({
    _id: item._id,
    id: item.fenceId || item._id || `FNC-${Date.now()}-${Math.random()}`,
    name: item.name || "Unnamed Fence",
    city: item.city || "",
    coordinates: item.coordinates || {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[]] },
      properties: {},
    },
    createdAt: item.createdAt
      ? new Date(item.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  })) || [];

  const [createGeoFence] = useCreateGeoFenceMutation();
  const [updateGeoFence] = useUpdateGeoFenceMutation();
  const [deleteGeoFence] = useDeleteGeoFenceMutation();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const [authError, setAuthError] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<google.maps.Map | null>(null);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);
  const currentPolygon = useRef<google.maps.Polygon | null>(null);
  const viewMapContainer = useRef<HTMLDivElement | null>(null);
  const viewMap = useRef<google.maps.Map | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

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

  const searchLocation = async (query: string) => {
    if (!query.trim() || !autocompleteService.current) return;

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
            setShowSearchResults(true);
          } else {
            setSearchResults([]);
          }
        }
      );
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    if (!placesService.current || !map.current) return;

    placesService.current.getDetails(
      {
        placeId: result.place_id,
        fields: ['geometry'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          map.current?.setCenter(place.geometry.location);
          map.current?.setZoom(14);
        }
      }
    );
    setShowSearchResults(false);
    setSearchQuery(result.description);
  };

  // Cleanup map function
  const cleanupMap = useCallback(() => {
    if (currentPolygon.current) {
      currentPolygon.current.setMap(null);
      currentPolygon.current = null;
    }
    if (drawingManager.current) {
      drawingManager.current.setMap(null);
      drawingManager.current = null;
    }
    map.current = null;
  }, []);

  // Initialize the main map
  const initializeMap = useCallback(() => {
    if (!mapContainer.current || !window.google) {
      return;
    }

    cleanupMap();

    try {
      // Ensure container exists and has height
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect();
        if (rect.height === 0) {
          setTimeout(initializeMap, 200);
          return;
        }
      } else {
        return;
      }

      const center = { lat: 23.2599, lng: 77.4126 };
      map.current = new google.maps.Map(mapContainer.current, {
        center,
        zoom: 9,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
      });

      autocompleteService.current = new google.maps.places.AutocompleteService();
      placesService.current = new google.maps.places.PlacesService(map.current);

      drawingManager.current = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: "#088",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#088",
          editable: true,
          draggable: true,
        },
      });

      drawingManager.current.setMap(map.current);

      google.maps.event.addListener(drawingManager.current, 'overlaycomplete', (event: any) => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          if (currentPolygon.current) {
            currentPolygon.current.setMap(null);
          }
          currentPolygon.current = event.overlay;
          drawingManager.current?.setDrawingMode(null);
        }
      });

      if (isEditMode && selectedFence) {
        try {
          const coords = selectedFence.coordinates.geometry.coordinates[0].map(c => ({
            lat: c[1],
            lng: c[0]
          }));
          
          // Close the polygon if it's not closed in GeoJSON
          if (coords.length > 0 && (coords[0].lat !== coords[coords.length-1].lat || coords[0].lng !== coords[coords.length-1].lng)) {
             // Google Maps auto-closes
          }

          currentPolygon.current = new google.maps.Polygon({
            paths: coords,
            fillColor: "#088",
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: "#088",
            editable: true,
            draggable: true,
            map: map.current
          });

          const bounds = new google.maps.LatLngBounds();
          coords.forEach(c => bounds.extend(c));
          map.current.fitBounds(bounds);
          drawingManager.current.setDrawingMode(null);
        } catch (error) {
          console.error("Error loading existing fence:", error);
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [isEditMode, selectedFence, cleanupMap]);

  // Initialize view map for the view modal
  const initializeViewMap = useCallback(() => {
    if (!viewMapContainer.current || !window.google || !selectedFence) {
      return;
    }

    try {
      const coords = selectedFence.coordinates.geometry.coordinates[0].map(c => ({
        lat: c[1],
        lng: c[0]
      }));

      viewMap.current = new google.maps.Map(viewMapContainer.current, {
        center: coords[0],
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
      });

      new google.maps.Polygon({
        paths: coords,
        fillColor: "#088",
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: "#088",
        map: viewMap.current
      });

      const bounds = new google.maps.LatLngBounds();
      coords.forEach(c => bounds.extend(c));
      viewMap.current.fitBounds(bounds);
    } catch (error) {
      console.error("Error initializing view map:", error);
    }
  }, [selectedFence]);

  // Effect for main map initialization
  useEffect(() => {
    if (isModalOpen && isGoogleMapsLoaded) {
      const timer = setTimeout(() => {
        initializeMap();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      cleanupMap();
    }
  }, [isModalOpen, isGoogleMapsLoaded, initializeMap, cleanupMap]);

  // Effect for view map initialization
  useEffect(() => {
    if (isViewModalOpen && isGoogleMapsLoaded) {
      const timer = setTimeout(() => {
        initializeViewMap();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isViewModalOpen, isGoogleMapsLoaded, initializeViewMap]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupMap();
      if (viewMap.current) {
        viewMap.current = null;
      }
    };
  }, [cleanupMap]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = fences.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(fences.length / itemsPerPage) || 1;

  const handleOpenModal = (fence: Fence | null = null) => {
    dispatch(openFenceModal({ fence, isEditMode: !!fence }));
  };

  const handleCloseModal = () => {
    dispatch(closeFenceModal());
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleDeleteClick = (fence: Fence) => {
    dispatch(openDeleteFenceModal(fence));
  };

  const handleViewClick = (fence: Fence) => {
    dispatch(openViewFenceModal(fence));
  };

  const handleConfirmDelete = async () => {
    if (selectedFence) {
      try {
        await deleteGeoFence(selectedFence._id).unwrap();
        dispatch(closeDeleteFenceModal());
        toast.success(`Fence "${selectedFence.name}" deleted successfully`);
      } catch (error) {
        console.error("Error deleting fence:", error);
        toast.error("Failed to delete fence", {
          description: "Please try again.",
        });
      }
    }
  };

  const handleSaveFence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fenceName = formData.get("fenceName") as string;
    const cityName = formData.get("cityName") as string;

    if (!currentPolygon.current) {
      toast.error("Please draw a fence on the map");
      return;
    }

    const path = currentPolygon.current.getPath();
    const coords: number[][] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const p = path.getAt(i);
      coords.push([p.lng(), p.lat()]);
    }
    // GeoJSON polygon must be closed
    if (coords.length > 0) {
      coords.push([coords[0][0], coords[0][1]]);
    }

    const coordinates: GeoJSON.Feature<GeoJSON.Polygon> = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
      properties: {},
    };

    const fenceData = {
      name: fenceName,
      city: cityName,
      coordinates,
    };

    try {
      if (isEditMode && selectedFence) {
        await updateGeoFence({
          _id: selectedFence._id,
          ...fenceData,
        }).unwrap();
        toast.success(`Fence "${fenceName}" updated successfully`);
      } else {
        await createGeoFence(fenceData).unwrap();
        toast.success(`Fence "${fenceName}" created successfully`);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving fence:", error);
      toast.error("Failed to save fence", {
        description: "Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(5)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-5 w-full" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(5)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div>Error loading fences. Please try again.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Geo-fencing Management</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fences</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fences.length}</div>
            <p className="text-xs text-muted-foreground">Across all cities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities Covered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.from(new Set(fences.map((f) => f.city))).length}</div>
            <p className="text-xs text-muted-foreground">Unique cities with fences</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Area (approx.)</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125 km²</div>
            <p className="text-xs text-muted-foreground">Placeholder for total area</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Fenced City</CardTitle>
            <Rows className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fences.length > 0
                ? fences.reduce((acc, curr) => {
                    const cityCount = fences.filter((f) => f.city === curr.city).length;
                    return cityCount > acc.count ? { city: curr.city, count: cityCount } : acc;
                  }, { city: "None", count: 0 }).city
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground">With most fences</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Manage Fences</CardTitle>
              <CardDescription>Create, edit, and manage geographic fences.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Create New Fence
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto no-scrollbar rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fence ID</TableHead>
                  <TableHead>Fence Name</TableHead>
                  <TableHead>City Name</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((fence) => (
                    <TableRow key={fence.id}>
                      <TableCell className="font-mono text-xs">{fence.id}</TableCell>
                      <TableCell className="font-medium">{fence.name}</TableCell>
                      <TableCell>{fence.city}</TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        {JSON.stringify(fence.coordinates.geometry.coordinates)}
                      </TableCell>
                      <TableCell>{fence.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewClick(fence)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(fence)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(fence)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No fences available.
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
            totalItems={fences.length}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Fence Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-4xl">
          <form onSubmit={handleSaveFence}>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Fence" : "Create New Fence"}</DialogTitle>
              <DialogDescription>
                {isEditMode ? "Update the details for your fence." : "Define a new geographic fence on the map."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fenceName">Fence Name</Label>
                  <Input
                    id="fenceName"
                    name="fenceName"
                    placeholder="e.g., Downtown Business District"
                    defaultValue={selectedFence?.name || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityName">City Name (Optional)</Label>
                  <Input
                    id="cityName"
                    name="cityName"
                    placeholder="e.g., Metropolis"
                    defaultValue={selectedFence?.city || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Search Location</Label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for a location..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length > 2) {
                          searchLocation(e.target.value);
                        } else {
                          setShowSearchResults(false);
                        }
                      }}
                      className="pl-9"
                    />
                  </div>
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.place_id}
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => handleSearchResultSelect(result)}
                        >
                          {result.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Draw Fence</Label>
                <div className="relative border rounded-md overflow-hidden">
                  <div ref={mapContainer} className="h-96 w-full rounded-md border" style={{ minHeight: "400px" }} />
                  
                  {authError && (
                    <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-4 text-center z-10 transition-all">
                      <p className="text-red-600 font-bold mb-2 text-lg">Google Maps Error</p>
                      <p className="text-sm text-red-500 mb-4 px-6 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                        InvalidKeyMapError: The API key is invalid or rejected.
                      </p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold shadow-md"
                        type="button"
                      >
                        Reload Page
                      </button>
                      <div className="mt-6 text-xs text-gray-500 max-w-md text-left bg-white p-4 rounded-md border border-red-100 italic">
                        <p className="font-bold text-red-800 mb-1 not-italic">Common fixes:</p>
                        <p>1. Ensure Billing is enabled in Google Cloud Console.</p>
                        <p>2. Enable "Maps JavaScript API" and "Places API (New)".</p>
                        <p>3. Check API restrictions (Referrers should allow this domain).</p>
                      </div>
                    </div>
                  )}
                  
                  {!isGoogleMapsLoaded && !authError && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-600 animate-pulse">Initializing Google Maps...</p>
                    </div>
                  )}
                </div>
                {!GOOGLE_MAPS_API_KEY && (
                  <p className="text-sm text-destructive">
                    Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Use the polygon tool to draw your fence boundary. You can search for locations above to navigate the map.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">{isEditMode ? "Save Changes" : "Create Fence"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Fence Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={() => dispatch(closeViewFenceModal())}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>View Fence: {selectedFence?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Fence Details</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">ID:</span> {selectedFence?.id}
                </p>
                <p>
                  <span className="text-muted-foreground">Name:</span> {selectedFence?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">City:</span> {selectedFence?.city}
                </p>
                <p>
                  <span className="text-muted-foreground">Created At:</span> {selectedFence?.createdAt}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Fence Area</h4>
              <div
                ref={viewMapContainer}
                className="h-64 w-full bg-secondary rounded-md border"
                style={{ minHeight: "300px" }}
              />
              {!GOOGLE_MAPS_API_KEY && (
                <p className="text-sm text-destructive mt-2">
                  Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => dispatch(closeViewFenceModal())}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={() => dispatch(closeDeleteFenceModal())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fence?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the fence "{selectedFence?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => dispatch(closeDeleteFenceModal())}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};