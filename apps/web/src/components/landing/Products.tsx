
import { ProductCard } from './ProductCard';

const products = [
  { name: 'Perfume', price: 80, image: 'https://placehold.co/600x600.png', hint: 'glowing serum bottle', rating: 5, reviewCount: 112, theme: 'orange' as const },
  { name: 'Lipstick', price: 35, image: 'https://placehold.co/600x600.png', hint: 'holographic shampoo bottle', rating: 4.5, reviewCount: 98, theme: 'pink' as const },
  { name: 'Mascara', price: 20, image: 'https://placehold.co/600x600.png', hint: 'futuristic conditioner bottle', rating: 5, reviewCount: 230, theme: 'blue' as const },
  { name: 'Foundation', price: 60, image: 'https://placehold.co/600x600.png', hint: 'holographic makeup', rating: 4, reviewCount: 75, theme: 'pink' as const },
];

export function Products() {
  return (
    <section className="py-20 bg-secondary/30 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#ffdca9,transparent)] opacity-20 -z-10"></div>
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Featured Products</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Discover our top-rated beauty essentials.</p>
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

