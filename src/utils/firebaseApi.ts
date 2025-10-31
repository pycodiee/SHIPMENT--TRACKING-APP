import { auth, db, storage } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { rtdb } from '@/lib/firebase';
import { ref as rtdbRef, set as rtdbSet, remove as rtdbRemove } from 'firebase/database';

export type UserRole = 'admin' | 'agent' | 'customer';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export const authApi = {
  onChange: (cb: (user: AppUser | null) => void) =>
    onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) return cb(null);
      const u = await fetchUserProfile(fbUser);
      cb(u);
    }),

  signup: async (email: string, password: string, name: string, role: UserRole) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userDoc = doc(db, 'users', cred.user.uid);
    await setDoc(userDoc, { email, name, role, createdAt: serverTimestamp() });
    const profile: AppUser = { id: cred.user.uid, email, name, role };
    return profile;
  },

  login: async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return fetchUserProfile(cred.user);
  },

  logout: () => signOut(auth),
};

async function fetchUserProfile(fbUser: FirebaseUser): Promise<AppUser> {
  const snap = await getDoc(doc(db, 'users', fbUser.uid));
  const data = snap.data() as Omit<AppUser, 'id'> | undefined;
  return { id: fbUser.uid, email: fbUser.email || '', name: data?.name || '', role: (data?.role || 'customer') as UserRole };
}

// Shipments
export type ShipmentStatus = 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed';

export interface Shipment {
  id?: string;
  trackingId: string;
  senderName: string;
  receiverName: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: ShipmentStatus;
  createdAt?: any;
  contactNumber: string;
  agentId?: string;
  customerEmail?: string;
  lastLocation?: { lat: number; lng: number; address?: string } | null;
  pickupDate?: string; // ISO date
  expectedDeliveryDate?: string; // ISO date
}

