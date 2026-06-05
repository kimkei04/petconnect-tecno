import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  getLguStats, 
  getLguAlerts, 
  getLguStrays, 
  updateLguStray, 
  getLguCampaigns, 
  createLguCampaign, 
  deleteLguCampaign,
  getLguAdoptions,
  createLguAdoption,
  updateLguAdoption
} from '../services/api'

export default function LguDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  const [activeTab, setActiveTab] = useState('OVERVIEW')
  const [loading, setLoading] = useState(true)
  
  // Real DB States
  const [stats, setStats] = useState({
    total_pets: 0,
    lost_pets: 0,
    total_owners: 0,
    strays_open: 0,
    reunited_total: 0,
    scans_total: 0,
    new_this_month: 0,
    barangay_breakdown: []
  })
  
  const [alerts, setAlerts] = useState([])
  const [strays, setStrays] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [adoptions, setAdoptions] = useState([])
  
  // Modal / Form States
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    vaccine_type: '',
    target_barangay: '',
    campaign_date: '',
    location: ''
  })
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showAdoptionModal, setShowAdoptionModal] = useState(false)
  const [adoptionForm, setAdoptionForm] = useState({
    pet_name: '',
    species: 'Dog',
    breed: '',
    estimated_age: '',
    description: '',
    photo_url: '',
    barangay: ''
  })

  const [formLoading, setFormLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      return navigate('/login?role=lgu')
    }
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (loggedInUser.role !== 'lgu' && loggedInUser.role !== 'admin') {
      return navigate('/dashboard')
    }
    
    loadDashboardData()
  }, [navigate])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, alertsRes, straysRes, campaignsRes, adoptionsRes] = await Promise.all([
        getLguStats(),
        getLguAlerts(),
        getLguStrays(),
        getLguCampaigns(),
        getLguAdoptions()
      ])
      
      setStats(statsRes.data)
      setAlerts(alertsRes.data || [])
      setStrays(straysRes.data || [])
      setCampaigns(campaignsRes.data || [])
      setAdoptions(adoptionsRes.data || [])
    } catch (err) {
      console.error('Failed to load LGU dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')
    try {
      await createLguCampaign(campaignForm)
      setSuccess('Vaccination campaign scheduled and broadcasted!')
      setShowCampaignModal(false)
      setCampaignForm({ title: '', description: '', vaccine_type: '', target_barangay: '', campaign_date: '', location: '' })
      loadDashboardData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Failed to create campaign.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleAdoptionSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')
    try {
      await createLguAdoption(adoptionForm)
      setSuccess('Rescue pet listed in the adoption gallery!')
      setShowAdoptionModal(false)
      setAdoptionForm({ pet_name: '', species: 'Dog', breed: '', estimated_age: '', description: '', photo_url: '', barangay: '' })
      loadDashboardData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Failed to list pet for adoption.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateStray = async (id, newStatus) => {
    try {
      await updateLguStray(id, { status: newStatus })
      setSuccess('Stray sighting status updated.')
      loadDashboardData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update status.')
    }
  }

  const handleUpdateAdoption = async (id, newStatus) => {
    try {
      await updateLguAdoption(id, { status: newStatus })
      setSuccess('Adoption listing updated.')
      loadDashboardData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update adoption listing.')
    }
  }

  const handleDeleteCampaign = async (id) => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return
    try {
      await deleteLguCampaign(id)
      setSuccess('Campaign cancelled successfully.')
      loadDashboardData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete campaign.')
    }
  }

  const navItems = [
    { icon: 'grid_view', label: 'Overview' },
    { icon: 'emergency_share', label: 'Alerts' },
    { icon: 'pets', label: 'Adoption' },
    { icon: 'campaign', label: 'Campaigns' },
    { icon: 'monitoring', label: 'Strays' }
  ]

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
    </div>
  )

  const renderOverview = () => (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {[
          { icon: 'pets', label: 'Registered Pets', value: stats.total_pets, color: 'bg-primary/10 text-primary' },
          { icon: 'warning', label: 'Strays Reported', value: stats.strays_open, color: 'bg-error/10 text-error' },
          { icon: 'favorite', label: 'Reunited Pets', value: stats.reunited_total, color: 'bg-secondary/10 text-secondary' },
          { icon: 'sensors', label: 'Total NFC Scans', value: stats.scans_total, color: 'bg-tertiary/10 text-tertiary' }
        ].map(s => (
          <div key={s.label} className="premium-card p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-full bg-primary-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.08em] mt-3">{s.label}</p>
              <p className="text-[32px] font-bold text-on-surface leading-tight mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barrio breakdown & stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-surface-container/50 shadow-xl shadow-primary/5">
          <h2 className="text-xl font-serif-elegant font-bold text-on-surface mb-6 flex items-center gap-3">
            Top Registration Barangay Areas
            <span className="material-symbols-outlined text-primary text-xl">analytics</span>
          </h2>
          
          <div className="space-y-6">
            {stats.barangay_breakdown && stats.barangay_breakdown.length > 0 ? (
              stats.barangay_breakdown.map((bar, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                    <span>{bar.barangay}</span>
                    <span>{bar.count} pets</span>
                  </div>
                  <div className="h-3 bg-surface-container-low rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.min(100, (bar.count / stats.total_pets) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant/50">No regional data logged yet.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-surface-container/50 shadow-xl shadow-primary/5 space-y-6">
          <h3 className="text-lg font-serif-elegant font-bold text-on-surface">Compliance Summary</h3>
          <div className="space-y-4">
            <div className="p-4 bg-surface-container-low/50 rounded-2xl border border-surface-container/30">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Registered this Month</p>
              <p className="text-2xl font-bold text-primary mt-1">+{stats.new_this_month}</p>
            </div>
            <div className="p-4 bg-surface-container-low/50 rounded-2xl border border-surface-container/30">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Reunited Pets</p>
              <p className="text-2xl font-bold text-tertiary mt-1">{stats.reunited_total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'ALERTS':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
             <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-serif-elegant font-bold text-on-surface tracking-tight mb-2">Active Lost Pet Bulletins</h2>
                  <p className="text-on-surface-variant font-light">Monitor active lost pet cases inside barangay jurisdiction.</p>
                </div>
             </div>
             {alerts.length === 0 ? (
               <div className="text-center py-20 bg-white border rounded-3xl opacity-40">
                 <span className="material-symbols-outlined text-4xl mb-3">verified</span>
                 <p className="text-xs font-bold uppercase tracking-widest">No active lost reports</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {alerts.map(alert => (
                   <div key={alert.id} className="premium-card p-6 flex justify-between items-center group">
                     <div className="flex items-center gap-5">
                       <img src={alert.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                       <div>
                         <p className="font-serif-elegant font-bold text-on-surface text-lg leading-none mb-2">{alert.pet_name}</p>
                         <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{alert.address || 'Unknown'}</p>
                         <p className="text-[8px] text-error font-bold uppercase mt-1">Owner: {alert.owner_name}</p>
                       </div>
                     </div>
                     <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low px-3 py-1.5 rounded-full">
                       {new Date(alert.reported_at).toLocaleDateString()}
                     </span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )
      case 'ADOPTION':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
             <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-serif-elegant font-bold text-on-surface tracking-tight mb-2">Adoption Registry</h2>
                  <p className="text-on-surface-variant font-light">Manage LGU shelter adoptions & listings.</p>
                </div>
                <button 
                  onClick={() => setShowAdoptionModal(true)}
                  className="bg-brown-gradient text-on-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow"
                >
                  List Pet for Adoption
                </button>
             </div>
             
             {adoptions.length === 0 ? (
               <div className="text-center py-20 bg-white border border-dashed rounded-3xl opacity-40">
                 <p className="text-xs font-bold uppercase tracking-widest">No pets listed for adoption</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                 {adoptions.map(pet => (
                   <div key={pet.id} className="premium-card p-6 flex flex-col gap-6 group">
                     <div className="relative overflow-hidden rounded-[2rem] shadow-lg aspect-[16/9] bg-surface-container-low">
                      <img src={pet.photo_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      <span className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${pet.status === 'available' ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        {pet.status}
                      </span>
                     </div>
                     <div className="px-2">
                       <p className="font-serif-elegant font-bold text-on-surface text-2xl leading-none mb-2">{pet.pet_name}</p>
                       <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{pet.breed || pet.species} • {pet.estimated_age}</p>
                       <p className="text-xs text-on-surface-variant mt-2 font-light line-clamp-2">"{pet.description}"</p>
                     </div>
                     {pet.status === 'available' && (
                       <button 
                         onClick={() => handleUpdateAdoption(pet.id, 'adopted')}
                         className="w-full py-4 bg-primary text-on-primary rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:shadow transition-all"
                       >
                         Mark as Adopted
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        )
      case 'CAMPAIGNS':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
             <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-serif-elegant font-bold text-on-surface tracking-tight mb-2">Vaccination Campaigns</h2>
                  <p className="text-on-surface-variant font-light">Schedule rabies immunization operations.</p>
                </div>
                <button 
                  onClick={() => setShowCampaignModal(true)}
                  className="bg-brown-gradient text-on-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow"
                >
                  Create Campaign
                </button>
             </div>
             
             {campaigns.length === 0 ? (
               <div className="text-center py-20 bg-white border border-dashed rounded-3xl opacity-40">
                 <p className="text-xs font-bold uppercase tracking-widest">No upcoming campaigns</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {campaigns.map(c => (
                   <div key={c.id} className="premium-card p-6 flex flex-col justify-between border relative overflow-hidden">
                     <div className="space-y-4">
                       <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider inline-block">
                         {c.vaccine_type}
                       </span>
                       <h3 className="text-xl font-serif-elegant font-bold text-on-surface">{c.title}</h3>
                       <p className="text-xs text-on-surface-variant font-light">"{c.description || 'No description'}"</p>
                       
                       <div className="grid grid-cols-2 gap-4 text-left text-xs pt-4 border-t border-surface-container-low">
                         <div>
                           <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Date</p>
                           <p className="font-bold text-on-surface mt-0.5">{new Date(c.campaign_date).toLocaleDateString()}</p>
                         </div>
                         <div>
                           <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Barangay</p>
                           <p className="font-bold text-on-surface mt-0.5">{c.target_barangay || 'All'}</p>
                         </div>
                       </div>
                     </div>

                     <div className="pt-6 mt-6 border-t border-surface-container/30 flex justify-between items-center">
                       <span className="text-xs font-semibold text-primary">Location: {c.location}</span>
                       <button 
                         onClick={() => handleDeleteCampaign(c.id)}
                         className="text-xs font-bold text-error uppercase hover:underline"
                       >
                         Cancel
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )
      case 'STRAYS':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
             <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-serif-elegant font-bold text-on-surface tracking-tight mb-2">Stray Sighting Reports</h2>
                  <p className="text-on-surface-variant font-light">Monitor open community-reported stray animal sightings.</p>
                </div>
             </div>
             
             {strays.length === 0 ? (
               <div className="text-center py-20 bg-white border border-dashed rounded-3xl opacity-40">
                 <p className="text-xs font-bold uppercase tracking-widest">No stray animal reports</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {strays.map(stray => (
                   <div key={stray.id} className="premium-card p-6 flex flex-col justify-between gap-4">
                     <div className="flex items-start gap-4">
                       {stray.photo_url ? (
                         <img src={stray.photo_url} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="" />
                       ) : (
                         <div className="w-16 h-16 bg-surface-container-low text-on-surface-variant/20 rounded-xl flex items-center justify-center">
                           <span className="material-symbols-outlined">pets</span>
                         </div>
                       )}
                       <div>
                         <div className="flex items-center gap-2">
                           <span className="bg-error/15 text-error px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">{stray.species}</span>
                           <span className="bg-surface-container-high px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">{stray.status}</span>
                         </div>
                         <h4 className="font-bold text-on-surface text-sm mt-2">{stray.location_description || `Reported in ${stray.barangay}`}</h4>
                         <p className="text-xs text-on-surface-variant font-light mt-1">"{stray.description}"</p>
                         <p className="text-[9px] text-on-surface-variant/40 mt-2">Reporter: {stray.reporter_name || 'Anonymous'}</p>
                       </div>
                     </div>
                     
                     {stray.status === 'open' && (
                       <div className="flex gap-2 pt-2 border-t border-surface-container/30">
                         <button 
                           onClick={() => handleUpdateStray(stray.id, 'investigating')}
                           className="flex-1 py-2 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-lg hover:bg-primary/20 transition-all"
                         >
                           Investigate
                         </button>
                         <button 
                           onClick={() => handleUpdateStray(stray.id, 'rescued')}
                           className="flex-1 py-2 bg-tertiary text-on-tertiary text-[10px] font-bold uppercase rounded-lg hover:shadow transition-all"
                         >
                           Rescued
                         </button>
                       </div>
                     )}
                     {stray.status === 'investigating' && (
                       <button 
                         onClick={() => handleUpdateStray(stray.id, 'rescued')}
                         className="w-full py-2 bg-tertiary text-on-tertiary text-[10px] font-bold uppercase rounded-lg hover:shadow transition-all"
                       >
                         Mark as Rescued
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        )
      default:
        return renderOverview()
    }
  }

  return (
    <div className="bg-surface min-h-screen pb-40 selection:bg-primary-container selection:text-primary font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container/30 h-[72px] flex items-center">
        <div className="flex justify-between items-center px-10 w-full max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-11 h-11 bg-brown-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-on-primary text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-on-surface leading-none tracking-tight">{user.name || 'LGU Admin'}</h1>
              <p className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-[0.2em] mt-1">Barangay {user.barangay || 'Cebu City'}</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {success && <span className="text-xs text-tertiary font-bold animate-pulse">{success}</span>}
            <button 
              onClick={() => { localStorage.clear(); navigate('/') }}
              className="px-6 py-2 bg-surface border border-error/20 rounded-xl text-[11px] font-semibold text-error hover:bg-error hover:text-white transition-all uppercase tracking-[0.08em] shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-28 px-10 max-w-7xl mx-auto">
        {renderContent()}
      </main>

      {/* Vaccination Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-serif-elegant font-bold text-on-surface">Schedule Vax Campaign</h3>
              <button onClick={() => setShowCampaignModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/80 hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleCampaignSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Campaign Title</label>
                <input required type="text" value={campaignForm.title} onChange={(e) => setCampaignForm({...campaignForm, title: e.target.value})} placeholder="e.g. Free Rabies Drive" className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Vaccine Type</label>
                <input required type="text" value={campaignForm.vaccine_type} onChange={(e) => setCampaignForm({...campaignForm, vaccine_type: e.target.value})} placeholder="e.g. Anti-Rabies Booster" className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Date</label>
                  <input required type="date" value={campaignForm.campaign_date} onChange={(e) => setCampaignForm({...campaignForm, campaign_date: e.target.value})} className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Target Barangay</label>
                  <input required type="text" value={campaignForm.target_barangay} onChange={(e) => setCampaignForm({...campaignForm, target_barangay: e.target.value})} className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Specific Location / Venue</label>
                <input required type="text" value={campaignForm.location} onChange={(e) => setCampaignForm({...campaignForm, location: e.target.value})} placeholder="e.g. Barangay Hall Gym" className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Details / Instructions</label>
                <textarea rows="3" value={campaignForm.description} onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})} placeholder="Owner reminders, guidelines..." className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs resize-none" />
              </div>
              <button type="submit" disabled={formLoading} className="w-full py-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl shadow mt-2">
                {formLoading ? 'Scheduling...' : 'Launch Campaign'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Adoption Listing Modal */}
      {showAdoptionModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-serif-elegant font-bold text-on-surface">List Pet for Adoption</h3>
              <button onClick={() => setShowAdoptionModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/80 hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleAdoptionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Pet Name</label>
                  <input required type="text" value={adoptionForm.pet_name} onChange={(e) => setAdoptionForm({...adoptionForm, pet_name: e.target.value})} placeholder="Buddy" className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Species</label>
                  <select value={adoptionForm.species} onChange={(e) => setAdoptionForm({...adoptionForm, species: e.target.value})} className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs">
                    <option>Dog</option><option>Cat</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Breed</label>
                  <input type="text" value={adoptionForm.breed} onChange={(e) => setAdoptionForm({...adoptionForm, breed: e.target.value})} placeholder="e.g. Beagle" className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Estimated Age</label>
                  <input required type="text" value={adoptionForm.estimated_age} onChange={(e) => setAdoptionForm({...adoptionForm, estimated_age: e.target.value})} placeholder="e.g. 6 months" className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Photo URL</label>
                <input type="text" value={adoptionForm.photo_url} onChange={(e) => setAdoptionForm({...adoptionForm, photo_url: e.target.value})} placeholder="https://..." className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Barangay</label>
                <input required type="text" value={adoptionForm.barangay} onChange={(e) => setAdoptionForm({...adoptionForm, barangay: e.target.value})} placeholder="e.g. Lahug" className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
                <textarea required rows="3" value={adoptionForm.description} onChange={(e) => setAdoptionForm({...adoptionForm, description: e.target.value})} placeholder="Describe pet behavior, compatibility, rescue history..." className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs resize-none" />
              </div>
              <button type="submit" disabled={formLoading} className="w-full py-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl shadow mt-2">
                {formLoading ? 'Submitting...' : 'List in Adoption board'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-[68px] bg-white/90 backdrop-blur-xl border-t border-surface-container/50 flex justify-around items-center px-6 z-50">
        {navItems.map(item => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab(item.label.toUpperCase())}
            className={`flex items-center justify-center transition-all duration-300 ${activeTab === item.label.toUpperCase() ? 'bg-primary text-on-primary shadow-md px-5 h-11 rounded-full gap-2' : 'text-on-surface-variant hover:text-primary w-11 h-11 rounded-full'}`}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            {activeTab === item.label.toUpperCase() && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
