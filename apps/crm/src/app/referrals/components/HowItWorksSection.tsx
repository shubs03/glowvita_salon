import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Send, UserPlus, Gift } from 'lucide-react';

interface HowItWorksStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HowItWorksStep = ({ icon, title, description }: HowItWorksStepProps) => (
  <div className="relative flex items-start gap-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

interface HowItWorksSectionProps {
  roleContent: {
    shareTip: string;
    signupText: string;
    networkText: string;
  };
  refereeBonusEnabled: boolean;
  refereeBonus: number;
  referrerBonus: number;
}

const HowItWorksSection = ({ 
  roleContent, 
  refereeBonusEnabled, 
  refereeBonus, 
  referrerBonus 
}: HowItWorksSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How It Works</CardTitle>
        <CardDescription>Follow these simple steps to start earning rewards.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-8">
          <HowItWorksStep 
            icon={<Send className="w-6 h-6" />}
            title="1. Share Your Link"
            description={`${roleContent.shareTip} ${refereeBonusEnabled ? `They'll get a ₹${refereeBonus} bonus when they sign up!` : ''}`}
          />
          <HowItWorksStep 
            icon={<UserPlus className="w-6 h-6" />}
            title="2. They Sign Up"
            description={`${roleContent.signupText} We'll track the referral automatically.`}
          />
          <HowItWorksStep 
            icon={<Gift className="w-6 h-6" />}
            title="3. Earn Your Bonus"
            description={`Once their account is approved and they meet the criteria, you'll receive a ₹${referrerBonus} bonus. It's that simple!`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HowItWorksSection;