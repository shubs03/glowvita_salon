
"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Button } from "@repo/ui/button";
import { useCreateSupplierMutation } from "@repo/store/services/api";
import { toast } from "sonner";
import stateCityData from "@/lib/state-city.json";

interface AddSupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSupplierForm: React.FC<AddSupplierFormProps> = ({
  isOpen,
  onClose,
}) => {
  const [createSupplier, { isLoading: isCreating }] =
    useCreateSupplierMutation();
  interface State {
    state: string;
    districts: string[];
  }

  const states: State[] = stateCityData.states;
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");

  const initialNewSupplierState = {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    shopName: "",
    country: "India",
    state: "",
    city: "",
    pincode: "",
    location: "",
    address: "",
    businessRegistrationNo: "",
    supplierType: "",
    licenseFile: null as File | null,
    password: "",
    confirmPassword: "",
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSupplier, setNewSupplier] = useState(initialNewSupplierState);
  const [showPassword, setShowPassword] = useState(false);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);

  const supplierTypes = [
    "Hair Care",
    "Skin Care",
    "Nail Care",
    "Beauty Tools & Equipment",
    "Spa & Wellness",
    "Makeup Products",
    "Hygiene & Cleaning",
  ];

  useEffect(() => {
    if (selectedState) {
      const stateData = states.find((s) => s.state === selectedState);
      setCities(stateData ? stateData.districts : []);
      setNewSupplier((prev) => ({ ...prev, state: selectedState, city: "" }));
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
  };

  const handleCityChange = (value: string) => {
    setNewSupplier((prev) => ({ ...prev, city: value }));
  };

  const handleNewSupplierChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "mobile" || name === "pincode") {
      const numericValue = value.replace(/\D/g, "");
      const maxLength = name === "mobile" ? 10 : 6;
      if (numericValue.length <= maxLength) {
        setNewSupplier((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setNewSupplier((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSupplierTypeChange = (value: string) => {
    setNewSupplier((prev) => ({ ...prev, supplierType: value }));
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    let licenseFileBase64 = null;
    if (newSupplier.licenseFile) {
      licenseFileBase64 = await toBase64(newSupplier.licenseFile);
    }

    try {
      await createSupplier({
        ...newSupplier,
        licenseFile: licenseFileBase64,
      }).unwrap();
      toast.success("Supplier added successfully!");
      setNewSupplier(initialNewSupplierState);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLicensePreview(null);
      onClose();
    } catch (error) {
      console.error("Failed to add supplier", error);
      toast.error("Failed to add supplier.");
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (JPEG, PNG, etc.)");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setLicensePreview(previewUrl);

      setNewSupplier((prev) => ({ ...prev, licenseFile: file }));
    }
  };

  useEffect(() => {
    return () => {
      if (licensePreview) {
        URL.revokeObjectURL(licensePreview);
      }
    };
  }, [licensePreview]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Add New Supplier
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Fill in the supplier details below. All fields marked with{" "}
            <span className="text-red-500">*</span> are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddSupplier} className="space-y-6 py-2">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={newSupplier.firstName}
                    onChange={handleNewSupplierChange}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newSupplier.lastName}
                    onChange={handleNewSupplierChange}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newSupplier.email}
                    onChange={handleNewSupplierChange}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="mobile"
                    className="text-sm font-medium text-gray-700"
                  >
                    Mobile <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={newSupplier.mobile}
                    onChange={handleNewSupplierChange}
                    className="w-full"
                    required
                    placeholder="12345 67890"
                  />
                  {newSupplier.mobile && newSupplier.mobile.length !== 10 && (
                    <p className="text-sm text-red-500">
                      Mobile number must be 10 digits
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Business Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="shopName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Shop Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="shopName"
                      name="shopName"
                      value={newSupplier.shopName}
                      onChange={handleNewSupplierChange}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="businessRegistrationNo"
                      className="text-sm font-medium text-gray-700"
                    >
                      Business Registration No.
                    </Label>
                    <Input
                      id="businessRegistrationNo"
                      name="businessRegistrationNo"
                      value={newSupplier.businessRegistrationNo}
                      onChange={handleNewSupplierChange}
                      className="w-full"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium text-gray-700"
                  >
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={newSupplier.address}
                    onChange={handleNewSupplierChange}
                    className="w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="country"
                      className="text-sm font-medium text-gray-700"
                    >
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="country"
                      value={newSupplier.country}
                      onValueChange={(value) =>
                        setNewSupplier((prev) => ({
                          ...prev,
                          country: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="state"
                      className="text-sm font-medium text-gray-700"
                    >
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedState}
                      onValueChange={handleStateChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {states.map((state) => (
                          <SelectItem key={state.state} value={state.state}>
                            {state.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="city"
                      className="text-sm font-medium text-gray-700"
                    >
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newSupplier.city}
                      onValueChange={handleCityChange}
                      disabled={!selectedState}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedState
                              ? "Select city"
                              : "Select state first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="pincode"
                      className="text-sm font-medium text-gray-700"
                    >
                      Pincode <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 6-digit pincode"
                      value={newSupplier.pincode}
                      onChange={handleNewSupplierChange}
                      className="w-full"
                      required
                    />
                    {newSupplier.pincode &&
                      newSupplier.pincode.length !== 6 && (
                        <p className="text-sm text-red-500">
                          Pincode must be 6 digits
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium text-gray-700"
                    >
                      Location (Optional)
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Enter location"
                      value={newSupplier.location}
                      onChange={handleNewSupplierChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Business Documents
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="licenseFile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    License/Certification (Image, max 5MB){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="licenseFile"
                        className="relative flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          id="licenseFile"
                          name="licenseFile"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {licensePreview && (
                      <div className="w-24 h-24 border rounded-lg overflow-hidden">
                        <img
                          src={licensePreview}
                          alt="License preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {newSupplier.licenseFile && (
                    <p className="mt-1 text-sm text-gray-600">
                      Selected: {newSupplier.licenseFile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="supplierType"
                    className="text-sm font-medium text-gray-700"
                  >
                    Supplier Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newSupplier.supplierType}
                    onValueChange={handleSupplierTypeChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier type" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Account Security (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={newSupplier.password}
                      onChange={handleNewSupplierChange}
                      className="w-full pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={newSupplier.confirmPassword}
                      onChange={handleNewSupplierChange}
                      className="w-full pr-10"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-gray-50 px-4 py-3 sm:px-6 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Adding..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplierForm;
