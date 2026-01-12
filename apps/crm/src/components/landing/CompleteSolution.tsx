import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Settings, TrendingUp, CreditCard } from "lucide-react";

const CompleteSolution = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="md:text-right space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 md:ml-auto">
              <Settings className="h-4 w-4" />
              Complete Solution
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-headline text-pretty bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text leading-tight">
              Everything you need to run your business
            </h2>
            <p className="text-lg md:text-xl max-w-xl md:ml-auto text-muted-foreground leading-relaxed">
              Our platform offers innovative features that bring
              convenience, efficiency, and an improved experience for both
              your team members and clients.
            </p>
          </div>
          <div className="space-y-6 md:space-y-8">
            <Card className="bg-gradient-to-br from-background to-primary/5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Settings className="h-5 w-5" />
                  </div>
                  Manage
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  Manage bookings, sales, clients, locations, and team
                  members. Analyse your business with advanced reporting and
                  analytics.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-background to-primary/5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  Grow
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  Win new clients on the world's largest beauty and wellness
                  marketplace. Keep them coming back with marketing
                  features.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-background to-primary/5 border-l-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  Get Paid
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  Get paid fast with seamless payment processing. Reduce
                  no-shows with upfront payments and simplify checkout for
                  clients.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompleteSolution;