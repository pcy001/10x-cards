import React from 'react';
import { cn } from '@/lib/utils';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  error?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  onBlur,
  isVisible,
  onToggleVisibility,
  error,
  id = 'password',
  label = 'Hasło',
  placeholder = '••••••••',
  required = true
}: PasswordInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={id} 
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full px-3 py-2 border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-10",
            error ? "border-destructive focus:ring-destructive" : "border-input"
          )}
          aria-invalid={!!error}
        />
        
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={isVisible ? 'Ukryj hasło' : 'Pokaż hasło'}
        >
          {isVisible ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
    </div>
  );
} 