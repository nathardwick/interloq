'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, description, error, options, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-slate-500 mb-1">{description}</p>
        )}
        <select
          ref={ref}
          id={id}
          className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            error
              ? 'border-red-400 focus:ring-red-500'
              : 'border-slate-300 focus:ring-navy-500'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
