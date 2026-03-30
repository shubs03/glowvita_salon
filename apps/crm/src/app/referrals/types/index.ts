export type Referral = {
    _id: string;
    referee: string;
    refereeName?: string;
    date: string;
    status: 'Pending' | 'Completed' | 'Bonus Paid';
    bonus: string;
};