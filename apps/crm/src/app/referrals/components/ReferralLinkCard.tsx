import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Copy } from 'lucide-react';

interface ReferralLinkCardProps {
  referralLink: string;
  userReferralCode?: string;
  onCopyLink: () => void;
}

const ReferralLinkCard = ({ referralLink, userReferralCode, onCopyLink }: ReferralLinkCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Your Unique Referral Link</CardTitle>
        <CardDescription>Share this link with other professionals. When they sign up using this link, you'll be credited for the referral.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={referralLink} readOnly className="bg-secondary text-base" />
          <Button onClick={onCopyLink} className="w-full sm:w-auto" disabled={!userReferralCode}>
            <Copy className="mr-2 h-4 w-4" /> Copy Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralLinkCard;