interface HeaderSectionProps {
  title: string;
  description: string;
}

const HeaderSection = ({ title, description }: HeaderSectionProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;