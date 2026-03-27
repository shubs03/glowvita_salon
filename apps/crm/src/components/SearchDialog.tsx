"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { vendorNavItems, doctorNavItems, supplierNavItems, NavItem } from "@/lib/routes";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { cn } from "@repo/ui/cn";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { role } = useCrmAuth();

  const navItems = useMemo(() => {
    switch (role) {
      case "vendor":
      case "staff":
        return vendorNavItems;
      case "doctor":
        return doctorNavItems;
      case "supplier":
        return supplierNavItems;
      default:
        return [];
    }
  }, [role]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return navItems.filter((item) =>
      item.title.toLowerCase().includes(term)
    );
  }, [searchTerm, navItems]);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="p-4 border-b border-border/50">
          <DialogTitle className="text-xl font-bold font-headline flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Quick Search
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search sections (e.g., Appointments, Clients, Sales)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-muted/30 border-border/50 focus:ring-primary/20"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {searchTerm.trim() === "" ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">Start typing to search for sections...</p>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 group border border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
                        <item.Icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-sm">{item.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No results found for "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
