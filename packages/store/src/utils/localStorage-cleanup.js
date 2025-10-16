// Utility to clear problematic localStorage data
// This helps fix the QuotaExceededError issue

export const clearProblematicLocalStorage = () => {
  const problematicKeys = [
    'serviceState', // Old service state that could contain large objects
    'crmAuthState',
    'userAuthState',
    'adminAuthState',
    // Add other problematic keys here if found
  ];

  // Also clear any keys that contain 'token' or 'auth'
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('token') || key.includes('auth')
  );
  
  const allKeysToClear = [...problematicKeys, ...authKeys];

  allKeysToClear.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        console.log(`Clearing localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`Failed to clear localStorage key ${key}:`, e);
    }
  });
};

// Auto-clear on import if running in browser
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  clearProblematicLocalStorage();
}