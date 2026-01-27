import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Eye, Edit2, Trash2 } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: string;
  startDate: string;
  expires: string;
  redeemed: number;
  applicableSpecialties: string[];
  applicableCategories: string[];
  applicableDiseases: string[];
  applicableServices: string[];
  applicableServiceCategories: string[];
  minOrderAmount?: number;
  offerImage?: string;
  isCustomCode?: boolean;
  businessType: string;
  businessId: string;
}

interface OffersTableProps {
  currentItems: Coupon[];
  userRole: string;
  onOpenModal: (type: 'viewCoupon' | 'editCoupon', coupon?: Coupon) => void;
  onDeleteClick: (coupon: Coupon) => void;
  formatDiscount: (coupon: Coupon) => string;
  formatList: (list: string[] | undefined | null) => string;
  getServiceNames: (serviceIds: string[]) => string;
  getCategoryNames: (categoryIds: string[]) => string;
  getAutoCategoriesFromServices: (serviceIds: string[]) => string[];
  isDeleting: boolean;
}

const OffersTable = ({
  currentItems,
  userRole,
  onOpenModal,
  onDeleteClick,
  formatDiscount,
  formatList,
  getServiceNames,
  getCategoryNames,
  getAutoCategoriesFromServices,
  isDeleting
}: OffersTableProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Starts On</TableHead>
              <TableHead>Expires On</TableHead>
              {userRole === 'vendor' && <TableHead>Services</TableHead>}
              {userRole === 'doctor' && <TableHead>Applicable Conditions</TableHead>}
              {userRole === 'supplier' && <TableHead>Min Order Amount</TableHead>}
              <TableHead>Redeemed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={userRole === 'vendor' ? 8 : (userRole === 'doctor' ? 7 : 7)} className="text-center py-8 text-muted-foreground">
                  No coupons found
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-medium">
                    {coupon.code}
                  </TableCell>
                  <TableCell>{formatDiscount(coupon)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      coupon.status === "Active"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary-foreground"
                    }`}>
                      {coupon.status}
                    </span>
                  </TableCell>
                  <TableCell>{coupon.startDate.split('T')[0]}</TableCell>
                  <TableCell>{coupon.expires ? coupon.expires.split('T')[0] : 'N/A'}</TableCell>
                  {userRole === 'vendor' && (
                    <TableCell>
                      {coupon.applicableServices && coupon.applicableServices.length > 0 
                        ? getServiceNames(coupon.applicableServices)
                        : 'All services'
                      }
                    </TableCell>
                  )}
                  {userRole === 'doctor' && (
                    <TableCell>
                      {coupon.applicableDiseases && coupon.applicableDiseases.length > 0 
                        ? `${coupon.applicableDiseases.length} condition(s)` 
                        : 'All conditions'
                      }
                    </TableCell>
                  )}
                  {userRole === 'supplier' && (
                    <TableCell>
                      {coupon.minOrderAmount ? `₹${coupon.minOrderAmount.toLocaleString()}` : 'No minimum'}
                    </TableCell>
                  )}
                  <TableCell>{coupon.redeemed}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenModal('viewCoupon', coupon)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenModal('editCoupon', coupon)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(coupon)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        disabled={isDeleting}
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

export default OffersTable;