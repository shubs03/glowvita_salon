
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { User, Building, Stethoscope, ArrowRight, ArrowLeft } from 'lucide-react';
import { VendorRegistrationForm } from '@/components/forms/VendorRegistrationForm';
import { DoctorRegistrationForm } from '@/components/forms/DoctorRegistrationForm';
import { SupplierRegistrationForm } from '@/components/forms/SupplierRegistrationForm';
import { cn } from '@repo/ui/cn';

type Role = 'vendor' | 'doctor' | 'supplier' | null;

const RoleCard = ({ icon: Icon, title, description, onClick, isSelected }) => (
  <div 
    className={cn(
        "p-6 text-center cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl",
        "bg-background/50 backdrop-blur-sm border",
        isSelected 
            ? 'border-primary ring-2 ring-primary shadow-xl' 
            : 'border-border/20 hover:border-primary/50'
    )}
    onClick={onClick}
  >
    <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 transform group-hover:scale-110",
        isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
    )}>
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1">{description}</p>
  </div>
);

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  
  const handleSuccess = () => {
    // This will be used later to transition to the onboarding steps
    router.push('/dashboard'); 
  };

  const renderForm = () => {
    switch(selectedRole) {
      case 'vendor':
        return <VendorRegistrationForm onSuccess={handleSuccess} />;
      case 'doctor':
        return <DoctorRegistrationForm onSuccess={handleSuccess} />;
      case 'supplier':
        return (
            <div className="max-w-2xl mx-auto">
                <SupplierRegistrationForm onSuccess={handleSuccess} />
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center p-4">
      <main className="w-full max-w-4xl">
        {!selectedRole ? (
          <div className="bg-background/70 backdrop-blur-sm border-white/20 shadow-2xl shadow-blue-500/10 p-8 rounded-lg">
            <h1 className="text-3xl font-bold text-center mb-2">Join Our Platform</h1>
            <p className="text-muted-foreground text-center mb-8">Choose your role to get started.</p>
            <div className="grid md:grid-cols-3 gap-6">
              <RoleCard 
                icon={Building} 
                title="Salon/Vendor" 
                description="Register your salon or spa to manage bookings and clients."
                onClick={() => setSelectedRole('vendor')}
                isSelected={selectedRole === 'vendor'}
              />
              <RoleCard 
                icon={Stethoscope} 
                title="Doctor/Dermatologist" 
                description="Join as a professional to offer consultations and services."
                onClick={() => setSelectedRole('doctor')}
                isSelected={selectedRole === 'doctor'}
              />
              <RoleCard 
                icon={User} 
                title="Supplier" 
                description="Register as a supplier to provide products to our vendors."
                onClick={() => setSelectedRole('supplier')}
                isSelected={selectedRole === 'supplier'}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <div>
            <Button variant="ghost" onClick={() => setSelectedRole(null)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4"/> Back to role selection
            </Button>
            {renderForm()}
          </div>
        )}
      </main>
    </div>
  );
}
