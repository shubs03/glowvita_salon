import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Edit, Trash2, Receipt } from 'lucide-react';
import { Expense } from '../page';

interface ExpenseTableProps {
  currentItems: Expense[];
  searchTerm: string;
  hasActiveFilters: boolean;
  onOpenModal: (expense?: Expense) => void;
  onDeleteClick: (expense: Expense) => void;
}

const ExpenseTable = ({
  currentItems,
  searchTerm,
  hasActiveFilters,
  onOpenModal,
  onDeleteClick
}: ExpenseTableProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Expense Type</TableHead>
              <TableHead className="min-w-[120px]">Date</TableHead>
              <TableHead className="min-w-[120px]">Amount</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Invoice No</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {currentItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                {searchTerm || hasActiveFilters 
                  ? 'No expenses found matching your criteria' 
                  : 'No expenses found. Click "Add Expense" to create your first expense record.'}
              </TableCell>
            </TableRow>
          ) : (
            currentItems.map((expense: Expense) => (
              <TableRow key={expense._id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{expense.expenseType}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>
                  <span className="">
                    {formatCurrency(expense.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1`}>
                    {expense.paymentMode}
                  </span>
                </TableCell>
                <TableCell>{expense.invoiceNo || '-'}</TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate" title={expense.note}>
                    {expense.note || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onOpenModal(expense)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDeleteClick(expense)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

export default ExpenseTable;