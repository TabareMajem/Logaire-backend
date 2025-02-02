"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../components/ui/command';
import { Icons } from '../../../components/ui/icons';
import { Button } from '@/components/ui/button';


interface SearchResult {
  id: string;
  title: string;
  href: string;
  type: 'shipment' | 'booking' | 'document';
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  const search = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      // TODO: Implement actual search logic
      const mockResults: SearchResult[] = [
        { id: '1', title: 'Shipment #12345', href: '/shipments/12345', type: 'shipment' },
        { id: '2', title: 'Booking #67890', href: '/bookings/67890', type: 'booking' },
      ];
      setResults(mockResults);
    }, 300),
    []
  );

  return (
    <>
      <Button
        variant="outline"
        className="w-64 justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Icons.search className="mr-2 h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
          <span>⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search shipments, bookings..."
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            search(value);
          }}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    router.push(result.href);
                    setOpen(false);
                  }}
                >
                  {result.type === 'shipment' && <Icons.ship className="mr-2 h-4 w-4" />}
                  {result.type === 'booking' && <Icons.calendar className="mr-2 h-4 w-4" />}
                  {result.type === 'document' && <Icons.fileText className="mr-2 h-4 w-4" />}
                  <span>{result.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}