import { ProductCard } from './ProductCard';

const products = [
  { name: 'Serum', price: 41, image: 'https://placehold.co/400x400.png', hint: 'serum bottle mockup', isNew: false, hasFocus: true },
  { name: 'Soap Pump', price: 41, image: 'https://placehold.co/400x400.png', hint: 'soap bottle mockup', isNew: true, hasFocus: false },
  { name: 'Dropper Bottles', price: 41, image: 'https://placehold.co/400x400.png', hint: 'dropper bottle mockup', isNew: false, hasFocus: false },
];

export function Products() {
  return (
    <section className="py-20 bg-[#fde9df] relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4">
          <div className="w-[600px] h-[600px] bg-[#f8d9c9] rounded-full" style={{ filter: 'blur(80px)' }}></div>
        </div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
          <div className="w-[600px] h-[600px] bg-[#f8d9c9] rounded-full" style={{ filter: 'blur(80px)' }}></div>
        </div>
        <div className="absolute top-10 left-10 w-64 h-auto opacity-50">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#F8D9C9" d="M37.1,-48.8C51.2,-37.2,67.6,-28.5,73.5,-16.2C79.4,-3.9,74.7,12,65.8,24.1C56.9,36.2,43.8,44.5,30.3,51.8C16.8,59.1,2.9,65.4,-11.2,65.7C-25.3,66,-39.6,59.3,-49.6,48.5C-59.5,37.7,-65.1,22.8,-69.5,6.5C-73.9,-9.8,-77.2,-27.5,-70.2,-41.3C-63.2,-55.1,-45.9,-65,-29.9,-69.1C-13.9,-73.2,--6.9,-71.4,2.3,-67.2C11.5,-63,22.9,-56.3,37.1,-48.8Z" transform="translate(100 100)" />
            </svg>
        </div>
        <div className="absolute bottom-10 right-10 w-64 h-auto opacity-50 transform rotate-180">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#F8D9C9" d="M37.1,-48.8C51.2,-37.2,67.6,-28.5,73.5,-16.2C79.4,-3.9,74.7,12,65.8,24.1C56.9,36.2,43.8,44.5,30.3,51.8C16.8,59.1,2.9,65.4,-11.2,65.7C-25.3,66,-39.6,59.3,-49.6,48.5C-59.5,37.7,-65.1,22.8,-69.5,6.5C-73.9,-9.8,-77.2,-27.5,-70.2,-41.3C-63.2,-55.1,-45.9,-65,-29.9,-69.1C-13.9,-73.2,-6.9,-71.4,2.3,-67.2C11.5,-63,22.9,-56.3,37.1,-48.8Z" transform="translate(100 100)" />
            </svg>
        </div>
        <div className="container mx-auto px-4 relative">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
              {products.slice(0, 3).map((product, index) => (
                <ProductCard key={index} {...product} />
              ))}
            </div>
        </div>
    </section>
  );
}
