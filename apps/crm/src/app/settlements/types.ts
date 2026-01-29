export interface Transaction {
    type: 'receive' | 'pay';
    amount: number;
    date: string;
    description: string;
}

export interface PayoutData {
    id: string;
    vendor: string;
    contactNo: string;
    ownerName: string;
    adminReceiveAmount: number;
    adminPayAmount: number;
    pendingAmount: number;
    totalSettlement: number;
    status: "Paid" | "Pending";
    transactions: Transaction[];
}
