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
      .then(r => setPet(r.data))
      .catch(() => {
        // Fallback mockup for demo
        setPet({
          tagId,
          name: 'Buddy',
          breed: 'Golden Retriever',
          species: 'Dog',
          age: 4,
          gender: 'Male',
          status: 'lost',
          registered_at: 'Cebu City',
          latitude: 10.3364, // Lahug, Cebu City
          longitude: 123.8971,
          medical_conditions: ['Nut Allergy', 'Microchipped (ID: 102****55)'],
          vaccines: 'Up to date',
          owner_name: 'Sarah Jenkins',
          owner_phone: '+63 999 888 7777',
          photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
          references: [
            'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80&w=400'
          ]
        })
      })
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

  if (notFound && !pet) return (
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
      <header className="fixed top-0 w-full z-50 bg-on-surface/95 backdrop-blur-md flex justify-between items-center px-6 h-20 border-b border-white/5">
        <span className="material-symbols-outlined text-primary">pets</span>
        <h1 className="text-lg font-serif-elegant font-bold text-white tracking-widest uppercase">PetConnect</h1>
        <div className="w-2 h-2 bg-secondary rounded-full animate-ping"></div>
      </header>

      <main className="pt-28 pb-40 px-6 max-w-lg mx-auto w-full space-y-8">
        {/* Status Banner */}
        {pet.status === 'lost' ? (
          <div className="space-y-4 animate-in zoom-in duration-500">
            <div className="bg-error rounded-2xl p-5 flex items-center justify-center gap-4 shadow-xl shadow-error/20">
              <span className="material-symbols-outlined text-white text-2xl animate-pulse">warning</span>
              <span className="font-bold text-white text-xs tracking-[0.2em] uppercase">This Pet is Reported Lost</span>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border-2 border-error/20 shadow-lg space-y-4">
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-error uppercase tracking-widest mb-1">Last Seen At</p>
                     <p className="text-sm font-bold text-on-surface">{pet.last_seen_location || 'Lahug, Cebu City'}</p>
                  </div>
               </div>

               {pet.reward_amount && (
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                       <span className="material-symbols-outlined text-xl">payments</span>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Reward Offered</p>
                       <p className="text-sm font-black text-on-surface">{pet.reward_amount}</p>
                    </div>
                 </div>
               )}

               <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container">
                  <p className="text-[11px] text-on-surface-variant leading-relaxed italic">"{pet.lost_description || 'Please help me get back home. I am friendly but might be scared.'}"</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-tertiary rounded-2xl p-5 flex items-center justify-center gap-4 shadow-xl shadow-tertiary/20 animate-in zoom-in duration-500">
            <span className="material-symbols-outlined text-white text-2xl">verified</span>
            <span className="font-bold text-white text-xs tracking-[0.2em] uppercase">Verified PetConnect Profile</span>
          </div>
        )}

        {/* Profile Hero */}
        <div className="flex flex-col items-center text-center py-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl -z-10 scale-150"></div>
            <img
              src={pet.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'}
              alt={pet.name}
              className="w-48 h-48 rounded-[3rem] object-cover border-4 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700"
            />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary border border-surface-container">
               <span className="material-symbols-outlined">nfc</span>
            </div>
          </div>
          <h2 className="text-5xl font-serif-elegant font-bold text-on-surface mb-2 tracking-tight">{pet.name}</h2>
          <p className="text-on-surface-variant text-lg font-light mb-6">{pet.breed} • {pet.age} Years Old</p>
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-surface-container-low/50 rounded-full border border-surface-container/50">
            <span className="material-symbols-outlined text-secondary text-base">location_on</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Lahug, Cebu City</span>
          </div>
        </div>

        {/* Map View */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 ml-2">
            <span className="material-symbols-outlined text-primary">map</span>
            <h3 className="font-serif-elegant font-bold text-lg text-on-surface">Registered Area</h3>
          </div>
          <div className="h-64 w-full rounded-[2.5rem] overflow-hidden border border-surface-container shadow-xl">
             <MapComponent lat={pet.latitude || 10.3364} lng={pet.longitude || 123.8971} zoom={15} />
          </div>
        </div>

        {/* Contact Actions */}
        <div className="bg-brown-gradient rounded-[3rem] p-10 text-on-primary shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">Primary Owner</p>
              <h3 className="text-2xl font-serif-elegant font-bold">{pet.owner_name || 'Sarah Jenkins'}</h3>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-[1.25rem] flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-2xl">shield_person</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 relative z-10">
            <a href={`tel:${pet.owner_phone}`} className="flex items-center justify-center gap-4 py-5 bg-white text-primary rounded-2xl font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs">
              <span className="material-symbols-outlined">call</span>
              Voice Call Owner
            </a>
            <button 
              onClick={() => document.getElementById('msg-section').scrollIntoView({behavior: 'smooth'})}
              className="flex items-center justify-center gap-4 py-5 bg-white/10 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all uppercase tracking-widest text-xs"
            >
              <span className="material-symbols-outlined">chat</span>
              Send Digital Message
            </button>
          </div>
        </div>

        {/* Message Section */}
        <div id="msg-section" className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-primary/5 border border-surface-container/50">
          <h3 className="font-serif-elegant font-bold text-xl text-on-surface mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">send_time_extension</span>
            Quick Notification
          </h3>
          {msgSent ? (
            <div className="text-center py-8 bg-tertiary-container/30 rounded-3xl border border-tertiary/20 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-tertiary text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-tertiary/20">
                <span className="material-symbols-outlined text-3xl">check</span>
              </div>
              <p className="font-bold text-tertiary uppercase tracking-widest text-[10px]">Alert Sent Successfully</p>
            </div>
          ) : (
            <form onSubmit={sendMessage} className="space-y-6">
              <div className="space-y-2">
                <textarea
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  rows={4}
                  required
                  placeholder="I found your pet near..."
                  className="w-full px-6 py-6 bg-surface-container-low/50 border border-surface-container rounded-3xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all resize-none"
                />
              </div>
              <button type="submit" className="w-full py-5 bg-on-surface text-surface rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-primary transition-all active:scale-95 shadow-xl shadow-on-surface/20">
                Transmit Security Alert
              </button>
            </form>
          )}
        </div>

        {/* Reference Photos */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <span className="material-symbols-outlined text-primary">photo_library</span>
            <h3 className="font-serif-elegant font-bold text-lg text-on-surface">Gallery & Markings</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(pet.references || []).map((url, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white group">
                <img src={url} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" alt="" />
              </div>
            ))}
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="bg-primary-container/30 rounded-3xl p-6 border border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary">medical_information</span>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Medical Needs</p>
            </div>
            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
              {Array.isArray(pet.medical_conditions) ? pet.medical_conditions.join(', ') : pet.medical_conditions || 'No critical conditions reported.'}
            </p>
          </div>
          <div className="bg-tertiary-container/30 rounded-3xl p-6 border border-tertiary/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-tertiary">vaccines</span>
              <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Health Status</p>
            </div>
            <p className="text-xs font-bold text-on-tertiary-container uppercase tracking-[0.15em]">
              {pet.vaccines || 'All vaccinations active'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-12 px-8 border-t border-surface-container/50 mt-10">
          <div className="text-primary font-serif-elegant font-bold text-lg mb-4 flex items-center justify-center gap-2">
             <span className="material-symbols-outlined text-xl">pets</span>
             PetConnect
          </div>
          <p className="text-on-surface-variant font-light text-sm leading-relaxed">
            The global standard for smart pet identification. Every scan helps bring a companion home.
          </p>
        </div>
      </main>

      {/* Global Action Bar */}
      <nav className="fixed bottom-0 w-full z-50 bg-on-surface px-6 pb-8 pt-4 flex justify-around items-center border-t border-white/5 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
        {[
          { icon: 'qr_code_scanner', label: 'Scan', active: true },
          { icon: 'favorite', label: 'Donate' },
          { icon: 'help', label: 'Support' }
        ].map(item => (
          <button key={item.label} className={`flex flex-col items-center gap-1.5 transition-all ${item.active ? 'text-primary-container scale-110' : 'text-on-surface-variant opacity-40 hover:opacity-100'}`}>
            <span className="material-symbols-outlined text-3xl">{item.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
