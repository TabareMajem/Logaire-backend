"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FeedbackCollector } from '@/lib/voice/feedback/feedback-collector';

interface VoiceFeedbackDialogProps {
  interactionId: string;
  open: boolean;
  onClose: () => void;
}

export function VoiceFeedbackDialog({ 
  interactionId, 
  open, 
  onClose 
}: VoiceFeedbackDialogProps) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const feedbackCollector = new FeedbackCollector();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackCollector.recordFeedback({
        interactionId,
        rating,
        feedbackType: 'quality',
        comments
      });
      toast.success('Thank you for your feedback!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Voice Interaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Button
                key={value}
                variant="ghost"
                size="sm"
                onClick={() => setRating(value)}
              >
                <Star 
                  className={`h-6 w-6 ${
                    value <= rating 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-muted-foreground'
                  }`} 
                />
              </Button>
            ))}
          </div>

          <Textarea
            placeholder="Any additional comments?"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="h-24"
          />

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}