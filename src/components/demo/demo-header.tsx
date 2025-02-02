"use client";

import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

export function DemoHeader() {
  return (
    <div className="relative py-20 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container px-4 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary/10 rounded-full">
              <Plane className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Interactive Demo</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience how LogiAire transforms air cargo operations with AI-powered automation, 
            real-time tracking, and predictive analytics.
          </p>
        </motion.div>
      </div>
    </div>
  );
}