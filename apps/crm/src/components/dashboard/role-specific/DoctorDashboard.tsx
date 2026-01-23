'use client';
import { useState, useEffect } from 'react';
import {
  StatCard,
  SalesChart,
  UpcomingAppointments,
  ClientFeedback,
  TopServicesChart,
  TopSellingProductsChart,
  DynamicDateFilter
} from '../index';

import {
  FaUserMd,
  FaStethoscope,
  FaHeartbeat,
  FaCalendarCheck,
  FaUserInjured,
  FaNotesMedical,
  FaPrescription,
  FaHospitalUser,
  FaUserNurse,
  FaDna,
  FaVial,
  FaSyncAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaRupeeSign,
  FaChartLine,
  FaClock
} from "react-icons/fa";

interface DoctorDashboardMetrics {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  todayRevenue: number;
  averageConsultationTime: number;
  patientSatisfaction: number;
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  recentAppointments: Array<{
    id: string;
    patient: string;
    service: string;
    date: string;
    time: string;
    status: string;
  }>;
}

interface DoctorDashboardProps {
  metrics: DoctorDashboardMetrics | null;
  loading: boolean;
  error: string | null;
  filterType: 'preset' | 'custom';
  presetPeriod: 'day' | 'month' | 'year' | 'all';
  startDate: string;
  endDate: string;
  onFilterChange: (
    newFilterType: 'preset' | 'custom',
    newPresetPeriod?: 'day' | 'month' | 'year' | 'all',
    newStartDate?: string,
    newEndDate?: string
  ) => void;
}

export default function DoctorDashboard({
  metrics,
  loading,
  error,
  filterType,
  presetPeriod,
  startDate,
  endDate,
  onFilterChange
}: DoctorDashboardProps) {

  // Format currency for Indian Rupees
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Doctor Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span>Loading...</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7 mb-6">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-80 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-80 bg-muted rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Doctor Dashboard</h1>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive font-medium">Error loading dashboard data</p>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Check if we have metrics but all values are zero
  const hasNoData = metrics &&
    metrics.totalPatients === 0 &&
    metrics.totalAppointments === 0 &&
    metrics.completedAppointments === 0 &&
    metrics.pendingAppointments === 0 &&
    metrics.totalRevenue === 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Doctor Dashboard</h1>
        <div className="flex flex-col gap-4">
          {/* Dynamic Date Filter Component */}
          <DynamicDateFilter
            filterType={filterType}
            presetPeriod={presetPeriod}
            startDate={startDate}
            endDate={endDate}
            onFilterChange={onFilterChange}
          />

        </div>
      </div>

      {/* Stats Cards - Specific to Doctor Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-8 mb-6">
        <StatCard
          title="Total Patients"
          value={metrics ? formatNumber(metrics.totalPatients) : '0'}
          change={hasNoData ? "No data" : "+12.5%"}
          subtitle={hasNoData ? "No data" : "+12.5%"}
          icon={FaUserMd}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Total Appointments"
          value={metrics ? formatNumber(metrics.totalAppointments) : '0'}
          change={hasNoData ? "No data" : "+15.2%"}
          subtitle={hasNoData ? "No data" : "+15.2%"}
          icon={FaCalendarCheck}
          iconColor="text-green-500"
        />
        <StatCard
          title="Completed"
          value={metrics ? formatNumber(metrics.completedAppointments) : '0'}
          change={hasNoData ? "No data" : "+8.3%"}
          subtitle={hasNoData ? "No data" : "+8.3%"}
          icon={FaCheckCircle}
          iconColor="text-teal-500"
        />
        <StatCard
          title="Pending"
          value={metrics ? formatNumber(metrics.pendingAppointments) : '0'}
          change={hasNoData ? "No data" : "+5.7%"}
          subtitle={hasNoData ? "No data" : "+5.7%"}
          icon={FaClock}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Cancelled"
          value={metrics ? formatNumber(metrics.cancelledAppointments) : '0'}
          change={hasNoData ? "No data" : "-3.7%"}
          subtitle={hasNoData ? "No data" : "-3.7%"}
          icon={FaTimesCircle}
          iconColor="text-red-500"
        />
        <StatCard
          title="Total Revenue"
          value={metrics ? formatCurrency(metrics.totalRevenue) : '₹0'}
          change={hasNoData ? "No data" : "+10.7%"}
          subtitle={hasNoData ? "No data" : "+10.7%"}
          icon={FaRupeeSign}
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Today's Revenue"
          value={metrics ? formatCurrency(metrics.todayRevenue) : '₹0'}
          change={hasNoData ? "No data" : "+5.2%"}
          subtitle={hasNoData ? "No data" : "+5.2%"}
          icon={FaChartLine}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Avg Consult Time"
          value={metrics ? `${Math.round(metrics.averageConsultationTime)} min` : '0 min'}
          change={hasNoData ? "No data" : "-2.1%"}
          subtitle={hasNoData ? "No data" : "-2.1%"}
          icon={FaClock}
          iconColor="text-gray-500"
        />
      </div>

      {/* Show a message if there's no data */}
      {hasNoData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No patient data found for your doctor account. This could be because:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>You haven't treated any patients yet</li>
                  <li>Your doctor profile might not be properly set up</li>
                  <li>There might be an issue with data filtering</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TopServicesChart
          filterType={filterType}
          presetPeriod={presetPeriod}
          startDate={startDate}
          endDate={endDate}
        />
        <SalesChart
          filterType={filterType}
          presetPeriod={presetPeriod}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {/* Patient Statistics and Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <UpcomingAppointments
          filterType={filterType}
          presetPeriod={presetPeriod}
          startDate={startDate}
          endDate={endDate}
        />
        <ClientFeedback />
      </div>
    </div>
  );
}