import { useEffect, useState } from 'react';
import { Package, TruckIcon, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog as Modal, DialogTrigger as ModalTrigger, DialogContent as ModalContent, DialogHeader as ModalHeader, DialogTitle as ModalTitle } from '@/components/ui/dialog';
import { ShipmentCard } from '@/components/ShipmentCard';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { shipmentsApi, Shipment } from '@/utils/firebaseApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { agentsApi, Agent } from '@/utils/firebaseApi';

export default function AdminDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);

  const { toast } = useToast();

  const stats = [
    { label: 'Total Shipments', value: '1,234', icon: Package, color: 'text-primary' },
    { label: 'Active', value: '856', icon: TruckIcon, color: 'text-warning' },
    { label: 'Delivered', value: '342', icon: CheckCircle, color: 'text-success' },
    { label: 'Delayed', value: '36', icon: AlertCircle, color: 'text-destructive' },
  ];

  const handleCreateShipment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const trackingId = `SHIP-${Math.random().toString(36).slice(2, 7).toUpperCase()}-${new Date().getFullYear()}`;
    const payload: Shipment = {
      trackingId,
      senderName: formData.get('senderName') as string,
      receiverName: formData.get('receiverName') as string,
      pickupAddress: formData.get('pickupAddress') as string,
      deliveryAddress: formData.get('deliveryAddress') as string,
      status: 'created',
      contactNumber: formData.get('contactNumber') as string,
      customerEmail: formData.get('email') as string,
      agentId: (formData.get('agentId') as string) || undefined,
      pickupDate: (formData.get('pickupDate') as string) || undefined,
      expectedDeliveryDate: (formData.get('expectedDeliveryDate') as string) || undefined,
    };
    // Strip undefined fields to avoid Firestore errors
    const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined)) as Shipment;
    const id = await shipmentsApi.create(cleanPayload);
    const newShipment: Shipment = { ...cleanPayload, id };
    setShipments([newShipment, ...shipments]);
    setDialogOpen(false);
    toast({ title: 'Shipment Created', description: `Tracking ID: ${trackingId}` });
    if (cleanPayload.agentId) await agentsApi.setAgentStatus(cleanPayload.agentId, 'busy');
  };

  function openEditDialog(s: Shipment) {
    setEditingShipment(s);
    setEditDialogOpen(true);
  }
  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingShipment) return;
    const form = e.currentTarget;
    const patch: Partial<Shipment> = {
      pickupAddress: form.pickupAddress.value,
      deliveryAddress: form.deliveryAddress.value,
      agentId: form.agentId.value,
      status: form.status.value,
    };
    try {
      await shipmentsApi.edit(editingShipment.id!, editingShipment.trackingId, patch);
      setShipments(shs => shs.map(s => s.id === editingShipment.id ? {...s, ...patch } : s));
      toast({ title: "Shipment Updated", description: `Tracking ID: ${editingShipment.trackingId}` });
      setEditDialogOpen(false);
      setEditingShipment(null);
      
      // Handle agent status updates
      const newAgentId = patch.agentId as string | undefined;
      const oldAgentId = editingShipment.agentId;
      
      // Free old agent if delivery status changes to delivered
      if (patch.status === 'delivered' && oldAgentId) {
        await agentsApi.setAgentStatus(oldAgentId, 'free');
      }
      
      // Set new agent to busy if newly assigned (different from old agent)
      if (newAgentId && newAgentId !== oldAgentId) {
        await agentsApi.setAgentStatus(newAgentId, 'busy');
      }
    } catch {
      toast({title: "Update failed", variant: "destructive"});
    }
  }
  async function handleDeleteShipment(shipment: Shipment) {
    if (!window.confirm(`Delete shipment with tracking ID ${shipment.trackingId}?`)) return;
    try {
      await shipmentsApi.delete(shipment.id!);
      setShipments((prev: Shipment[]) => prev.filter((s) => s.id !== shipment.id));
      toast({ title: "Shipment deleted", description: `Shipment ${shipment.trackingId} has been removed.` });
    } catch (error) {
      toast({ title: "Delete failed", description: "Could not delete shipment.", variant: "destructive" });
    }
  }

  useEffect(() => {
    (async () => {
      const list = await shipmentsApi.listAll();
      setShipments(list.map((s: Partial<Shipment> & { id?: string }) => ({
        id: s.id ?? '',
        trackingId: s.trackingId || '',
        senderName: s.senderName || '',
        receiverName: s.receiverName || '',
        pickupAddress: s.pickupAddress || '',
        deliveryAddress: s.deliveryAddress || '',
        status: s.status || 'created',
        createdAt: s.createdAt,
        contactNumber: s.contactNumber || '',
      })));
    })();
  }, []);

  useEffect(() => { (async () => { setAgents(await agentsApi.listAgents()); })(); }, []);

  const handleCreateAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.agentName.value;
    const email = form.agentEmail.value;
    const password = form.agentPassword.value;
    try {
      await agentsApi.createAgent(name, email, password);
      setAgents(await agentsApi.listAgents());
      setCreateAgentOpen(false);
      toast({ title: 'Agent Created', description: `${name} (${email}) added.` });
    } catch (err) {
      toast({ title: 'Error creating agent', description: (err as Error).message, variant: 'destructive' });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage all shipments and operations</p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={()=>setDialogOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Shipment
            </Button>
            <Button size="lg" variant="secondary" onClick={()=>setCreateAgentOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Agent
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover-lift backdrop-blur-sm bg-card/50 border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Shipments List */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold">Recent Shipments</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {shipments.map((shipment, index) => (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <div className="relative">
                  <ShipmentCard shipment={{
                    id: shipment.id ?? '',
                    trackingId: shipment.trackingId,
                    senderName: shipment.senderName,
                    receiverName: shipment.receiverName,
                    pickupAddress: shipment.pickupAddress,
                    deliveryAddress: shipment.deliveryAddress,
                    status: shipment.status,
                    createdAt: shipment.createdAt,
                    contactNumber: shipment.contactNumber,
                  }}>
                    <div className="flex justify-end">
                      <button aria-label="Edit shipment" onClick={() => openEditDialog(shipment)} className="mr-2 text-primary hover:text-accent text-lg">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button aria-label="Delete shipment" onClick={() => handleDeleteShipment(shipment)} className="mt-4 text-destructive hover:text-accent text-lg">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </ShipmentCard>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <Modal open={dialogOpen} onOpenChange={setDialogOpen}>
        <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Create New Shipment</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleCreateShipment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input id="senderName" name="senderName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver Name</Label>
                <Input id="receiverName" name="receiverName" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address</Label>
              <Input id="pickupAddress" name="pickupAddress" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Input id="deliveryAddress" name="deliveryAddress" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Input id="pickupDate" name="pickupDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                <Input id="expectedDeliveryDate" name="expectedDeliveryDate" type="date" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input id="contactNumber" name="contactNumber" type="tel" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentId">Assign Agent</Label>
              <select name="agentId" id="agentId" required className="w-full border rounded p-2">
                <option value=''>Select Agent</option>
                {agents.filter(a=>a.status==='free').map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.email}) - {agent.status}</option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">Create Shipment</Button>
          </form>
        </ModalContent>
      </Modal>

      <Modal open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <ModalContent>
          <ModalHeader><ModalTitle>Edit Shipment</ModalTitle></ModalHeader>
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <div>
              <Label>Pickup Address</Label>
              <Input name="pickupAddress" required defaultValue={editingShipment?.pickupAddress || ''} />
            </div>
            <div>
              <Label>Delivery Address</Label>
              <Input name="deliveryAddress" required defaultValue={editingShipment?.deliveryAddress || ''} />
            </div>
            <div>
              <Label>Assign Agent</Label>
              <select name="agentId" className="w-full border rounded p-2" defaultValue={editingShipment?.agentId || ''}>
                <option value=''>Select Agent</option>
                {agents.filter(a=>a.status==='free' || a.id===editingShipment?.agentId).map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.email}) - {agent.status}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select name="status" className="w-full border rounded p-2" defaultValue={editingShipment?.status || 'created'}>
                <option value="created">Created</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out For Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={()=>setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      <Modal open={createAgentOpen} onOpenChange={setCreateAgentOpen}>
        <ModalContent>
          <ModalHeader><ModalTitle>Create Agent</ModalTitle></ModalHeader>
          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div><Label>Name</Label><Input name="agentName" required /></div>
            <div><Label>Email</Label><Input name="agentEmail" required type="email" /></div>
            <div><Label>Password</Label><Input name="agentPassword" required type="password" minLength={6} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={()=>setCreateAgentOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
