"use client";

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle
} from 'lucide-react';
import { cn } from '@repo/ui/cn';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedTab, setSelectedTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setProduct(data.data);
          setSelectedImage(data.data.image);
        } else {
          setError(data.message || 'Product not found');
        }
      } catch (err) {
        setError('Failed to fetch product details. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="aspect-square bg-muted rounded-2xl mb-4"></div>
                <div className="flex gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-square w-20 bg-muted rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                <div className="h-12 bg-muted rounded w-1/3 mb-8"></div>
                <div className="space-y-4 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded"></div>
                  ))}
                </div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center bg-card p-8 rounded-2xl shadow-xl max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Product</h2>
          <p className="text-muted-foreground mb-6">Failed to fetch product details. Please try again later.</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()} className="rounded-xl">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If product not found, show 404 page
  if (!product) {
    return notFound();
  }
  
  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  
  const handleAddToCart = () => {
    // In a real app, this would dispatch an action to add the product to cart
    console.log(`Added ${quantity} of ${product.name} to cart`);
  };
  
  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // In a real app, this would dispatch an action to add/remove from wishlist
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-muted-foreground">
            <li>
              <button 
                onClick={() => router.push('/')} 
                className="hover:text-primary transition-colors"
              >
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button 
                onClick={() => router.push('/products')} 
                className="hover:text-primary transition-colors"
              >
                Products
              </button>
            </li>
            <li>/</li>
            <li className="text-foreground truncate max-w-xs">{product.name}</li>
          </ol>
        </nav>
        
        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-card rounded-2xl overflow-hidden shadow-lg mb-4 relative group">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              {product.isNew && (
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-sm py-1 px-3 rounded-full">
                  NEW
                </Badge>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button 
                className={cn(
                  "aspect-square w-20 bg-card rounded-lg overflow-hidden border-2 flex-shrink-0",
                  selectedImage === product.image ? "border-primary shadow-md" : "border-transparent"
                )}
                onClick={() => setSelectedImage(product.image)}
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                />
              </button>
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <div className="mb-6">
              <Badge variant="secondary" className="mb-3 text-sm py-1 px-3 rounded-full">
                {product.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-muted-foreground mb-6">{product.vendorName}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      )} 
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            </div>
            
            {/* Price */}
            <div className="mb-8">
              {product.salePrice ? (
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold">₹{product.salePrice.toFixed(2)}</span>
                  <span className="text-xl text-muted-foreground line-through">₹{product.price.toFixed(2)}</span>
                  <Badge variant="destructive" className="text-sm py-1 px-3 rounded-full">
                    {discountPercentage}% OFF
                  </Badge>
                </div>
              ) : (
                <span className="text-4xl font-bold">₹{product.price.toFixed(2)}</span>
              )}
            </div>
            
            {/* Size */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Size: {product.size}</h3>
            </div>
            
            {/* Quantity and Add to Cart */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center border rounded-xl overflow-hidden">
                <button 
                  className="px-5 py-3 text-lg font-bold hover:bg-muted transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="px-6 py-3 font-medium">{quantity}</span>
                <button 
                  className="px-5 py-3 text-lg font-bold hover:bg-muted transition-colors"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
              
              <Button 
                size="lg" 
                className="flex-1 min-w-[200px] rounded-xl py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-xl h-14 w-14 border-2 hover:bg-muted transition-colors"
                onClick={handleWishlist}
              >
                <Heart className={cn("h-6 w-6", isWishlisted && "fill-current text-red-500")} />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-xl h-14 w-14 border-2 hover:bg-muted transition-colors"
              >
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Stock Status */}
            <div className="mb-8">
              {product.inStock ? (
                <div className="flex items-center text-green-600 bg-green-50 p-4 rounded-xl">
                  <CheckCircle className="mr-3 h-6 w-6 flex-shrink-0" />
                  <div>
                    <span className="font-medium">In Stock</span>
                    <span className="text-green-700 ml-2">({product.stockCount} available)</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-red-600 bg-red-50 p-4 rounded-xl">
                  <RotateCcw className="mr-3 h-6 w-6 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Out of Stock</span>
                    <span className="text-red-700 ml-2">- Back in 2-3 weeks</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center p-4 bg-card rounded-xl border border-border/50">
                <Truck className="mr-3 h-6 w-6 text-primary" />
                <div>
                  <div className="font-medium text-sm">Free Shipping</div>
                  <div className="text-muted-foreground text-xs">On orders over ₹500</div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-card rounded-xl border border-border/50">
                <ShieldCheck className="mr-3 h-6 w-6 text-primary" />
                <div>
                  <div className="font-medium text-sm">Secure Payment</div>
                  <div className="text-muted-foreground text-xs">100% protected</div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-card rounded-xl border border-border/50">
                <RotateCcw className="mr-3 h-6 w-6 text-primary" />
                <div>
                  <div className="font-medium text-sm">Easy Returns</div>
                  <div className="text-muted-foreground text-xs">30-day guarantee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="mt-16 bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
          <div className="border-b border-border/50">
            <div className="flex">
              <button
                className={cn(
                  "px-6 py-4 font-medium text-sm transition-colors",
                  selectedTab === 'description' 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setSelectedTab('description')}
              >
                Description
              </button>
              <button
                className={cn(
                  "px-6 py-4 font-medium text-sm transition-colors",
                  selectedTab === 'ingredients' 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setSelectedTab('ingredients')}
              >
                Ingredients
              </button>
              <button
                className={cn(
                  "px-6 py-4 font-medium text-sm transition-colors",
                  selectedTab === 'reviews' 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setSelectedTab('reviews')}
              >
                Reviews
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {selectedTab === 'description' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Product Description</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {product.fullDescription}
                </p>
              </div>
            )}
            
            {selectedTab === 'ingredients' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
                <p className="text-muted-foreground">
                  {product.ingredients}
                </p>
                
                <div className="mt-8 p-6 bg-muted rounded-xl">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Shipping & Returns
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start">
                      <Truck className="mr-3 h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                      <span>Free shipping on orders over ₹500</span>
                    </li>
                    <li className="flex items-start">
                      <RotateCcw className="mr-3 h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                      <span>30-day return policy</span>
                    </li>
                    <li className="flex items-start">
                      <ShieldCheck className="mr-3 h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                      <span>2-year warranty</span>
                    </li>
                    <li className="flex items-start">
                      <Clock className="mr-3 h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                      <span>Estimated delivery: 3-5 business days</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {selectedTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold">{product.rating}</div>
                  <div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-5 w-5",
                            i < Math.floor(product.rating) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          )} 
                        />
                      ))}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Based on {product.reviewCount} reviews
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Sample reviews - in a real app, these would come from an API */}
                  <div className="border-b border-border/50 pb-6 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium">Sarah K.</div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="text-muted-foreground text-sm mb-2">2 weeks ago</div>
                    <p className="text-foreground">
                      This product exceeded my expectations! The quality is amazing and it arrived quickly. 
                      I've been using it for a few weeks now and I can already see a difference in my skin.
                    </p>
                  </div>
                  
                  <div className="border-b border-border/50 pb-6 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium">Michael T.</div>
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                        <Star key={4} className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                    <div className="text-muted-foreground text-sm mb-2">1 month ago</div>
                    <p className="text-foreground">
                      Great product overall. I've been using it for a month and it's helped with my skin concerns. 
                      The only reason I'm giving 4 stars instead of 5 is because the packaging could be better.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}