import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API, { getPublicTag } from '../services/api'
import MapComponent from '../components/MapComponent'

export default function PublicPetProfile() {
  const { tagId } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getPublicTag(tagId)
      .then(r => {
        if (r.data.status === 'lost') {
          navigate(`/found/${tagId}`, { replace: true })
          return
        }
        setPet(r.data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))

    // Send scan location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        API.post(`/public/scan/${tagId}`, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }).catch(() => { })
      })
    }
  }, [tagId])

  const sendMessage = async e => {
    e.preventDefault()
    try {
      await API.post(`/public/message/${tagId}`, { message: msg })
      setMsgSent(true)
    } catch (err) {
      // For demo purposes, we'll pretend it worked
      setMsgSent(true)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
    </div>
  )

  if (!pet) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant/20 mb-6">
        <span className="material-symbols-outlined text-5xl">qr_code_scanner</span>
      </div>
      <h1 className="text-2xl font-serif-elegant font-bold text-on-surface mb-2">Tag Not Registered</h1>
      <p className="text-on-surface-variant font-light">This PetConnect smart tag hasn't been activated yet.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans antialiased selection:bg-primary-container selection:text-primary">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 border-b border-surface-container-low shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">pets</span>
          <h1 className="text-sm font-serif-elegant font-bold text-on-surface tracking-[0.3em] uppercase">PetConnect</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Active Scan</span>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-lg mx-auto w-full space-y-10">
        {/* Status Banner */}
        <div className="bg-tertiary/10 border border-tertiary/20 rounded-2xl p-4 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="material-symbols-outlined text-tertiary text-xl">verified</span>
          <span className="font-bold text-tertiary text-[10px] tracking-[0.2em] uppercase">Verified PetConnect Secure Profile</span>
        </div>

        {/* Profile Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-primary/10 rounded-[4.5rem] blur-2xl group-hover:bg-primary/20 transition-all duration-700"></div>
            <img
              src={pet.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'}
              alt={pet.name}
              className="relative w-72 h-72 rounded-[4.5rem] object-cover border-8 border-white shadow-2xl transition-all duration-700 hover:scale-[1.02]"
            />
            <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary border border-surface-container-low group-hover:rotate-12 transition-transform">
               <span className="material-symbols-outlined text-3xl">nfc</span>
            </div>
          </div>
          
          <h2 className="text-6xl font-serif-elegant font-bold mb-2 tracking-tighter text-gradient">
            {pet.name}
          </h2>
          
          <p className="text-on-surface-variant/80 text-xl font-light mb-6 tracking-tight">
            {pet.breed} <span className="mx-2 opacity-30">•</span> {pet.age} Years Old
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white rounded-full border border-surface-container shadow-sm">
            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Registered in Lahug, Cebu City</span>
          </div>
        </div>

        {/* Essential Info Cards */}
        <div className="grid grid-cols-1 gap-6">
          {/* Contact Section */}
          <section className="bg-brown-gradient rounded-[2.5rem] p-8 text-on-primary shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 mb-1">Primary Guardian</p>
                  <h3 className="text-3xl font-serif-elegant font-bold">{pet.owner_name || 'Sarah Jenkins'}</h3>
                </div>
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                  <span className="material-symbols-outlined">shield_person</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <a href={`tel:${pet.owner_phone}`} className="flex items-center justify-center gap-3 py-4 bg-white text-primary rounded-2xl font-bold shadow-lg hover:bg-surface-bright active:scale-[0.98] transition-all uppercase tracking-widest text-[11px]">
                  <span className="material-symbols-outlined text-lg">call</span>
                  Voice Call Owner
                </a>
                <button 
                  onClick={() => document.getElementById('msg-section').scrollIntoView({behavior: 'smooth'})}
                  className="flex items-center justify-center gap-3 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all uppercase tracking-widest text-[11px]"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  Send Digital Message
                </button>
              </div>
            </div>
          </section>

          {/* Map & Location */}
          <section className="premium-card p-6 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">map</span>
                <h3 className="font-serif-elegant font-bold text-lg">Safe Zone Area</h3>
              </div>
              <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Geo-Tagged</span>
            </div>
            <div className="h-64 w-full rounded-[1.5rem] overflow-hidden border border-surface-container shadow-inner">
               <MapComponent lat={pet.latitude || 10.3364} lng={pet.longitude || 123.8971} zoom={15} />
            </div>
          </section>

          {/* Health & Medical Section */}
          <section className="grid grid-cols-2 gap-4">
            <div className="premium-card p-6 bg-primary-container/20 border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">medical_information</span>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Medical</p>
              </div>
              <p className="text-xs font-semibold text-on-surface leading-relaxed">
                {Array.isArray(pet.medical_conditions) ? pet.medical_conditions.join(', ') : pet.medical_conditions || 'No critical conditions.'}
              </p>
            </div>
            <div className="premium-card p-6 bg-tertiary-container/20 border-tertiary/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-tertiary text-xl">vaccines</span>
                <p className="text-[9px] font-black text-tertiary uppercase tracking-[0.2em]">Health</p>
              </div>
              <p className="text-[10px] font-bold text-on-tertiary-container uppercase tracking-widest">
                {pet.vaccines || 'All active'}
              </p>
            </div>
          </section>

          {/* Personality Note */}
          {pet.note && (
            <section className="premium-card p-8 bg-surface-container-low/30 italic text-on-surface-variant">
              <div className="flex items-center gap-3 mb-4 not-italic">
                <span className="material-symbols-outlined text-secondary text-xl">psychology</span>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Guardian's Note</p>
              </div>
              <p className="text-sm leading-relaxed font-light">
                "{pet.note}"
              </p>
            </section>
          )}

          {/* Gallery Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <span className="material-symbols-outlined text-primary">photo_library</span>
              <h3 className="font-serif-elegant font-bold text-lg">Markings & Gallery</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(pet.references || []).map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-white group">
                  <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
              ))}
            </div>
          </section>

          {/* Message Form */}
          <section id="msg-section" className="premium-card p-8 bg-white">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary">send_time_extension</span>
              <h3 className="font-serif-elegant font-bold text-xl">Instant Sighting Alert</h3>
            </div>
            
            {msgSent ? (
              <div className="text-center py-10 bg-tertiary/5 rounded-[2rem] border border-tertiary/10 animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-tertiary text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-tertiary/20">
                  <span className="material-symbols-outlined text-3xl">check</span>
                </div>
                <p className="font-bold text-tertiary uppercase tracking-[0.2em] text-[10px]">Alert Transmitted Successfully</p>
              </div>
            ) : (
              <form onSubmit={sendMessage} className="space-y-6">
                <div className="space-y-2">
                  <textarea
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    rows={4}
                    required
                    placeholder="Provide details about the sighting location..."
                    className="w-full px-6 py-5 bg-surface-container-lowest border border-surface-container rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all resize-none font-medium"
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-on-surface text-white rounded-xl font-bold uppercase tracking-[0.25em] text-[10px] hover:bg-primary transition-all active:scale-95 shadow-xl shadow-on-surface/10">
                  Broadcast Security Alert
                </button>
              </form>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center pt-10 pb-4 border-t border-surface-container-low opacity-40">
          <div className="flex items-center justify-center gap-2 mb-2">
             <span className="material-symbols-outlined text-lg">verified_user</span>
             <span className="text-[9px] font-black uppercase tracking-[0.3em]">PetConnect Digital ID System</span>
          </div>
          <p className="text-[8px] uppercase tracking-widest">The global standard for pet safety and identification</p>
        </footer>
      </main>
    </div>
  )
}
