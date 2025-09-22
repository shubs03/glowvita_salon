
"use client";

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Search, Plus, Check } from 'lucide-react';
import { cn } from '@repo/ui/cn';

const serviceCategories = ["Featured", "Special Promos", "Hair", "Beard", "Kids", "Coloring", "Treatments"];
const services = [
  { name: "Adult Haircut", duration: "35 mins", price: "35", category: "Hair", image: 'https://picsum.photos/seed/haircut/200' },
  { name: "Kids Haircut (12yo and under)", duration: "35 mins", price: "25", category: "Kids", image: 'https://picsum.photos/seed/kidscut/200' },
  { name: "Father & Son Special", duration: "1 hr 10 mins", price: "55", category: "Featured", services: 2, discount: "Save 8%", image: 'https://picsum.photos/seed/fatherson/200' },
  { name: "Student Haircut (18yo and under)", duration: "35 mins", price: "30", category: "Hair", image: 'https://picsum.photos/seed/studentcut/200' },
  { name: "Adult Haircut and Beard Trim", duration: "1 hr", price: "55", category: "Hair", services: 2, discount: "Save 15%", image: 'https://picsum.photos/seed/trim/200' },
  { name: "Adult Haircut & Wash", duration: "45 mins", price: "45", category: "Hair", services: 2, discount: "Save 10%", image: 'https://picsum.photos/seed/wash/200' },
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
    (activeCategory === 'Featured' ? service.discount : service.category === activeCategory) &&
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            placeholder="Search for services like 'Haircut' or 'Beard Trim'..." 
            className="pl-12 h-14 text-base rounded-xl bg-background border-2" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-8 relative">
        <div className="no-scrollbar flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4">
            {serviceCategories.map((cat) => (
            <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full flex-shrink-0 h-10 px-5 shadow-sm hover:shadow-md transition-all duration-200 border-border/50 hover:-translate-y-0.5"
            >
                {cat}
            </Button>
            ))}
        </div>
        <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none"></div>
      </div>

      <div className="space-y-4">
        {filteredServices.map((service, index) => {
            const isSelected = selectedServices.some(s => s.name === service.name);
            return (
                <Card 
                    key={index} 
                    className={cn(
                        "cursor-pointer transition-all duration-300 border-2",
                        isSelected ? 'border-primary ring-2 ring-primary/20 shadow-lg bg-primary/5' : 'bg-background hover:border-primary/50 hover:shadow-md'
                    )}
                    onClick={() => onSelectService(service)}
                >
                    <CardContent className="p-4 flex items-center gap-4">
                      <img src={service.image} alt={service.name} className="w-20 h-20 rounded-lg object-cover" data-ai-hint="salon service" />
                      <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.duration}{service.services ? ` • ${service.services} services` : ''}</p>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-base font-bold text-primary">MYR {service.price}</span>
                              {service.discount && <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{service.discount}</span>}
                          </div>
                      </div>
                      <div className={cn(
                          "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 transform",
                          isSelected ? 'bg-primary text-primary-foreground scale-100 rotate-0' : 'bg-secondary group-hover:scale-110'
                      )}>
                          {isSelected ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                      </div>
                    </CardContent>
                </Card>
            );
        })}
      </div>
    </div>
  );
}
