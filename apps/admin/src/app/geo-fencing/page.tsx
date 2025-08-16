
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Plus, Edit, Trash2, Eye, Map, MapPin, Globe, Rows } from 'lucide-react';

interface Fence {
  id: string;
  name: string;
  city: string;
  coordinates: string;
  createdAt: string;
}

const fencesData: Fence[] = [
  { id: 'FNC-001', name: 'Downtown Core', city: 'Metropolis', coordinates: 'Polygon(...43.65, -79.38...)', createdAt: '2024-08-15' },
  { id: 'FNC-002', name: 'North Suburbs', city: 'Metropolis', coordinates: 'Polygon(...43.75, -79.41...)', createdAt: '2024-08-14' },
  { id: 'FNC-003', name: 'Airport Zone', city: 'Gotham', coordinates: 'Polygon(...40.71, -74.00...)', createdAt: '2024-08-13' },
];

export default function GeoFencingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFence, setSelectedFence] = useState<Fence | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = fencesData.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(fencesData.length / itemsPerPage);

  const handleOpenModal = (fence: Fence | null = null) => {
    setSelectedFence(fence);
    setIsEditMode(!!fence);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (fence: Fence) => {
    setSelectedFence(fence);
    setIsDeleteModalOpen(true);
  };
  
  const handleViewClick = (fence: Fence) => {
    setSelectedFence(fence);
    setIsViewModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if(selectedFence) {
      console.log(`Deleting fence: ${selectedFence.name}`);
      // API call to delete fence would go here
    }
    setIsDeleteModalOpen(false);
    setSelectedFence(null);
  };
  
  const handleSaveFence = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fenceData = {
      name: formData.get('fenceName'),
      city: formData.get('cityName'),
    };
    
    if (isEditMode) {
      console.log('Updating fence:', { id: selectedFence?.id, ...fenceData });
    } else {
      console.log('Creating new fence:', fenceData);
    }
    
    setIsModalOpen(false);
    setSelectedFence(null);
  };

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
            <div className="text-2xl font-bold">{fencesData.length}</div>
            <p className="text-xs text-muted-foreground">Across all cities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities Covered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{[...new Set(fencesData.map(f => f.city))].length}</div>
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
              <CardDescription>Create, edit, and manage geographic fences.</CardDescription>
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
                    <TableCell className="font-mono text-xs">{fence.id}</TableCell>
                    <TableCell className="font-medium">{fence.name}</TableCell>
                    <TableCell>{fence.city}</TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">{fence.coordinates}</TableCell>
                    <TableCell>{fence.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewClick(fence)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(fence)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(fence)}>
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
                totalItems={fencesData.length}
            />
        </CardContent>
      </Card>

      {/* Add/Edit Fence Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <form onSubmit={handleSaveFence}>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Fence' : 'Create New Fence'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update the details for your fence.' : 'Define a new geographic fence on the map.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fenceName">Fence Name</Label>
                  <Input id="fenceName" name="fenceName" placeholder="e.g., Downtown Business District" defaultValue={selectedFence?.name || ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityName">City Name (Optional)</Label>
                  <Input id="cityName" name="cityName" placeholder="e.g., Metropolis" defaultValue={selectedFence?.city || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Draw Fence</Label>
                <div className="h-96 w-full bg-secondary rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Map component with polygon tools will be here.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Fence'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Fence Modal */}
       <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>View Fence: {selectedFence?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                <h4 className="font-semibold">Fence Details</h4>
                <div className="text-sm space-y-1">
                   <p><span className="text-muted-foreground">ID:</span> {selectedFence?.id}</p>
                   <p><span className="text-muted-foreground">Name:</span> {selectedFence?.name}</p>
                   <p><span className="text-muted-foreground">City:</span> {selectedFence?.city}</p>
                   <p><span className="text-muted-foreground">Created At:</span> {selectedFence?.createdAt}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Fence Area</h4>
                <div className="h-64 w-full bg-secondary rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Map view of the fence will be here.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Fence?</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the fence "{selectedFence?.name}"? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
