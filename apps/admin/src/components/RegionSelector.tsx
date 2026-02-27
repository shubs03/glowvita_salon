"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setSelectedRegion, selectSelectedRegion, selectCurrentAdmin } from "@repo/store/slices/adminAuthSlice";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Globe } from "lucide-react";

export default function RegionSelector() {
  const dispatch = useAppDispatch();
  const selectedRegion = useAppSelector(selectSelectedRegion);
  const admin = useAppSelector(selectCurrentAdmin);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRegions = async () => {
      // Only SUPER_ADMIN needs to fetch all regions for the selector
      if (!admin || (admin.roleName !== "SUPER_ADMIN" && admin.roleName !== "superadmin")) {
        return;
      }
      
      try {
        setLoading(true);
        const res = await fetch("/api/admin/regions", {
          credentials: 'same-origin'
        });

        if (!res.ok) {
           console.error("Failed to fetch regions:", res.statusText);
           return;
        }

        const json = await res.json();
        if (json.success) {
          setRegions(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch regions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [admin]);

  const handleRegionChange = (value: string) => {
    const regionId = value === "all" ? null : value;
    dispatch(setSelectedRegion(regionId));
    
    // Update URL with new regionId
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (regionId) {
      current.set("regionId", regionId);
    } else {
      current.delete("regionId");
    }
    
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  // Only show for Super Admins
  if (!admin || (admin.roleName !== "SUPER_ADMIN" && admin.roleName !== "superadmin")) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedRegion || "all"}
        onValueChange={handleRegionChange}
        disabled={loading}
      >
        <SelectTrigger className="w-[180px] h-9 bg-background border-muted hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 truncate">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Select Region" />
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="max-h-[300px]">
          <SelectItem value="all" className="font-medium">
            <div className="flex items-center gap-2">
              <span>All Regions</span>
            </div>
          </SelectItem>
          {regions.map((region: any) => (
            <SelectItem key={region._id} value={region._id}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
