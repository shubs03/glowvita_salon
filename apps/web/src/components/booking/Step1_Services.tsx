
"use client";

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Search, Plus, Check } from 'lucide-react';
import { cn } from '@repo/ui/cn';

const serviceCategories = ["Featured", "Special Promos", "Hair", "Beard", "Kids", "Coloring", "Treatments"];
const services = [
  { name: "Adult Haircut", duration: "35 mins", price: "35", category: "Hair" },
  { name: "Kids Haircut (12yo and under)", duration: "35 mins", price: "25", category: "Kids" },
  { name: "Father & Son Special", duration: "35 mins", price: "55", category: "Featured", services: 2, discount: "Save 8%" },
  { name: "Student Haircut (18yo and under)", duration: "35 mins", price: "30", category: "Hair" },
  { name: "Adult Haircut and Beard Trim", duration: "1 hr", price: "55", category: "Hair", services: 2, discount: "Save 15%" },
  { name: "Adult Haircut & Wash", duration: "45 mins", price: "45", category: "Hair", services: 2, discount: "Save 10%" },
];

interface Step1ServicesProps {
    selectedServices: any[];
    onSelectService: (service: any) => void;
}

export function Step1_Services({ selectedServices, onSelectService }: Step1ServicesProps) {
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services.filter(
    (service) => 
    (activeCategory === 'Featured' ? service.services : service.category === activeCategory) &&
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            placeholder="Search services" 
            className="pl-10 h-12" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <div className="relative">
            <div className="no-scrollbar overflow-x-auto pb-2 flex space-x-2">
                {serviceCategories.map((cat) => (
                <Button
                    key={cat}
                    variant={activeCategory === cat ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(cat)}
                    className="rounded-full flex-shrink-0"
                >
                    {cat}
                </Button>
                ))}
            </div>
            <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredServices.map((service, index) => {
            const isSelected = selectedServices.some(s => s.name === service.name);
            return (
                <Card 
                    key={index} 
                    className={cn(
                        "cursor-pointer transition-all duration-200 border-2",
                        isSelected ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'hover:border-primary/50 hover:shadow-md'
                    )}
                    onClick={() => onSelectService(service)}
                >
                    <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.duration}{service.services ? ` • ${service.services} services` : ''}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-primary">MYR {service.price}</span>
                            {service.discount && <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{service.discount}</span>}
                        </div>
                    </div>
                    <div className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200",
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    )}>
                        {isSelected ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </div>
                    </CardContent>
                </Card>
            );
        })}
      </div>
    </div>
  );
}
