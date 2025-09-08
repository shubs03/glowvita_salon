
import Image from 'next/image';

const PlatformForCard = ({
  title,
  imageUrl,
  hint,
}: {
  title: string;
  imageUrl: string;
  hint: string;
}) => (
  <a
    className="relative inline-block h-40 w-64 md:h-[194px] md:w-[309px] shrink-0 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-2xl group border border-border/50"
    href="#"
  >
    <Image
      className="size-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      src={imageUrl}
      alt={title}
      width={309}
      height={194}
      data-ai-hint={hint}
    />
    <div className="absolute inset-0 z-10 flex w-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
      <div className="flex flex-row items-center justify-between gap-2 p-3 md:p-4">
        <div className="text-base md:text-xl font-semibold leading-tight text-white">
          {title}
        </div>
      </div>
    </div>
  </a>
);

const PlatformForMarquee = ({ rtl = false }: { rtl?: boolean }) => {
  const items = [
    {
      title: "Hair Salon",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "hair salon",
    },
    {
      title: "Nail Salon",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "nail salon",
    },
    {
      title: "Barbers",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "barber shop",
    },
    {
      title: "Waxing Salon",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "waxing salon",
    },
    {
      title: "Medspa",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "spa",
    },
    {
      title: "Eyebrow Bar",
      imageUrl: "https://placehold.co/309x194.png",
      hint: "eyebrows",
    },
  ];
  return (
    <div className="w-full overflow-hidden">
      <div
        className={`flex w-fit items-start space-x-4 md:space-x-8 ${rtl ? "animate-slide-rtl" : "animate-slide"} hover:[animation-play-state:paused]`}
      >
        {[...items, ...items].map((item, index) => (
          <PlatformForCard
            key={`${item.title}-${index}`}
            title={item.title}
            imageUrl={item.imageUrl}
            hint={item.hint}
          />
        ))}
      </div>
    </div>
  );
};


export function PlatformFor() {
    return (
        <section className="py-16 md:py-20 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
          <div className="mx-auto max-w-[2000px] space-y-8 md:space-y-12 relative z-10">
            <div className="text-center space-y-4 px-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                A platform for everyone
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Whether you're running a small boutique salon or managing
                multiple locations, our platform adapts to your unique business
                needs.
              </p>
            </div>

            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
              <PlatformForMarquee />
            </div>
            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
              <PlatformForMarquee rtl={true} />
            </div>
          </div>
        </section>
    )
}
