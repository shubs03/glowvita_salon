
import { ProductCard } from './ProductCard';

const products = [
  { name: 'Bio-Derm Serum', price: 75.00, image: 'https://placehold.co/600x600.png', hint: 'glowing serum bottle', rating: 5, reviewCount: 112 },
  { name: 'Chroma-Shift Shampoo', price: 42.50, image: 'https://placehold.co/600x600.png', hint: 'holographic shampoo bottle', rating: 4.5, reviewCount: 98 },
  { name: 'Nano-Repair Conditioner', price: 55.00, image: 'https://placehold.co/600x600.png', hint: 'futuristic conditioner bottle', rating: 5, reviewCount: 230 },
  { name: 'Holographic Lip Gloss', price: 38.00, image: 'https://placehold.co/600x600.png', hint: 'holographic makeup', rating: 4, reviewCount: 75 },
];

export function Products() {
  return (
    <section className="py-20 bg-secondary/30 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#7e22ce,transparent)] opacity-20 -z-10"></div>
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Featured Cyberceuticals</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Upgrade your regimen with our latest bio-engineered products.</p>
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
