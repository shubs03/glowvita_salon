
"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from '@repo/ui/button';
import { User, Building, Stethoscope, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { VendorRegistrationForm } from '@/components/forms/VendorRegistrationForm';
import { DoctorRegistrationForm } from '@/components/forms/DoctorRegistrationForm';
import { SupplierRegistrationForm } from '@/components/forms/SupplierRegistrationForm';
import { cn } from '@repo/ui/cn';

type Role = 'vendor' | 'doctor' | 'supplier' | null;

const RoleCard = ({ icon: Icon, title, description, onClick, isSelected }) => (
  <Card 
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
  </Card>
);

const SuccessModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full text-center p-8 bg-background/90 backdrop-blur-sm">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
        <p className="text-muted-foreground mb-6">You have successfully onboarded on the Glow Vita platform.</p>
        <Button onClick={() => router.push('/login')} className="w-full">
          Proceed to Login <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </div>
  );
};

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleRegistrationSuccess = () => {
    setShowSuccessModal(true);
  };

  const renderForm = () => {
    switch(selectedRole) {
      case 'vendor':
        return <VendorRegistrationForm onSuccess={handleRegistrationSuccess} />;
      case 'doctor':
        return <DoctorRegistrationForm onSuccess={handleRegistrationSuccess} />;
      case 'supplier':
        return (
            <div className="max-w-md mx-auto">
                <SupplierRegistrationForm onSuccess={handleRegistrationSuccess} />
            </div>
        );
      default:
        return null;
    }
  };

  if (selectedRole === 'vendor') {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
             <div className="container mx-auto px-4 py-8">
                 <Button variant="ghost" onClick={() => setSelectedRole(null)} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to role selection
                </Button>
                {renderForm()}
            </div>
            <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center p-4">
      <main className="w-full max-w-4xl">
        {!selectedRole ? (
          <Card className="bg-background/70 backdrop-blur-sm border-white/20 shadow-2xl shadow-blue-500/10">
            <CardContent className="p-8">
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
            </CardContent>
          </Card>
        ) : (
          <div>
            <Button variant="ghost" onClick={() => setSelectedRole(null)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4"/> Back to role selection
            </Button>
            {renderForm()}
          </div>
        )}
      </main>
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
}
