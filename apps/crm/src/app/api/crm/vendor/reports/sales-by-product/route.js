import { NextResponse } from "next/server";
import _db from '@repo/lib/db';
import ClientOrderModel from '@repo/lib/models/user/ClientOrder.model';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import ProductCategoryModel from '@repo/lib/models/admin/ProductCategory';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();
// Helper function to calculate date ranges based on filter period
const getDateRanges = (period) => {
  const now = new Date();
  
  let startDate, endDate;
  
  if (period === 'day' || period === 'today') {
    // Today only
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === 'yesterday') {
    // Yesterday only
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
  } else if (period === 'week') {
    // Current week
    const dayOfWeek = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    // Current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'year') {
    // Current year
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    // All time
    startDate = new Date(2020, 0, 1); // Default to beginning of 2020
    endDate = new Date(now.getFullYear() + 1, 0, 1, 23, 59, 59, 999);
  }
  
  return { startDate, endDate };
};

// GET - Fetch sales by product report
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId.toString();
    const { searchParams } = new URL(req.url);
    
    // Get filter parameters
    const period = searchParams.get('period') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const productFilter = searchParams.get('product');
    const customerFilter = searchParams.get('customer');
    const statusFilter = searchParams.get('status');
    const categoryFilter = searchParams.get('category');
    const brandFilter = searchParams.get('brand');
    
    // Determine date range
    let startDate, endDate;
    
    // Handle special periods (today, yesterday) with proper date range
    if (period === 'today' || period === 'yesterday') {
      const dateRange = getDateRanges(period);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    } else if (startDateParam && endDateParam) {
      // Parse dates from parameters
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      
      // Ensure we're working with proper date objects
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        // Fallback to period-based dates if parsing fails
        const dateRange = getDateRanges(period);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      }
      
      // For same-day custom ranges (like today/yesterday sent from frontend),
      // ensure we capture the full day
      if (startDate.toDateString() === endDate.toDateString()) {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
      }
    } else {
      const dateRange = getDateRanges(period);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }
    
    // Base query for orders - only include delivered/completed orders for sales reporting
    const baseQuery = {
      vendorId: vendorId,
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'Delivered' // Only include delivered orders in sales reports
    };
    
    // Apply additional filters if provided
    // Note: ClientOrder model doesn't have customerName field, using userId instead
    if (customerFilter && customerFilter !== '') {
      // This would require a more complex query to match customer names
      // For now, we'll skip this filter as it's not directly supported
    }
    
    if (statusFilter && statusFilter !== '') {
      baseQuery.status = statusFilter;
    }
    
    // Fetch all orders within date range
    let allOrders = await ClientOrderModel.find(baseQuery)
      .sort({ createdAt: 1 });
    
    // Handle case where no orders are found
    if (!allOrders || allOrders.length === 0) {
      return NextResponse.json({
        success: true,
        data: { salesByProduct: [] },
        filters: {
          period,
          startDate,
          endDate,
          product: productFilter || null,
          customer: customerFilter || null,
          status: statusFilter || null
        }
      });
    }
    
    // Get all products for the vendor to enrich the report data
    // Apply filters for product name, category, and brand
    const productQuery = { vendorId: vendorId };
    
    if (productFilter && productFilter !== '' && productFilter !== 'all') {
      productQuery.productName = { $regex: productFilter, $options: 'i' };
    }
    
    if (brandFilter && brandFilter !== '' && brandFilter !== 'all') {
      productQuery.brand = brandFilter; // Exact match for brand
    }
    
    let vendorProducts = await ProductModel.find(productQuery);
    
    // Apply category filter after fetching products since category is stored as an ID in products
    if (categoryFilter && categoryFilter !== '' && categoryFilter !== 'all') {
      // Find the category by name to get its ID
      const trimmedCategoryFilter = categoryFilter.trim();
      const matchingCategory = await ProductCategoryModel.findOne({
        name: trimmedCategoryFilter
      });
      
      if (matchingCategory) {
        // Filter products by the matching category ID
        const matchingCategoryId = matchingCategory._id.toString();
        vendorProducts = vendorProducts.filter(product => {
          if (!product.category) return false;
          
          // Convert both values to string for comparison
          const productCategoryId = product.category.toString().trim();
          return productCategoryId === matchingCategoryId;
        });
      } else {
        // If no matching category found, return empty array
        vendorProducts = [];
      }
    }
    
    // Debug: Log the number of products after filtering
    console.log(`Products after filtering: ${vendorProducts.length}`);
    if (vendorProducts.length > 0) {
      vendorProducts.forEach(product => {
        console.log(`Product: ${product.productName}, Category: ${product.category}, Brand: ${product.brand}`);
      });
    }
    
    // Handle case where no products are found
    if (!vendorProducts || vendorProducts.length === 0) {
      return NextResponse.json({
        success: true,
        data: { salesByProduct: [] },
        filters: {
          period,
          startDate,
          endDate,
          product: productFilter || null,
          customer: customerFilter || null,
          status: statusFilter || null,
          category: categoryFilter || null,
          brand: brandFilter || null
        }
      });
    }
    const productMap = {};
    vendorProducts.forEach(product => {
      productMap[product._id.toString()] = product;
    });
        
    // Get all categories to map category IDs to names
    const categories = await ProductCategoryModel.find();
    
    // Handle case where no categories are found (shouldn't happen but just in case)
    const categoryMap = {};
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        categoryMap[category._id.toString()] = category.name;
      });
    }
        
    // Sales by product with enhanced financial details
    const salesByProduct = {};
        
    // Process each order and aggregate by product
    allOrders.forEach(order => {
      // Process each item in the order
      order.items.forEach(item => {
        // Apply product filter if provided
        if (productFilter && productFilter !== '') {
          if (!item.name.toLowerCase().includes(productFilter.toLowerCase())) {
            return; // Skip this item if it doesn't match the filter
          }
        }
            
        const productId = item.productId ? item.productId.toString() : null;
        
        // Skip items without a valid product ID
        if (!productId) {
          console.warn('Skipping item without valid product ID:', item);
          return;
        }
        
        const productName = item.name || 'Unknown Product';
            
        // Get product details if available
        const productDetails = productMap[productId];
            
        if (!salesByProduct[productId]) {
          salesByProduct[productId] = {
            productId: productId,
            productName: productName,
            brand: productDetails?.brand || 'N/A',
            productCategory: productDetails?.category ? categoryMap[productDetails.category.toString()] || 'N/A' : 'N/A',
            unitsSold: 0,
            grossSales: 0, // before discounts/tax
            discountAmount: 0,
            netSales: 0,
            taxAmount: 0,
            totalSales: 0, // Net + Tax
            costOfGoodsSold: 0, // COGS
            grossProfit: 0,
            grossMarginPercentage: 0,
            averageSellingPrice: 0
          };
        }
            
        // Update product sales data
        const quantity = item.quantity || 0;
        const unitPrice = item.price || 0;
        const itemTotal = unitPrice * quantity;
            
        salesByProduct[productId].unitsSold += quantity;
        salesByProduct[productId].grossSales += itemTotal;
            
        // For now, we're setting discounts/tax to 0 as the ClientOrder model
        // doesn't have these fields. In a real implementation, these would come
        // from the order or be calculated based on business rules.
        // We'll assume 0 discounts and 0 tax for now
        const discount = 0;
        const tax = 0;
            
        salesByProduct[productId].discountAmount += discount;
        salesByProduct[productId].taxAmount += tax;
        salesByProduct[productId].netSales += (itemTotal - discount);
        salesByProduct[productId].totalSales += (itemTotal - discount + tax);
            
        // Calculate COGS, Gross Profit and Gross Margin %
        // Assuming COGS is 60% of net sales as an example
        const cogs = (itemTotal - discount) * 0.6;
        const grossProfit = (itemTotal - discount) - cogs;
        const grossMarginPercentage = (itemTotal - discount) > 0 ? (grossProfit / (itemTotal - discount)) * 100 : 0;
            
        salesByProduct[productId].costOfGoodsSold += cogs;
        salesByProduct[productId].grossProfit += grossProfit;
        // Will recalculate average gross margin percentage at the end
      });
    });
        
    // Handle case where no sales data was processed
    if (Object.keys(salesByProduct).length === 0) {
      return NextResponse.json({
        success: true,
        data: { salesByProduct: [] },
        filters: {
          period,
          startDate,
          endDate,
          product: productFilter || null,
          customer: customerFilter || null,
          status: statusFilter || null
        }
      });
    }
    
    // Recalculate gross margin percentage for each product
    Object.keys(salesByProduct).forEach(productId => {
      const product = salesByProduct[productId];
      if (product.netSales > 0) {
        product.grossMarginPercentage = (product.grossProfit / product.netSales) * 100;
      } else {
        product.grossMarginPercentage = 0;
      }
          
      // Calculate average selling price
      product.averageSellingPrice = product.unitsSold > 0 ? product.netSales / product.unitsSold : 0;
          
      // Round all monetary values to 2 decimal places
      product.grossSales = parseFloat(product.grossSales.toFixed(2));
      product.discountAmount = parseFloat(product.discountAmount.toFixed(2));
      product.netSales = parseFloat(product.netSales.toFixed(2));
      product.taxAmount = parseFloat(product.taxAmount.toFixed(2));
      product.totalSales = parseFloat(product.totalSales.toFixed(2));
      product.costOfGoodsSold = parseFloat(product.costOfGoodsSold.toFixed(2));
      product.grossProfit = parseFloat(product.grossProfit.toFixed(2));
      product.grossMarginPercentage = parseFloat(product.grossMarginPercentage.toFixed(2));
      product.averageSellingPrice = parseFloat(product.averageSellingPrice.toFixed(2));
    });
    // Convert to array and sort by total sales amount
    const salesByProductArray = Object.values(salesByProduct).sort((a, b) => b.totalSales - a.totalSales);
    
    const responseData = {
      salesByProduct: salesByProductArray.map(product => ({
        ...product,
        // Map to the field names expected by the frontend
        productId: product.productId,
        productName: product.productName,
        brand: product.brand,
        category: product.productCategory,
        quantitySold: product.unitsSold,
        grossSales: product.grossSales,
        discountAmount: product.discountAmount,
        netSales: product.netSales,
        taxAmount: product.taxAmount,
        totalSales: product.totalSales,
        averageSellingPrice: product.averageSellingPrice,
        cogs: product.costOfGoodsSold,
        grossProfit: product.grossProfit,
        grossMarginPercent: product.grossMarginPercentage,
        // Status field for filtering delivered products
        status: 'delivered'
      }))
    };
    return NextResponse.json({
      success: true,
      data: responseData,
      filters: {
        period,
        startDate,
        endDate,
        product: productFilter || null,
        customer: customerFilter || null,
        status: statusFilter || null,
        category: categoryFilter || null,
        brand: brandFilter || null
      }
    });
    
  } catch (error) {
    console.error("Error fetching sales by product report:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        filters: {
          period,
          startDate,
          endDate,
          product: productFilter || null,
          customer: customerFilter || null,
          status: statusFilter || null,
          category: categoryFilter || null,
          brand: brandFilter || null
        }
      },
      { status: 500 }
    );
  }
});