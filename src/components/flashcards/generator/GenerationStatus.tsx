import React from 'react';
import { GenerationStatusProps, GenerationStatusType } from './types';
import { Spinner } from '@/components/ui/Spinner';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export default function GenerationStatus({
  status,
  message
}: GenerationStatusProps) {
  // Określenie stylu statusu na podstawie typu
  const getStatusStyle = () => {
    switch (status) {
      case GenerationStatusType.GENERATING:
        return {
          containerClass: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
          icon: <Spinner size="sm" className="text-blue-600 dark:text-blue-400" />
        };
      case GenerationStatusType.SUCCESS:
        return {
          containerClass: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
          icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        };
      case GenerationStatusType.ERROR:
        return {
          containerClass: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
          icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        };
      default:
        return {
          containerClass: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300',
          icon: <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        };
    }
  };

  const { containerClass, icon } = getStatusStyle();

  return (
    <div className={`flex items-center p-4 mb-6 border rounded-md ${containerClass}`}>
      <div className="mr-3 flex-shrink-0">{icon}</div>
      <div>
        <div className="font-medium">
          {status === GenerationStatusType.GENERATING && 'Generowanie fiszek'}
          {status === GenerationStatusType.SUCCESS && 'Fiszki wygenerowane'}
          {status === GenerationStatusType.ERROR && 'Błąd generowania'}
        </div>
        {message && <p className="text-sm mt-1">{message}</p>}
      </div>
    </div>
  );
} 