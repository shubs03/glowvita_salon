import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Staff } from '../page';

interface StaffTableProps {
  currentItems: Staff[];
  searchTerm: string;
  onOpenModal: (staff?: Staff, tab?: string) => void;
  onDeleteClick: (staff: Staff) => void;
}

const StaffTable = ({
  currentItems,
  searchTerm,
  onOpenModal,
  onDeleteClick
}: StaffTableProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Name</TableHead>
              <TableHead className="min-w-[150px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Phone</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No staff found matching your criteria' : 'No staff members added yet'}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((staff: Staff) => (
                <TableRow key={staff._id}>
                  <TableCell className="font-medium py-3 min-w-[120px] max-w-[150px]">
                    <div className="flex items-center gap-3">
                      <img 
                        src={staff.photo || `https://placehold.co/40x40.png?text=${staff.fullName[0]}`} 
                        alt={staff.fullName} 
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                      <span className="font-semibold truncate max-w-[80px]">{staff.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[150px] max-w-[180px] truncate">{staff.emailAddress}</TableCell>
                  <TableCell className="min-w-[120px] max-w-[150px] truncate">{staff.mobileNo}</TableCell>
                  <TableCell>{staff.position}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      staff.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {staff.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenModal(staff)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenModal(staff, 'earnings')}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(staff)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
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

export default StaffTable;