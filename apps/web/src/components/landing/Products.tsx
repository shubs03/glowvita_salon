import { ProductCard } from './ProductCard';

const products = [
  { name: 'Serum', price: 41, image: 'https://placehold.co/600x400.png', hint: 'serum bottle mockup', isNew: false, hasFocus: true },
  { name: 'Soap Pump', price: 41, image: 'https://placehold.co/600x400.png', hint: 'soap bottle mockup', isNew: true, hasFocus: false },
  { name: 'Dropper Bottles', price: 41, image: 'https://placehold.co/600x400.png', hint: 'dropper bottle mockup', isNew: false, hasFocus: true },
  { name: 'Foundation', price: 41, image: 'https://placehold.co/600x400.png', hint: 'foundation bottle mockup', isNew: false, hasFocus: false },
];

export function Products() {
  return (
    <section className="py-20 bg-[#fef5f1] relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/sandy-sand.png')] opacity-50"></div>
        <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-[#d59a78]">Featured Products</h2>
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
