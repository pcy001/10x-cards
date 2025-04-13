import React from 'react';
import { cn } from '@/lib/utils';

interface LoginLinkProps {
  className?: string;
  label?: string;
}

export default function LoginLink({
  className,
  label = 'Masz już konto? Zaloguj się'
}: LoginLinkProps) {
  return (
    <div className={cn("text-center mt-4", className)}>
      <a
        href="/auth/login"
        className="text-sm text-primary hover:underline font-medium"
      >
        {label}
      </a>
    </div>
  );
} 