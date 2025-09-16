
'use client';
import { StatCard } from '@/components/dashboard/StatCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { ClientFeedback } from '@/components/dashboard/ClientFeedback';
import { TopServicesChart } from '@/components/dashboard/TopServicesChart';

import {
  FaDollarSign,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";

export default function CrmPage() {

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Revenue"
          value="₹1,25,832"
          change="+12.5%"
          icon={FaDollarSign}
          iconColor="text-green-500"
        />
        <StatCard
          title="New Clients"
          value="24"
          change="+8.2%"
          icon={FaUsers}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Today's Bookings"
          value="12"
          change="-2.1%"
          icon={FaCalendarAlt}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Pending Tasks"
          value="3"
          change="2 new"
          icon={FaClipboardList}
          iconColor="text-blue-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesChart />
        <TopServicesChart />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <UpcomingAppointments />
        <ClientFeedback />
      </div>
    </div>
  );
}
