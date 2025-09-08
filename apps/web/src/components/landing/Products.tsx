
import { ProductCard } from './ProductCard';

const products = [
  { name: 'Organic Argan Oil', price: 25.00, image: 'https://placehold.co/600x600.png', hint: 'beauty product bottle', rating: 5, reviewCount: 112 },
  { name: 'Keratin Restore Shampoo', price: 32.50, image: 'https://placehold.co/600x600.png', hint: 'shampoo bottle', rating: 4.5, reviewCount: 98 },
  { name: 'Vitamin C Face Serum', price: 45.00, image: 'https://placehold.co/600x600.png', hint: 'serum dropper', rating: 5, reviewCount: 230 },
  { name: 'Matte Finish Foundation', price: 38.00, image: 'https://placehold.co/600x600.png', hint: 'foundation makeup', rating: 4, reviewCount: 75 },
];

export function Products() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Shop Our Products</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Bring the salon experience home with our curated selection of professional-grade products.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
