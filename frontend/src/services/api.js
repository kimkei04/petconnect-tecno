// Mock API Service for Standalone Frontend
// This replaces the axios calls with simulated responses using localStorage.

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const getStore = (key, defaultVal) => JSON.parse(localStorage.getItem(key)) || defaultVal;
const setStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// Initialize mock data if not exists
if (!localStorage.getItem('mockPets')) {
  setStore('mockPets', [
    { id: 1, tag_id: 'PTC-7741-A', name: 'Milo', species: 'Dog', breed: 'Golden Retriever', age: 3, status: 'healthy', photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1', owner_name: 'John Doe', owner_phone: '09171234567' },
    { id: 2, tag_id: 'PTC-7741-B', name: 'Luna', species: 'Cat', breed: 'Persian', age: 2, status: 'lost', photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', owner_name: 'Jane Smith', owner_phone: '09181234567' }
  ]);
}

if (!localStorage.getItem('mockAlerts')) {
  setStore('mockAlerts', [
    { id: 1, title: 'Pet Scanned!', message: 'Luna was scanned near Central Park.', type: 'scan', created_at: new Date().toISOString(), is_read: false, latitude: 10.3291, longitude: 123.9061 },
    { id: 2, title: 'Vaccine Reminder', message: 'Milo is due for Rabies vaccination.', type: 'vaccine', created_at: new Date(Date.now() - 86400000).toISOString(), is_read: true }
  ]);
}

// ── Auth ────────────────────────────────────────────────
export const login = async (data) => {
  await delay();
  const user = { id: 1, name: 'Demo User', email: data.email, role: data.email.includes('lgu') ? 'lgu' : 'owner' };
  localStorage.setItem('token', 'mock-jwt-token');
  localStorage.setItem('user', JSON.stringify(user));
  return { data: { token: 'mock-jwt-token', user } };
};

export const register = async (data) => {
  await delay();
  return login({ email: data.email });
};

export const updateProfile = async (data) => {
  await delay();
  const user = getStore('user', {});
  const updated = { ...user, ...data };
  setStore('user', updated);
  return { data: { message: 'Profile updated', user: updated } };
};

// ── Pets ────────────────────────────────────────────────
export const getPets = async () => {
  await delay();
  return { data: getStore('mockPets', []) };
};

export const getPet = async (id) => {
  await delay();
  const pet = getStore('mockPets', []).find(p => String(p.id) === String(id));
  if (!pet) throw new Error('Not found');
  return { data: pet };
};

export const createPet = async (data) => {
  await delay();
  const pets = getStore('mockPets', []);
  const newPet = { ...data, id: Date.now(), status: 'healthy', tag_id: `PTC-${Math.floor(1000 + Math.random() * 9000)}` };
  setStore('mockPets', [...pets, newPet]);
  return { data: newPet };
};

export const updatePet = async (id, data) => {
  await delay();
  let pets = getStore('mockPets', []);
  const index = pets.findIndex(p => String(p.id) === String(id));
  if (index > -1) {
    pets[index] = { ...pets[index], ...data };
    setStore('mockPets', pets);
    return { data: pets[index] };
  }
  throw new Error('Not found');
};

export const deletePet = async (id) => {
  await delay();
  let pets = getStore('mockPets', []);
  setStore('mockPets', pets.filter(p => String(p.id) !== String(id)));
  return { data: { message: 'Deleted' } };
};

// ── Public tag scan ─────────────────────────────────────
export const getPublicTag = async (tagId) => {
  await delay();
  const pets = getStore('mockPets', []);
  const pet = pets.find(p => String(p.tag_id) === String(tagId) || String(p.id) === String(tagId));
  if (!pet) throw new Error('Tag not found');
  return { data: pet };
};

export const submitScanLog = async (tagId, data) => {
  await delay();
  return { data: { message: 'Log submitted' } };
};

export const submitScanMessage = async (tagId, data) => {
  await delay();
  const alerts = getStore('mockAlerts', []);
  const newAlert = {
    id: Date.now(),
    title: 'New Sighting Message',
    message: data.message,
    type: 'sighting',
    created_at: new Date().toISOString(),
    is_read: false
  };
  setStore('mockAlerts', [newAlert, ...alerts]);
  return { data: { message: 'Message sent' } };
};

// ── Alerts / Notifications ──────────────────────────────
export const getAlerts = async () => {
  await delay();
  return { data: getStore('mockAlerts', []) };
};

export const markRead = async (id) => {
  await delay();
  let alerts = getStore('mockAlerts', []);
  const a = alerts.find(a => String(a.id) === String(id));
  if (a) a.is_read = true;
  setStore('mockAlerts', alerts);
  return { data: { message: 'Marked read' } };
};

export const deleteAlert = async (id) => {
  await delay();
  let alerts = getStore('mockAlerts', []);
  setStore('mockAlerts', alerts.filter(a => String(a.id) !== String(id)));
  return { data: { message: 'Deleted' } };
};

// ── Lost pets & Sightings ───────────────────────────────
export const getLostPets = async () => {
  await delay();
  return { data: getStore('mockPets', []).filter(p => p.status === 'lost').map(p => ({
    ...p, pet_name: p.name, pet_id: p.id, last_seen_location: 'Central Park'
  })) };
};

export const reportLost = async (id, data) => {
  await delay();
  let pets = getStore('mockPets', []);
  const p = pets.find(p => String(p.id) === String(id));
  if (p) {
    p.status = 'lost';
    Object.assign(p, data);
  }
  setStore('mockPets', pets);
  return { data: { message: 'Reported lost' } };
};

export const resolvedLost = async (id) => {
  await delay();
  let pets = getStore('mockPets', []);
  const p = pets.find(p => String(p.id) === String(id));
  if (p) p.status = 'healthy';
  setStore('mockPets', pets);
  return { data: { message: 'Resolved' } };
};

export const submitSighting = async (reportId, data) => {
  await delay();
  const alerts = getStore('mockAlerts', []);
  const newAlert = {
    id: Date.now(),
    title: 'New Pet Sighting!',
    message: `A sighting was reported: ${data.message || 'No details'}. Contact: ${data.reporter_phone || 'None'}`,
    type: 'sighting',
    created_at: new Date().toISOString(),
    is_read: false,
    latitude: data.latitude,
    longitude: data.longitude
  };
  setStore('mockAlerts', [newAlert, ...alerts]);
  return { data: { message: 'Sighting reported' } };
};

// ── LGU Dashboard ───────────────────────────────────────
export const getLguStats = async () => {
  await delay();
  return { data: { registered_pets: 152, active_lost: 12, resolved_lost: 45, strays_caught: 8 } };
};
export const getLguAlerts = async () => ({ data: [] });
export const getLguStrays = async () => ({ data: [] });
export const updateLguStray = async () => ({ data: {} });
export const getLguCampaigns = async () => ({ data: [] });
export const createLguCampaign = async () => ({ data: {} });
export const deleteLguCampaign = async () => ({ data: {} });
export const getLguAdoptions = async () => ({ data: [] });
export const createLguAdoption = async () => ({ data: {} });
export const updateLguAdoption = async () => ({ data: {} });

// ── Adoption Gallery ────────────────────────────────────
export const getPublicAdoptions = async () => ({ data: [] });

// ── Ownership Transfers ─────────────────────────────────
export const getMyTransfers = async () => {
  await delay();
  return { data: { sent: [], received: [] } };
};
export const initiateTransfer = async () => {
  await delay();
  return { data: { message: 'Transfer initiated' } };
};
export const acceptTransfer = async () => ({ data: { message: 'Accepted' } });
export const rejectTransfer = async () => ({ data: { message: 'Rejected' } });

// API Object for components using API.get/post
const API = {
  get: async (url) => {
    if (url.includes('/public/tag/')) {
      const tagId = url.split('/').pop();
      return getPublicTag(tagId);
    }
    return { data: {} };
  },
  post: async (url, data) => {
    if (url.includes('/public/message/')) {
      const tagId = url.split('/').pop();
      return submitScanMessage(tagId, data);
    }
    if (url.includes('/public/scan/')) {
      const tagId = url.split('/').pop();
      return submitScanLog(tagId, data);
    }
    return { data: {} };
  }
};

export default API;

