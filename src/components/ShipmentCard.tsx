import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { MapPin, User, Phone, Calendar } from 'lucide-react';

interface ShipmentCardProps {
  shipment: {
    id: string;
    trackingId: string;
    senderName: string;
    receiverName: string;
    pickupAddress: string;
    deliveryAddress: string;
    status: any;
    createdAt?: any;
    contactNumber?: string;
  };
  children?: React.ReactNode;
}

export const ShipmentCard = ({ shipment, children }: ShipmentCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">
              {shipment.trackingId}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {shipment.senderName} → {shipment.receiverName}
            </p>
          </div>
          <StatusBadge status={shipment.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-primary">From</p>
            <p className="text-muted-foreground">{shipment.pickupAddress}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-success mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-success">To</p>
            <p className="text-muted-foreground">{shipment.deliveryAddress}</p>
          </div>
        </div>
        {shipment.contactNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{shipment.contactNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Created: {
              (() => {
                const v = shipment.createdAt as any;
                const d = v?.toDate ? v.toDate() : (v ? new Date(v) : null);
                return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '-';
              })()
            }
          </span>
        </div>
        {children && (
          <div className="pt-3 border-t border-border">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
