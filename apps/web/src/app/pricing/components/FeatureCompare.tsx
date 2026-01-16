import React from 'react';
import { Check } from 'lucide-react';

const FeatureCompare = () => {
  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Compare Plans
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl mx-auto">
          See the detailed comparison of features across our different plans.
        </p>
      </div>
      
      <div className="overflow-x-auto rounded-2xl border border-border mt-8">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-foreground">Feature</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-foreground">Basic</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-foreground">Pro</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-foreground">Free Trial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="bg-card hover:bg-accent">
              <td className="py-3 px-4 text-sm font-medium">Client Management</td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
            </tr>
            <tr className="bg-background hover:bg-accent">
              <td className="py-3 px-4 text-sm font-medium">Appointment Booking</td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
            </tr>
            <tr className="bg-card hover:bg-accent">
              <td className="py-3 px-4 text-sm font-medium">Analytics</td>
              <td className="py-3 px-4 text-center text-sm text-muted-foreground">Basic</td>
              <td className="py-3 px-4 text-center text-sm">Advanced</td>
              <td className="py-3 px-4 text-center text-sm">Advanced</td>
            </tr>
            <tr className="bg-background hover:bg-accent">
              <td className="py-3 px-4 text-sm font-medium">SMS Marketing</td>
              <td className="py-3 px-4 text-center text-sm text-muted-foreground">-</td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
            </tr>
            <tr className="bg-card hover:bg-accent">
              <td className="py-3 px-4 text-sm font-medium">Priority Support</td>
              <td className="py-3 px-4 text-center text-sm text-muted-foreground">-</td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
              <td className="py-3 px-4 text-center text-sm">
                <Check className="text-green-500 mx-auto" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default FeatureCompare;