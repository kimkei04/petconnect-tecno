import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API, { getPublicTag, submitSighting } from '../services/api'
import MapComponent from '../components/MapComponent'

export default function PublicPetProfile() {
  const { tagId } = useParams()
  const navigate = useNavigate()
  
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  
  // Messaging & Sighting States
  const [activeTab, setActiveTab] = useState('INFO') // INFO or REPORT
  const [msg, setMsg] = useState('')
  const [msgSent, setMsgSent] = useState(false)
  const [msgError, setMsgError] = useState('')
  
  const [sightingForm, setSightingForm] = useState({
    reporter_name: '',
    reporter_phone: '',
    message: '',
    latitude: '',
    longitude: ''
  })
  const [locShared, setLocShared] = useState(false)
  const [submittingSighting, setSubmittingSighting] = useState(false)
  const [sightingSuccess, setSightingSuccess] = useState('')

  useEffect(() => {
    if (!tagId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    getPublicTag(tagId)
      .then(r => {
        if (r.data.status?.toLowerCase() === 'lost') {
          navigate(`/found/${tagId}`, { replace: true })
          return
        }
        setPet(r.data)
      })
      .catch((err) => {
        console.error('Public profile fetch error:', err)
        setNotFound(true)
      })
      .finally(() => setLoading(false))

    // Optional: Log scan location silently
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        API.post(`/public/scan/${tagId}`, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          scanType: 'public_scan'
        }).catch(() => {})
      }, () => {})
    }
  }, [tagId, navigate])

  const handleSendMessage = async e => {
    e.preventDefault()
    if (!msg.trim()) return
    setMsgError('')
    try {
      await API.post(`/public/message/${tagId}`, { message: msg })
      setMsgSent(true)
      setMsg('')
    } catch (err) {
      setMsgError('Failed to send message. Please try again or call the owner.')
    }
  }

  const shareLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        setSightingForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }))
        setLocShared(true)
      },
      () => alert('Could not access location. Please type the location details.')
    )
  }

  const handleSightingSubmit = async e => {
    e.preventDefault()
    setSubmittingSighting(true)
    setSightingSuccess('')
    try {
      // Use pet.id or pet.lost_report_id as identifier
      await submitSighting(pet?.lost_report_id || pet?.id, sightingForm)
      setSightingSuccess('Thank you! Your report has been sent to the owner.')
      setSightingForm({ reporter_name: '', reporter_phone: '', message: '', latitude: '', longitude: '' })
      setLocShared(false)
      setTimeout(() => setSightingSuccess(''), 5000)
    } catch (err) {
      alert('Failed to submit report. Please try again.')
    } finally {
      setSubmittingSighting(true) // Keep it "true" for a bit or reset
      setTimeout(() => setSubmittingSighting(false), 2000)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
    </div>
  )

  if (notFound || !pet) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant/20 mb-6 shadow-inner">
        <span className="material-symbols-outlined text-5xl">qr_code_scanner</span>
      </div>
      <h1 className="text-2xl font-serif-elegant font-bold text-on-surface mb-2">Tag Not Recognized</h1>
      <p className="text-on-surface-variant font-light max-w-xs">This PetConnect smart tag hasn't been activated or the profile is private.</p>
      <button onClick={() => navigate('/')} className="mt-8 py-3 px-10 bg-on-surface text-surface rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl">Back to Home</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans antialiased selection:bg-primary-container selection:text-primary pb-20">
      {/* Dynamic Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-surface-container-low shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">pets</span>
          <h1 className="text-xs font-serif-elegant font-black text-on-surface tracking-[0.2em] uppercase">PetConnect ID</h1>
        </div>
        <div className="flex items-center gap-2 bg-tertiary/10 px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse"></div>
          <span className="text-[9px] font-bold text-tertiary uppercase tracking-widest">Secure Scan</span>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-lg mx-auto w-full space-y-8">
        
        {/* Profile Hero Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/15 rounded-[3.5rem] blur-2xl group-hover:bg-primary/25 transition-all duration-700"></div>
            <img
              src={pet.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'}
              alt={pet.name}
              className="relative w-64 h-64 rounded-[3.5rem] object-cover border-4 border-white shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            />
            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-brown-gradient text-white rounded-2xl shadow-xl flex items-center justify-center border border-white/20">
               <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-5xl font-serif-elegant font-bold text-on-surface tracking-tight">
              {pet.name}
            </h2>
            <p className="text-on-surface-variant text-base font-medium tracking-wide">
              {pet.breed || pet.species} <span className="mx-2 opacity-30">•</span> {pet.age ? `${pet.age} Years` : 'Companion'}
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-surface-container/50">
          <button 
            onClick={() => setActiveTab('INFO')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'INFO' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Pet Information
          </button>
          <button 
            onClick={() => setActiveTab('REPORT')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'REPORT' ? 'bg-error text-white shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Report Sighting
          </button>
        </div>

        {activeTab === 'INFO' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Owner Contact Card */}
            <section className="bg-brown-gradient rounded-[2rem] p-7 text-on-primary shadow-xl relative overflow-hidden">
               <div className="relative z-10 space-y-6">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">Registered Owner</p>
                     <h3 className="text-2xl font-serif-elegant font-bold">{pet.owner_name}</h3>
                   </div>
                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                     <span className="material-symbols-outlined text-lg">shield_person</span>
                   </div>
                 </div>
                 
                 <div className="flex flex-col gap-3">
                   <a href={`tel:${pet.owner_phone}`} className="w-full py-4 bg-white text-primary rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
                      <span className="material-symbols-outlined text-lg">call</span>
                      Call {pet.owner_name}
                   </a>
                   <div className="text-[10px] text-white/60 font-medium text-center italic">
                     Please call immediately if you have this pet secured.
                   </div>
                 </div>
               </div>
            </section>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="premium-card p-5 bg-primary-container/10 border-primary/5 flex flex-col gap-2">
                <span className="material-symbols-outlined text-primary text-xl">medical_information</span>
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Medical Notes</p>
                <p className="text-xs font-semibold text-on-surface">{pet.medical_conditions || 'None reported'}</p>
              </div>
              <div className="premium-card p-5 bg-tertiary-container/10 border-tertiary/5 flex flex-col gap-2">
                <span className="material-symbols-outlined text-tertiary text-xl">info</span>
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Personality</p>
                <p className="text-xs font-semibold text-on-surface">{pet.note || 'Friendly & Calm'}</p>
              </div>
            </div>

            {/* Location Reference */}
            <section className="premium-card p-5 space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary text-lg">home_pin</span>
                   Home Safe Zone
                 </h3>
               </div>
               <div className="h-48 w-full rounded-2xl overflow-hidden border border-surface-container shadow-inner">
                  <MapComponent lat={pet.latitude || 10.3364} lng={pet.longitude || 123.8971} zoom={15} />
               </div>
            </section>

            {/* Quick Message Form */}
            <section className="premium-card p-7 space-y-5 bg-white border-2 border-primary/5">
               <h3 className="text-lg font-serif-elegant font-bold text-on-surface flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary">chat_bubble</span>
                 Direct Message
               </h3>
               
               {msgSent ? (
                 <div className="bg-tertiary/5 border border-tertiary/10 p-6 rounded-2xl text-center animate-in zoom-in duration-300">
                    <span className="material-symbols-outlined text-tertiary text-3xl mb-2">check_circle</span>
                    <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Message sent to guardian</p>
                 </div>
               ) : (
                 <form onSubmit={handleSendMessage} className="space-y-4">
                   <textarea
                     value={msg}
                     onChange={e => setMsg(e.target.value)}
                     rows={3}
                     placeholder="Type a quick message to the owner..."
                     className="w-full px-5 py-4 bg-surface-container-low border border-surface-container rounded-2xl text-sm outline-none focus:border-primary/30 transition-all resize-none"
                   />
                   {msgError && <p className="text-[10px] text-error font-bold">{msgError}</p>}
                   <button type="submit" className="w-full py-4 bg-on-surface text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-on-surface/10 hover:bg-primary transition-all active:scale-[0.98]">
                     Send Message
                   </button>
                 </form>
               )}
            </section>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sighting Report Form */}
            <section className="premium-card p-8 space-y-6 bg-white border-2 border-error/5">
              <div className="space-y-1">
                <h3 className="text-2xl font-serif-elegant font-bold text-on-surface">Found this pet?</h3>
                <p className="text-xs text-on-surface-variant font-light">Submit your sighting details to help the owner.</p>
              </div>

              {sightingSuccess && (
                <div className="p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl text-tertiary text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-in zoom-in duration-300">
                  <span className="material-symbols-outlined">verified</span>
                  {sightingSuccess}
                </div>
              )}

              <form onSubmit={handleSightingSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Maria"
                      value={sightingForm.reporter_name}
                      onChange={e => setSightingForm({...sightingForm, reporter_name: e.target.value})}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3.5 text-xs outline-none focus:border-primary/30" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Your Contact</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 0917..."
                      value={sightingForm.reporter_phone}
                      onChange={e => setSightingForm({...sightingForm, reporter_phone: e.target.value})}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3.5 text-xs outline-none focus:border-primary/30" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Observation Details</label>
                  <textarea 
                    required
                    rows={3} 
                    placeholder="Where exactly did you see the pet? Behavior? Direction of travel?"
                    value={sightingForm.message}
                    onChange={e => setSightingForm({...sightingForm, message: e.target.value})}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-4 text-xs outline-none focus:border-primary/30 resize-none" 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-surface-container/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">Share GPS Pin</span>
                    <span className="text-[10px] text-on-surface-variant">Sends current location to owner</span>
                  </div>
                  <button
                    type="button"
                    onClick={shareLocation}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${locShared ? 'bg-tertiary text-on-tertiary shadow-sm' : 'bg-white text-primary border border-surface-container hover:bg-surface-container-low'}`}
                  >
                    {locShared ? 'Shared ✓' : 'Add Location'}
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={submittingSighting}
                  className="w-full py-5 bg-error text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-error/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                >
                  {submittingSighting ? 'Submitting Report...' : 'Transmit Sighting Report'}
                </button>
              </form>
            </section>
          </div>
        )}

        {/* System Footer */}
        <footer className="text-center pt-10 pb-6 border-t border-surface-container-low opacity-40">
           <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span className="text-[9px] font-black uppercase tracking-[0.25em]">PetConnect Digital ID System</span>
           </div>
           <p className="text-[8px] uppercase tracking-widest">Global Standard for Pet Safety & Recovery</p>
        </footer>
      </main>
    </div>
  )
}
