"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const certifications = [
  {
    name: 'ISO 27001',
    description: 'Information Security Management',
    logo: '/images/iso-27001.svg'
  },
  {
    name: 'SOC 2 Type II',
    description: 'Service Organization Control',
    logo: '/images/soc2.svg'
  },
  {
    name: 'GDPR',
    description: 'Data Protection Compliance',
    logo: '/images/gdpr.svg'
  }
];

const reports = [
  {
    title: 'Security Whitepaper',
    description: 'Detailed overview of our security practices',
    href: '#'
  },
  {
    title: 'Privacy Policy',
    description: 'How we handle and protect your data',
    href: '/privacy'
  },
  {
    title: 'Compliance Report',
    description: 'Annual security compliance report',
    href: '#'
  }
];

export function SecurityCompliance() {
  return (
    <div className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Certifications */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Certifications</h2>
            <div className="grid gap-6">
              {certifications.map((cert) => (
                <Card key={cert.name}>
                  <CardContent className="flex items-center p-6">
                    <div className="relative w-16 h-16 mr-6">
                      <Image
                        src={cert.logo}
                        alt={cert.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Security Reports */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Security Reports</h2>
            <div className="grid gap-6">
              {reports.map((report) => (
                <Card key={report.title}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={report.href}>
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}