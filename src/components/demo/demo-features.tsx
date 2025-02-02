"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plane, 
  BarChart, 
  FileText, 
  Bell, 
  Globe, 
  Shield,
  Zap,
  Users,
  TrendingUp 
} from 'lucide-react';

const features = [
  {
    icon: Plane,
    title: 'Smart Booking',
    description: 'AI-powered route optimization and automated carrier selection',
    color: 'text-blue-500'
  },
  {
    icon: BarChart,
    title: 'Analytics Dashboard',
    description: 'Real-time insights and performance metrics',
    color: 'text-green-500'
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Digital AWB and customs documentation handling',
    color: 'text-amber-500'
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description: 'Proactive notifications for delays and disruptions',
    color: 'text-purple-500'
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Access to worldwide carrier network and routes',
    color: 'text-indigo-500'
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Predictive analytics for risk assessment',
    color: 'text-rose-500'
  }
];

export function DemoFeatures() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the powerful features that make LogiAire the leading air cargo management platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}