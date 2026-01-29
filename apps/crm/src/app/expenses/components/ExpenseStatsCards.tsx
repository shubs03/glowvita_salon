import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Wallet, TrendingUp, Receipt } from 'lucide-react';
import { Expense } from '../page';

interface ExpenseStatsCardsProps {
  totalExpenses: number;
  currentMonthExpenses: number;
  filteredExpensesCount: number;
  hasActiveFilters: boolean;
}

const ExpenseStatsCards = ({
  totalExpenses,
  currentMonthExpenses,
  filteredExpensesCount,
  hasActiveFilters
}: ExpenseStatsCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-primary/70 mt-1">All-time expenses</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">This Month</p>
              <p className="text-2xl font-bold text-secondary-foreground">{formatCurrency(currentMonthExpenses)}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Current month expenses</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <TrendingUp className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Total Records</p>
              <p className="text-2xl font-bold text-secondary-foreground">{filteredExpensesCount}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">
                {hasActiveFilters ? 'Filtered' : 'Total'} expense entries
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Receipt className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseStatsCards;