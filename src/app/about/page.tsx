"use client";

import { AboutHero } from '@/components/about/about-hero';
import { AboutMission } from '@/components/about/about-mission';
import { AboutTeam } from '@/components/about/about-team';
import { AboutValues } from '@/components/about/about-values';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutTeam />
    </div>
  );
}