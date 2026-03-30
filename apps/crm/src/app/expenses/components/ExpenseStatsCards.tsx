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
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">All-time expenses</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <Wallet className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">This Month</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{formatCurrency(currentMonthExpenses)}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Current month expenses</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <TrendingUp className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Total Records</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{filteredExpensesCount}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">
                {hasActiveFilters ? 'Filtered' : 'Total'} expense entries
              </p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <Receipt className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseStatsCards;