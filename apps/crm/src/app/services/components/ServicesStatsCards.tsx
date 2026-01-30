import { Card, CardContent } from "@repo/ui/card";
import { Tag, CheckCircle, XCircle, BarChart2 } from "lucide-react";
import { Service } from "./types";

interface ServicesStatsCardsProps {
  services: Service[];
}

const ServicesStatsCards = ({ services }: ServicesStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Services</p>
              <p className="text-2xl font-bold text-primary">{services.length}</p>
              <p className="text-xs text-primary/70 mt-1">All services offered</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Tag className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Approved</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {services.filter(s => s.status === 'approved').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Approved services</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <CheckCircle className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Pending Approval</p>
              <p className="text-2xl font-bold text-primary">
                {services.filter(s => s.status === 'pending').length}
              </p>
              <p className="text-xs text-primary/70 mt-1">Awaiting review</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <BarChart2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Disapproved</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {services.filter(s => s.status === 'disapproved').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Rejected services</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <XCircle className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesStatsCards;