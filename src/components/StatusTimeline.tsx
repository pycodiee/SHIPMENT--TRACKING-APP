import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  status: string;
  label: string;
  timestamp?: string;
  completed: boolean;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

export const StatusTimeline = ({ steps }: StatusTimelineProps) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "rounded-full p-2 transition-colors",
              step.completed 
                ? "bg-success text-success-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
              {step.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-0.5 h-16 my-1",
                step.completed ? "bg-success" : "bg-border"
              )} />
            )}
          </div>
          <div className="flex-1 pb-8">
            <h4 className={cn(
              "font-medium",
              step.completed ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </h4>
            {step.timestamp && (
              <p className="text-sm text-muted-foreground mt-1">
                {step.timestamp}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
