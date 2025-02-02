'use client';

import { ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

type ToastData = {
  id: string | number;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
};

type ToastFunction = {
  (message: string | number | ReactNode, data?: any): string | number;
  success: (message: string | number | ReactNode, data?: any) => string | number;
  error: (message: string | number | ReactNode, data?: any) => string | number;
  loading: (message: string | number | ReactNode, data?: any) => string | number;
  toasts: ToastData[];
};

export const useToast = () => {
  const toast: ToastFunction = Object.assign(sonnerToast, {
    toasts: [] // This will be populated by the toast library
  });

  return {
    toast,
    toasts: toast.toasts
  };
};

export type { ToastData };