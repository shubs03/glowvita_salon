
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from "@repo/ui/card";
import { Button } from '@repo/ui/button';
import { User, Building, Stethoscope, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { VendorRegistrationForm } from '@/components/forms/VendorRegistrationForm';
import { DoctorRegistrationForm } from '@/components/forms/DoctorRegistrationForm';
import { SupplierRegistrationForm } from '@/components/forms/SupplierRegistrationForm';
import { cn } from '@repo/ui/cn';

type Role = 'vendor' | 'doctor' | 'supplier' | null;

const RoleCard = ({ icon: Icon, title, description, onClick, isSelected }) => (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-xl border-2 bg-background p-6 text-left shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2",
        isSelected
          ? "border-primary ring-4 ring-primary/20"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300",
            isSelected
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {isSelected && (
        <div className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-background">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )}
    </div>
);

const SuccessModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
        return <SupplierRegistrationForm onSuccess={handleRegistrationSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/50 to-background flex items-center justify-center p-4">
      <main className="w-full max-w-4xl transition-all duration-500">
        {!selectedRole ? (
          <Card className="w-full shadow-2xl border-border/50">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight mb-3">
                  Join Our Professional Network
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Select the role that best describes you to begin your journey with us.
                </p>
              </div>
              
              <div className="mt-10 grid grid-cols-1 gap-6">
                <RoleCard 
                  icon={Building} 
                  title="Salon or Spa Owner" 
                  description="Register your business to manage bookings, staff, and clients all in one place."
                  onClick={() => setSelectedRole('vendor')}
                  isSelected={selectedRole === 'vendor'}
                />
                <RoleCard 
                  icon={Stethoscope} 
                  title="Doctor or Dermatologist" 
                  description="Offer your professional services and consultations to a wider audience."
                  onClick={() => setSelectedRole('doctor')}
                  isSelected={selectedRole === 'doctor'}
                />
                <RoleCard 
                  icon={User} 
                  title="Product Supplier" 
                  description="Partner with us to provide quality products to our network of salons and professionals."
                  onClick={() => setSelectedRole('supplier')}
                  isSelected={selectedRole === 'supplier'}
                />
              </div>

              <div className="mt-10 text-center text-sm text-muted-foreground">
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Button variant="ghost" onClick={() => setSelectedRole(null)} className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to role selection
            </Button>
            {renderForm()}
          </div>
        )}
      </main>
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
}
