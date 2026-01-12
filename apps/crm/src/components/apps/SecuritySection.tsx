import { Shield } from "lucide-react";
import FeatureCheck from "./FeatureCheck";

const SecuritySection = () => {
  return (
    <section className="py-10 overflow-hidden bg-white">
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-4">
          Security & Reliability
        </h2>
        
        <p className="mt-2 text-gray-600 max-w-2xl">
          Enterprise-grade protection for your business and client data.
        </p>
      </div>

      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
              <Shield className="relative z-10 w-full h-full text-primary/80" />
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Security You Can Trust
            </h3>
            <p className="text-muted-foreground">
              We prioritize the security of your business and client data with
              enterprise-grade protection.
            </p>
            <ul className="space-y-3 text-left">
              <FeatureCheck>
                <strong>Data Encryption:</strong> All data is encrypted in
                transit and at rest.
              </FeatureCheck>
              <FeatureCheck>
                <strong>Secure Payments:</strong> PCI-compliant payment
                processing to protect financial data.
              </FeatureCheck>
              <FeatureCheck>
                <strong>Regular Backups:</strong> Your data is backed up
                regularly to prevent loss.
              </FeatureCheck>
              <FeatureCheck>
                <strong>Access Control:</strong> Granular permissions to
                control what your staff can see and do.
              </FeatureCheck>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;