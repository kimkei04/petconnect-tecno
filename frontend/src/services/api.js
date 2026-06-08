import axios from 'axios'

const baseURL = '/api';

const API = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ────────────────────────────────────────────────
export const login    = data => API.post('/auth/login', data)
export const register = data => API.post('/auth/register', data)
export const updateProfile = data => API.put('/auth/profile', data)

// ── Pets ────────────────────────────────────────────────
export const getPets     = ()         => API.get('/pets')
export const getPet      = id         => API.get(`/pets/${id}`)
export const createPet   = data       => API.post('/pets', data)
export const updatePet   = (id, data) => API.put(`/pets/${id}`, data)
export const deletePet   = id         => API.delete(`/pets/${id}`)

// ── Public tag scan ─────────────────────────────────────
export const getPublicTag = tagId => API.get(`/public/tag/${tagId}`)
export const submitScanLog = (tagId, data) => API.post(`/public/scan/${tagId}`, data)
export const submitScanMessage = (tagId, data) => API.post(`/public/message/${tagId}`, data)

// ── Alerts / Notifications ──────────────────────────────
export const getAlerts   = ()         => API.get('/alerts')
export const markRead    = id         => API.patch(`/alerts/${id}/read`)
export const deleteAlert = id         => API.delete(`/alerts/${id}`)

// ── Lost pets & Sightings ───────────────────────────────
export const getLostPets  = ()         => API.get('/public/lost')
export const reportLost   = (id, data) => API.post(`/pets/${id}/lost`, data)
export const resolvedLost = id         => API.post(`/pets/${id}/found`)
export const submitSighting = (reportId, data) => API.post(`/public/sighting/${reportId}`, data)

// ── LGU Dashboard ───────────────────────────────────────
export const getLguStats  = ()         => API.get('/lgu/stats')
export const getLguAlerts = ()         => API.get('/lgu/alerts')
export const getLguStrays = ()         => API.get('/lgu/strays')
export const updateLguStray = (id, data) => API.put(`/lgu/strays/${id}`, data)
export const getLguCampaigns = ()      => API.get('/lgu/campaigns')
export const createLguCampaign = data  => API.post('/lgu/campaigns', data)
export const deleteLguCampaign = id    => API.delete(`/lgu/campaigns/${id}`)
export const getLguAdoptions = ()      => API.get('/lgu/adoptions')
export const createLguAdoption = data  => API.post('/lgu/adoptions', data)
export const updateLguAdoption = (id, data) => API.put(`/lgu/adoptions/${id}`, data)



// ── Adoption Gallery ────────────────────────────────────
export const getPublicAdoptions = ()   => API.get('/public/adoptions')

// ── Ownership Transfers ─────────────────────────────────
export const getMyTransfers   = ()     => API.get('/transfers/my-transfers')
export const initiateTransfer = data   => API.post('/transfers', data)
export const acceptTransfer   = id     => API.post(`/transfers/${id}/accept`)
export const rejectTransfer   = id     => API.post(`/transfers/${id}/reject`)

export default API
