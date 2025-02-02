import { Ship, Globe, Search, Clock, BarChart, Shield, Zap, FileText, Users, Database } from 'lucide-react';
import { FeatureCategory } from '@/types/features';

export const featureCategories: FeatureCategory[] = [
  {
    id: 'core',
    title: 'Core Features',
    description: 'Essential tools for managing your shipping operations',
    features: [
      {
        title: 'AI-Powered Booking',
        description: 'Intelligent route optimization and automated rate comparison',
        icon: Ship
      },
      {
        title: 'Real-time Tracking',
        description: 'Track shipments with live updates and instant notifications',
        icon: Clock
      },
      {
        title: 'Smart Analytics',
        description: 'Data-driven insights for better decision making',
        icon: BarChart
      }
    ]
  },
  {
    id: 'automation',
    title: 'Automation & Integration',
    description: 'Streamline your workflow with powerful automation tools',
    features: [
      {
        title: 'Document Management',
        description: 'Automated document generation and storage',
        icon: FileText
      },
      {
        title: 'API Integration',
        description: 'Connect with your existing systems seamlessly',
        icon: Database
      },
      {
        title: 'Team Collaboration',
        description: 'Work together efficiently with role-based access',
        icon: Users
      }
    ]
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    description: 'Enterprise-grade security for your shipping operations',
    features: [
      {
        title: 'Data Protection',
        description: 'Advanced encryption and secure data handling',
        icon: Shield
      },
      {
        title: 'Compliance Tools',
        description: 'Stay compliant with shipping regulations',
        icon: FileText
      },
      {
        title: 'Audit Trails',
        description: 'Complete visibility of all system activities',
        icon: Search
      }
    ]
  }
];