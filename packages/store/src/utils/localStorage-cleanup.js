// Utility to clear problematic localStorage data
// This helps fix the QuotaExceededError issue

export const clearProblematicLocalStorage = () => {
  const problematicKeys = [
    'serviceState', // Old service state that could contain large objects
    // NOTE: We're intentionally NOT clearing current auth state keys:
    // 'crmAuthState', 'userAuthState', 'adminAuthState' are actively used
    // Add other problematic keys here if found
  ];

  // Only clear keys that contain 'token' or 'auth' but are NOT the current auth state keys
  const authKeys = Object.keys(localStorage).filter(key => 
    (key.includes('token') || key.includes('auth')) && 
    !['crmAuthState', 'userAuthState', 'adminAuthState'].includes(key)
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
// NOTE: We're disabling auto-clear to prevent clearing active auth state
// if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
//   clearProblematicLocalStorage();
// }