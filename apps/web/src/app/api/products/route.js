import { NextResponse } from "next/server";

// Mock product data - in a real app, this would come from a database
const mockProducts = [
  {
    id: '1',
    name: 'Aura Serum',
    description: 'Revitalizing serum for a radiant glow.',
    price: 68.00,
    salePrice: 58.00,
    image: 'https://picsum.photos/id/1027/400/400',
    hint: 'skincare product bottle',
    rating: 4.5,
    reviewCount: 812,
    vendorName: 'Aura Cosmetics',
    isNew: true,
    category: 'Skincare',
  },
  {
    id: '2',
    name: 'Chroma Balm',
    description: 'Hydrating lip balm with a hint of color.',
    price: 24.00,
    image: 'https://picsum.photos/id/1028/400/400',
    hint: 'cosmetic balm',
    rating: 4.8,
    reviewCount: 1254,
    vendorName: 'Chroma Beauty',
    category: 'Cosmetics',
  },
  {
    id: '3',
    name: 'Zen Mist',
    description: 'Calming facial mist for instant hydration.',
    price: 35.00,
    salePrice: 29.99,
    image: 'https://picsum.photos/id/1029/400/400',
    hint: 'spray bottle',
    rating: 4.7,
    reviewCount: 987,
    vendorName: 'Serenity Skincare',
    category: 'Skincare',
  },
  {
    id: '4',
    name: 'Terra Scrub',
    description: 'Exfoliating body scrub with natural minerals.',
    price: 48.00,
    image: 'https://picsum.photos/id/1031/400/400',
    hint: 'cosmetic jar',
    rating: 4.9,
    reviewCount: 2310,
    vendorName: 'Earthly Essentials',
    isNew: true,
    category: 'Body Care',
  },
  {
    id: '5',
    name: 'Luminous Cream',
    description: 'Brightening day cream with SPF 30.',
    price: 55.00,
    image: 'https://picsum.photos/id/1032/400/400',
    hint: 'cream jar',
    rating: 4.6,
    reviewCount: 742,
    vendorName: 'Radiant Skin',
    category: 'Skincare',
  },
  {
    id: '6',
    name: 'Ocean Essence',
    description: 'Hydrating serum with marine extracts.',
    price: 72.00,
    salePrice: 65.00,
    image: 'https://picsum.photos/id/1033/400/400',
    hint: 'serum bottle',
    rating: 4.8,
    reviewCount: 1156,
    vendorName: 'Aqua Beauty',
    category: 'Skincare',
  },
  {
    id: '7',
    name: 'Bloom Perfume',
    description: 'Floral fragrance for day and night.',
    price: 85.00,
    image: 'https://picsum.photos/id/1035/400/400',
    hint: 'perfume bottle',
    rating: 4.9,
    reviewCount: 1876,
    vendorName: 'Floral Essence',
    isNew: true,
    category: 'Fragrance',
  },
  {
    id: '8',
    name: 'Mineral Mask',
    description: 'Detoxifying clay mask with minerals.',
    price: 38.00,
    image: 'https://picsum.photos/id/1036/400/400',
    hint: 'mask jar',
    rating: 4.4,
    reviewCount: 632,
    vendorName: 'Pure Earth',
    category: 'Face Care',
  },
];

// GET - Fetch all products
export async function GET(request) {
  try {
    // In a real app, you would fetch from a database
    // For now, we'll return the mock data
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    
    let filteredProducts = mockProducts;
    
    // Apply category filter
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply search filter
    if (search) {
      filteredProducts = filteredProducts.filter(
        product => 
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase()) ||
          product.vendorName.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        filteredProducts = filteredProducts.slice(0, limitNum);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: filteredProducts,
      count: filteredProducts.length
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Error fetching products", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}