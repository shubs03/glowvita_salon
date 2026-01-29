"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Search, Calendar, UserCheck, FileText, CheckCircle, Trash2, Plus } from "lucide-react";
import { Client, AppointmentFormData } from "../types";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: AppointmentFormData, client: Client) => void;
  offlineClients: Client[];
  onlineClients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onRemoveSelectedClient: () => void;
}

export default function NewAppointmentModal({
  isOpen,
  onClose,
  onSave,
  offlineClients,
  onlineClients,
  selectedClient,
  onSelectClient,
  onRemoveSelectedClient,
}: NewAppointmentModalProps) {
  const [appointmentData, setAppointmentData] = useState<AppointmentFormData>({
    date: "",
    startTime: "",
    service: "",
    duration: "",
    staffMember: "",
    notes: "",
  });
  
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredClientsForAppointment = useMemo(() => {
    const allClients = [...offlineClients, ...onlineClients];
    return allClients.filter(
      (client: Client) =>
        client.fullName
          .toLowerCase()
          .includes(clientSearchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.phone.includes(clientSearchTerm)
    );
  }, [offlineClients, onlineClients, clientSearchTerm]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAppointmentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!selectedClient) {
      alert("Please select a client for the appointment");
      return;
    }
    onSave(appointmentData, selectedClient);
    
    // Reset form
    setAppointmentData({
      date: "",
      startTime: "",
      service: "",
      duration: "",
      staffMember: "",
      notes: "",
    });
    onRemoveSelectedClient();
    onClose();
  };

  const handleOpenAddClientModal = () => {
    setIsSearchFocused(false);
    // This would trigger opening the add client modal
    // We'll pass this callback from the parent component
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col p-0 sm:w-[90vw] md:w-[85vw] lg:max-w-6xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-blue-100">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            New Appointment
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-sm sm:text-base">
            Schedule a new appointment for your client with detailed
            information and service selection
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Side - Appointment Details */}
          <div className="w-full lg:w-3/5 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r bg-gray-50/30 overflow-y-auto">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-md flex items-center justify-center">
                  <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                </div>
                Appointment Details
              </h3>

              <div className="space-y-4 sm:space-y-6">
                {/* Date and Start Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="date"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Select Date
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={appointmentData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 sm:h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="startTime"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={appointmentData.startTime}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 sm:h-12"
                      required
                    />
                  </div>
                </div>

                {/* Service */}
                <div className="space-y-2">
                  <Label
                    htmlFor="service"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Service
                  </Label>
                  <select
                    id="service"
                    name="service"
                    value={appointmentData.service}
                    onChange={handleInputChange}
                    className="flex h-10 sm:h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Service</option>
                    <option value="haircut">Haircut</option>
                    <option value="styling">Hair Styling</option>
                    <option value="coloring">Hair Coloring</option>
                    <option value="facial">Facial Treatment</option>
                    <option value="manicure">Manicure</option>
                    <option value="pedicure">Pedicure</option>
                    <option value="massage">Massage</option>
                    <option value="makeup">Makeup</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Duration
                  </Label>
                  <select
                    id="duration"
                    name="duration"
                    value={appointmentData.duration}
                    onChange={handleInputChange}
                    className="flex h-10 sm:h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Duration</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="150">2.5 hours</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>

                {/* Staff Members */}
                <div className="space-y-2">
                  <Label
                    htmlFor="staffMember"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Staff Member
                  </Label>
                  <select
                    id="staffMember"
                    name="staffMember"
                    value={appointmentData.staffMember}
                    onChange={handleInputChange}
                    className="flex h-10 sm:h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Staff Member</option>
                    <option value="sarah">
                      Sarah Johnson - Hair Stylist
                    </option>
                    <option value="mike">Mike Davis - Barber</option>
                    <option value="emma">Emma Wilson - Beautician</option>
                    <option value="alex">
                      Alex Brown - Massage Therapist
                    </option>
                    <option value="lisa">
                      Lisa Garcia - Nail Technician
                    </option>
                  </select>
                </div>

                {/* Appointment Notes */}
                <div className="space-y-2">
                  <Label
                    htmlFor="notes"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Appointment Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={appointmentData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any special notes, requests, or preferences..."
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px] sm:min-h-[100px]"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Client Selection */}
          <div className="w-full lg:w-2/5 p-4 sm:p-6 flex flex-col bg-white">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 rounded-md flex items-center justify-center">
                <UserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600" />
              </div>
              Client Selection
            </h3>

            {/* Search Box */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search clients by name, email, or phone..."
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSearchFocused(false), 200)
                  }
                />
              </div>
            </div>

            {/* Selected Client Display */}
            {selectedClient && (
              <div className="mb-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <img
                        src={
                          selectedClient.profilePicture ||
                          `https://placehold.co/40x40.png?text=${selectedClient.fullName[0]}`
                        }
                        alt={selectedClient.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {selectedClient.fullName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {selectedClient.phone}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRemoveSelectedClient}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Show when search is focused or has content */}
            {(isSearchFocused || clientSearchTerm) && (
              <div className="space-y-3">
                {/* Add New Client Button */}
                <Button
                  variant="outline"
                  onClick={handleOpenAddClientModal}
                  className="w-full border-gray-300 hover:bg-gray-50 text-sm h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Client
                </Button>

                {/* Client List */}
                <div
                  className="space-y-2 max-h-64 overflow-y-auto"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#cbd5e1 #f1f5f9",
                  }}
                >
                  {filteredClientsForAppointment.map((client: Client) => (
                    <div
                      key={client._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedClient?._id === client._id
                          ? "bg-blue-50 border-blue-300 shadow-md"
                          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                      }`}
                      onClick={() => {
                        onSelectClient(client);
                        setIsSearchFocused(false);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            client.profilePicture ||
                            `https://placehold.co/32x32.png?text=${client.fullName[0]}`
                          }
                          alt={client.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {client.fullName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {client.phone}
                          </p>
                        </div>
                        {selectedClient?._id ===
                          client._id && (
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredClientsForAppointment.length === 0 && (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium text-sm">
                        No clients found
                      </p>
                      <p className="text-xs">Try adjusting your search</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Appointment Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg h-12 text-base font-semibold"
                disabled={
                  !selectedClient ||
                  !appointmentData.date ||
                  !appointmentData.startTime ||
                  !appointmentData.service
                }
              >
                <Calendar className="w-5 h-5 mr-2" />
                Save Appointment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}