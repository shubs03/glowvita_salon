
import { ProductCard } from './ProductCard';

const products = [
  {
    name: 'Aura Serum',
    description: 'Revitalizing serum for a radiant glow.',
    price: 68.00,
    image: 'https://picsum.photos/id/1027/400/400',
    hint: 'skincare product bottle',
    vendorName: 'Starlight Cosmetics',
    isNew: true,
  },
  {
    name: 'Chroma Balm',
    description: 'Hydrating lip balm with a hint of color.',
    price: 24.00,
    image: 'https://picsum.photos/id/1028/400/400',
    hint: 'cosmetic balm',
    vendorName: 'Hue & Shade',
    isNew: false,
  },
  {
    name: 'Zen Mist',
    description: 'Calming facial mist for instant hydration.',
    price: 35.00,
    image: 'https://picsum.photos/id/1029/400/400',
    hint: 'spray bottle',
    vendorName: 'Aether Beauty',
    isNew: false,
  },
  {
    name: 'Terra Scrub',
    description: 'Exfoliating body scrub with natural minerals.',
    price: 48.00,
    image: 'https://picsum.photos/id/1031/400/400',
    hint: 'cosmetic jar',
    vendorName: 'Earthly Essentials',
    isNew: false,
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Products</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Discover our curated selection of high-quality products from top vendors.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard 
              key={index} 
              name={product.name}
              description={product.description}
              price={product.price}
              image={product.image}
              hint={product.hint}
              vendorName={product.vendorName}
              isNew={product.isNew}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
