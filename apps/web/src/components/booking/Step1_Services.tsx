
"use client";

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Search, Plus, Check } from 'lucide-react';

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

  const filteredServices = services.filter(
    (service) => service.category === activeCategory || (activeCategory === 'Featured' && service.services)
  );

  return (
    <div className="w-full">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search services" className="pl-10 h-12" />
      </div>

      <div className="mb-6">
        <div className="relative no-scrollbar overflow-x-auto pb-2">
          <div className="flex space-x-2">
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
        </div>
      </div>

      <div className="space-y-4">
        {filteredServices.map((service, index) => {
            const isSelected = selectedServices.some(s => s.name === service.name);
            return (
                <Card 
                    key={index} 
                    className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-gray-300'}`}
                    onClick={() => onSelectService(service)}
                >
                    <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.duration}{service.services ? ` • ${service.services} services` : ''}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">MYR {service.price}</span>
                            {service.discount && <span className="text-sm text-green-600">{service.discount}</span>}
                        </div>
                    </div>
                    <Button variant={isSelected ? 'default' : 'outline'} size="icon">
                        {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                    </CardContent>
                </Card>
            );
        })}
      </div>
    </div>
  );
}
