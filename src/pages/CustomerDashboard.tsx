import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StatusTimeline } from '@/components/StatusTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, MapPin, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Map } from '@/components/Map';
import { shipmentsApi } from '@/utils/firebaseApi';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';

type TimelineItem = {
  status: string;
  label?: string;
  timestamp?: string;
  completed?: boolean;
};

type TrackedShipment = {
  id: string;
  trackingId: string;
  senderName: string;
  receiverName: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  estimatedDelivery?: string;
  timeline: TimelineItem[];
  lastLocation: { lat: number; lng: number; address?: string } | null;
};

export default function CustomerDashboard() {
  const [trackingId, setTrackingId] = useState('');
  const [shipmentData, setShipmentData] = useState<TrackedShipment | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      toast({
        title: "Invalid Tracking ID",
        description: "Please enter a valid tracking ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const ship = await shipmentsApi.findByTrackingId(trackingId.trim());
    setLoading(false);
    if (!ship) {
      toast({ title: 'Not Found', description: 'No shipment found for this tracking ID', variant: 'destructive' });
      setShipmentData(null);
      return;
    }
    // Build timeline based on current status
    const order = ['created','picked_up','in_transit','out_for_delivery','delivered'];
    const currentIndex = Math.max(0, order.indexOf((ship.status as string) || 'created'));
    const steps = order.map((key, idx) => ({
      status: key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      completed: idx <= currentIndex,
    }));

    // Estimated delivery: 1 day before expectedDeliveryDate if available
    let eta = '';
    if (ship.expectedDeliveryDate) {
      const d = new Date(ship.expectedDeliveryDate);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() - 1);
        eta = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      }
    }

    setShipmentData({
      trackingId: ship.trackingId,
      senderName: ship.senderName,
      receiverName: ship.receiverName,
      pickupAddress: ship.pickupAddress,
      deliveryAddress: ship.deliveryAddress,
      status: ship.status,
      estimatedDelivery: eta,
      timeline: steps,
      id: ship.id,
      lastLocation: ship.lastLocation || null,
    });
    // No success toast; information is visible in the UI below
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ShipTrack Pro
              </span>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{user.name}</span>
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Package className="h-16 w-16 text-primary mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 text-gradient">Track Your Shipment</h1>
          <p className="text-muted-foreground">Enter your tracking ID to see real-time updates</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-8 backdrop-blur-sm bg-card/50 border-primary/10 hover-lift">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Tracking ID (e.g., SHIP-001-2025)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  className="flex-1 backdrop-blur-sm"
                />
                <Button onClick={handleTrack} disabled={loading} className="bg-gradient-to-r from-primary to-accent">
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Tracking...' : 'Track'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {shipmentData && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-sm bg-card/50 border-primary/10 hover-lift">
              <CardHeader>
                <CardTitle>Shipment Details</CardTitle>
                <CardDescription>Tracking ID: {shipmentData.trackingId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      From
                    </h3>
                    <p className="text-sm text-muted-foreground">{shipmentData.senderName}</p>
                    <p className="text-sm text-muted-foreground">{shipmentData.pickupAddress}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-success" />
                      To
                    </h3>
                    <p className="text-sm text-muted-foreground">{shipmentData.receiverName}</p>
                    <p className="text-sm text-muted-foreground">{shipmentData.deliveryAddress}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated Delivery:</span>
                    <span className="text-sm text-primary font-medium">{shipmentData.estimatedDelivery}</span>
                  </div>
                </div>
                <div className="py-8">
                  <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-0 relative">
                    {shipmentData.timeline.map((step, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center min-w-[70px] relative">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 text-lg font-bold transition-all duration-300 
                          ${step.completed ? 'bg-primary text-white border-primary shadow-md' : 'bg-background border-border text-muted-foreground shadow-none'}`}
                          >
                          {step.completed ? <span className="text-xl">✓</span> : idx + 1}
                        </div>
                        {/* Connector line */}
                        {idx < shipmentData.timeline.length - 1 && (
                          <div className="absolute top-6 left-[calc(50%+24px)] h-0.5 w-full" style={{width: `calc(100% - 48px)`, background: step.completed && shipmentData.timeline[idx+1].completed ? '#2563eb' : '#e5e7eb', zIndex: 0}}></div>
                        )}
                        <div className="mt-2 text-xs text-center w-20">
                          <span className={step.completed ? 'font-semibold text-primary' : 'text-muted-foreground'}>{step.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {shipmentData.lastLocation && (
              <Card className="backdrop-blur-sm bg-card/50 border-primary/10 hover-lift">
                <CardHeader>
                  <CardTitle>Live Location</CardTitle>
                  <CardDescription>Last reported by delivery agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <Map lat={shipmentData.lastLocation.lat} lng={shipmentData.lastLocation.lng} height="320px" />
                </CardContent>
              </Card>
            )}

            
          </motion.div>
        )}
      </div>
    </div>
  );
}
