
'use client';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { TopServicesChart } from '@/components/dashboard/TopServicesChart';
import { TeamChat } from '@/components/dashboard/TeamChat';
import { ClientFeedback } from '@/components/dashboard/ClientFeedback';
import { ToDoList } from '@/components/dashboard/ToDoList';
import {
  FaDollarSign,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";

export default function CrmPage() {

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                iconColor="text-purple-500"
                />
                <StatCard
                title="Pending Tasks"
                value="3"
                change="2 new"
                icon={FaClipboardList}
                iconColor="text-yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <RevenueChart />
                    <UpcomingAppointments />
                </div>

                {/* Sidebar Area */}
                <div className="space-y-8">
                    <TeamChat />
                </div>
            </div>
          
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <TopServicesChart />
              <ClientFeedback />
              <ToDoList />
           </div>
           
        </div>
    </div>
  );
}
