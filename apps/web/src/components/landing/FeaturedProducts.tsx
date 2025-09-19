import { ProductCard } from '@repo/ui/components/landing/ProductCard';

const products = [
  {
    name: 'Aura Serum',
    description: 'Revitalizing serum for a radiant glow.',
    price: 68.00,
    image: 'https://picsum.photos/id/1027/400/400',
    hint: 'skincare product bottle',
    rating: 4.5,
    reviewCount: 812,
    vendorName: 'Aura Cosmetics',
    isNew: true,
  },
  {
    name: 'Chroma Balm',
    description: 'Hydrating lip balm with a hint of color.',
    price: 24.00,
    image: 'https://picsum.photos/id/1028/400/400',
    hint: 'cosmetic balm',
    rating: 4.8,
    reviewCount: 1254,
    vendorName: 'Chroma Beauty',
  },
  {
    name: 'Zen Mist',
    description: 'Calming facial mist for instant hydration.',
    price: 35.00,
    image: 'https://picsum.photos/id/1029/400/400',
    hint: 'spray bottle',
    rating: 4.7,
    reviewCount: 987,
    vendorName: 'Serenity Skincare',
  },
  {
    name: 'Terra Scrub',
    description: 'Exfoliating body scrub with natural minerals.',
    price: 48.00,
    image: 'https://picsum.photos/id/1031/400/400',
    hint: 'cosmetic jar',
    rating: 4.9,
    reviewCount: 2310,
    vendorName: 'Earthly Essentials',
    isNew: true,
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">Featured Products</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">Discover our curated selection of high-quality products from top vendors.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, index) => (
            <ProductCard 
              key={index} 
              name={product.name}
              price={product.price}
              image={product.image}
              hint={product.hint}
              rating={product.rating}
              reviewCount={product.reviewCount}
              vendorName={product.vendorName}
              isNew={product.isNew}
            />
          ))}
        </div>
      </div>
    </section>
  );
}