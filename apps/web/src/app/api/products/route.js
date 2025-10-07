import { NextResponse } from "next/server";

// Mock data as fallback when CRM API is not available
const mockProducts = [
  {
    _id: "1",
    id: "1",
    productName: "Radiant Glow Serum",
    name: "Radiant Glow Serum",
    price: 45.99,
    salePrice: 39.99,
    productImage: "https://images.unsplash.com/photo-1526947425969-2c925c7fcc39?w=320&h=224&fit=crop",
    image: "https://images.unsplash.com/photo-1526947425969-2c925c7fcc39?w=320&h=224&fit=crop",
    description: "A powerful vitamin C serum that brightens and evens skin tone",
    category: "skincare",
    categoryName: "skincare",
    vendorName: "Aura Cosmetics",
    businessName: "Aura Cosmetics",
    status: "approved"
  },
  {
    _id: "2",
    id: "2",
    productName: "Luxury Face Cream",
    name: "Luxury Face Cream",
    price: 78.50,
    productImage: "https://images.unsplash.com/photo-1526947425969-2c925c7fcc39?w=320&h=224&fit=crop",
    image: "https://images.unsplash.com/photo-1526947425969-2c925c7fcc39?w=320&h=224&fit=crop",
    description: "Rich anti-aging cream with peptides and hyaluronic acid",
    category: "skincare",
    categoryName: "skincare",
    vendorName: "Serenity Skincare",
    businessName: "Serenity Skincare",
    status: "approved"
  },
  {
    _id: "3",
    id: "3",
    productName: "Matte Lipstick Set",
    name: "Matte Lipstick Set",
    price: 32.00,
    salePrice: 28.99,
    productImage: "https://images.unsplash.com/photo-1526947425969-2c925c7fcc39?w=320&h=224&fit=crop",
    image: "https://images.unsplash.com/photo-1526947425969-2c925c7fcc39?w=320&h=224&fit=crop",
    description: "Set of 6 long-lasting matte lipsticks in trending shades",
    category: "cosmetics",
    categoryName: "cosmetics",
    vendorName: "Chroma Beauty",
    businessName: "Chroma Beauty",
    status: "approved"
  },
  {
    _id: "4",
    id: "4",
    productName: "Gentle Cleansing Oil",
    name: "Gentle Cleansing Oil",
    price: 28.75,
    productImage: "https://images.unsplash.com/photo-1526947425969-2c925c7fcc39?w=320&h=224&fit=crop",
    image: "https://images.unsplash.com/photo-1526947425969-2c925c7fcc39?w=320&h=224&fit=crop",
    description: "Natural cleansing oil that removes makeup and impurities",
    category: "facecare",
    categoryName: "facecare",
    vendorName: "Earthly Essentials",
    businessName: "Earthly Essentials",
    status: "approved"
  }
];

// GET - Fetch approved vendor products from CRM
export async function GET() {
  try {
    // In production, this should be the actual CRM URL
    const crmUrl = "http://localhost:3001/api/crm/vendor/products";
    
    console.log("Fetching products from CRM:", crmUrl);
    
    const response = await fetch(crmUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });
    
    console.log("CRM API response status:", response.status);
    
    if (!response.ok) {
      console.error(`CRM API error: ${response.status} ${response.statusText}`);
      // Fallback to mock data when CRM API fails
      return NextResponse.json(mockProducts, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }
    
    const products = await response.json();
    console.log("Products fetched from CRM:", products.length);
    
    // Transform CRM product data to match the web app's expected format
    const transformedProducts = products.map(product => {
      // Log product data for debugging
      console.log("Processing product:", product._id, product.productName);
      
      // Ensure all required fields are present and properly formatted
      const transformedProduct = {
        _id: product._id || product.id,
        id: product._id || product.id,
        productName: product.productName || product.name || "Unnamed Product",
        name: product.productName || product.name || "Unnamed Product",
        price: product.price || 0,
        salePrice: product.salePrice,
        productImage: product.productImage || product.image || "",
        image: product.productImage || product.image || "",
        description: product.description || "",
        vendorName: product.vendorName || product.businessName || "Unknown Vendor",
        businessName: product.businessName || product.vendorName || "Unknown Vendor",
        category: product.category || product.categoryName || "General",
        categoryName: product.categoryName || product.category || "General",
        status: product.status || "pending",
      };
      
      // Log transformed product for debugging
      console.log("Transformed product:", transformedProduct._id, transformedProduct.productName);
      
      return transformedProduct;
    });
    
    // If we get an empty response or error from CRM, fallback to mock data
    if (!transformedProducts || (Array.isArray(transformedProducts) && transformedProducts.length === 0)) {
      console.warn("No products found from CRM, using mock data");
      return NextResponse.json(mockProducts, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }
    
    // Add CORS headers for public access
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    
    return NextResponse.json(transformedProducts, { headers });
  } catch (error) {
    console.error("Error fetching products from CRM:", error);
    // Fallback to mock data when CRM API is not accessible
    return NextResponse.json(mockProducts, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  return new NextResponse(null, { headers });
}