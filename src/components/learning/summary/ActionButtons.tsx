import React from 'react';
import { BackToDashboardButton } from './BackToDashboardButton';
import { ActionButtonsProps } from './types';

export function ActionButtons({ onBackToDashboard, dashboardUrl }: ActionButtonsProps) {
  return (
    <div className="flex flex-col items-center mt-6 space-y-4">
      <BackToDashboardButton 
        onClick={onBackToDashboard}
        href={dashboardUrl}
      />
    </div>
  );
} 