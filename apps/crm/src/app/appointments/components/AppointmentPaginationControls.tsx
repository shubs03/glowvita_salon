import { Pagination } from "@repo/ui/pagination";

interface AppointmentPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

const AppointmentPaginationControls = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: AppointmentPaginationControlsProps) => {
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

export default AppointmentPaginationControls;