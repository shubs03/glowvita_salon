import { Pagination } from "@repo/ui/pagination";

interface ReferralPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

const ReferralPaginationControls = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: ReferralPaginationControlsProps) => {
  return (
    <div className="mt-8">
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

export default ReferralPaginationControls;