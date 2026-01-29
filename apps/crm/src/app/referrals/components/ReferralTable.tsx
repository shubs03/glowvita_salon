import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Referral } from "../types";

interface ReferralTableProps {
  currentItems: Referral[];
  getStatusColor: (status: Referral['status']) => string;
}

const ReferralTable = ({ currentItems, getStatusColor }: ReferralTableProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Referred Professional</TableHead>
              <TableHead className="min-w-[120px]">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Bonus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  You haven't referred anyone yet.
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((referral) => (
                <TableRow key={referral._id}>
                  <TableCell className="font-medium py-3 min-w-[120px] max-w-[150px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {referral.referee.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold truncate max-w-[80px]">{referral.referee}</span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px] max-w-[150px]">
                    {new Date(referral.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                      {referral.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">₹{referral.bonus}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReferralTable;