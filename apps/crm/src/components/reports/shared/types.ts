export interface Report {
    title: string;
    description: string;
    details: string;
}

export interface ReportCategory {
    category: string;
    reports: Report[];
}

export interface Filters {
    startDate: string;
    endDate: string;
    reportType: string;
}

export interface FilterParams {
    startDate?: string;
    endDate?: string;
    saleType?: string;
    city?: string;
    status?: string;
    userType?: string;
    client?: string;
    service?: string;
    staff?: string;
    product?: string;
    category?: string;
    brand?: string;
    region?: string;
    bookingType?: string;
    settlementFromDate?: string;
    settlementToDate?: string;
}
