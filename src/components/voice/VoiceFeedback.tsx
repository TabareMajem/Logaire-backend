"use client";

import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FeedbackCollector } from '@/lib/voice/feedback/feedback-collector';

interface VoiceFeedbackProps {
  interactionId: string;
  onComplete: () => void;
}

export function VoiceFeedback({ interactionId, onComplete }: VoiceFeedbackProps) {
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
      onComplete();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            onClick={() => setRating(value)}
          >
            {value <= rating ? (
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            ) : (
              <Star className="h-6 w-6 text-muted-foreground" />
            )}
          </Button>
        ))}
      </div>

      <Textarea
        placeholder="Any additional comments?"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="h-24"
      />

      <Button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        Submit Feedback
      </Button>
    </div>
  );
}