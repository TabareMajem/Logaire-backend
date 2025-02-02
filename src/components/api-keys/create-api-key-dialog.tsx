"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Copy, CheckCircle2 } from 'lucide-react';

interface CreateAPIKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAPIKeyDialog({ open, onClose }: CreateAPIKeyDialogProps) {
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!keyName.trim()) return;
    
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API endpoint
      // const response = await fetch('/api/keys', {
      //   method: 'POST',
      //   body: JSON.stringify({ name: keyName }),
      // });
      // const data = await response.json();
      
      // Simulated response
      const mockKey = 'sk_' + Math.random().toString(36).substring(2, 15);
      setGeneratedKey(mockKey);
    } catch (error) {
      console.error('Failed to create API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setKeyName('');
    setGeneratedKey(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for accessing the API. Make sure to copy your key - you won&apos;t be able to see it again!
          </DialogDescription>
        </DialogHeader>

        {!generatedKey ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="Enter a name for your API key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription className="break-all font-mono">
                {generatedKey}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Make sure to copy your API key now. You won&apos;t be able to see it again!
            </p>
          </div>
        )}

        <DialogFooter>
          {!generatedKey ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!keyName.trim() || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </>
          ) : (
            <Button
              className="w-full sm:w-auto"
              onClick={handleCopy}
              variant="outline"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Key
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}