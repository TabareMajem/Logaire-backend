import { ScheduleOptimization, ScheduleConstraints } from '../../types/scheduling';
import { ErrorLogger } from '@/lib/errors/logger';
import { Location } from '../..';

export class ScheduleValidator {
  validate(
    schedule: ScheduleOptimization,
    constraints: ScheduleConstraints
  ): ValidationResult {
    try {
      const violations: ValidationViolation[] = [];

      // Check pickup window
      if (constraints.earliestPickup && 
          schedule.recommendedSchedule.pickupWindow.start < constraints.earliestPickup) {
        violations.push({
          type: 'pickup_window',
          message: 'Pickup window starts before earliest allowed time'
        });
      }

      // Check delivery window
      if (constraints.latestDelivery &&
          schedule.recommendedSchedule.deliveryWindow.end > constraints.latestDelivery) {
        violations.push({
          type: 'delivery_window',
          message: 'Delivery window ends after latest allowed time'
        });
      }

      // Check transit time
      if (constraints.transitTimeLimit) {
        const transitTime = this.calculateTransitTime(schedule);
        if (transitTime > constraints.transitTimeLimit) {
          violations.push({
            type: 'transit_time',
            message: 'Transit time exceeds maximum allowed'
          });
        }
      }

      // Check required stops
      if (constraints.requiredStops) {
        const missingStops = this.findMissingStops(
          schedule,
          constraints.requiredStops
        );
        if (missingStops.length > 0) {
          violations.push({
            type: 'required_stops',
            message: `Missing required stops: ${missingStops.join(', ')}`
          });
        }
      }

      return {
        isValid: violations.length === 0,
        violations,
        warnings: this.generateWarnings(schedule, constraints)
      };
    } catch (error) {
      ErrorLogger.error('Schedule validation failed', error as Error);
      throw error;
    }
  }

  private calculateTransitTime(schedule: ScheduleOptimization): number {
    const start = schedule.recommendedSchedule.pickupWindow.start;
    const end = schedule.recommendedSchedule.deliveryWindow.end;
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Hours
  }

  private findMissingStops(
    schedule: ScheduleOptimization,
    requiredStops: Location[]
  ): string[] {
    const scheduledLocations = schedule.recommendedSchedule.transitPoints.map(
      tp => tp.location.name
    );
    return requiredStops
      .filter(stop => !scheduledLocations.includes(stop.name))
      .map(stop => stop.name);
  }

  private generateWarnings(
    schedule: ScheduleOptimization,
    constraints: ScheduleConstraints
  ): string[] {
    const warnings: string[] = [];

    // Add schedule-specific warnings
    if (schedule.reliability < 0.8) {
      warnings.push('Schedule has lower than recommended reliability');
    }

    // Add buffer-related warnings
    const lowBufferPoints = schedule.recommendedSchedule.transitPoints.filter(
      tp => tp.bufferHours < 2
    );
    if (lowBufferPoints.length > 0) {
      warnings.push('Some transit points have minimal buffer time');
    }

    return warnings;
  }
}

interface ValidationResult {
  isValid: boolean;
  violations: ValidationViolation[];
  warnings: string[];
}

interface ValidationViolation {
  type: 'pickup_window' | 'delivery_window' | 'transit_time' | 'required_stops';
  message: string;
}