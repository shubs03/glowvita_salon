
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
        <h2 className="text-2xl font-bold mb-4">Select Your Services</h2>
        
        {/* Tab-like navigation for categories */}
        <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-4">
                {serviceCategories.map(category => (
                    <button 
                        key={category.name}
                        className={`py-2 px-1 text-sm font-medium transition-colors duration-200 ${
                            activeCategory === category.name 
                                ? 'border-b-2 border-primary text-primary' 
                                : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveCategory(category.name)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
            {services[activeCategory].map(service => {
                const isSelected = selectedServices.some(s => s.name === service.name);
                return (
                    <Card 
                        key={service.name} 
                        className={`p-4 flex justify-between items-center transition-all duration-200 ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}`}
                    >
                        <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">{service.duration}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-lg">₹{service.price}</span>
                            <Button 
                                size="sm"
                                variant={isSelected ? "default" : "secondary"}
                                onClick={() => onSelectService(service)}
                                className="w-28"
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
  );
}
