"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { CheckCircle2, ShoppingBag } from 'lucide-react';


export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg mx-auto border border-gray-100 dark:border-gray-700">
        <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Thank you for your order!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Your order has been placed successfully. You will receive an email confirmation shortly with your order details.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => router.push('/products')}
            className="bg-primary hover:bg-primary/90"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/profile/orders')}
          >
            View My Orders
          </Button>
        </div>
      </div>
    </div>
  );
}