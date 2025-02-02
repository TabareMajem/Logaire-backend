"use client";

import { Rocket, Globe, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const missions = [
  {
    icon: Rocket,
    title: 'Our Mission',
    description: 'To simplify global trade by making freight management accessible to businesses of all sizes.'
  },
  {
    icon: Globe,
    title: 'Our Vision',
    description: 'A world where international shipping is as simple as local delivery.'
  },
  {
    icon: Users,
    title: 'Our Values',
    description: 'Innovation, transparency, and customer success drive everything we do.'
  }
];

export function AboutMission() {
  return (
    <div className="py-20">
      <div className="container px-4 mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          {missions.map((mission, index) => {
            const Icon = mission.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{mission.title}</h3>
                  <p className="text-muted-foreground">{mission.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}