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
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
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
import { NEXT_PUBLIC_MAPBOX_API_KEY } from "../../../../../packages/config/config";

// Set the Mapbox access token
if (NEXT_PUBLIC_MAPBOX_API_KEY) {
  mapboxgl.accessToken = NEXT_PUBLIC_MAPBOX_API_KEY;
} else {
  console.error("Mapbox API key is not defined");
}

interface Fence {
  _id?: string;
  id: string;
  name: string;
  city: string;
  coordinates: GeoJSON.Feature<GeoJSON.Polygon>;
  createdAt: string;
}

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
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
    (state): GeoFencingState => selectRootState(state).geoFencing
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

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const viewMapContainer = useRef<HTMLDivElement | null>(null);
  const viewMap = useRef<mapboxgl.Map | null>(null);

  // Search for locations using Mapbox Geocoding API
  const searchLocation = async (query: string) => {
    if (!query.trim() || !NEXT_PUBLIC_MAPBOX_API_KEY) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${NEXT_PUBLIC_MAPBOX_API_KEY}&limit=5`
      );
      const data = await response.json();

      if (data.features) {
        const results: SearchResult[] = data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center,
        }));
        setSearchResults(results);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Failed to search location", {
        description: "Please try again.",
      });
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: SearchResult) => {
    if (map.current) {
      map.current.flyTo({
        center: result.center,
        zoom: 14,
        duration: 1000,
      });
    }
    setShowSearchResults(false);
    setSearchQuery(result.place_name);
  };

  // Cleanup map function
  const cleanupMap = useCallback(() => {
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    if (draw.current) {
      draw.current = null;
    }
  }, []);

  // Initialize the main map
  const initializeMap = useCallback(() => {
    if (!mapContainer.current || !NEXT_PUBLIC_MAPBOX_API_KEY) {
      console.error("Map container or API key not found");
      return;
    }

    cleanupMap();

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-74.5, 40],
        zoom: 9,
      });

      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: "draw_polygon",
      });

      map.current.addControl(draw.current);
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      const updateArea = (e: any) => {
        const data = draw.current?.getAll();
        if (data && data.features.length > 0) {
          console.log("Drawn feature:", data.features[0]);
        }
      };

      map.current.on("draw.create", updateArea);
      map.current.on("draw.delete", updateArea);
      map.current.on("draw.update", updateArea);

      map.current.on("load", () => {
        if (isEditMode && selectedFence && draw.current) {
          try {
            const featureCollection: GeoJSON.FeatureCollection = {
              type: "FeatureCollection",
              features: [selectedFence.coordinates],
            };
            draw.current.set(featureCollection);
            const coordinates = selectedFence.coordinates.geometry.coordinates[0];
            const bounds = coordinates.reduce(
              (bounds, coord) => bounds.extend(coord as [number, number]),
              new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
            );
            map.current?.fitBounds(bounds, { padding: 50 });
          } catch (error) {
            console.error("Error loading existing fence:", error);
            toast.error("Failed to load existing fence", {
              description: "Please try again.",
            });
          }
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Failed to initialize map", {
        description: "Please try again.",
      });
    }
  }, [isEditMode, selectedFence, cleanupMap]);

  // Initialize view map for the view modal
  const initializeViewMap = useCallback(() => {
    if (!viewMapContainer.current || !NEXT_PUBLIC_MAPBOX_API_KEY || !selectedFence) {
      return;
    }

    if (viewMap.current) {
      viewMap.current.remove();
    }

    try {
      viewMap.current = new mapboxgl.Map({
        container: viewMapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-74.5, 40],
        zoom: 9,
      });

      viewMap.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      viewMap.current.on("load", () => {
        if (!viewMap.current || !selectedFence) return;

        viewMap.current.addSource("fence-polygon", {
          type: "geojson",
          data: selectedFence.coordinates,
        });

        viewMap.current.addLayer({
          id: "fence-fill",
          type: "fill",
          source: "fence-polygon",
          paint: {
            "fill-color": "#088",
            "fill-opacity": 0.3,
          },
        });

        viewMap.current.addLayer({
          id: "fence-stroke",
          type: "line",
          source: "fence-polygon",
          paint: {
            "line-color": "#088",
            "line-width": 2,
          },
        });

        const coordinates = selectedFence.coordinates.geometry.coordinates[0];
        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
        );

        viewMap.current.fitBounds(bounds, { padding: 50 });
      });
    } catch (error) {
      console.error("Error initializing view map:", error);
      toast.error("Failed to initialize view map", {
        description: "Please try again.",
      });
    }
  }, [selectedFence]);

  // Effect for main map initialization
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      cleanupMap();
    }
  }, [isModalOpen, initializeMap, cleanupMap]);

  // Effect for view map initialization
  useEffect(() => {
    if (isViewModalOpen) {
      const timer = setTimeout(() => {
        initializeViewMap();
      }, 100);
      return () => clearTimeout(timer);
    } else if (viewMap.current) {
      viewMap.current.remove();
      viewMap.current = null;
    }
  }, [isViewModalOpen, initializeViewMap]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupMap();
      if (viewMap.current) {
        viewMap.current.remove();
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

    const drawnData = draw.current?.getAll();
    if (!drawnData || drawnData.features.length === 0) {
      toast.error("Please draw a fence on the map");
      return;
    }
    const coordinates = drawnData.features[0] as GeoJSON.Feature<GeoJSON.Polygon>;

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
                          key={result.id}
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => handleSearchResultSelect(result)}
                        >
                          {result.place_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Draw Fence</Label>
                <div ref={mapContainer} className="h-96 w-full rounded-md border" style={{ minHeight: "400px" }} />
                {!NEXT_PUBLIC_MAPBOX_API_KEY && (
                  <p className="text-sm text-destructive">
                    Mapbox API key is not configured. Please set NEXT_PUBLIC_MAPBOX_API_KEY in your environment variables.
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
              {!NEXT_PUBLIC_MAPBOX_API_KEY && (
                <p className="text-sm text-destructive mt-2">
                  Mapbox API key is not configured. Please set NEXT_PUBLIC_MAPBOX_API_KEY in your environment variables.
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