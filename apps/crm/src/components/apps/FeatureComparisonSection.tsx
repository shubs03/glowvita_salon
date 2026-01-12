const FeatureComparisonSection = () => {
  const features = [
    { feature: "Manage Calendar & Staff", vendor: true },
    { feature: "Process Payments & Invoicing", vendor: true },
    { feature: "Client Profiles & History", vendor: true },
    { feature: "Inventory Management", vendor: true },
    { feature: "Business Analytics & Reports", vendor: true },
    { feature: "Marketing & Promotions", vendor: true },
  ];

  return (
    <section className="py-10 overflow-hidden bg-white">
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-4">
          Vendor App Features
        </h2>
        
        <p className="mt-2 text-gray-600 max-w-2xl">
          Explore the powerful features available in our vendor app.
        </p>
      </div>

      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-secondary/20">
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-card-foreground">Feature</th>
                <th className="text-center p-4 font-semibold text-card-foreground">
                  Vendor App
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((item, index) => (
                <tr key={index} className={`border-b border-border ${index % 2 === 1 ? 'bg-secondary/10' : ''}`}>
                  <td className="p-4 text-card-foreground">{item.feature}</td>
                  <td className="text-center p-4">
                    {item.vendor ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-600">
                        ✓
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default FeatureComparisonSection;