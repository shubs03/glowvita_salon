"use client";
import { useState, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Select } from "@repo/ui/select";
import {
  Plus,
  Search,
  FileDown,
  Eye,
  Edit,
  Trash2,
  Calendar,
  UserCheck,
  FileText,
  CheckCircle,
  AlertTriangle,
  Copy,
  FileSpreadsheet,
  Printer,
  Download,
} from "lucide-react";
import {
  useGetClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetAppointmentsQuery,
  useGetCrmReviewsQuery,
  useGetCrmClientOrdersQuery,
} from "@repo/store/api";
import { toast } from "sonner";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Skeleton } from "@repo/ui/skeleton";
import ClientListSection from "./components/ClientListSection";
import ClientStatsSection from "./components/ClientStatsSection";
import ClientProfileModal from "./components/ClientProfileModal";
import AddEditClientModal from "./components/AddEditClientModal";
import NewAppointmentModal from "./components/NewAppointmentModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import { Client, Review, AppointmentFormData, ClientFormData } from "./types";
import { formatDateForDisplay, getStatusColor } from "./utils";

export default function ClientsPage() {
  const { user } = useCrmAuth();

  // Fetch offline clients
  const {
    data: offlineClients = [],
    isLoading: isOfflineLoading,
    isError: isOfflineError,
    refetch: refetchOffline,
  } = useGetClientsQuery(
    {
      search: "",
      status: "",
      page: 1,
      limit: 100,
      source: "offline",
    },
    {
      skip: !user?._id,
    }
  );

  // Fetch online clients
  const {
    data: onlineClients = [],
    isLoading: isOnlineLoading,
    isError: isOnlineError,
    refetch: refetchOnline,
  } = useGetClientsQuery(
    {
      search: "",
      status: "",
      page: 1,
      limit: 100,
      source: "online",
    },
    {
      skip: !user?._id,
    }
  );

  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [clientSegment, setClientSegment] = useState<"offline" | "online">(
    "offline"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileClient, setProfileClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] =
    useState(false);
  const [selectedClientForAppointment, setSelectedClientForAppointment] =
    useState<Client | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Appointment form state
  const [appointmentData, setAppointmentData] = useState<AppointmentFormData>({
    date: "",
    startTime: "",
    service: "",
    duration: "",
    staffMember: "",
    notes: "",
  });

  // Combine clients based on selected segment
  const combinedClients = useMemo(() => {
    if (clientSegment === "online") {
      return onlineClients;
    }
    return offlineClients;
  }, [offlineClients, onlineClients, clientSegment]);

  // Fetch appointments for this vendor
  const vendorId = user?.vendorId || user?._id;
  const { data: appointmentsResponse, isLoading: isLoadingAppointments } =
    useGetAppointmentsQuery({ vendorId });

  // Normalize appointments into an array
  const appointments: any[] = useMemo(() => {
    const r: any = appointmentsResponse;
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.data)) return r.data;
    if (Array.isArray(r?.appointments)) return r.appointments;
    if (Array.isArray(r?.data?.appointments)) return r.data.appointments;
    return [];
  }, [appointmentsResponse]);

  // Fetch reviews for this vendor
  const { data: reviewsResponse, isLoading: isLoadingReviews } =
    useGetCrmReviewsQuery({ filter: "all", entityType: "all" });

  // Fetch client orders
  const { data: clientOrdersResponse, isLoading: isLoadingOrders } =
    useGetCrmClientOrdersQuery({});

  // Normalize reviews into an array
  const allReviews: Review[] = useMemo(() => {
    const r: any = reviewsResponse;
    if (Array.isArray(r)) return r;
    if (r?.success && Array.isArray(r?.reviews)) return r.reviews;
    if (Array.isArray(r?.reviews)) return r.reviews;
    if (Array.isArray(r?.data?.reviews)) return r.data.reviews;
    return [];
  }, [reviewsResponse]);

  // Compute bookings and totals per client
  const { bookingsById, totalsById, completedById, cancelledById } =
    useMemo(() => {
      const countsById = new Map<string, number>();
      const totalsById = new Map<string, number>();
      const completedCountById = new Map<string, number>();
      const cancelledCountById = new Map<string, number>();

      // Create lookup maps for online customers
      const emailToClientId = new Map<string, string>();
      const phoneToClientId = new Map<string, string>();
      const nameToClientId = new Map<string, string>();
      const allClientIds = new Set<string>();

      [...offlineClients, ...onlineClients].forEach((c) => {
        const id = String(c._id);
        allClientIds.add(id);
        if (c.email) emailToClientId.set(c.email.toLowerCase().trim(), id);
        if (c.phone) phoneToClientId.set(c.phone.replace(/\D/g, ""), id);
        if (c.fullName) nameToClientId.set(c.fullName.toLowerCase().trim(), id);
      });

      (appointments || []).forEach((appt: any) => {
        const rawClientId =
          appt?.client?._id ??
          appt?.client ??
          appt?.clientId ??
          appt?.client_id;
        let clientId = rawClientId != null ? String(rawClientId) : "";

        // If no ID match with known clients, try matching by email, phone, or name
        if (!clientId || !allClientIds.has(clientId)) {
          const apptEmail = (appt?.client?.email || appt?.clientEmail || "")
            .toLowerCase()
            .trim();
          const apptPhone = (
            appt?.client?.phone ||
            appt?.clientPhone ||
            (appt?.client && typeof appt.client === "object"
              ? appt.client.phone
              : "") ||
            ""
          ).replace(/\D/g, "");
          const apptName = (appt?.client?.name || appt?.clientName || "")
            .toLowerCase()
            .trim();

          if (apptEmail && emailToClientId.has(apptEmail)) {
            clientId = emailToClientId.get(apptEmail)!;
          } else if (apptPhone && phoneToClientId.has(apptPhone)) {
            clientId = phoneToClientId.get(apptPhone)!;
          } else if (apptName && nameToClientId.has(apptName)) {
            clientId = nameToClientId.get(apptName)!;
          }
        }

        if (!clientId) return;

        const amount =
          Number(
            appt?.finalAmount ??
              appt?.totalAmount ??
              appt?.amount ??
              appt?.price ??
              0
          ) || 0;
        const status = String(appt?.status || "").toLowerCase();

        countsById.set(clientId, (countsById.get(clientId) || 0) + 1);

        if (status === "completed") {
          totalsById.set(clientId, (totalsById.get(clientId) || 0) + amount);
          completedCountById.set(
            clientId,
            (completedCountById.get(clientId) || 0) + 1
          );
        } else if (status === "cancelled") {
          cancelledCountById.set(
            clientId,
            (cancelledCountById.get(clientId) || 0) + 1
          );
        }
      });

      return {
        bookingsById: countsById,
        totalsById,
        completedById: completedCountById,
        cancelledById: cancelledCountById,
      };
    }, [appointments, offlineClients, onlineClients]);

  // Normalize orders into an array
  const allClientOrders: any[] = useMemo(() => {
    const r: any = clientOrdersResponse;
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.data)) return r.data;
    return [];
  }, [clientOrdersResponse]);

  // Get appointments for the selected profile client with robust matching
  const profileClientAppointments = useMemo(() => {
    if (!profileClient || !appointments) return [];

    return appointments.filter((appt: any) => {
      const rawClientId =
        appt?.client?._id ?? appt?.client ?? appt?.clientId ?? appt?.client_id;
      const apptClientId = rawClientId != null ? String(rawClientId) : "";
      const targetId = String(profileClient._id);

      if (apptClientId === targetId) return true;

      // Fallback: match by email or phone
      const apptEmail = (appt?.client?.email || appt?.clientEmail || "")
        .toLowerCase()
        .trim();
      const clientEmail = (profileClient.email || "").toLowerCase().trim();
      if (apptEmail && clientEmail && apptEmail === clientEmail) return true;

      const apptPhone = (
        appt?.client?.phone ||
        appt?.clientPhone ||
        (appt?.client && typeof appt.client === "object"
          ? appt.client.phone
          : "") ||
        ""
      ).replace(/\D/g, "");
      const clientPhone = (profileClient.phone || "").replace(/\D/g, "");
      if (apptPhone && clientPhone && apptPhone === clientPhone) return true;

      // Final fallback: match by name
      const apptName = (
        appt?.client?.name ||
        appt?.clientName ||
        (appt?.client && typeof appt.client === "object"
          ? appt.client.name
          : "") ||
        ""
      )
        .toLowerCase()
        .trim();
      const clientName = (profileClient.fullName || "").toLowerCase().trim();
      if (apptName && clientName && apptName === clientName) return true;

      return false;
    });
  }, [profileClient, appointments]);

  // Get orders for the selected profile client with robust matching
  const profileClientOrders = useMemo(() => {
    if (!profileClient || !allClientOrders) return [];

    return allClientOrders.filter((order: any) => {
      // Priority 1: Match by userId
      const targetId = String(profileClient._id);
      if (order.userId && String(order.userId) === targetId) return true;

      // Fallback: match by email or phone
      const orderEmail = (order.email || "").toLowerCase().trim();
      const clientEmail = (profileClient.email || "").toLowerCase().trim();
      if (orderEmail && clientEmail && orderEmail === clientEmail) return true;

      const orderPhone = (order.contactNumber || order.phone || "").replace(
        /\D/g,
        ""
      );
      const clientPhone = (profileClient.phone || "").replace(/\D/g, "");
      if (orderPhone && clientPhone && orderPhone === clientPhone) return true;

      return false;
    });
  }, [profileClient, allClientOrders]);

  const inactiveClients = useMemo(() => {
    return [...offlineClients, ...onlineClients].filter(
      (c: Client) => c.status === "Inactive"
    );
  }, [offlineClients, onlineClients]);

  // Export functions
  const getDataForExport = () => {
    const filteredClients = combinedClients.filter(
      (client: Client) =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    );

    return filteredClients.map((client: Client) => ({
      Name: client.fullName,
      Email: client.email,
      Phone: client.phone,
      Birthday: formatDateForDisplay(client.birthdayDate),
      "Last Visit": formatDateForDisplay(client.lastVisit),
      "Total Bookings": bookingsById.get(String(client._id)) || 0,
      "Total Spent": (totalsById.get(String(client._id)) || 0).toFixed(2),
      Status: client.status,
    }));
  };

  const exportToExcel = () => {
    const data = getDataForExport();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, "clients_list.xlsx");
  };

  const exportToCSV = () => {
    const data = getDataForExport();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "clients_list.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    printTable();
  };

  const copyToClipboard = () => {
    const data = getDataForExport();
    if (data.length === 0) {
      toast.info("No data to copy");
      return;
    }

    // Create TSV (Tab Separated Values)
    const headers = Object.keys(data[0]);
    const tsv = [
      headers.join("\t"),
      ...data.map((row: any) =>
        headers.map((header) => row[header as keyof typeof row]).join("\t")
      ),
    ].join("\n");

    navigator.clipboard
      .writeText(tsv)
      .then(() => {
        toast.success("Client data copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy data.");
      });
  };

  const printTable = () => {
    const data = getDataForExport();
    if (data.length === 0) {
      toast.info("No data to print");
      return;
    }

    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      const headers = Object.keys(data[0]);

      const htmlContent = `
                <html>
                <head>
                    <title>Clients List</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        h1 { color: #333; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { bg-color: #f2f2f2; font-weight: bold; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                    </style>
                </head>
                <body>
                    <h1>Clients List</h1>
                    <table>
                        <thead>
                            <tr>
                                ${headers.map((h) => `<th>${h}</th>`).join("")}
                            </tr>
                        </thead>
                        <tbody>
                            ${data
                              .map(
                                (row: any) => `
                                <tr>
                                    ${headers.map((h) => `<td>${row[h as keyof typeof row] || ""}</td>`).join("")}
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleExport = (format: string) => {
    switch (format) {
      case "excel":
        exportToExcel();
        break;
      case "csv":
        exportToCSV();
        break;
      case "pdf":
        exportToPDF();
        break;
      case "copy":
        copyToClipboard();
        break;
      case "print":
        printTable();
        break;
      default:
        break;
    }
  };

  const exportData = useMemo(() => {
    const filteredClients = combinedClients.filter(
      (client: Client) =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    );
    return filteredClients;
  }, [combinedClients, searchTerm]);



  const handleSaveClient = async (clientData: ClientFormData, clientId?: string) => {
    try {
      if (clientId) {
        // Update existing client
        await updateClient({ _id: clientId, ...clientData }).unwrap();
        toast.success("Client updated successfully.");
      } else {
        // Create new client
        await createClient(clientData).unwrap();
        toast.success("Client created successfully.");
      }
      refetchOffline();
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to save client.";
      toast.error(errorMessage);
      throw err; // Re-throw to let the modal handle it
    }
  };

  const handleOpenModal = (client?: Client) => {
    setSelectedClient(client || null);
    setIsModalOpen(true);
  };



  const handleNameClick = (client: Client) => {
    setProfileClient(client);
    setIsProfileModalOpen(true);
    setActiveTab("overview");
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedClient) {
      try {
        await deleteClient(selectedClient._id).unwrap();
        toast.success("Client deleted successfully.");
        refetchOffline();
      } catch (err: any) {
        const errorMessage = err?.data?.message || "Failed to delete client.";
        toast.error(errorMessage);
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedClient(null);
      }
    }
  };

  const handleAddAppointment = (client?: Client) => {
    if (client) {
      setSelectedClientForAppointment(client);
    }
    setIsNewAppointmentModalOpen(true);
  };

  const handleSelectClientForAppointment = (client: Client) => {
    setSelectedClientForAppointment(client);
    setClientSearchTerm("");
  };

  const handleRemoveSelectedClient = () => {
    setSelectedClientForAppointment(null);
  };

  const handleSaveAppointment = (appointmentData: AppointmentFormData, client: Client) => {
    // Here you would typically save the appointment to your backend
    console.log("Saving appointment:", {
      ...appointmentData,
      clientId: client._id,
      clientName: client.fullName,
    });
    alert("Appointment saved successfully!");
  };

  if (isOfflineLoading || isOnlineLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
              <Skeleton className="h-8 w-64" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Skeleton className="h-10 w-80" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      {[
                        "Name",
                        "Email",
                        "Phone",
                        "Birthday",
                        "Last Visit",
                        "Bookings",
                        "Total Spent",
                        "Status",
                        "Actions",
                      ].map((_, i) => (
                        <TableHead
                          key={i}
                          className={
                            i < 3
                              ? i === 0
                                ? "min-w-[120px]"
                                : i === 1
                                  ? "min-w-[150px]"
                                  : "min-w-[120px]"
                              : ""
                          }
                        >
                          <Skeleton className="h-5 w-full" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i} className="hover:bg-muted/50">
                        <TableCell className="font-medium py-3 min-w-[120px] max-w-[150px]">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[150px] max-w-[180px]">
                          <Skeleton className="h-5 w-full mb-1" />
                        </TableCell>
                        <TableCell className="min-w-[120px] max-w-[150px]">
                          <Skeleton className="h-5 w-full mb-1" />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isOfflineError || isOnlineError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading clients data</p>
          </div>
          <Button
            onClick={() => {
              refetchOffline();
              refetchOnline();
            }}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section matching marketplace design */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Client Management
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                View, add, and manage your clients.
              </p>
            </div>
          </div>
        </div>

        <ClientStatsSection
          offlineClients={offlineClients}
          onlineClients={onlineClients}
          appointments={appointments}
          inactiveClients={inactiveClients}
          totalsById={totalsById}
        />

        {/* Search and Action Buttons Section */}
        <div className="">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, or phone..."
                className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>


              <div className="">
                <div className="flex items-center rounded-md border border-border/20 overflow-hidden w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setClientSegment("offline");
                    }}
                    className={`h-12 px-6 flex-1 sm:flex-none ${clientSegment === "offline" ? "bg-primary hover:bg-primary/90 text-primary-foreground rounded-tl-lg rounded-bl-lg" : "bg-background text-foreground hover:bg-muted"}`}
                  >
                    Offline Clients
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientSegment("online");
                    }}
                    className={`h-12 px-6 flex-1 sm:flex-none ${clientSegment === "online" ? "bg-primary hover:bg-primary/90 text-primary-foreground  rounded-tr-lg rounded-br-lg" : "bg-background text-foreground hover:bg-muted"}`}
                  >
                    Online Customers
                  </button>
                </div>
              </div>


            <Button
              variant="outline"
              className="h-12 px-6 rounded-lg border-border hover:border-primary flex-1 sm:flex-none"
              onClick={() => {
                const exportButton = document.createElement("button");
                exportButton.onclick = () => handleExport("excel");
                exportButton.click();
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => handleOpenModal()}
              className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>

        <ClientListSection
          // Client data passed to table component
          clients={combinedClients}
          isLoading={isOfflineLoading || isOnlineLoading}
          searchTerm={searchTerm}
          handleOpenModal={handleOpenModal}
          handleNameClick={handleNameClick}
          handleDeleteClick={handleDeleteClick}
          bookingsById={bookingsById}
          totalsById={totalsById}
          offlineClients={offlineClients}
          onlineClients={onlineClients}
          appointments={appointments}
          inactiveClients={inactiveClients}
        />

        {/* Client Profile Modal */}
        <ClientProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          client={profileClient}
          activeTab={activeTab as "overview" | "orders" | "appointments" | "client-details" | "reviews" | "payment-history"}
          setActiveTab={setActiveTab as (tab: "overview" | "orders" | "appointments" | "client-details" | "reviews" | "payment-history") => void}
          bookingsById={bookingsById}
          totalsById={totalsById}
          completedById={completedById}
          cancelledById={cancelledById}
          profileClientAppointments={profileClientAppointments}
          profileClientOrders={profileClientOrders}
          allReviews={allReviews}
          handleAddAppointment={handleAddAppointment}
        />

        {/* Add/Edit Client Modal */}
        <AddEditClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          client={selectedClient}
          onSave={handleSaveClient}
          isSaving={isCreating || isUpdating}
        />

        {/* New Appointment Modal */}
        <NewAppointmentModal
          isOpen={isNewAppointmentModalOpen}
          onClose={() => setIsNewAppointmentModalOpen(false)}
          onSave={handleSaveAppointment}
          offlineClients={offlineClients}
          onlineClients={onlineClients}
          selectedClient={selectedClientForAppointment}
          onSelectClient={handleSelectClientForAppointment}
          onRemoveSelectedClient={handleRemoveSelectedClient}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          client={selectedClient}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
