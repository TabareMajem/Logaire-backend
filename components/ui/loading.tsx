"use client";

import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  className?: string;
}

export function Loader({ size = 24, className }: LoaderProps) {
  return <Loader2 className={`animate-spin ${className}`} size={size} />;
}

export function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader size={32} className="text-primary" />
    </div>
  );
}

export function TableLoader() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <Loader className="text-muted-foreground" />
    </div>
  );
}

export function ButtonLoader() {
  return <Loader size={16} className="mr-2" />;
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-4">
      <Loader className="text-muted-foreground" />
    </div>
  );
}