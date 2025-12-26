"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

interface ProductData {
  product: string;
  vendor: string;
  city: string;
  sale: string;
  rawSale: number;
  productSold: number;
  productPlatformFee: number;
  productGST: number;
  type: string;
}

export function SalesOfProductsChart({ productsData, filterType, filterValue }: { productsData?: ProductData[], filterType?: string, filterValue?: string }) {
  // Format the data for the chart - aggregate products data
  const chartData = productsData?.map((product: ProductData) => ({
    name: product.product,
    value: product.productPlatformFee, // Use platform fee for the chart
    sales: product.productSold,
    platformFee: product.productPlatformFee,
    gst: product.productGST,
    vendor: product.vendor,
    city: product.city,
    type: product.type,
    totalAmount: product.rawSale // Total amount is the sale amount
  })).filter(item => item.value > 0) || []; // Filter out items with zero value for pie chart

  // Check if we have products data
  const hasProducts = chartData.length > 0;
  
  // Show message when filter is selected but no value chosen
  if (filterType && !filterValue) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-center p-4">
          <div className="text-lg font-medium">Please select a {filterType} to view product sales data.</div>
          <div className="text-sm text-gray-500 mt-2">
            Select a specific {filterType} value to see the product sales chart.
          </div>
        </div>
      </div>
    );
  }
  
  if (!hasProducts) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-center p-4">
          <div className="text-lg font-medium">No product platform fee data available yet.</div>
          <div className="text-sm text-gray-500 mt-2">
            Product platform fee data will appear once orders are delivered.
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltip to show detailed product information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-4 rounded-md shadow-md">
          <p className="font-bold text-lg">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">Product Total Amount:</span> ₹{data.totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-sm">
            <span className="font-medium">Product Platform Fee:</span> ₹{data.platformFee?.toLocaleString('en-IN') || '0.00'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Product Sold:</span> {data.sales}
          </p>
          <p className="text-sm">
            <span className="font-medium">Percentage:</span> {payload[0].percent ? (payload[0].percent * 100).toFixed(1) + '%' : 'N/A'}
          </p>
        </div>
      );
    }
    return null;
  };



  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          name="Product Platform Fee"
          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
}