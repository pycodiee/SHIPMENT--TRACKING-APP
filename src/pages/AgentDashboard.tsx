import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShipmentCard } from '@/components/ShipmentCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, MapPin, Trash2, ArrowLeft, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { shipmentsApi, Shipment, Agent } from '@/utils/firebaseApi';
import { useAuth } from '@/context/AuthContext';
import { Map } from '@/components/Map';
import { agentsApi } from '@/utils/firebaseApi';

export default function AgentDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const pickupAddressDep = shipments[0]?.pickupAddress || null;
  const deliveryAddressDep = shipments[0]?.deliveryAddress || null;

  useEffect(() => { (async () => { setAgents(await agentsApi.listAgents()); })(); }, []);
  // Poll agents periodically to reflect admin updates to status
  useEffect(() => {
    const id = setInterval(async () => {
      const latest = await agentsApi.listAgents();
      setAgents(latest);
      // update selected agent reference if status changed
      if (selectedAgent) {
        const updated = latest.find(a => a.id === selectedAgent.id) || null;
        if (updated && (updated.status !== selectedAgent.status)) setSelectedAgent(updated);
      }
    }, 8000);
    return () => clearInterval(id);
  }, [selectedAgent]);

  // If logged-in user is an agent, auto-select their agent record when agents load
  useEffect(() => {
    if (!selectedAgent && user && user.role === 'agent') {
      const mine = agents.find(a => a.id === user.id) || null;
      if (mine) setSelectedAgent(mine);
    }
  }, [agents, user, selectedAgent]);

  // Load shipments when selected agent changes
  useEffect(() => {
    (async () => {
      if (selectedAgent) {
        const agentShipments = await shipmentsApi.listForAgent(selectedAgent.id);
        setShipments(agentShipments.map(s => ({
          id: s.id ?? '',
          trackingId: s.trackingId,
          senderName: s.senderName,
          receiverName: s.receiverName,
          pickupAddress: s.pickupAddress,
          deliveryAddress: s.deliveryAddress,
          status: s.status,
          createdAt: s.createdAt,
          contactNumber: s.contactNumber,
        })));
      } else {
        setShipments([]);
      }
    })();
  }, [selectedAgent?.id, selectedAgent]);

  useEffect(() => {
    async function geocodeAddress(addr: string): Promise<[number, number] | null> {
      if (!addr) return null;
      try {
        // Add country context if not present for better geocoding
        let query = addr.trim();
        if (!query.toLowerCase().includes('india') && !query.toLowerCase().includes('india,')) {
          query = `${addr}, India`;
        }
        const resp = await fetch(`/api/nominatim/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`);
        const data = await resp.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          console.log(`Geocoded "${addr}" → [${lat}, ${lon}]:`, data[0].display_name);
          return [lat, lon];
        }
        console.warn(`No geocoding results for: ${addr}`);
        return null;
      } catch (error) {
        console.error('Geocoding error for:', addr, error);
        return null;
      }
    }
    if (!pickupAddressDep && !deliveryAddressDep) return;
    const pickupAddress = pickupAddressDep || '';
    const deliveryAddress = deliveryAddressDep || '';
    let cancelled = false;
    (async () => {
      setGeocodeLoading(true);
      const [from, to] = await Promise.all([
        geocodeAddress(pickupAddress),
        geocodeAddress(deliveryAddress),
      ]);
      if (cancelled) return;
      setFromCoords(from);
      setToCoords(to);
      setGeocodeLoading(false);
    })();
    return () => { cancelled = true; };
  }, [pickupAddressDep, deliveryAddressDep]);

  const handleStatusUpdate = async (shipmentId: string, newStatus: string) => {
    let coords: { lat: number; lng: number } | undefined = undefined;
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch { /* ignore */ }
    }
    await shipmentsApi.updateStatus(shipmentId, newStatus as Shipment['status'], coords || undefined);
    setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, status: newStatus as Shipment['status'], lastLocation: coords || s.lastLocation } : s));
    toast({ title: 'Status Updated', description: `Shipment status changed to ${newStatus.replace('_', ' ')}` });
  };

  const handleFileUpload = async (shipmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await shipmentsApi.uploadProof(shipmentId, file);
      toast({ title: 'Proof Uploaded', description: 'Delivery proof uploaded for shipment' });
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (!window.confirm(`Delete agent ${agent.name} (${agent.email})?`)) return;
    try {
      await agentsApi.deleteAgent(agent.id);
      const updated = await agentsApi.listAgents();
      setAgents(updated);
      if (selectedAgent && selectedAgent.id === agent.id) setSelectedAgent(null);
      toast({ title: 'Agent deleted', description: `${agent.name} removed.` });
    } catch (e) {
      toast({ title: 'Delete failed', description: 'Could not delete agent', variant: 'destructive' });
    }
  };

  const firstShipment = shipments.length > 0 ? shipments[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background relative">
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
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{user?.name || 'Agent'}</span>
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex min-h-screen">
        <aside className="w-64 bg-background/80 border-r border-border shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gradient px-4 pt-6 pb-3">Agents</h2>
          <ul className="flex-1 overflow-y-auto">
            {agents.map(agent => (
              <li
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={'px-4 py-3 cursor-pointer flex items-center justify-between transition ' + (selectedAgent && selectedAgent.id === agent.id ? 'bg-white font-bold' : 'hover:bg-white/80')}>
                <span>{agent.name}</span>
                <span className={`text-xs ml-2 px-2 py-1 rounded-full ${agent.status === 'free' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>{agent.status}</span>
                <button onClick={(e)=>{e.stopPropagation(); handleDeleteAgent(agent);}} className="ml-2 text-destructive hover:text-accent" aria-label="Delete agent"><Trash2 className="h-4 w-4"/></button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="flex-1 pt-4 pb-14 overflow-y-auto min-h-screen bg-transparent">
          <div className="max-w-5xl mx-auto px-4 py-2">
            {selectedAgent ? (
              <>
                <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <div className="p-5 bg-card/80 rounded shadow flex flex-col gap-2 sm:flex-row sm:items-center">
                    <h2 className="text-2xl font-bold mr-5 text-primary">{selectedAgent.name}</h2>
                    <div className="text-muted-foreground text-sm">{selectedAgent.email}</div>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${selectedAgent.status === 'free' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>{selectedAgent.status.toUpperCase()}</span>
                  </div>
                </motion.div>
                {geocodeLoading ? (
                  <div className="mb-8 w-full rounded bg-card/20 flex items-center justify-center h-[320px] text-sm text-muted-foreground">Loading map…</div>
                ) : (fromCoords && toCoords && firstShipment) ? (
                  <div className="mb-8 w-full rounded overflow-hidden" style={{ height: 340 }}>
                    <Map
                      markers={[
                        { lat: fromCoords[0], lng: fromCoords[1], tooltip: <span className="font-bold text-green-700">From</span>, popup: (<div><strong>From:</strong> {firstShipment.pickupAddress}<br/><small>{firstShipment.trackingId}</small></div>), iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png' },
                        { lat: toCoords[0], lng: toCoords[1], tooltip: <span className="font-bold text-blue-700">To</span>, popup: (<div><strong>To:</strong> {firstShipment.deliveryAddress}<br/><small>{firstShipment.trackingId}</small></div>), iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png' },
                      ]}
                      polyline={[fromCoords, toCoords]}
                      height="320px"
                      zoom={8}
                    />
                  </div>
                ) : null}
                <h3 className="font-semibold text-xl mb-3">Shipments Assigned</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shipments.length ? shipments.map((shipment, index) => {
                    const normalizedShipment = {
                      id: shipment.id ?? '',
                      trackingId: shipment.trackingId,
                      senderName: shipment.senderName,
                      receiverName: shipment.receiverName,
                      pickupAddress: shipment.pickupAddress,
                      deliveryAddress: shipment.deliveryAddress,
                      status: shipment.status,
                      createdAt: shipment.createdAt,
                      contactNumber: shipment.contactNumber,
                    };
                    return (
                      <motion.div key={shipment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                        <ShipmentCard shipment={normalizedShipment}>
                          <div className="space-y-3">
                            <div>
                              <label htmlFor={`proof-${shipment.id}`} className="cursor-pointer">
                                <Button type="button" variant="outline" className="w-full" asChild>
                                  <span><Upload className="h-4 w-4 mr-2" />Upload Proof of Delivery</span>
                                </Button>
                              </label>
                              <input id={`proof-${shipment.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(shipment.id, e)} />
                            </div>
                          </div>
                        </ShipmentCard>
                      </motion.div>
                    );
                  }) : (
                    <div className='col-span-full text-center text-muted-foreground'>No shipments assigned.</div>
                  )}
                </div>
              </>
            ) : (
              <div className='pt-8 text-center text-xl text-muted-foreground'>Select an agent from the sidebar</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
