import { Pagination } from "@repo/ui/pagination";

interface OffersPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

const OffersPaginationControls = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: OffersPaginationControlsProps) => {
  return (
    <div className="mt-4">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(value) => {
          onItemsPerPageChange(value);
          onPageChange(1);
        }}
        totalItems={totalItems}
      />
    </div>
  );
};

export default OffersPaginationControls;