import { cn } from '@/lib/utils';

type Status = 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'created':
        return 'bg-muted text-muted-foreground';
      case 'picked_up':
        return 'bg-info/10 text-info';
      case 'in_transit':
        return 'bg-warning/10 text-warning';
      case 'out_for_delivery':
        return 'bg-accent/10 text-accent';
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'delayed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = () => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      getStatusStyles(),
      className
    )}>
      {getStatusText()}
    </span>
  );
};
