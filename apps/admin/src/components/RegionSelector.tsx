"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setSelectedRegion, selectSelectedRegion, selectCurrentAdmin } from "@repo/store/slices/adminAuthSlice";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
      if (!admin || admin.roleName !== "SUPER_ADMIN") {
        return;
      }
      
      try {
        setLoading(true);
        const res = await fetch("/api/admin/regions", {
          credentials: 'same-origin' // Ensures cookies are sent
        });

        if (!res.ok) {
           const text = await res.text();
           let errData;
           try { errData = JSON.parse(text); } catch(e) {}
           console.error("Failed to fetch regions:", errData?.message || errData?.error || res.statusText);
           return;
        }

        const json = await res.json();
        if (json.success) {
          setRegions(json.data);
        } else {
          console.error("Failed to fetch regions:", json.message || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to fetch regions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [admin]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    dispatch(setSelectedRegion(regionId || null));
    
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
  if (!admin || admin.roleName !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="region-selector" className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Region:
      </label>
      <select
        id="region-selector"
        value={selectedRegion || ""}
        onChange={handleRegionChange}
        disabled={loading}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      >
        <option value="">All Regions</option>
        {regions.map((region: any) => (
          <option key={region._id} value={region._id}>
            {region.name}
          </option>
        ))}
      </select>
    </div>
  );
}
