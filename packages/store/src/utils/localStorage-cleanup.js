// Utility to clear problematic localStorage data
// This helps fix the QuotaExceededError issue

export const clearProblematicLocalStorage = () => {
  const problematicKeys = [
    'serviceState', // Old service state that could contain large objects
    // Add other problematic keys here if found
  ];

  problematicKeys.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        console.log(`Clearing problematic localStorage key: ${key}`);
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