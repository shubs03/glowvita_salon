import { Card, CardContent } from "@repo/ui/card";
import { Users, TrendingUp, Gift } from 'lucide-react';

interface ReferralStatsCardsProps {
  totalReferrals: number;
  successfulReferrals: number;
  totalBonusEarned: number;
  roleContent: {
    professionalsText: string;
    successText: string;
  };
}

const ReferralStatsCards = ({ 
  totalReferrals, 
  successfulReferrals, 
  totalBonusEarned,
  roleContent
}: ReferralStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Referrals</p>
              <p className="text-2xl font-bold text-primary">{totalReferrals}</p>
              <p className="text-xs text-primary/70 mt-1">{roleContent.professionalsText}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Successful Referrals</p>
              <p className="text-2xl font-bold text-green-600">{successfulReferrals}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">{roleContent.successText}</p>
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
              <p className="text-sm font-medium text-secondary-foreground mb-1">Total Bonus Earned</p>
              <p className="text-2xl font-bold text-secondary-foreground">₹{totalBonusEarned.toLocaleString()}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Bonuses paid out to you</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Gift className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralStatsCards;