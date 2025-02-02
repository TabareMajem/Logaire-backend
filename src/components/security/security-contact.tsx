"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Mail, Shield } from 'lucide-react';

export function SecurityContact() {
  return (
    <div className="py-20">
      <div className="container px-4 mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Report a Security Issue</h2>
                <p className="text-muted-foreground mb-6">
                  We take security seriously. If you believe you&apos;ve found a security vulnerability,
                  please report it to our security team immediately.
                </p>
                <div className="space-y-4">
                  <Button asChild>
                    <a href="mailto:security@freightflow.com">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Security Team
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/security/bug-bounty">
                      <Shield className="mr-2 h-4 w-4" />
                      Bug Bounty Program
                    </a>
                  </Button>
                </div>
              </div>
              <div className="bg-muted p-8 rounded-lg">
                <h3 className="font-semibold mb-4">Response Time Commitment</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-32">Critical:</span>
                    <span className="text-muted-foreground">Within 4 hours</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-32">High:</span>
                    <span className="text-muted-foreground">Within 24 hours</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-32">Medium:</span>
                    <span className="text-muted-foreground">Within 48 hours</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-32">Low:</span>
                    <span className="text-muted-foreground">Within 72 hours</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}