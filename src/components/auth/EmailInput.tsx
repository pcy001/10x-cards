import React from 'react';
import { cn } from '@/lib/utils';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function EmailInput({
  value,
  onChange,
  onBlur,
  error,
  id = 'email',
  label = 'Email',
  placeholder = 'twoj@email.com',
  required = true
}: EmailInputProps) {
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
      
      <input
        id={id}
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full px-3 py-2 border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary",
          error ? "border-destructive focus:ring-destructive" : "border-input"
        )}
        aria-invalid={!!error}
      />
      
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
    </div>
  );
} 