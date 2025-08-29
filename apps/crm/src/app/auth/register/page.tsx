
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from "@repo/ui/card";
import { Button } from '@repo/ui/button';
import { User, Building, Stethoscope, ArrowRight, CheckCircle2 } from 'lucide-react';
import { VendorRegistrationForm } from '@/components/forms/VendorRegistrationForm';
import { DoctorRegistrationForm } from '@/components/forms/DoctorRegistrationForm';
import { SupplierRegistrationForm } from '@/components/forms/SupplierRegistrationForm';

type Role = 'vendor' | 'doctor' | 'supplier' | null;

const RoleCard = ({ icon: Icon, title, description, onClick, isSelected }) => (
  <Card 
    className={`p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isSelected ? 'border-primary ring-2 ring-primary' : 'hover:border-gray-300'}`}
    onClick={onClick}
  >
    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
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
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <main className="w-full max-w-4xl">
        {!selectedRole ? (
          <Card>
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
              &larr; Back to role selection
            </Button>
            {renderForm()}
          </div>
        )}
      </main>
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
}
