"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { useState } from "react";

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface SalonItem {
  id: number;
  vendorName: string;
  email: string;
  contactNumber: string;
  dateSubmitted: string;
  status: ApprovalStatus;
}

interface ServiceItem {
  id: number;
  serviceType: string;
  vendorName: string;
  serviceName: string;
  serviceId: string;
  status: ApprovalStatus;
}

const initialSalonData: SalonItem[] = [
  {
    id: 1,
    vendorName: "New Beauty Haven",
    email: "contact@newbeauty.com",
    contactNumber: "+1 (555) 123-4567",
    dateSubmitted: "2023-10-27",
    status: 'pending'
  },
  // Add more salon data as needed
];

const initialServiceData: ServiceItem[] = [
  {
    id: 1,
    serviceType: "Haircut",
    vendorName: "New Beauty Haven",
    serviceName: "Premium Haircut",
    serviceId: "SVC001",
    status: 'pending'
  },
  {
    id: 2,
    serviceType: "Spa",
    vendorName: "New Beauty Haven",
    serviceName: "Full Body Massage",
    serviceId: "SVC002",
    status: 'pending'
  },
  // Add more service data as needed
];

export default function VendorApprovalPage() {
  const [activeTab, setActiveTab] = useState('salon');
  const [salonData, setSalonData] = useState<SalonItem[]>(initialSalonData);
  const [serviceData, setServiceData] = useState<ServiceItem[]>(initialServiceData);

  const handleSalonStatus = (id: number, status: 'approved' | 'rejected') => {
    setSalonData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const handleServiceStatus = (id: number, status: 'approved' | 'rejected') => {
    setServiceData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Vendor Verification & Approval</h1>

      <div className="flex space-x-4 mb-6">
        <Button 
          variant={activeTab === 'salon' ? 'default' : 'outline'}
          onClick={() => setActiveTab('salon')}
        >
          Salon
        </Button>
        <Button 
          variant={activeTab === 'service' ? 'default' : 'outline'}
          onClick={() => setActiveTab('service')}
        >
          Service
        </Button>
      </div>

        {activeTab === 'salon' && (
          <Card>
            <CardHeader>
              <CardTitle>Salon Approvals</CardTitle>
              <CardDescription>Salon vendors waiting for verification to join the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Vendor Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Contact</th>
                      <th className="p-2 text-left">Date Submitted</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salonData.map((salon) => (
                      <tr 
                        key={salon.id} 
                        className={`border-b ${
                          salon.status === 'approved' ? 'bg-green-50' : 
                          salon.status === 'rejected' ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="p-2">{salon.vendorName}</td>
                        <td className="p-2">{salon.email}</td>
                        <td className="p-2">{salon.contactNumber}</td>
                        <td className="p-2">{salon.dateSubmitted}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            salon.status === 'approved' ? 'bg-green-100 text-green-800' :
                            salon.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {salon.status.charAt(0).toUpperCase() + salon.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="sm" className="mr-2">View Details</Button>
                          <Button 
                            size="sm" 
                            variant={salon.status === 'approved' ? 'default' : 'outline'}
                            onClick={() => handleSalonStatus(salon.id, 'approved')}
                            className="mr-2"
                          >
                            Approve
                          </Button>
                          <Button 
                            variant={salon.status === 'rejected' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleSalonStatus(salon.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'service' && (
          <Card>
            <CardHeader>
              <CardTitle>Service Approvals</CardTitle>
              <CardDescription>Services waiting for approval.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Service Type</th>
                      <th className="p-2 text-left">Vendor Name</th>
                      <th className="p-2 text-left">Service Name</th>
                      <th className="p-2 text-left">Service ID</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceData.map((service) => (
                      <tr 
                        key={service.id} 
                        className={`border-b ${
                          service.status === 'approved' ? 'bg-green-50' : 
                          service.status === 'rejected' ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="p-2">{service.serviceType}</td>
                        <td className="p-2">{service.vendorName}</td>
                        <td className="p-2">{service.serviceName}</td>
                        <td className="p-2">{service.serviceId}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.status === 'approved' ? 'bg-green-100 text-green-800' :
                            service.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <Button 
                            size="sm" 
                            variant={service.status === 'approved' ? 'default' : 'outline'}
                            onClick={() => handleServiceStatus(service.id, 'approved')}
                            className="mr-2"
                          >
                            Approve
                          </Button>
                          <Button 
                            variant={service.status === 'rejected' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleServiceStatus(service.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
