import { cn } from "@repo/ui/cn";

interface FAQ {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title: string;
  faqs: FAQ[];
  className?: string;
}

export const FaqSection = ({ 
  title, 
  faqs, 
  className 
}: FaqSectionProps) => {
  return (
    <section className={cn("py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background", className)}>
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
            <h3 className="font-bold text-card-foreground text-lg items-center leading-tight mb-2">
              {faq.question}
            </h3>
            <p className="text-muted-foreground text-sm">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};