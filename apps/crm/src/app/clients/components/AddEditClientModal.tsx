"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Client, ClientFormData } from "../types";

interface AddEditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (clientData: ClientFormData, clientId?: string) => Promise<void>;
  isSaving: boolean;
}

export default function AddEditClientModal({
  isOpen,
  onClose,
  client,
  onSave,
  isSaving,
}: AddEditClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    fullName: "",
    email: "",
    phone: "",
    birthdayDate: "",
    gender: "",
    country: "",
    occupation: "",
    profilePicture: "",
    address: "",
    preferences: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedFormats = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedFormats.includes(file.type)) {
        toast.error(
          "Invalid file format. Only JPG, JPEG, PNG, and WEBP are allowed."
        );
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file size (500KB = 500 * 1024 bytes)
      const maxSize = 500 * 1024; // 500 KB
      if (file.size > maxSize) {
        toast.error("File size exceeds 500 KB. Please choose a smaller image.");
        e.target.value = ""; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // Allow only digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }
    if (name === "fullName") {
      // Allow only letters and spaces
      const lettersAndSpaces = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({ ...prev, fullName: lettersAndSpaces }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Validate Full Name: required and only letters/spaces
      if (!formData.fullName || formData.fullName.trim().length === 0) {
        toast.error("Full name is required.");
        return;
      }
      if (formData.fullName.trim().length < 2) {
        toast.error("Full name must be at least 2 characters long.");
        return;
      }

      // Validate Email: required and must contain @
      if (!formData.email || formData.email.trim().length === 0) {
        toast.error("Email address is required.");
        return;
      }
      if (!formData.email.includes("@")) {
        toast.error("Email must contain @ symbol.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error("Please enter a valid email address.");
        return;
      }

      // Validate phone: exactly 10 digits
      if (!formData.phone || formData.phone.trim().length !== 10) {
        toast.error("Phone number must be exactly 10 digits.");
        return;
      }

      const clientData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birthdayDate: formData.birthdayDate,
        gender: (formData.gender as "Male" | "Female" | "Other") || "Other",
        country: formData.country.trim(),
        occupation: formData.occupation.trim(),
        profilePicture: formData.profilePicture,
        address: formData.address.trim(),
        preferences: formData.preferences.trim(),
      };

      await onSave(clientData, client?._id);
      handleClose();
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to save client.";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      birthdayDate: "",
      gender: "",
      country: "",
      occupation: "",
      profilePicture: "",
      address: "",
      preferences: "",
    });
    onClose();
  };

  // Initialize form data when editing
  useEffect(() => {
    if (client && isOpen) {
      // Format the birthday date for the date input (YYYY-MM-DD)
      let birthdayDateFormatted = "";
      if (client.birthdayDate) {
        try {
          const date = new Date(client.birthdayDate);
          // Check if the date is valid
          if (!isNaN(date.getTime())) {
            birthdayDateFormatted = date.toISOString().split("T")[0];
          }
        } catch (e) {
          console.error("Error formatting birthday date:", e);
        }
      }

      setFormData({
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        birthdayDate: birthdayDateFormatted,
        gender: client.gender,
        country: client.country,
        occupation: client.occupation,
        profilePicture: client.profilePicture || "",
        address: client.address,
        preferences: client.preferences || "",
      });
    } else if (isOpen) {
      // Reset for new client
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        birthdayDate: "",
        gender: "",
        country: "",
        occupation: "",
        profilePicture: "",
        address: "",
        preferences: "",
      });
    }
  }, [client, isOpen]);

  // Add CSS to hide scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {client ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogDescription>
            {client
              ? "Update the details for this client."
              : "Enter the details for the new client."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Profile Picture */}
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="relative">
                <p className="text-sm font-medium text-gray-700 text-center mb-2">
                  Profile Photo
                </p>
                <input
                  id="profilePicture"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePicture"
                  className="cursor-pointer block"
                >
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-200 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-blue-50">
                    {formData.profilePicture ? (
                      <img
                        src={formData.profilePicture}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-500">
                          Add Photo
                        </span>
                      </div>
                    )}
                  </div>
                </label>
                {formData.profilePicture && (
                  <div className="absolute -top-1 -right-1">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          profilePicture: "",
                        }))
                      }
                      className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors duration-200"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Allowed: JPG, JPEG, PNG, WEBP • Max size: 500 KB
            </p>
          </div>

          {/* Full Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          {/* Phone and Birthday */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                placeholder="Enter 10-digit phone number"
                title="Phone number must be exactly 10 digits"
                onKeyDown={(e) => {
                  if (e.key === " ") e.preventDefault();
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdayDate">Birthday Date</Label>
              <Input
                id="birthdayDate"
                name="birthdayDate"
                type="date"
                value={formData.birthdayDate}
                onChange={handleInputChange}
                placeholder="Select birthday (optional)"
              />
            </div>
          </div>

          {/* Gender and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={(e) => handleSelectChange("gender", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:border-blue-500"
              >
                <option value="">Select Gender (optional)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="e.g., India (optional)"
              />
            </div>
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              placeholder="e.g., Software Engineer (optional)"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter full address (optional)"
              rows={3}
            />
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <Label htmlFor="preferences">Notes</Label>
            <Textarea
              id="preferences"
              name="preferences"
              value={formData.preferences}
              onChange={handleInputChange}
              placeholder="Enter any client preferences or notes (optional)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : client
                ? "Update Client"
                : "Save Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}