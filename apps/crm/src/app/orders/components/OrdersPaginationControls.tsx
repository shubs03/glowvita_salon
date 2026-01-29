import { Pagination } from "@repo/ui/pagination";

interface OrdersPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

const OrdersPaginationControls = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: OrdersPaginationControlsProps) => {
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

export default OrdersPaginationControls;