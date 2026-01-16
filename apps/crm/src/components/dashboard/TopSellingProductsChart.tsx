"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a4de6c", "#d0ed57"];

interface TopProductData {
  productName: string;
  quantitySold: number;
  totalSales: number;
}

interface TopSellingProductsChartProps {
  filterType?: 'preset' | 'custom';
  presetPeriod?: 'day' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
}

// Helper function to format date for display
const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export function TopSellingProductsChart({ 
  filterType = 'preset', 
  presetPeriod = 'all', 
  startDate = '', 
  endDate = '' 
}: TopSellingProductsChartProps) {
  const [data, setData] = useState<TopProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        // Build query params based on filter parameters
        let url = '/api/crm/vendor/reports/sales-by-product';
        const params = new URLSearchParams();
        
        // Handle custom date range
        if (filterType === 'custom' && startDate && endDate) {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        } 
        // Handle preset periods
        else if (presetPeriod && presetPeriod !== 'all') {
          params.append('period', presetPeriod);
        }
        
        // Append query parameters if any exist
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.salesByProduct) {
            // Get top 5 products by quantity sold
            const topProducts = result.data.salesByProduct
              .sort((a: any, b: any) => b.quantitySold - a.quantitySold)
              .slice(0, 5);
            setData(topProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching top selling products:', error);
        // Fallback to mock data on error
        setData([
          { productName: 'Lipstick', quantitySold: 25, totalSales: 5000 },
          { productName: 'Foundation', quantitySold: 20, totalSales: 8000 },
          { productName: 'Mascara', quantitySold: 18, totalSales: 3600 },
          { productName: 'Eyeliner', quantitySold: 15, totalSales: 3000 },
          { productName: 'Blush', quantitySold: 12, totalSales: 2400 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellingProducts();
  }, [filterType, presetPeriod, startDate, endDate]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Based on delivered products and sales data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage calculation
  const totalQuantity = data.reduce((sum, item) => sum + item.quantitySold, 0);

  // Format data with explicit percentages for display
  const formattedData = data.map(item => ({
    ...item,
    percentage: totalQuantity > 0 ? (item.quantitySold / totalQuantity) * 100 : 0
  }));

  // Custom tooltip to show detailed information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-2 rounded shadow-sm">
          <p className="font-semibold">{data.productName}</p>
          <p>Quantity Sold: {data.quantitySold}</p>
          <p>Total Sales: ₹{data.totalSales.toFixed(2)}</p>
          <p>Percentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>
          {filterType === 'custom' 
            ? `Top selling products from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}.`
            : presetPeriod === 'day' 
              ? "Top selling products today."
              : presetPeriod === 'month' 
                ? "Top selling products this month."
                : presetPeriod === 'year' ? "Top selling products this year."
                  : "Top selling products. All time."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="quantitySold"
                nameKey="productName"
                label={({ productName, percentage }) => `${productName}: ${percentage.toFixed(0)}%`}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No product sales data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}