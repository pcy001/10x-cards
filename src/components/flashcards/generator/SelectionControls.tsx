import React from 'react';
import { SelectionControlsProps } from './types';
import { Button } from '@/components/ui/button';

export default function SelectionControls({
  onSelectAll,
  onDeselectAll,
  selectedCount,
  totalCount,
}: SelectionControlsProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        Zaznaczono: <span className="font-medium">{selectedCount}</span> z {totalCount}
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onSelectAll} 
          variant="outline" 
          size="sm"
          disabled={selectedCount === totalCount}
        >
          Zaznacz wszystkie
        </Button>
        <Button 
          onClick={onDeselectAll} 
          variant="outline" 
          size="sm"
          disabled={selectedCount === 0}
        >
          Odznacz wszystkie
        </Button>
      </div>
    </div>
  );
} 