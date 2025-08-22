"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/tabs";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Checkbox } from "@repo/ui/checkbox";
import {
  Badge,
  Building,
  MapPin,
  Globe,
  Download,
  Image as ImageIcon,
  Banknote,
  FileText,
  Clock,
  Tags,
  Trash2,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

// MOCK DATA AND TYPES
type SalonCategory = "unisex" | "men" | "women";
type SubCategory = "shop" | "shop-at-home" | "onsite";

interface Subscription {
  plan: string;
  status: "Active" | "Expired";
  endDate: string;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

interface Document {
  id: string;
  name: string;
  type: "aadhar" | "pan" | "gst" | "license";
  status: "pending" | "approved" | "rejected";
}

interface OpeningHour {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

const initialVendorData = {
  businessName: "Glamour Salon",
  address: "123 Beauty Lane, Glamoria, GL 12345",
  salonId: "SID-GLM748",
  website: "https://glamoursalon.com",
  description:
    "Your one-stop destination for beauty and wellness. We offer a wide range of services from haircuts to spa treatments.",
  category: "unisex" as SalonCategory,
  subCategories: ["shop", "shop-at-home"] as SubCategory[],
  subscription: {
    plan: "Pro Yearly",
    status: "Active" as "Active" | "Expired",
    endDate: "2025-08-15",
  },
  gallery: [
    "https://placehold.co/600x400.png",
    "https://placehold.co/600x400.png",
    "https://placehold.co/600x400.png",
  ],
  bankDetails: {
    accountHolderName: "Jane Doe",
    accountNumber: "********1234",
    bankName: "Glamour Bank",
    ifscCode: "GLAM0001234",
  },
  documents: [
    {
      id: "1",
      name: "aadhar_card.pdf",
      type: "aadhar" as const,
      status: "approved" as const,
    },
    {
      id: "2",
      name: "pan_card.pdf",
      type: "pan" as const,
      status: "approved" as const,
    },
    {
      id: "3",
      name: "gst_cert.pdf",
      type: "gst" as const,
      status: "pending" as const,
    },
  ],
  openingHours: [
    { day: "Monday", open: "09:00", close: "21:00", isOpen: true },
    { day: "Tuesday", open: "09:00", close: "21:00", isOpen: true },
    { day: "Wednesday", open: "09:00", close: "21:00", isOpen: true },
    { day: "Thursday", open: "09:00", close: "21:00", isOpen: true },
    { day: "Friday", open: "09:00", close: "21:00", isOpen: true },
    { day: "Saturday", open: "10:00", close: "22:00", isOpen: true },
    { day: "Sunday", open: "", close: "", isOpen: false },
  ],
};

// SUB-COMPONENTS FOR TABS
const ProfileTab = ({ vendor, setVendor, categories, subCategories }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Business Profile</CardTitle>
      <CardDescription>Update your salon's public information.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="businessName">Salon Name</Label>
        <Input
          id="businessName"
          value={vendor.businessName}
          onChange={(e) =>
            setVendor({ ...vendor, businessName: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={vendor.description}
          onChange={(e) =>
            setVendor({ ...vendor, description: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Salon Category</Label>
        <Select
          value={vendor.category}
          onValueChange={(value) => setVendor({ ...vendor, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unisex">Unisex</SelectItem>
            <SelectItem value="men">Men</SelectItem>
            <SelectItem value="women">Women</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Sub Categories</Label>
        <div className="grid grid-cols-3 gap-4">
          {subCategories.map((subCat: any) => (
            <div key={subCat.id} className="flex items-center space-x-2">
              <Checkbox
                id={subCat.id}
                checked={vendor.subCategories.includes(subCat.id)}
                onCheckedChange={(checked) => {
                  const newSubCats = checked
                    ? [...vendor.subCategories, subCat.id]
                    : vendor.subCategories.filter(
                        (id: string) => id !== subCat.id
                      );
                  setVendor({ ...vendor, subCategories: newSubCats });
                }}
              />
              <Label
                htmlFor={subCat.id}
                className="text-sm font-medium leading-none"
              >
                {subCat.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button>Save Changes</Button>
    </CardFooter>
  </Card>
);

const SubscriptionTab = ({ subscription }: { subscription: Subscription }) => (
  <Card>
    <CardHeader>
      <CardTitle>My Subscription</CardTitle>
      <CardDescription>
        Details about your current plan and billing.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <p className="font-semibold text-lg">{subscription.plan}</p>
          <p className="text-sm text-muted-foreground">
            Status:{" "}
            <span
              className={
                subscription.status === "Active"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {subscription.status}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Renews on</p>
          <p className="font-semibold">{subscription.endDate}</p>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-end gap-2">
      <Button variant="outline">Change Plan</Button>
      <Button>View Billing History</Button>
    </CardFooter>
  </Card>
);

const GalleryTab = ({ gallery }: { gallery: string[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Salon Gallery</CardTitle>
      <CardDescription>Manage your salon's photo gallery.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="mb-6 p-6 border-2 border-dashed rounded-lg text-center">
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drag & drop images here or
        </p>
        <Button variant="link" asChild>
          <label htmlFor="gallery-upload" className="cursor-pointer">
            browse to upload
          </label>
        </Button>
        <Input
          id="gallery-upload"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((src, index) => (
          <div key={index} className="relative group aspect-video">
            <Image
              src={src}
              alt={`Salon image ${index + 1}`}
              layout="fill"
              className="object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const BankDetailsTab = ({ details }: { details: BankDetails }) => (
  <Card>
    <CardHeader>
      <CardTitle>Bank Details</CardTitle>
      <CardDescription>Manage your bank account for payouts.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Account Holder Name</Label>
          <Input value={details.accountHolderName} />
        </div>
        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input value={details.accountNumber} />
        </div>
        <div className="space-y-2">
          <Label>Bank Name</Label>
          <Input value={details.bankName} />
        </div>
        <div className="space-y-2">
          <Label>IFSC Code</Label>
          <Input value={details.ifscCode} />
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button>Update Bank Details</Button>
    </CardFooter>
  </Card>
);

const DocumentsTab = ({ documents }: { documents: Document[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Business Documents</CardTitle>
      <CardDescription>
        Upload and manage your verification documents.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="mb-6 p-6 border-2 border-dashed rounded-lg text-center">
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drag & drop files here or
        </p>
        <Button variant="link" asChild>
          <label htmlFor="doc-upload" className="cursor-pointer">
            browse to upload
          </label>
        </Button>
        <Input
          id="doc-upload"
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.png"
        />
      </div>
      <ul className="space-y-3">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {doc.type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={doc.status === "approved" ? "default" : "secondary"}
                className={
                  doc.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {doc.status}
              </Badge>

              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const OpeningHoursTab = ({
  hours,
  setHours,
}: {
  hours: OpeningHour[];
  setHours: any;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Opening Hours</CardTitle>
      <CardDescription>Set your weekly business hours.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {hours.map((hour, index) => (
        <div key={hour.day} className="grid grid-cols-4 items-center gap-4">
          <div className="col-span-1">
            <Checkbox
              id={hour.day}
              checked={hour.isOpen}
              onCheckedChange={(checked) => {
                const newHours = [...hours];
                newHours[index].isOpen = !!checked;
                setHours(newHours);
              }}
            />
            <Label htmlFor={hour.day} className="ml-2 font-medium">
              {hour.day}
            </Label>
          </div>
          <div className="col-span-1">
            <Input
              type="time"
              value={hour.open}
              disabled={!hour.isOpen}
              onChange={(e) => {
                const newHours = [...hours];
                newHours[index].open = e.target.value;
                setHours(newHours);
              }}
            />
          </div>
          <div className="col-span-1">
            <Input
              type="time"
              value={hour.close}
              disabled={!hour.isOpen}
              onChange={(e) => {
                const newHours = [...hours];
                newHours[index].close = e.target.value;
                setHours(newHours);
              }}
            />
          </div>
          <div className="col-span-1 text-right">
            {hour.isOpen ? (
              <span className="text-green-600">Open</span>
            ) : (
              <span className="text-red-600">Closed</span>
            )}
          </div>
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <Button>Save Hours</Button>
    </CardFooter>
  </Card>
);

const CategoriesTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Service Categories</CardTitle>
      <CardDescription>
        Manage the categories for your services and products.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Category management UI would go here */}
      <p>Category management functionality coming soon.</p>
    </CardContent>
  </Card>
);

// MAIN PAGE COMPONENT
export default function SalonProfilePage() {
  const [vendor, setVendor] = useState(initialVendorData);
  const [openingHours, setOpeningHours] = useState(
    initialVendorData.openingHours
  );

  const subCategories = [
    { id: "shop", label: "Shop" },
    { id: "shop-at-home", label: "Shop at Home" },
    { id: "onsite", label: "Onsite" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-muted/30 p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-lg flex-shrink-0">
              <Image
                src="https://placehold.co/200x200.png"
                alt="Salon Logo"
                layout="fill"
                className="object-cover"
              />
            </div>
            <div className="flex-grow">
              <CardTitle className="text-2xl md:text-3xl font-bold">
                {vendor.businessName}
              </CardTitle>
              <CardDescription className="text-base flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" /> {vendor.address}
              </CardDescription>
              <div className="text-sm text-muted-foreground mt-2">
                Salon ID:{" "}
                <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">
                  {vendor.salonId}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {vendor.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="mr-2 h-4 w-4" /> Website
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a href="/apps">
                    <Download className="mr-2 h-4 w-4" /> Download App
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="opening-hours">Opening Hours</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <ProfileTab
            vendor={vendor}
            setVendor={setVendor}
            categories={[]}
            subCategories={subCategories}
          />
        </TabsContent>
        <TabsContent value="subscription" className="mt-4">
          <SubscriptionTab subscription={vendor.subscription} />
        </TabsContent>
        <TabsContent value="gallery" className="mt-4">
          <GalleryTab gallery={vendor.gallery} />
        </TabsContent>
        <TabsContent value="bank-details" className="mt-4">
          <BankDetailsTab details={vendor.bankDetails} />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentsTab documents={vendor.documents} />
        </TabsContent>
        <TabsContent value="opening-hours" className="mt-4">
          <OpeningHoursTab hours={openingHours} setHours={setOpeningHours} />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
