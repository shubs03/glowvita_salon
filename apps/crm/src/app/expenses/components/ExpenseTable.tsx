import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Edit, Trash2, Receipt, Eye, FileText } from 'lucide-react';
import { Expense } from '../page';

interface ExpenseTableProps {
  currentItems: Expense[];
  searchTerm: string;
  hasActiveFilters: boolean;
  onOpenModal: (expense?: Expense) => void;
  onOpenDetails: (expense: Expense) => void;
  onDeleteClick: (expense: Expense) => void;
}

const ExpenseTable = ({
  currentItems,
  searchTerm,
  hasActiveFilters,
  onOpenModal,
  onOpenDetails,
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
      <div className="flex-1 overflow-auto no-scrollbar">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[70px]">Invoice</TableHead>
              <TableHead className="min-w-[150px]">Expense Type</TableHead>
              <TableHead className="min-w-[120px]">Date</TableHead>
              <TableHead className="min-w-[120px]">Amount</TableHead>
              <TableHead className="min-w-[130px]">Payment Mode</TableHead>
              <TableHead className="min-w-[120px]">Invoice No</TableHead>
              <TableHead className="min-w-[200px]">Note</TableHead>
              <TableHead className="text-right sticky right-0 bg-background">Actions</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {currentItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                {searchTerm || hasActiveFilters 
                  ? 'No expenses found matching your criteria' 
                  : 'No expenses found. Click "Add Expense" to create your first expense record.'}
              </TableCell>
            </TableRow>
          ) : (
            currentItems.map((expense: Expense) => (
              <TableRow key={expense._id} className="hover:bg-muted/50 group">
                <TableCell>
                  <div 
                    className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center cursor-pointer group/img"
                    onClick={() => onOpenDetails(expense)}
                    title="View Details"
                  >
                    {expense.invoice ? (
                      expense.invoice.startsWith('data:image/') ? (
                        <>
                          <img 
                            src={expense.invoice} 
                            alt="Invoice" 
                            className="w-full h-full object-cover transition-transform group-hover/img:scale-110" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="h-5 w-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                          <span className="text-[8px] font-bold text-primary mt-0.5">PDF</span>
                        </div>
                      )
                    ) : (
                      <Receipt className="h-6 w-6 text-muted-foreground/30" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {expense.expenseType}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(expense.date)}</TableCell>
                <TableCell className="font-bold text-foreground">
                  {formatCurrency(expense.amount)}
                </TableCell>
                <TableCell>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                    {expense.paymentMode}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{expense.invoiceNo || '-'}</TableCell>
                <TableCell>
                  <div className="max-w-[180px] truncate text-sm text-muted-foreground" title={expense.note}>
                    {expense.note || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-right sticky right-0 bg-background/80 backdrop-blur-sm">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onOpenDetails(expense)} 
                      title="View Details"
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onOpenModal(expense)} 
                      title="Edit"
                      className="hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 transition-colors" 
                      onClick={() => onDeleteClick(expense)} 
                      title="Delete"
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

export default ExpenseTable;