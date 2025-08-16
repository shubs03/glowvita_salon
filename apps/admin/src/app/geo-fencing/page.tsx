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
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Map,
  MapPin,
  Globe,
  Rows,
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

// Set the Mapbox access token
if (process.env.NEXT_PUBLIC_MAPBOX_API_KEY) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
}

interface Fence {
  id: string;
  name: string;
  city: string;
  coordinates: GeoJSON.Feature<GeoJSON.Polygon>;
  createdAt: string;
}

const fencesData: Fence[] = [
  {
    id: "FNC-001",
    name: "Downtown Core",
    city: "Metropolis",
    coordinates: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-79.38, 43.65],
            [-79.37, 43.65],
            [-79.37, 43.66],
            [-79.38, 43.66],
            [-79.38, 43.65],
          ],
        ],
      },
    },
    createdAt: "2024-08-15",
  },
];

export default function GeoFencingPage() {
  const dispatch = useAppDispatch();
  const {
    isModalOpen,
    isViewModalOpen,
    isDeleteModalOpen,
    selectedFence,
    isEditMode,
  } = useAppSelector(
    (state: ReturnType<typeof selectRootState>) => state.geoFencing
  );

  const [fences, setFences] = useState<Fence[]>(fencesData);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);

  const initializeMap = useCallback(() => {
    if (map.current) return;
    if (!mapContainer.current) return;
    if (!mapboxgl.accessToken) {
      console.error("Mapbox Access Token is not set.");
      return;
    }

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

    map.current.on("draw.create", updateArea);
    map.current.on("draw.delete", updateArea);
    map.current.on("draw.update", updateArea);

    function updateArea(e: any) {
      // You can get the drawn GeoJSON data here
      const data = draw.current?.getAll();
      if (data && data.features.length > 0) {
        console.log(data.features[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      // Use a timeout to ensure the dialog is rendered before initializing the map
      setTimeout(() => {
        initializeMap();
        if (isEditMode && selectedFence && draw.current) {
          draw.current.set({
            type: "FeatureCollection",
            features: [(selectedFence as Fence).coordinates],
          });
        } else if (draw.current) {
          draw.current.deleteAll();
        }
      }, 100);
    }
  }, [isModalOpen, isEditMode, selectedFence, initializeMap]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = fences.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(fences.length / itemsPerPage);

  const handleOpenModal = (fence: Fence | null = null) => {
    dispatch(openFenceModal({ fence, isEditMode: !!fence }));
  };

  const handleCloseModal = () => {
    dispatch(closeFenceModal());
  };

  const handleDeleteClick = (fence: Fence) => {
    dispatch(openDeleteFenceModal(fence));
  };

  const handleViewClick = (fence: Fence) => {
    dispatch(openViewFenceModal(fence));
  };

  const handleConfirmDelete = () => {
    if (selectedFence) {
      setFences(fences.filter((f) => f.id !== (selectedFence as Fence).id));
    }
    dispatch(closeDeleteFenceModal());
  };

  const handleSaveFence = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fenceName = formData.get("fenceName") as string;
    const cityName = formData.get("cityName") as string;

    const drawnData = draw.current?.getAll();
    if (!drawnData || drawnData.features.length === 0) {
      alert("Please draw a fence on the map.");
      return;
    }
    const coordinates = drawnData
      .features[0] as GeoJSON.Feature<GeoJSON.Polygon>;

    if (isEditMode && selectedFence) {
      setFences(
        fences.map((f) =>
          f.id === (selectedFence as Fence).id
            ? { ...f, name: fenceName, city: cityName, coordinates }
            : f
        )
      );
    } else {
      const newFence: Fence = {
        id: `FNC-${Date.now()}`,
        name: fenceName,
        city: cityName,
        coordinates,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setFences([...fences, newFence]);
    }

    handleCloseModal();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">
        Geo-fencing Management
      </h1>

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
            <CardTitle className="text-sm font-medium">
              Cities Covered
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(new Set(fences.map((f) => f.city))).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique cities with fences
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Area (approx.)
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125 km²</div>
            <p className="text-xs text-muted-foreground">
              Placeholder for total area
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Fenced City
            </CardTitle>
            <Rows className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Metropolis</div>
            <p className="text-xs text-muted-foreground">With 2 fences</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Manage Fences</CardTitle>
              <CardDescription>
                Create, edit, and manage geographic fences.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Fence
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
                {currentItems.map((fence) => (
                  <TableRow key={fence.id}>
                    <TableCell className="font-mono text-xs">
                      {fence.id}
                    </TableCell>
                    <TableCell className="font-medium">{fence.name}</TableCell>
                    <TableCell>{fence.city}</TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">
                      {JSON.stringify(fence.coordinates.geometry.coordinates)}
                    </TableCell>
                    <TableCell>{fence.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewClick(fence)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(fence)}
                      >
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
            totalItems={fences.length}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Fence Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-3xl">
          <form onSubmit={handleSaveFence}>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Fence" : "Create New Fence"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update the details for your fence."
                  : "Define a new geographic fence on the map."}
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
                    defaultValue={(selectedFence as Fence)?.name || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityName">City Name (Optional)</Label>
                  <Input
                    id="cityName"
                    name="cityName"
                    placeholder="e.g., Metropolis"
                    defaultValue={(selectedFence as Fence)?.city || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Draw Fence</Label>
                <div ref={mapContainer} className="h-96 w-full rounded-md" />
                {!mapboxgl.accessToken && (
                  <p className="text-sm text-destructive">
                    Mapbox API key is not configured.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Save Changes" : "Create Fence"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Fence Modal */}
      <Dialog
        open={isViewModalOpen}
        onOpenChange={() => dispatch(closeViewFenceModal())}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              View Fence: {(selectedFence as Fence)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Fence Details</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">ID:</span>{" "}
                  {(selectedFence as Fence)?.id}
                </p>
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {(selectedFence as Fence)?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">City:</span>{" "}
                  {(selectedFence as Fence)?.city}
                </p>
                <p>
                  <span className="text-muted-foreground">Created At:</span>{" "}
                  {(selectedFence as Fence)?.createdAt}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Fence Area</h4>
              <div className="h-64 w-full bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  Map view of the fence will be here.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => dispatch(closeViewFenceModal())}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={() => dispatch(closeDeleteFenceModal())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fence?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the fence "
              {(selectedFence as Fence)?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => dispatch(closeDeleteFenceModal())}
            >
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
}
