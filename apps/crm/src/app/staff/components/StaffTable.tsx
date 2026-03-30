import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Eye, Edit, Trash2, Mail, IndianRupee, ChevronUp, ChevronDown } from 'lucide-react';
import { Staff } from '../page';

interface StaffTableProps {
  currentItems: Staff[];
  searchTerm: string;
  onOpenModal: (staff?: Staff, tab?: string) => void;
  onDeleteClick: (staff: Staff) => void;
  onSendMail: (staffId: string) => void;
  isSendingMail: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: any) => void;
}

const StaffTable = ({
  currentItems,
  searchTerm,
  onOpenModal,
  onDeleteClick,
  onSendMail,
  isSendingMail,
  sortBy,
  sortOrder,
  onSort
}: StaffTableProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="min-w-[120px] cursor-pointer hover:text-primary transition-colors"
                onClick={() => onSort?.('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead className="min-w-[150px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Phone</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-center">Commission</TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-primary transition-colors"
                onClick={() => onSort?.('balance')}
              >
                <div className="flex items-center justify-end gap-1">
                  Balance
                  {sortBy === 'balance' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                  <TableCell className="text-center">
                    {staff.commission ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        {staff.commissionRate}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Off</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={staff.earningsSummary?.netBalance && staff.earningsSummary.netBalance > 0 ? "text-red-600" : "text-muted-foreground"}>
                      ₹{(staff.earningsSummary?.netBalance || 0).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${staff.status === 'Active'
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
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="View Staff Earnings Ledger"
                      >
                        <IndianRupee className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSendMail(staff._id)}
                        disabled={isSendingMail}
                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                        title="Send Credentials Email"
                      >
                        <Mail className="h-4 w-4" />
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