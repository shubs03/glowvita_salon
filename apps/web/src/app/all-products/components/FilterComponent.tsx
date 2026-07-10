"use client";

import React, { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DropdownFilterProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
  singleSelect?: boolean;
}

// ─── Single Dropdown Filter ───────────────────────────────────────────────────

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  label,
  options,
  selectedOptions,
  onSelectionChange,
  singleSelect = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleOption = (option: string) => {
    if (singleSelect) {
      onSelectionChange(selectedOptions.includes(option) ? [] : [option]);
      setIsOpen(false);
      return;
    }
    if (selectedOptions.includes(option)) {
      onSelectionChange(selectedOptions.filter((o) => o !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };

  const displayLabel =
    selectedOptions.length === 0
      ? label
      : selectedOptions.length === 1
        ? selectedOptions[0]
        : `${selectedOptions[0]} +${selectedOptions.length - 1}`;

  const hasSelection = selectedOptions.length > 0;

  return (
    <div ref={ref} className="gf-dropdown-wrapper">
      <button
        type="button"
        className={`gf-dropdown-trigger${hasSelection ? " gf-active" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="gf-trigger-label">{displayLabel}</span>
        <svg
          className={`gf-chevron${isOpen ? " gf-open" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="gf-dropdown-panel" role="listbox">
          {options.length === 0 ? (
            <div className="gf-no-options">No options available</div>
          ) : (
            options.map((option) => {
              const checked = selectedOptions.includes(option);
              return (
                <div
                  key={option}
                  role="option"
                  aria-selected={checked}
                  className={`gf-option${checked ? " gf-option-selected" : ""}`}
                  onClick={() => toggleOption(option)}
                >
                  {!singleSelect && (
                    <span className={`gf-checkbox${checked ? " gf-checkbox-checked" : ""}`}>
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <polyline
                            points="2,6 5,9 10,3"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  )}
                  <span className="gf-option-text">{option}</span>
                </div>
              );
            })
          )}
          {hasSelection && !singleSelect && (
            <div className="gf-clear-row">
              <button
                type="button"
                className="gf-clear-btn"
                onClick={() => {
                  onSelectionChange([]);
                  setIsOpen(false);
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Filter Component Props ───────────────────────────────────────────────────

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
  // Price range
  priceRange?: [number, number];
  setPriceRange?: (range: [number, number]) => void;
}

const PRICE_RANGE_OPTIONS = [
  "Under ₹200",
  "₹200 – ₹500",
  "₹500 – ₹1,000",
  "₹1,000 – ₹2,000",
  "₹2,000 – ₹5,000",
  "Above ₹5,000",
];

const SKIN_TYPE_OPTIONS = [
  "Oily",
  "Dry",
  "Combination",
  "Sensitive",
  "Normal",
  "All Skin Types",
];

// ─── Main FilterComponent ─────────────────────────────────────────────────────

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
  priceRange,
  setPriceRange,
}) => {
  const [selectedPriceOptions, setSelectedPriceOptions] = useState<string[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);

  const hasAnyFilter =
    selectedBodyParts.length > 0 ||
    selectedBrand.length > 0 ||
    selectedPriceOptions.length > 0 ||
    selectedSkinTypes.length > 0 ||
    ratingFilter !== "all" ||
    sortBy !== "featured";

  const handleResetAll = () => {
    resetFilters();
    setSelectedPriceOptions([]);
    setSelectedSkinTypes([]);
  };

  return (
    <>
      {/* Scoped styles */}
      <style>{`
        .gf-bar {
          width: 100%;
          background: transparent;
          padding: 20px 0 16px;
        }
        .gf-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .gf-label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 4px;
        }
        .gf-label svg { color: #888; }

        /* Dropdown wrapper */
        .gf-dropdown-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        /* Trigger button */
        .gf-dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          height: 42px;
          padding: 0 16px;
          min-width: 160px;
          background: #fff;
          border: 1.5px solid #d0d0d0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          white-space: nowrap;
          user-select: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .gf-dropdown-trigger:hover {
          border-color: #a78bca;
          box-shadow: 0 2px 8px rgba(167,139,202,0.13);
        }
        .gf-dropdown-trigger.gf-active {
          border-color: #7c3aed;
          background: #faf5ff;
          color: #5b21b6;
          box-shadow: 0 0 0 2px rgba(124,58,237,0.1);
        }
        .gf-trigger-label {
          flex: 1;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 140px;
        }
        .gf-chevron {
          flex-shrink: 0;
          transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
          color: #888;
        }
        .gf-chevron.gf-open {
          transform: rotate(180deg);
          color: #7c3aed;
        }

        /* Panel */
        .gf-dropdown-panel {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          z-index: 200;
          background: #fff;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          min-width: 200px;
          max-height: 280px;
          overflow-y: auto;
          padding: 6px 0;
          animation: gf-fadeIn 0.15s ease;
          scrollbar-width: none;
        }
        .gf-dropdown-panel::-webkit-scrollbar { display: none; }

        @keyframes gf-fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Option row */
        .gf-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 16px;
          font-size: 13.5px;
          color: #333;
          cursor: pointer;
          transition: background 0.12s;
        }
        .gf-option:hover { background: #f5f0ff; }
        .gf-option.gf-option-selected { background: #faf5ff; color: #5b21b6; font-weight: 500; }

        /* Checkbox */
        .gf-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid #d0d0d0;
          background: #fff;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.15s, background 0.15s;
        }
        .gf-checkbox.gf-checkbox-checked {
          background: #7c3aed;
          border-color: #7c3aed;
        }

        .gf-option-text { flex: 1; }

        .gf-no-options {
          padding: 12px 16px;
          font-size: 13px;
          color: #aaa;
        }

        /* Clear row */
        .gf-clear-row {
          border-top: 1px solid #f0f0f0;
          padding: 8px 16px 4px;
        }
        .gf-clear-btn {
          font-size: 12px;
          font-weight: 600;
          color: #7c3aed;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }
        .gf-clear-btn:hover { color: #5b21b6; }

        /* Reset all */
        .gf-reset-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          height: 42px;
          padding: 0 14px;
          border-radius: 8px;
          border: 1.5px solid #e0d4f7;
          background: #faf5ff;
          color: #7c3aed;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(124,58,237,0.08);
        }
        .gf-reset-btn:hover {
          background: #ede9fe;
          border-color: #7c3aed;
        }

        /* Active count badge */
        .gf-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7c3aed;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          margin-left: 2px;
        }

        @media (max-width: 768px) {
          .gf-inner {
            gap: 8px;
            padding: 0 16px;
          }
          .gf-dropdown-trigger {
            min-width: 130px;
            height: 38px;
            font-size: 13px;
          }
          .gf-trigger-label { max-width: 100px; }
        }
        @media (max-width: 480px) {
          .gf-inner { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 8px; }
        }
      `}</style>

      <div className="gf-bar">
        <div className="gf-inner">
          {/* Filter icon label */}
          {/* <span className="gf-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
          </span> */}

          {/* Categories (body parts) */}
          <DropdownFilter
            label="Categories"
            options={allBodyParts.length > 0 ? allBodyParts : ["Face", "Hair", "Body", "Nails", "Eyes", "Lips"]}
            selectedOptions={selectedBodyParts}
            onSelectionChange={setSelectedBodyParts}
          />

          {/* Brands */}
          <DropdownFilter
            label="Brands"
            options={allBrands.length > 0 ? allBrands : ["L'Oreal", "Pond's", "Nivea", "Lakme", "Maybelline", "Biotique"]}
            selectedOptions={selectedBrand}
            onSelectionChange={setSelectedBrand}
          />

          {/* Price Range */}
          <DropdownFilter
            label="Price Range"
            options={PRICE_RANGE_OPTIONS}
            selectedOptions={selectedPriceOptions}
            onSelectionChange={setSelectedPriceOptions}
          />

          {/* Skin Type */}
          <DropdownFilter
            label="Skin Type"
            options={SKIN_TYPE_OPTIONS}
            selectedOptions={selectedSkinTypes}
            onSelectionChange={setSelectedSkinTypes}
          />

          {/* Sort By */}
          <DropdownFilter
            label="Sort By"
            singleSelect
            options={["Featured", "Newest", "Price: Low to High", "Price: High to Low", "Top Rated"]}
            selectedOptions={
              sortBy === "featured" ? [] :
                sortBy === "newest" ? ["Newest"] :
                  sortBy === "price-low" ? ["Price: Low to High"] :
                    sortBy === "price-high" ? ["Price: High to Low"] :
                      sortBy === "rating" ? ["Top Rated"] : []
            }
            onSelectionChange={(vals) => {
              const map: Record<string, string> = {
                "Featured": "featured",
                "Newest": "newest",
                "Price: Low to High": "price-low",
                "Price: High to Low": "price-high",
                "Top Rated": "rating",
              };
              setSortBy(vals.length > 0 ? (map[vals[0]] ?? "featured") : "featured");
            }}
          />

          {/* Reset all */}
          {hasAnyFilter && (
            <button type="button" className="gf-reset-btn" onClick={handleResetAll}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reset
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterComponent;