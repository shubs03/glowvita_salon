import { useState, useEffect } from 'react';

interface ShippingConfig {
  chargeType: 'fixed' | 'percentage';
  amount: number;
  isEnabled: boolean;
}

export const useVendorShippingConfig = (vendorId: string | undefined) => {
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShippingConfig = async () => {
      if (!vendorId) {
        setShippingConfig(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/vendor/${vendorId}/shipping`);
        const data = await response.json();

        if (data.success) {
          setShippingConfig(data.data);
        } else {
          setError(data.message || 'Failed to fetch shipping configuration');
        }
      } catch (err) {
        setError('Failed to fetch shipping configuration');
        console.error('Error fetching vendor shipping config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingConfig();
  }, [vendorId]);

  return { shippingConfig, loading, error };
};