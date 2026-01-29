export interface Client {
  id: string;
  name: string;
}

export interface Notification {
  _id: string;
  title: string;
  channels: string[];
  content: string;
  targetType:
    | "all_online_clients"
    | "all_offline_clients"
    | "all_staffs"
    | "specific_clients";
  targets?: Client[];
  date: string;
  status: "Sent" | "Scheduled";
}