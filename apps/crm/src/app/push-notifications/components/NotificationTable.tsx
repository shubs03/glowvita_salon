import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Eye, Trash2 } from 'lucide-react';
import { Notification } from '../types';

interface NotificationTableProps {
  currentItems: Notification[];
  searchTerm: string;
  onViewNotification: (notification: Notification) => void;
  onDeleteClick: (notification: Notification) => void;
}

const targetDisplayMap: Record<string, string> = {
  all_online_clients: "All Online Clients",
  all_offline_clients: "All Offline Clients",
  all_staffs: "All Staffs",
  specific_clients: "Specific Clients",
};

const getTargetDisplay = (notification: Notification) => {
  if (notification.targetType === "specific_clients") {
    return `${targetDisplayMap[notification.targetType]} (${notification.targets?.length || 0})`;
  }
  return targetDisplayMap[notification.targetType] || notification.targetType;
};

const NotificationTable = ({
  currentItems,
  searchTerm,
  onViewNotification,
  onDeleteClick
}: NotificationTableProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Title</TableHead>
              <TableHead className="min-w-[120px]">Channels</TableHead>
              <TableHead className="min-w-[150px]">Target</TableHead>
              <TableHead className="min-w-[120px]">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No notifications found matching your criteria' : 'No notifications sent yet'}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((notification: Notification) => (
                <TableRow key={notification._id}>
                  <TableCell className="font-medium py-3 min-w-[150px] max-w-[200px] truncate">
                    {notification.title}
                  </TableCell>
                  <TableCell className="min-w-[120px] max-w-[150px] truncate">
                    {notification.channels.join(", ")}
                  </TableCell>
                  <TableCell className="min-w-[150px] max-w-[180px] truncate">
                    {getTargetDisplay(notification)}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {new Date(notification.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        notification.status === "Sent"
                          ? "bg-primary text-white"
                          : "bg-secondary text-primary"
                      }`}
                    >
                      {notification.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewNotification(notification)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(notification)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default NotificationTable;