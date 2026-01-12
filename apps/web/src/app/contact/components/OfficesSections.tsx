import React from 'react';
import { ArrowBigLeft, ArrowDownIcon, ArrowRight, ArrowRightIcon, MapPin } from 'lucide-react';

const OfficesLocations = () => {
  const offices = [
    {
      city: 'Nashik, Maharashtra',
      label: 'Headquarters',
      address: 'Office No. 1, Bhakti Apartment, near Hotel Rasoi, Suchita Nagar, Mumbai Naka, Nashik, Maharashtra, India PIN - 422009',
    },
    {
      city: 'Pune, Maharashtra',
      label: 'Pune Office',
      address: 'Second floor, Wisteriaa Fortune, Bhumkar Das Gugre Rd, Near Bhumkar Chowk, Wakad, Pune, Maharashtra, India PIN - 411057',
    },
    {
      city: 'Sangli, Maharashtra',
      label: 'Sangli Office',
      address: 'G1 Pragati Residency, Lane No. 4, Pragati Colony, Near Diamond Hotel, 100 Ft. Road, Sangli, Maharashtra, India PIN - 416416',
    },
    {
      city: 'Surat, Maharashtra',
      label: 'Surat Office',
      address: 'Office No. 12, Exceluss Business Space, Bhimrad Canal Road, Althan, Surat, Gujarat, India PIN - 395017',
    },
    {
      city: 'Jalgaon, Maharashtra',
      label: 'Jalgaon Office',
      address: 'Gurukul Colony, near MJ College, Beside JDCC Bank, Jalgaon, Maharashtra, India PIN - 425001',
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Our Offices
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Find us at our locations around the world.

        </p>
      </div>

      {/* Office Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offices.map((office, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Header Section */}
            <div className="bg-primary/5 border-b border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                <h3 className="text-lg font-bold text-primary">
                  {office.city}
                </h3>
              </div>
              <p className="lg:ml-9 text-xs text-primary font-bold uppercase tracking-wide">
                {office.label}
              </p>
            </div>

            {/* Address Section */}
            <div className="p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {office.address}
              </p>
            </div>

            <div>
              <div className="p-6">
                <a
                  href={`https://www.google.com/maps/dir/${office.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs tracking-wide font-medium text-center text-primary"
                >
                  Get Directions <ArrowRightIcon className='w-4 h-4 ml-2'/>
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default OfficesLocations;