import { Pagination } from '@repo/ui/pagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}: PaginationControlsProps) => {
  if (totalItems === 0) return null; // Don't render when there are no items

  return (
    <Pagination
      className="mt-8"
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={onItemsPerPageChange}
      totalItems={totalItems}
    />
  );
};

export default PaginationControls;