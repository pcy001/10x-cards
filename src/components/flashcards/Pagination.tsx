import React from 'react';
import { PaginationProps } from './types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  perPage,
  onPageChange,
  onPerPageChange
}: PaginationProps) {
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPerPageChange(parseInt(e.target.value, 10));
  };

  // Generuje numery stron do wyświetlenia z uwzględnieniem stron brzegowych i aktualnej
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Jeśli jest mniej niż 7 stron, pokazuj wszystkie
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Zawsze pokazuj pierwszą stronę
    pageNumbers.push(1);
    
    // Oblicz zakres stron do wyświetlenia wokół aktualnej strony
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Dodaj separator przed zakresem, jeśli potrzebny
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Dodaj zakres stron
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Dodaj separator po zakresie, jeśli potrzebny
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Zawsze pokazuj ostatnią stronę
    pageNumbers.push(totalPages);
    
    return pageNumbers;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 py-2">
      <div className="text-sm text-muted-foreground">
        Pokazuje <span className="font-medium">{perPage}</span> fiszek na stronie
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => !isPrevDisabled && onPageChange(currentPage - 1)}
          disabled={isPrevDisabled}
          className="w-9 h-9 flex items-center justify-center rounded-md border hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Poprzednia strona"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="flex items-center">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="w-9 h-9 flex items-center justify-center">
                {page}
              </span>
            )
          ))}
        </div>
        
        <button
          onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
          disabled={isNextDisabled}
          className="w-9 h-9 flex items-center justify-center rounded-md border hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Następna strona"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <label htmlFor="per-page" className="text-sm text-muted-foreground">
          Fiszek na stronie:
        </label>
        <select
          id="per-page"
          value={perPage}
          onChange={handlePerPageChange}
          className="bg-background border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  );
} 