export const shipmentsApi = {
  create: async (shipment: Shipment) => {
    const col = collection(db, 'shipments');
    const docRef = await addDoc(col, { ...shipment, createdAt: serverTimestamp() });
    // RTDB sync
    const shipmentForRtdb = {
      trackingId: shipment.trackingId,
      senderName: shipment.senderName,
      receiverName: shipment.receiverName,
      pickupAddress: shipment.pickupAddress,
      deliveryAddress: shipment.deliveryAddress,
      status: shipment.status,
      contactNumber: shipment.contactNumber,
      agentId: shipment.agentId || '',
      customerEmail: shipment.customerEmail || '',
      lastLocation: shipment.lastLocation || null,
      createdAt: Date.now()
    };
    await rtdbSet(rtdbRef(rtdb, `shipments/${shipment.trackingId}`), shipmentForRtdb);
    return docRef.id;
  },

  listAll: async () => {
    const col = collection(db, 'shipments');
    const snap = await getDocs(col);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Shipment) }));
  },

  listForAgent: async (agentId: string) => {
    const q = query(collection(db, 'shipments'), where('agentId', '==', agentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Shipment) }));
  },

  findByTrackingId: async (trackingId: string) => {
    const q = query(collection(db, 'shipments'), where('trackingId', '==', trackingId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as Shipment) };
  },

  onShipment: (shipmentId: string, cb: (s: Shipment & { id: string }) => void) =>
    onSnapshot(doc(db, 'shipments', shipmentId), (snap) => {
      const data = snap.data() as Shipment | undefined;
      if (data) cb({ id: snap.id, ...data });
    }),

  updateStatus: async (shipmentId: string, status: ShipmentStatus, location?: { lat: number; lng: number; address?: string }) => {
    const snap = await getDoc(doc(db, 'shipments', shipmentId));
    if (!snap.exists()) return;
    const oldData = snap.data() as Shipment;
    // Update Firestore
    await updateDoc(doc(db, 'shipments', shipmentId), { status, lastLocation: location || null });
    await addDoc(collection(db, 'shipments', shipmentId, 'updates'), {
      status,
      location: location || null,
      at: serverTimestamp(),
    });
    // RTDB sync
    const rtdbNode = rtdbRef(rtdb, `shipments/${oldData.trackingId}`);
    await rtdbSet(rtdbNode, {
      ...oldData,
      status,
      lastLocation: location || null,
      createdAt: oldData.createdAt?.seconds ? oldData.createdAt.seconds * 1000 : Date.now()
    });
  },

  edit: async (id: string, trackingId: string, patch: Partial<Shipment>) => {
    // Patch Firestore
    await updateDoc(doc(db, 'shipments', id), patch);
    // Patch RTDB
    // Fetch full fresh data from Firestore (since the doc may have been patched)
    const snap = await getDoc(doc(db, 'shipments', id));
    if (!snap.exists()) return;
    const newData = snap.data() as Shipment;
    const rtdbNode = rtdbRef(rtdb, `shipments/${trackingId}`);
    await rtdbSet(rtdbNode, {
      trackingId: newData.trackingId,
      senderName: newData.senderName,
      receiverName: newData.receiverName,
      pickupAddress: newData.pickupAddress,
      deliveryAddress: newData.deliveryAddress,
      status: newData.status,
      contactNumber: newData.contactNumber,
      agentId: newData.agentId || '',
      customerEmail: newData.customerEmail || '',
      lastLocation: newData.lastLocation || null,
      createdAt: newData.createdAt?.seconds ? newData.createdAt.seconds * 1000 : Date.now()
    });
  },

  uploadProof: async (shipmentId: string, file: File) => {
    const proofRef = ref(storage, `pods/${shipmentId}/${file.name}`);
    await uploadBytes(proofRef, file);
    const url = await getDownloadURL(proofRef);
    await addDoc(collection(db, 'shipments', shipmentId, 'pods'), {
      url,
      at: serverTimestamp(),
    });
    await updateDoc(doc(db, 'shipments', shipmentId), { status: 'delivered' });
    return url;
  },

  submitFeedback: async (shipmentId: string, rating: number, comments: string) => {
    await addDoc(collection(db, 'shipments', shipmentId, 'feedback'), {
      rating,
      comments,
      at: serverTimestamp(),
    });
  },

  delete: async (id: string) => {
    // Get the trackingId before deletion
    const snap = await getDoc(doc(db, 'shipments', id));
    let trackingId = undefined;
    if (snap.exists()) trackingId = (snap.data() as Shipment).trackingId;
    await deleteDoc(doc(db, 'shipments', id));
    if (trackingId)
      await rtdbRemove(rtdbRef(rtdb, `shipments/${trackingId}`));
  },
};

export interface Agent {
  id: string;
  name: string;
  email: string;
  status: 'free' | 'busy';
}

export const agentsApi = {
  /**
   * Create an agent (auth + Firestore + RTDB)
   */
  createAgent: async (name: string, email: string, password: string): Promise<Agent> => {
    // 1. Create user in Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    // 2. Store in Firestore
    const userDoc = doc(db, 'agents', cred.user.uid);
    const agentData: Agent = { id: cred.user.uid, name, email, status: 'free' };
    await setDoc(userDoc, agentData);
    // 3. Store in RTDB
    await rtdbSet(rtdbRef(rtdb, `agents/${cred.user.uid}`), agentData);
    return agentData;
  },
  /**
   * List all agents (with status)
   */
  listAgents: async (): Promise<Agent[]> => {
    const colSnap = await getDocs(collection(db, 'agents'));
    return colSnap.docs.map(doc => doc.data() as Agent);
  },
  /**
   * Set an agent's status (free/busy)
   */
  setAgentStatus: async (agentId: string, status: 'free' | 'busy') => {
    await updateDoc(doc(db, 'agents', agentId), { status });
    await rtdbSet(rtdbRef(rtdb, `agents/${agentId}/status`), status);
  },
  /**
   * Delete agent records (Firestore + RTDB). Note: Cannot delete Auth user from client SDK.
   */
  deleteAgent: async (agentId: string) => {
    await deleteDoc(doc(db, 'agents', agentId));
    await rtdbRemove(rtdbRef(rtdb, `agents/${agentId}`));
  },
};


