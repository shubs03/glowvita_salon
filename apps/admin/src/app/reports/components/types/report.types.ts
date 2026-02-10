export interface Report {
  title: string;
  description: string;
  details: string;
}

export interface ReportCategory {
  category: string;
  reports: Report[];
}
