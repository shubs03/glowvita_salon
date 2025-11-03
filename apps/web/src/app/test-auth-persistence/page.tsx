"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@repo/store/hooks';
import { setUserAuth } from '@repo/store/slices/userAuthSlice';
import { Button } from '@repo/ui/button';

export default function TestAuthPersistence() {
  const { isAuthenticated, user, token } = useAuth();
  const dispatch = useAppDispatch();
  const [testUser, setTestUser] = useState({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com'
  });
  const [testToken, setTestToken] = useState('test-token-12345');

  const simulateLogin = () => {
    dispatch(setUserAuth({
      user: testUser,
      token: testToken,
      role: 'USER',
      permissions: []
    }));
  };

  const checkLocalStorage = () => {
    const authState = localStorage.getItem('userAuthState');
    console.log('Current localStorage userAuthState:', authState);
    alert(`Current localStorage userAuthState: ${authState || 'null'}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Auth Persistence Test</h1>
        
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h2 className="text-lg font-semibold mb-2">Current Auth State:</h2>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user ? user.name : 'None'}</p>
          <p><strong>Token:</strong> {token ? 'Present' : 'None'}</p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={simulateLogin} 
            className="w-full"
          >
            Simulate Login
          </Button>
          
          <Button 
            onClick={checkLocalStorage} 
            variant="outline"
            className="w-full"
          >
            Check LocalStorage
          </Button>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="w-full"
          >
            Refresh Page
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>Instructions:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click "Simulate Login"</li>
            <li>Click "Check LocalStorage" to verify state is saved</li>
            <li>Click "Refresh Page" to test persistence</li>
            <li>After refresh, check if auth state is still present</li>
          </ol>
        </div>
      </div>
    </div>
  );
}