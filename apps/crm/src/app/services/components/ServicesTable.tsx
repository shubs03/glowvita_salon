import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import { Switch } from "@repo/ui/switch";
import { Button } from "@repo/ui/button";
import { Eye, Edit, Trash2, Plus, Tag, Clock } from "lucide-react";
import Image from "next/image";
import { Service } from "./types";

interface ServicesTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onView: (service: Service) => void;
  onDelete: (service: Service) => void;
  onAddOn: (service: Service) => void;
  onVisibilityToggle: (service: Service) => void;
  searchTerm: string;
  statusFilter: string;
  isNoServicesError: boolean;
  isError: boolean;
  refetch: () => void;
}

const ServicesTable = ({ 
  services, 
  onEdit, 
  onView, 
  onDelete, 
  onAddOn, 
  onVisibilityToggle, 
  searchTerm, 
  statusFilter,
  isNoServicesError, 
  isError, 
  refetch 
}: ServicesTableProps) => {
  const filteredServices = services.filter(
    (service: Service) =>
      (service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.categoryName &&
        service.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (statusFilter === "all" || service.status === statusFilter)
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError && !isNoServicesError ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  Failed to load services. Please try again later.
                  <Button onClick={() => refetch()} className="ml-4">
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : filteredServices.length > 0 ? (
              filteredServices.map((service: Service) => (
                <TableRow key={service._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Image
                        src={service.image || "https://placehold.co/40x40.png"}
                        alt={service.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {service._id?.substring(0, 8) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {service.categoryName || "Uncategorized"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {service.duration} mins
                    </div>
                  </TableCell>
                  <TableCell>₹{service.price?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        service.status === 'approved' ? 'default' :
                          service.status === 'disapproved' ? 'destructive' : 'secondary'
                      }
                      className={
                        service.status === 'approved' ? 'bg-primary text-primary-foreground' :
                          service.status === 'disapproved' ? 'bg-secondary text-primary-foreground' :
                            'bg-secondary text-primary'
                      }
                    >
                      {service.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={service.onlineBooking}
                      onCheckedChange={() => onVisibilityToggle(service)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {service.status === 'disapproved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(service)}
                          className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                          title="Resubmit for approval"
                        >
                          <span className="text-xs font-medium">Resubmit</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(service)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(service)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddOn(service)}
                        className="h-8 w-8 p-0"
                        title="Add Addon"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(service)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                  {isNoServicesError ? "No services found. Add your first service to get started!" : "No matching services found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ServicesTable;