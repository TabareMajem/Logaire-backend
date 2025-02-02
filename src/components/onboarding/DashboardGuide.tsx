import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useState } from 'react';

interface GuideStep {
  title: string;
  description: string;
  image?: string;
  target?: string;
}

const guideSteps: GuideStep[] = [
  {
    title: 'Welcome to the Monitoring Dashboard',
    description: 'This guide will help you understand the key features and how to use them effectively.',
    target: '#dashboard-overview'
  },
  {
    title: 'Real-time Metrics',
    description: 'Monitor system metrics in real-time. View CPU, memory, disk, and network usage with automatic updates.',
    target: '#metrics-panel'
  },
  {
    title: 'Custom Metrics',
    description: 'Create and track custom metrics by combining existing metrics or defining new ones.',
    target: '#custom-metrics'
  },
  {
    title: 'Alert Management',
    description: 'Set up alert rules, manage notifications, and respond to system events.',
    target: '#alerts-panel'
  },
  {
    title: 'Health Checks',
    description: 'Monitor the health of your services and infrastructure components.',
    target: '#health-dashboard'
  }
];

export function DashboardGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [hasSeenGuide, setHasSeenGuide] = useLocalStorage('dashboard-guide-seen', false);

  if (hasSeenGuide) {
    return null;
  }

  const currentGuide = guideSteps[currentStep];

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      highlightElement(guideSteps[currentStep + 1].target);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      highlightElement(guideSteps[currentStep - 1].target);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    setHasSeenGuide(true);
    removeHighlight();
  };

  const highlightElement = (target?: string) => {
    removeHighlight();
    if (target) {
      const element = document.querySelector(target);
      if (element) {
        element.classList.add('highlight-element');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const removeHighlight = () => {
    document.querySelectorAll('.highlight-element').forEach(el => {
      el.classList.remove('highlight-element');
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentGuide.title}</DialogTitle>
        </DialogHeader>

        <Card className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {currentGuide.description}
            </p>

            {currentGuide.image && (
              <img
                src={currentGuide.image}
                alt={currentGuide.title}
                className="rounded-lg border"
              />
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <Button
                onClick={handleNext}
              >
                {currentStep === guideSteps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
} 