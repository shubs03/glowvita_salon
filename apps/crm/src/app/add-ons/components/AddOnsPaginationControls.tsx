import { Pagination } from "@repo/ui/pagination";

interface AddOnsPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  hasItems: boolean;
}

const AddOnsPaginationControls = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  hasItems
}: AddOnsPaginationControlsProps) => {
  if (!hasItems) return null;

  return (
    <Pagination
      className="mt-4 p-4 border-t"
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={onItemsPerPageChange}
      totalItems={totalItems}
    />
  );
};

export default AddOnsPaginationControls;