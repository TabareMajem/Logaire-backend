"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DemoService } from '@/lib/auth/demo-service';
import { Loader2, PlayCircle } from 'lucide-react';

export function DemoAccess() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDemoAccess = async () => {
    setIsLoading(true);
    try {
      await DemoService.createDemoSession();
      toast.success('Welcome to the demo account!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to access demo account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-muted/50">
      <div className="container px-4 mx-auto">
        <Card className="max-w-2xl mx-auto border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">
              Try FreightFlow Demo
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Experience all features instantly with our demo account
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleDemoAccess}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Accessing Demo...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Access Demo Account
                  </>
                )}
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Included Features:</h4>
                <ul className="space-y-1">
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Full dashboard access
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Sample shipments and bookings
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Document management
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Advanced Features:</h4>
                <ul className="space-y-1">
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> AI-powered features
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Analytics and reporting
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Real-time tracking
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}