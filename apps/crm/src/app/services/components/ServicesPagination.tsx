import { Pagination } from "@repo/ui/pagination";
import { Service } from "./types";

interface ServicesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  totalItems: number;
  services: Service[];
  searchTerm: string;
  statusFilter: string;
}

const ServicesPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange, 
  totalItems 
}: ServicesPaginationProps) => {
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

export default ServicesPagination;