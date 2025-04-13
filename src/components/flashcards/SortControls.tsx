import React from 'react';
import { SortControlsProps } from './types';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function SortControls({ sortBy, sortDir, onSortChange }: SortControlsProps) {
  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value, sortDir);
  };

  const toggleSortDirection = () => {
    const newDirection = sortDir === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newDirection);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-by" className="text-sm text-muted-foreground hidden sm:inline">Sortuj według:</label>
      <div className="flex items-center">
        <select
          id="sort-by"
          value={sortBy}
          onChange={handleSortByChange}
          className="bg-background border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="created_at">Data utworzenia</option>
          <option value="correct_answers_count">Liczba poprawnych odpowiedzi</option>
        </select>
        <button
          onClick={toggleSortDirection}
          className="ml-2 p-1.5 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={sortDir === 'asc' ? 'Sortuj malejąco' : 'Sortuj rosnąco'}
        >
          {sortDir === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
} 