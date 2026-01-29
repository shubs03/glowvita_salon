import { Card } from "@repo/ui/card";
import { Gift, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  roleContent: {
    title: string;
    description: string;
    networkText: string;
  };
  referrerBonus: number;
  refereeBonusEnabled: boolean;
  refereeBonus: number;
}

const HeroSection = ({ 
  roleContent, 
  referrerBonus, 
  refereeBonusEnabled, 
  refereeBonus 
}: HeroSectionProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground overflow-hidden">
      <div className="grid md:grid-cols-2 items-center">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-2">Grow Together, Earn Together</h2>
          <p className="mb-6 opacity-90 max-w-md">
            Invite fellow professionals to our platform. When they join, you both get rewarded. It's our way of saying thank you for helping our community grow.
          </p>
          <div className="space-y-3 text-sm">
            {referrerBonus > 0 && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 opacity-90"/>
                <span>Earn ₹{referrerBonus} for every successful referral.</span>
              </div>
            )}
            {refereeBonusEnabled && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 opacity-90"/>
                <span>Your friend gets ₹{refereeBonus} too!</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 opacity-90"/>
              <span>{roleContent.networkText}</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center p-8">
          <Gift className="w-48 h-48 text-primary-foreground opacity-20" />
        </div>
      </div>
    </Card>
  );
};

export default HeroSection;