import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { MapPin } from "lucide-react";
import { useUpdateVendorProfileMutation } from '@repo/store/api';
import { toast } from 'sonner';

interface TravelSettingsTabProps {
  vendor: any;
  setVendor: any;
}

export const TravelSettingsTab = ({ vendor, setVendor }: TravelSettingsTabProps) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();

  const handleSave = async () => {
    try {
      const result: any = await updateVendorProfile({
        _id: vendor._id,
        vendorType: vendor.vendorType,
        travelRadius: vendor.travelRadius,
        travelSpeed: vendor.travelSpeed,
        baseLocation: vendor.baseLocation,
      }).unwrap();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update travel settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel Settings</CardTitle>
        <CardDescription>Configure your home service travel settings for accurate travel time calculation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Vendor Type</Label>
          <Select
            value={vendor.vendorType || 'shop-only'}
            onValueChange={(value) => setVendor({ ...vendor, vendorType: value })}
          >
            <SelectTrigger className="h-12 rounded-lg border-border hover:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border/40">
              <SelectItem value="shop-only">Shop Only (No travel)</SelectItem>
              <SelectItem value="home-only">Home Only</SelectItem>
              <SelectItem value="onsite-only">Onsite Only</SelectItem>
              <SelectItem value="hybrid">Hybrid (Shop + Home Services)</SelectItem>
              <SelectItem value="vendor-home-travel">Vendor Home Travel</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select how you provide services to customers</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelRadius">Travel Radius (km)</Label>
          <Input
            id="travelRadius"
            type="number"
            min="0"
            step="1"
            value={vendor.travelRadius || 0}
            onChange={(e) =>
              setVendor({ ...vendor, travelRadius: Number(e.target.value) })
            }
            placeholder="e.g., 50"
            className="h-12 rounded-lg border border-border focus:border-primary text-base"
          />
          <p className="text-xs text-muted-foreground">Maximum distance you can travel for home services</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelSpeed">Average Travel Speed (km/h)</Label>
          <Input
            id="travelSpeed"
            type="number"
            min="1"
            step="1"
            value={vendor.travelSpeed || 30}
            onChange={(e) =>
              setVendor({ ...vendor, travelSpeed: Number(e.target.value) })
            }
            placeholder="e.g., 30"
            className="h-12 rounded-lg border border-border focus:border-primary text-base"
          />
          <p className="text-xs text-muted-foreground">Your average travel speed for time estimation (default: 30 km/h)</p>
        </div>

        <div className="space-y-4">
          <Label>Base Location</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseLat">Latitude</Label>
              <Input
                id="baseLat"
                type="number"
                step="any"
                value={vendor.baseLocation?.lat || vendor.location?.lat || ''}
                onChange={(e) =>
                  setVendor({
                    ...vendor,
                    baseLocation: {
                      ...vendor.baseLocation,
                      lat: Number(e.target.value),
                      lng: vendor.baseLocation?.lng || vendor.location?.lng || 0
                    }
                  })
                }
                placeholder="e.g., 19.0760"
                className="h-12 rounded-lg border border-border focus:border-primary text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseLng">Longitude</Label>
              <Input
                id="baseLng"
                type="number"
                step="any"
                value={vendor.baseLocation?.lng || vendor.location?.lng || ''}
                onChange={(e) =>
                  setVendor({
                    ...vendor,
                    baseLocation: {
                      lat: vendor.baseLocation?.lat || vendor.location?.lat || 0,
                      lng: Number(e.target.value)
                    }
                  })
                }
                placeholder="e.g., 72.8777"
                className="h-12 rounded-lg border border-border focus:border-primary text-base"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Your starting location for travel calculations (shop/home address)</p>
        </div>

        <div className="mt-4 p-3 bg-secondary/10 border-l-4 border-secondary rounded-r-md">
          <div className="flex gap-2">
            <MapPin className="h-4 w-4 text-secondary flex-shrink-0 mt-1" />
            <div className="text-sm text-secondary-foreground">
              <p className="font-bold text-xs text-secondary uppercase mb-1">Why are these settings important?</p>
              <ul className="text-[11px] text-secondary/80 list-disc list-inside space-y-0.5 font-medium">
                <li>Travel radius determines which customers you can serve</li>
                <li>Travel speed helps estimate accurate arrival times</li>
                <li>Base location is used to calculate distances to customers</li>
                <li>These settings enable real-time travel time calculation via Google Maps</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90">
          Save Travel Settings
        </Button>
      </CardFooter>
    </Card>
  );
};