'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function LoginDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-navy-800 border border-navy-300 hover:bg-navy-50 transition-colors"
      >
        Login
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg animate-fade-in">
          <a
            href="/login"
            className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Consultant Edition
          </a>
          <a
            href="#"
            className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Adviser Edition
          </a>
        </div>
      )}
    </div>
  );
}
