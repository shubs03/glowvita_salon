"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { User, Building, Stethoscope, ArrowLeft } from 'lucide-react';
import { VendorRegistrationForm } from '@/components/forms/VendorRegistrationForm';
import { DoctorRegistrationForm } from '@/components/forms/Doct orRegistrationForm';
import { SupplierRegistrationForm } from '@/components/forms/SupplierRegistrationForm';
import { cn } from '@repo/ui/cn';

type Role = 'vendor' | 'doctor' | 'supplier' | null;

const RoleCard = ({ icon: Icon, title, description, onClick, isSelected }) => (
  <button 
    className={cn(
        "p-6 text-center cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl w-full rounded-lg",
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
  </button>
);

const RoleSelectionScreen = ({ onSelectRole }) => (
    <div className="w-full max-w-4xl mx-auto bg-background/70 backdrop-blur-sm border border-white/20 shadow-2xl shadow-blue-500/10 p-8 md:p-12 rounded-lg animate-in fade-in-50 duration-500">
        <h1 className="text-3xl font-bold text-center mb-2">Join Our Platform</h1>
        <p className="text-muted-foreground text-center mb-8">Choose your role to get started.</p>
        <div className="grid md:grid-cols-3 gap-6">
            <RoleCard 
                icon={Building} 
                title="Salon/Vendor" 
                description="Register your salon or spa to manage bookings and clients."
                onClick={() => onSelectRole('vendor')}
                isSelected={false}
            />
            <RoleCard 
                icon={Stethoscope} 
                title="Doctor/Dermatologist" 
                description="Join as a professional to offer consultations and services."
                onClick={() => onSelectRole('doctor')}
                isSelected={false}
            />
            <RoleCard 
                icon={User} 
                title="Supplier" 
                description="Register as a supplier to provide products to our vendors."
                onClick={() => onSelectRole('supplier')}
                isSelected={false}
            />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
            </Link>
        </p>
    </div>
);

const RegistrationFlow = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard'); 
  };

  const renderForm = () => {
    switch(selectedRole) {
      case 'vendor':
        return <VendorRegistrationForm onSuccess={handleSuccess} />;
      case 'doctor':
        return <DoctorRegistrationForm onSuccess={handleSuccess} />;
      case 'supplier':
        return <SupplierRegistrationForm onSuccess={handleSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex flex-col items-center justify-center p-4">
      {selectedRole && (
          <div className="w-full max-w-4xl mb-4">
              <Button variant="ghost" onClick={() => setSelectedRole(null)} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4"/> Back to role selection
              </Button>
          </div>
      )}
      {!selectedRole ? (
        <RoleSelectionScreen onSelectRole={setSelectedRole} />
      ) : (
        renderForm()
      )}
    </div>
  );
};

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegistrationFlow />
        </Suspense>
    )
}