"use client";

import { useCreatePaymentOrderMutation } from '@repo/store/api';

export default function ApiTestPage() {
  const [createPaymentOrder] = useCreatePaymentOrderMutation();

  const testApi = async () => {
    try {
      console.log('Testing payment order API...');
      const result = await createPaymentOrder({
        amount: 100,
        receipt: 'test_receipt_123'
      }).unwrap();
      console.log('API Test Result:', result);
      alert('API Test Successful! Check console for details.');
    } catch (error) {
      console.error('API Test Error:', error);
      alert('API Test Failed! Check console for error details.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <button 
        onClick={testApi}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Payment Order API
      </button>
      <div className="mt-4 text-sm text-gray-600">
        <p>This will test the payment order creation API endpoint.</p>
        <p>Expected URL: http://localhost:3000/api/payments/create-order</p>
        <p>Check browser console and network tab for details.</p>
      </div>
    </div>
  );
}