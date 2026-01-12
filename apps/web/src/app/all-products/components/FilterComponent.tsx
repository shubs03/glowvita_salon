"use client";

import React, { useState } from "react";
import { Button } from "@repo/ui/button";
import { RotateCcw, Filter } from "lucide-react";

// MultiSelect component
interface MultiSelectProps {
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder: string;
  label: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedOptions,
  onSelectionChange,
  placeholder,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onSelectionChange(selectedOptions.filter((item) => item !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="relative w-full">
      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </label>
      <div
        className={`mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${isOpen ? "ring-1 ring-primary" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <div
                  key={option}
                  className="flex items-center bg-primary/10 text-primary text-xs px-2 py-0.5 rounded"
                >
                  {option}
                  <button
                    type="button"
                    className="ml-1 text-primary/70 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <span className="text-muted-foreground/70">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedOptions.length > 0 && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            <div
              className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-8 px-2 text-sm border border-border rounded mb-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div
            className="max-h-40 overflow-auto"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${selectedOptions.includes(option) ? "bg-accent" : ""}`}
                  onClick={() => toggleOption(option)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option)}
                      readOnly
                      className="mr-2"
                    />
                    {option}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface FilterComponentProps {
  allBodyParts: string[];
  allBrands: string[];
  selectedBodyParts: string[];
  setSelectedBodyParts: (selected: string[]) => void;
  selectedBrand: string[];
  setSelectedBrand: (selected: string[]) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  resetFilters: () => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  allBodyParts,
  allBrands,
  selectedBodyParts,
  setSelectedBodyParts,
  selectedBrand,
  setSelectedBrand,
  ratingFilter,
  setRatingFilter,
  sortBy,
  setSortBy,
  resetFilters,
}) => {
  return (
    <div className="pt-20 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground text-lg">
              Filter Products:
            </h3>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Body Part Filter */}
          <div className="flex flex-col gap-2">
            <MultiSelect
              options={allBodyParts}
              selectedOptions={selectedBodyParts}
              onSelectionChange={setSelectedBodyParts}
              placeholder="All Body Parts"
              label="Body Part"
            />
          </div>

          {/* Brand Filter */}
          <div className="flex flex-col gap-2">
            <MultiSelect
              options={allBrands}
              selectedOptions={selectedBrand}
              onSelectionChange={setSelectedBrand}
              placeholder="All Brands"
              label="Brand"
            />
          </div>

          {/* Rating Filter - Single Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Rating
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Ratings</option>
              <option value="high-to-low">Highest Rated First</option>
              <option value="low-to-high">Lowest Rated First</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;