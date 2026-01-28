import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface AddOn {
  _id: string;
  name: string;
  price: number;
  duration: number;
  status: string;
  services: string[];
  service?: string; // For backwards compatibility
}

interface Service {
  _id: string;
  name: string;
}

interface AddOnsTableProps {
  addOns: AddOn[];
  services: Service[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  currentItems: AddOn[];
  onOpenModal: (type: 'view', addon?: AddOn) => void;
  onOpenDeleteModal: (addon: AddOn) => void;
}

const AddOnsTable = ({
  addOns,
  services,
  isLoading,
  searchTerm,
  statusFilter,
  currentItems,
  onOpenModal,
  onOpenDeleteModal
}: AddOnsTableProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mapped Service</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Duration (min)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading add-ons...
                  </div>
                </TableCell>
              </TableRow>
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'No add-ons found matching your criteria' : 'No add-ons available'}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((addon) => (
                <TableRow key={addon._id}>
                  <TableCell className="font-medium">{addon.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {addon.services && addon.services.length > 0 ? (
                        addon.services.map((serviceId) => {
                          const service = services.find((s) => String(s._id) === String(serviceId));
                          return service ? (
                            <Badge key={String(serviceId)} variant="outline" className="text-[10px]">
                              {service.name}
                            </Badge>
                          ) : null;
                        })
                      ) : addon.service ? (
                        // Fallback for older data
                        <Badge variant="outline" className="text-[10px]">
                          {services.find((s) => String(s._id) === String(addon.service))?.name || "Not mapped"}
                        </Badge>
                      ) : "Not mapped"}
                    </div>
                  </TableCell>
                  <TableCell>₹{addon.price}</TableCell>
                  <TableCell>{addon.duration} min</TableCell>
                  <TableCell>
                    <Badge variant={addon.status === "active" ? "default" : "secondary"}>
                      {addon.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onOpenModal('view', addon)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => onOpenDeleteModal(addon)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AddOnsTable;