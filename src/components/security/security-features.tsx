"use client";

import { Card, CardContent } from '../../../components/ui/card';
import { Shield, Lock, Key, Database, FileCheck, Users } from 'lucide-react';

const securityFeatures = [
  {
    icon: Shield,
    title: 'Advanced Encryption',
    description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.'
  },
  {
    icon: Lock,
    title: 'Access Controls',
    description: 'Role-based access control (RBAC) with granular permissions and audit logging.'
  },
  {
    icon: Key,
    title: 'Authentication',
    description: 'Multi-factor authentication (MFA) and single sign-on (SSO) support.'
  },
  {
    icon: Database,
    title: 'Data Protection',
    description: 'Regular backups, data redundancy, and disaster recovery procedures.'
  },
  {
    icon: FileCheck,
    title: 'Compliance',
    description: 'Adherence to international security standards and regulations.'
  },
  {
    icon: Users,
    title: 'Security Team',
    description: '24/7 monitoring and incident response by our dedicated security team.'
  }
];

export function SecurityFeatures() {
  return (
    <div className="py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Security Features</h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive security measures to protect your data and operations
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-none bg-gradient-to-br from-background to-muted">
                <CardContent className="p-6">
                  <Icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}