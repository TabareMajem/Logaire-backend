// src/components/ui/command.tsx -->

import * as React from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';
import { Input } from './input';
import { Button } from './button';
import { XIcon } from 'lucide-react';

export function CommandDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/50" />
      <DialogContent className="fixed inset-0 flex items-center justify-center bg-white p-6 sm:w-[500px] sm:rounded-lg">
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function CommandInput({
  placeholder,
  value,
  onValueChange,
}: {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Input
      className="w-full p-2 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    />
  );
}

export function CommandList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="w-full max-h-60 overflow-y-auto mt-2 space-y-2">
      {children}
    </ul>
  );
}

export function CommandEmpty({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-muted-foreground">{children}</li>
  );
}

export function CommandGroup({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-medium text-lg text-muted-foreground">{heading}</h3>
      <ul>{children}</ul>
    </div>
  );
}

export function CommandItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <li
      onClick={onSelect}
      className="flex items-center cursor-pointer p-2 text-sm rounded-md hover:bg-muted-foreground hover:text-primary transition-colors"
    >
      {children}
    </li>
  );
}
