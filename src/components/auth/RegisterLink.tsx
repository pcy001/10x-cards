import React from 'react';
import { cn } from '@/lib/utils';

interface RegisterLinkProps {
  className?: string;
  label?: string;
}

export default function RegisterLink({
  className,
  label = 'Nie masz jeszcze konta? Zarejestruj się'
}: RegisterLinkProps) {
  return (
    <div className={cn("text-center mt-4", className)}>
      <a
        href="/auth/register"
        className="text-sm text-primary hover:underline font-medium"
      >
        {label}
      </a>
    </div>
  );
} 