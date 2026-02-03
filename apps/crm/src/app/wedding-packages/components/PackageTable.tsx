import { Button } from "@repo/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import Image from "next/image";

interface WeddingPackage {
  _id: string;
  name: string;
  description: string;
  services: any[];
  totalPrice: number;
  discountedPrice: number | null;
  duration: number;
  staffCount: number;
  assignedStaff: string[];
  image: string | null;
  status: string;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PackageTableProps {
  packages: WeddingPackage[];
  staff: any[];
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  onViewClick: (pkg: WeddingPackage) => void;
  onEditClick: (pkg: WeddingPackage) => void;
  onDeleteClick: (pkg: WeddingPackage) => void;
}

export function PackageTable({
  packages,
  staff,
  searchTerm,
  currentPage,
  itemsPerPage,
  onViewClick,
  onEditClick,
  onDeleteClick,
}: PackageTableProps) {
  // Filter packages based on search term
  const filteredPackages = packages.filter((pkg: WeddingPackage) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredPackages.slice(startIndex, endIndex);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Package</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
                currentItems.map((pkg: WeddingPackage) => (
                  <TableRow key={pkg._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {pkg.image ? (
                          <Image
                            src={pkg.image}
                            alt={pkg.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                        )}
                        <span className="font-medium">{pkg.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {pkg.services && pkg.services.length > 0 ? (
                        <div 
                          className="flex items-center gap-1"
                          title={pkg.services.map((service: any) => 
                            `${service.serviceName} (x${service.quantity})`
                          ).join(', ')}
                        >
                          <span className="text-sm">
                            {pkg.services[0].serviceName}
                            {pkg.services.length > 1 && (
                              <span className="text-muted-foreground"> + {pkg.services.length - 1}</span>
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No services</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {Math.floor(pkg.duration / 60)}h {pkg.duration % 60}m
                    </TableCell>
                    <TableCell>
                      {pkg.assignedStaff && pkg.assignedStaff.length > 0 ? (
                        <div 
                          className="flex items-center gap-1"
                          title={pkg.assignedStaff.map((staffId: string) => {
                            const staffMember = staff.find((s: any) => (s.id || s._id) === staffId);
                            return staffMember?.name || 'Unknown';
                          }).join(', ')}
                        >
                          {(() => {
                            const firstStaffId = pkg.assignedStaff[0];
                            const firstStaffMember = staff.find((s: any) => (s.id || s._id) === firstStaffId);
                            const remainingCount = pkg.assignedStaff.length - 1;
                            
                            return (
                              <span className="text-sm">
                                {firstStaffMember?.name || 'Unknown'}
                                {remainingCount > 0 && (
                                  <span className="text-muted-foreground"> + {remainingCount}</span>
                                )}
                              </span>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {pkg.staffCount || 1} staff required
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span>₹{pkg.totalPrice}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          pkg.status === 'approved' ? 'default' :
                            pkg.status === 'disapproved' ? 'destructive' : 'secondary'
                        }
                        className={
                          pkg.status === 'approved' ? 'bg-green-100 text-green-800' :
                            pkg.status === 'disapproved' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {pkg.status}
                      </Badge>
                      {pkg.status === 'disapproved' && pkg.rejectionReason && (
                        <p
                          className="text-[10px] text-red-500 mt-1 max-w-[150px] leading-tight"
                          title={pkg.rejectionReason}
                        >
                          Reason: {pkg.rejectionReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch checked={pkg.isActive} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewClick(pkg)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditClick(pkg)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteClick(pkg)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm
                      ? "No matching packages found."
                      : "No wedding packages found. Create your first package to get started!"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
}
