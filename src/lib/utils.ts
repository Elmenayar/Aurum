import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | any) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
