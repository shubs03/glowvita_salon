
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Plus, Check } from 'lucide-react';

const serviceCategories = [
    { name: "Hair" },
    { name: "Skin" },
    { name: "Nails" },
    { name: "Body" }
];

const services = {
    "Hair": [
        { name: "Signature Haircut", duration: "60 min", price: "120.00" },
        { name: "Color & Highlights", duration: "120 min", price: "250.00" },
        { name: "Keratin Treatment", duration: "90 min", price: "180.00" }
    ],
    "Skin": [
        { name: "GlowVita Facial", duration: "75 min", price: "150.00" },
        { name: "HydraFacial", duration: "60 min", price: "180.00" }
    ],
    "Nails": [
        { name: "Classic Manicure", duration: "45 min", price: "60.00" },
        { name: "Gel Pedicure", duration: "60 min", price: "80.00" }
    ],
    "Body": [
        { name: "Deep Tissue Massage", duration: "90 min", price: "200.00" }
    ]
};

export function Step1_Services({ selectedServices, onSelectService }: { selectedServices: any[], onSelectService: (service: any) => void; }) {
  const [activeCategory, setActiveCategory] = useState("Hair");

  return (
    <div className="w-full">
        <h2 className="text-2xl font-bold mb-6">Select Your Services</h2>
        <div className="flex flex-col md:flex-row gap-8">
            {/* Categories List */}
            <div className="md:w-1/4 space-y-2">
                {serviceCategories.map(category => (
                    <Button 
                        key={category.name}
                        variant={activeCategory === category.name ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setActiveCategory(category.name)}
                    >
                        {category.name}
                    </Button>
                ))}
            </div>

            {/* Services List */}
            <div className="md:w-3/4 space-y-4">
                {services[activeCategory].map(service => {
                    const isSelected = selectedServices.some(s => s.name === service.name);
                    return (
                        <Card 
                            key={service.name} 
                            className={`p-4 flex justify-between items-center transition-all ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                        >
                            <div>
                                <h3 className="font-semibold">{service.name}</h3>
                                <p className="text-sm text-muted-foreground">{service.duration}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">₹{service.price}</span>
                                <Button 
                                    size="sm"
                                    variant={isSelected ? "default" : "secondary"}
                                    onClick={() => onSelectService(service)}
                                >
                                    {isSelected ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    {isSelected ? 'Selected' : 'Add'}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    </div>
  );
}
