import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getLostPets, submitSighting } from '../services/api'

export default function LostPet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Sighting Form State
  const [sightingForm, setSightingForm] = useState({
    reporter_name: '',
    reporter_phone: '',
    message: '',
    latitude: '',
    longitude: ''
  })
  const [locShared, setLocShared] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLostPetDetails()
  }, [id])

  const fetchLostPetDetails = async () => {
    try {
      const res = await getLostPets()
      // find report matching pet id
      const found = res.data.find(r => String(r.pet_id) === String(id) || String(r.id) === String(id))
      if (found) {
        setPet(found)
      } else {
        setError('Lost pet report could not be found or has already been resolved.')
      }
    } catch (err) {
      console.error('Failed to load lost pet details:', err)
      setError('Could not retrieve lost pet bulletin.')
    } finally {
      setLoading(false)
    }
  }

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSightingForm(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }))
          setLocShared(true)
        },
        (err) => {
          alert('Could not access browser location. Please type the location details.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleSightingSubmit = async (e) => {
    e.preventDefault()
    if (!sightingForm.message.trim()) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    
    try {
      await submitSighting(pet.id, sightingForm)
      setSuccess(`Thank you! Your sighting report has been sent to ${pet.pet_name}'s owner.`)
      setSightingForm({
        reporter_name: '',
        reporter_phone: '',
        message: '',
        latitude: '',
        longitude: ''
      })
      setLocShared(false)
    } catch (err) {
      setError('Failed to report sighting. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
    </div>
  )

  if (error || !pet) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center gap-6">
      <span className="material-symbols-outlined text-5xl text-error">warning</span>
      <h2 className="text-2xl font-serif-elegant font-bold text-on-surface">Bulletin Not Found</h2>
      <p className="text-xs text-on-surface-variant font-light max-w-sm leading-relaxed">{error || 'This lost pet bulletin has been resolved or removed.'}</p>
      <Link to="/" className="py-3.5 px-8 bg-brown-gradient text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl">
        Go to Home
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans antialiased pb-20">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md flex justify-between items-center px-6 h-16 border-b border-surface-container">
        <span className="material-symbols-outlined text-primary">pets</span>
        <h1 className="text-sm font-black text-primary tracking-[0.2em] uppercase">Lost Pet Alert</h1>
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="pt-24 px-5 max-w-lg mx-auto w-full space-y-6">
        {/* Emergency Alert Banner */}
        <div className="bg-error rounded-2xl p-5 flex flex-col items-center gap-3 shadow-xl shadow-error/20 animate-pulse text-center">
          <div className="flex items-center justify-center gap-3">
             <span className="material-symbols-outlined text-white text-xl animate-bounce">warning</span>
             <span className="font-black text-white text-[11px] tracking-widest uppercase">🚨 Emergency: This Pet is Lost</span>
             <span className="material-symbols-outlined text-white text-xl animate-bounce">warning</span>
          </div>
          {pet.reward_amount && (
            <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20">
               Reward: ₱{pet.reward_amount}
            </div>
          )}
        </div>

        {/* Success Sighting Alert */}
        {success && (
          <div className="p-4 bg-tertiary-container/30 border border-tertiary/20 rounded-2xl text-tertiary text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-in zoom-in">
            <span className="material-symbols-outlined text-lg">verified</span>
            {success}
          </div>
        )}

        {/* Incident Details Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-surface-container space-y-6 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
           
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
                 <span className="material-symbols-outlined text-2xl">my_location</span>
              </div>
              <div>
                 <p className="text-[10px] font-black text-error uppercase tracking-widest mb-1">Last Seen At</p>
                 <p className="text-lg font-black text-on-surface leading-tight">{pet.last_seen_location || 'Unknown location'}</p>
              </div>
           </div>

           <div className="p-5 bg-surface-container-low/50 rounded-2xl border border-surface-container italic">
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                 "{pet.description || 'Please help me get back home. I am friendly but might be scared if approached too quickly.'}"
              </p>
           </div>
        </div>

        {/* Profile Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <img
              src={pet.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'}
              alt={pet.pet_name}
              className="w-44 h-44 rounded-full object-cover border-4 border-white shadow-2xl"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-surface-container flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-500 text-[14px]">verified</span>
              <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest leading-none">Verified ID</span>
            </div>
          </div>
          <h2 className="text-4xl font-black text-primary mb-1 tracking-tight">{pet.pet_name}</h2>
          <p className="text-on-surface-variant font-bold text-sm mb-4">{pet.breed || pet.species} • {pet.sex || 'Unknown'} • {pet.color || 'Mixed'}</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Barangay {pet.barangay || 'Cebu City'}</span>
          </div>
        </div>

        {/* Sighting Form Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-surface-container space-y-6">
          <div>
            <h3 className="text-xl font-serif-elegant font-bold text-on-surface">Did you spot {pet.pet_name}?</h3>
            <p className="text-xs text-on-surface-variant font-light mt-1">Submit a sighting with your location info to alert the owner.</p>
          </div>
          
          <form onSubmit={handleSightingSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={sightingForm.reporter_name}
                  onChange={(e) => setSightingForm({...sightingForm, reporter_name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Your Phone</label>
                <input
                  type="text"
                  value={sightingForm.reporter_phone}
                  onChange={(e) => setSightingForm({...sightingForm, reporter_phone: e.target.value})}
                  placeholder="0917xxxxxxx"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Sighting Details</label>
              <textarea
                required
                rows="3"
                value={sightingForm.message}
                onChange={(e) => setSightingForm({...sightingForm, message: e.target.value})}
                placeholder="Describe landmark, pet status, movements..."
                className="w-full bg-surface-container-low border border-surface-container rounded-xl p-4 text-xs resize-none focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-surface-container/50">
              <div>
                <p className="text-xs font-bold text-on-surface">Share GPS Coordinates</p>
                <p className="text-[9px] text-on-surface-variant font-light">Shares current coordinates to owner.</p>
              </div>
              <button
                type="button"
                onClick={shareLocation}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${locShared ? 'bg-tertiary text-on-tertiary shadow' : 'bg-surface-container text-primary hover:bg-surface-container-high'}`}
              >
                {locShared ? 'Shared ✓' : 'Share Location'}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-brown-gradient text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg transition-all"
            >
              {submitting ? 'Sending Alert...' : 'Notify Owner'}
            </button>
          </form>
        </div>

        {/* Owner Contact Card (only shows if NOT hidden by owner) */}
        {!pet.hide_phone && pet.owner_phone && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-surface-container">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Owner Contact</p>
                <h3 className="text-2xl font-black text-primary tracking-tight">{pet.owner_name}</h3>
              </div>
              <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary border border-surface-container">
                <span className="material-symbols-outlined">contact_phone</span>
              </div>
            </div>
            <a href={`tel:${pet.owner_phone}`} className="flex items-center justify-center gap-3 py-4 bg-primary text-on-primary rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all">
              <span className="material-symbols-outlined">call</span>
              Call Owner Direct ({pet.owner_phone})
            </a>
          </div>
        )}

        <div className="text-center py-8 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Powered by PetConnect Smart ID</p>
        </div>
      </main>
    </div>
  )
}