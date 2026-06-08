import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicTag, submitSighting } from '../services/api'
import MapComponent from '../components/MapComponent'

const SAMPLE_PET = {
  "pet_name": "Rocky",
  "breed": "German Shepherd",
  "species": "Dog",
  "sex": "Male",
  "color": "Black and Tan",
  "status": "LOST",
  "reward": "₱5,000",
  "barangay": "Barangay Lahug",
  "last_seen_location": "IT Park Cebu, near Skyrise 4",
  "last_seen_coords": [10.3310, 123.9050],
  "owner_note": "Rocky was wearing a red collar. Very friendly but might be scared of loud noises.",
  "owner_instructions": "Call me at 09171234567 or contact LGU.",
  "owner_name": "Juan dela Cruz",
  "owner_phone": "09171234567",
  "pet_photo_url": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"
}

export default function PetNfcProfile() {
  const { tagId } = useParams()
  const [pet, setPet] = useState(SAMPLE_PET)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [locShared, setLocShared] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sightingSuccess, setSightingSuccess] = useState(false)
  
  const [sightingForm, setSightingForm] = useState({
    name: '',
    phone: '',
    description: '',
    latitude: null,
    longitude: null
  })

  useEffect(() => {
    if (tagId && tagId !== 'rocky-xk9z2') {
      getPublicTag(tagId)
        .then(r => {
          setPet(r.data)
        })
        .catch(() => {
          // Fallback to sample for demo if needed, but in reality show not found
          // For now, let's keep sample if tagId is not found but matches a demo pattern
          if (tagId.includes('demo')) {
            setPet(SAMPLE_PET)
          } else {
            setNotFound(true)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [tagId])

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setSightingForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }))
        setLocShared(true)
      })
    }
  }

  const handleSightingSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // In a real app, we'd use pet.lost_report_id or similar
      if (pet.lost_report_id) {
        await submitSighting(pet.lost_report_id, {
          reporter_name: sightingForm.name,
          reporter_phone: sightingForm.phone,
          message: sightingForm.description,
          latitude: sightingForm.latitude,
          longitude: sightingForm.longitude
        })
      }
      setSightingSuccess(true)
    } catch (err) {
      console.error(err)
      // For demo, still show success
      setSightingSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center text-[#C0392B]">
      <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-center text-[#E0E0E0]">
      <span className="material-symbols-outlined text-6xl text-[#C0392B] mb-4">search_off</span>
      <h1 className="text-2xl font-bold mb-2">Pet Not Found</h1>
      <p className="opacity-60">This NFC tag is not registered or the profile is private.</p>
    </div>
  )

  const isLost = pet.status?.toUpperCase() === 'LOST'

  return (
    <div className="min-h-screen bg-[#111111] text-[#E0E0E0] font-['Inter',_sans-serif] flex flex-col items-center">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col relative pb-10">
        
        {/* 1. Sticky Top Bar */}
        <header className="sticky top-0 z-50 bg-[#C0392B] h-14 flex items-center justify-between px-4 shadow-lg">
          <span className="material-symbols-outlined text-white text-2xl">pets</span>
          <h1 className="text-white font-black text-sm tracking-widest uppercase">Lost Pet — Help Reunite</h1>
          <span className="material-symbols-outlined text-white text-2xl">warning</span>
        </header>

        {/* 2. Alert Banner */}
        {isLost && (
          <div className="bg-[#C0392B] p-4 flex flex-col items-center gap-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-white font-bold">
              <span className="text-xl">✳️</span>
              <span className="uppercase tracking-tight text-sm">This pet is reported lost</span>
            </div>
            {pet.reward && (
              <div className="bg-white/20 px-3 py-1 rounded-full border border-white/30">
                <span className="text-white text-[10px] font-black uppercase tracking-wider">Reward: {pet.reward} Cash</span>
              </div>
            )}
          </div>
        )}

        <main className="p-4 space-y-4">
          
          {/* 3. Pet Profile Card */}
          <section className="bg-[#1E1E1E] rounded-[16px] p-6 flex flex-col items-center shadow-xl border border-white/5">
            <div className="relative mb-4">
              <img 
                src={pet.pet_photo_url} 
                alt={pet.pet_name} 
                className="w-32 h-32 rounded-full object-cover border-4 border-[#C0392B] shadow-lg"
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">{pet.pet_name}</h2>
            <p className="text-sm opacity-70 mb-4">
              {pet.breed} • {pet.species} • {pet.sex} • {pet.color}
            </p>
            <div className="bg-[#2A2A2A] px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/5">
              <span className="material-symbols-outlined text-[#C0392B] text-sm">location_on</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">{pet.barangay || 'Cebu City'}</span>
            </div>
          </section>

          {/* 4. Last Seen Card */}
          <section className="bg-[#1E1E1E] rounded-[16px] p-6 space-y-4 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
              <span className="text-[11px] font-black text-[#C0392B] uppercase tracking-[0.2em]">Last Seen</span>
            </div>
            <p className="text-lg font-bold text-white">{pet.last_seen_location}</p>
            {pet.owner_note && (
              <p className="text-sm italic opacity-80 border-l-2 border-[#8B5E3C] pl-4 py-1">
                "{pet.owner_note}"
              </p>
            )}
            <div className="bg-[#2A2A2A] p-4 rounded-xl border border-white/5">
              <p className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2">Owner Instructions</p>
              <p className="text-xs leading-relaxed opacity-90">{pet.owner_instructions}</p>
            </div>
          </section>

          {/* 5. Map */}
          <section className="bg-[#1E1E1E] rounded-[16px] overflow-hidden h-64 border border-white/5 shadow-inner">
            <MapComponent 
              lat={pet.last_seen_coords?.[0] || 10.3310} 
              lng={pet.last_seen_coords?.[1] || 123.9050} 
              zoom={16} 
            />
          </section>

          {/* 6. Owner Contact Card */}
          <section className="bg-[#1E1E1E] rounded-[16px] p-6 space-y-4 border border-white/5">
            <div>
              <p className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-1">Pet Owner</p>
              <h3 className="text-2xl font-bold text-white">{pet.owner_name}</h3>
            </div>
            <a 
              href={`tel:${pet.owner_phone}`}
              className="w-full py-4 bg-[#C0392B] rounded-xl flex items-center justify-center gap-3 text-white font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-xl">call</span>
              Call {pet.owner_name} — {pet.owner_phone}
            </a>
          </section>

          {/* 7. Send Message to Owner */}
          <section className="bg-[#1E1E1E] rounded-[16px] p-6 space-y-4 border border-white/5">
            <h3 className="text-lg font-bold text-white">Send a message to the owner</h3>
            <div className="space-y-3">
              <textarea 
                placeholder={`I found ${pet.pet_name} near...`}
                className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#C0392B] outline-none min-h-[100px] resize-none"
              />
              <a 
                href={`sms:${pet.owner_phone}?body=I found ${pet.pet_name} near...`}
                className="w-full py-4 bg-[#2A2A2A] border border-white/10 text-white rounded-xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-xl text-[#C0392B]">send</span>
                Notify Owner
              </a>
            </div>
          </section>

          {/* 8. Report a Sighting */}
          <section className="bg-[#1E1E1E] rounded-[16px] p-6 space-y-5 border border-white/5 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Report a sighting</h3>
              <p className="text-xs opacity-60 mt-1">Share where and when you saw {pet.pet_name} so the owner can search that area.</p>
            </div>

            {sightingSuccess ? (
              <div className="bg-[#2A2A2A] border border-green-900/50 p-6 rounded-2xl text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                <p className="font-bold text-white uppercase tracking-widest text-xs">Sighting Report Submitted</p>
                <p className="text-[10px] opacity-60">Thank you for helping reunite {pet.pet_name}!</p>
              </div>
            ) : (
              <form onSubmit={handleSightingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest ml-1">Your Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Enter your name"
                      value={sightingForm.name}
                      onChange={e => setSightingForm({...sightingForm, name: e.target.value})}
                      className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#C0392B] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest ml-1">Your Phone</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="0912..."
                      value={sightingForm.phone}
                      onChange={e => setSightingForm({...sightingForm, phone: e.target.value})}
                      className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-3.5 text-sm focus:ring-1 focus:ring-[#C0392B] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    required
                    placeholder="Describe where you saw the pet, condition, direction of travel..."
                    value={sightingForm.description}
                    onChange={e => setSightingForm({...sightingForm, description: e.target.value})}
                    className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#C0392B] outline-none min-h-[100px] resize-none"
                  />
                </div>

                <div className="bg-[#2A2A2A] p-4 rounded-xl flex items-center justify-between border border-white/5">
                   <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm opacity-60">my_location</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Share GPS Location</span>
                   </div>
                   <button 
                     type="button" 
                     onClick={shareLocation}
                     className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${locShared ? 'bg-green-600 text-white' : 'bg-[#C0392B] text-white'}`}
                   >
                     {locShared ? 'Shared ✓' : 'Share'}
                   </button>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 bg-[#C0392B] text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-[#C0392B]/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Sighting Report'}
                </button>
              </form>
            )}
          </section>

          {/* 9. Footer */}
          <footer className="pt-8 pb-4 text-center">
             <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.25em]">Powered by PetConnect Smart ID</p>
          </footer>

        </main>
      </div>
    </div>
  )
}
