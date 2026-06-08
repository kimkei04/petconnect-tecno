import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import API, { getPublicTag, submitSighting } from '../services/api'
import MapComponent from '../components/MapComponent'

export default function FoundPetPage() {
  const { tagId } = useParams()
  const navigate = useNavigate()
  
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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
  const [submitting, setSubmitting] = useState(false)
  const [sightingSuccess, setSightingSuccess] = useState('')
  const [sightingError, setSightingError] = useState('')

  useEffect(() => {
    if (!tagId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    getPublicTag(tagId)
      .then(r => {
        if (r.data.status?.toLowerCase() !== 'lost') {
          navigate(`/tag/${tagId}`, { replace: true })
          return
        }
        setPet(r.data)
      })
      .catch((err) => {
        console.error('Found pet page fetch error:', err)
        setNotFound(true)
      })
      .finally(() => setLoading(false))

    // Optional: Log scan location silently
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        API.post(`/public/scan/${tagId}`, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          scanType: 'lost_tag_scan'
        }).catch(() => {})
      }, () => {})
    }
  }, [tagId, navigate])

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
      () => setSightingError('Could not access your location. Please describe where you are in the message.')
    )
  }

  const sendMessage = async e => {
    e.preventDefault()
    if (!msg.trim()) return
    setMsgError('')
    try {
      await API.post(`/public/message/${tagId}`, { message: msg })
      setMsgSent(true)
      setMsg('')
    } catch {
      setMsgError('Failed to send message. Please try calling the owner instead.')
    }
  }

  const handleSightingSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    setSightingError('')
    setSightingSuccess('')
    try {
      // Use pet.lost_report_id or fallback to id
      await submitSighting(pet?.lost_report_id || pet?.id, sightingForm)
      setSightingSuccess(`Thank you! Your sighting was sent to ${pet.owner_name}.`)
      setSightingForm({ reporter_name: '', reporter_phone: '', message: '', latitude: '', longitude: '' })
      setLocShared(false)
    } catch {
      setSightingError('Failed to report sighting. Please try again or call the owner.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-error text-5xl">progress_activity</span>
      </div>
    )
  }

  if (notFound || !pet) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant/20 mb-2 shadow-inner">
          <span className="material-symbols-outlined text-5xl">qr_code_scanner</span>
        </div>
        <h1 className="text-2xl font-serif-elegant font-bold text-on-surface">Tag Not Found</h1>
        <p className="text-sm text-on-surface-variant font-light">This PetConnect tag is not registered or has been deactivated.</p>
        <button onClick={() => navigate('/')} className="mt-4 py-3 px-8 bg-on-surface text-surface font-bold text-xs uppercase tracking-widest rounded-xl">
          Go to Home
        </button>
      </div>
    )
  }

  const showOwnerPhone = pet.owner_phone && !pet.hide_phone
  const showAddress = pet.address && !pet.hide_address
  const mapLat = pet.last_seen_lat || pet.latitude || 10.3364
  const mapLng = pet.last_seen_lng || pet.longitude || 123.8971

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans antialiased pb-10">
      <header className="fixed top-0 w-full z-50 bg-error/95 backdrop-blur-md flex justify-between items-center px-6 h-16 border-b border-white/10">
        <span className="material-symbols-outlined text-white">pets</span>
        <h1 className="text-xs font-black text-white tracking-[0.25em] uppercase">Lost Pet — Recovery Mode</h1>
        <span className="material-symbols-outlined text-white animate-pulse">warning</span>
      </header>

      <main className="pt-20 px-5 max-w-lg mx-auto w-full space-y-6">
        {/* Emergency banner */}
        <div className="bg-error rounded-2xl p-5 text-center shadow-xl shadow-error/25 space-y-2">
          <p className="text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">emergency</span>
            Urgent: This pet is lost
          </p>
          {pet.reward_amount && (
            <p className="inline-block bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-white/20">
              Reward: {pet.reward_amount}
            </p>
          )}
        </div>

        {/* Pet identity */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-surface-container text-center space-y-4">
          <div className="relative inline-block">
            <img
              src={pet.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'}
              alt={pet.name}
              className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-error/10 shadow-xl"
            />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-error text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-serif-elegant font-bold text-on-surface leading-tight">{pet.name}</h2>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              {[pet.breed, pet.species, pet.sex, pet.color].filter(Boolean).join(' • ')}
            </p>
          </div>
        </div>

        {/* Last seen & description */}
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-error/10 space-y-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-error text-xl mt-0.5">my_location</span>
            <div>
              <p className="text-[10px] font-bold text-error uppercase tracking-wider">Last seen location</p>
              <p className="text-sm font-bold text-on-surface">{pet.last_seen_location || 'Not specified'}</p>
            </div>
          </div>
          {pet.lost_description && (
            <p className="text-xs text-on-surface-variant italic leading-relaxed border-l-2 border-error/20 pl-4 bg-error/5 py-3 rounded-r-xl">
              "{pet.lost_description}"
            </p>
          )}
        </div>

        {/* Map */}
        <div className="rounded-[2.5rem] overflow-hidden border border-surface-container shadow-lg h-56 relative group">
          <MapComponent lat={mapLat} lng={mapLng} zoom={15} />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow px-3 py-1.5 rounded-lg text-[9px] font-bold text-error uppercase tracking-widest z-[400] border border-error/10">
            Last Known Area
          </div>
        </div>

        {/* Owner contact — primary CTA for finders */}
        <div className="bg-brown-gradient rounded-[2.5rem] p-8 text-on-primary shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">Registered Guardian</p>
            <h3 className="text-3xl font-serif-elegant font-bold">{pet.owner_name}</h3>
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            {showOwnerPhone ? (
              <a
                href={`tel:${pet.owner_phone}`}
                className="flex items-center justify-center gap-3 py-4.5 bg-white text-primary rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">call</span>
                Call {pet.owner_name}
              </a>
            ) : (
              <p className="text-xs text-white/80 bg-white/10 rounded-xl p-4 border border-white/20 font-medium">
                Phone hidden for privacy. Use the form below.
              </p>
            )}
            
            {showAddress && (
              <div className="flex items-start gap-3 text-xs text-white/80 bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-lg">home</span>
                <span className="leading-relaxed">{pet.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Report a sighting - HIGH PRIORITY FORM */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-error/5 space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif-elegant font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-error">add_location_alt</span>
              Report a Sighting
            </h3>
            <p className="text-xs text-on-surface-variant font-light">Share where you saw {pet.name} to help the search.</p>
          </div>

          {sightingSuccess && (
            <div className="p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl text-tertiary text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-in zoom-in duration-300">
              <span className="material-symbols-outlined">verified</span>
              {sightingSuccess}
            </div>
          )}
          {sightingError && <p className="text-xs text-error font-medium">{sightingError}</p>}

          {!sightingSuccess && (
            <form onSubmit={handleSightingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={sightingForm.reporter_name}
                  onChange={e => setSightingForm({ ...sightingForm, reporter_name: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-4 text-xs outline-none focus:border-primary/30"
                />
                <input
                  type="text"
                  placeholder="Your Phone"
                  value={sightingForm.reporter_phone}
                  onChange={e => setSightingForm({ ...sightingForm, reporter_phone: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-4 text-xs outline-none focus:border-primary/30"
                />
              </div>
              <textarea
                required
                rows={3}
                placeholder={`Tell the owner where you saw ${pet.name}...`}
                value={sightingForm.message}
                onChange={e => setSightingForm({ ...sightingForm, message: e.target.value })}
                className="w-full bg-surface-container-low border border-surface-container rounded-xl p-4 text-xs resize-none outline-none focus:border-primary/30"
              />
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
                disabled={submitting}
                className="w-full py-5 bg-error text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-error/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? 'Transmitting...' : 'Submit Sighting Report'}
              </button>
            </form>
          )}
        </div>

        {/* Quick Message Form */}
        {!msgSent && (
          <div className="bg-white rounded-[2rem] p-7 shadow-lg border border-surface-container space-y-4">
            <h3 className="text-lg font-serif-elegant font-bold text-on-surface">Direct Message to Owner</h3>
            <form onSubmit={sendMessage} className="space-y-3">
              <textarea
                value={msg}
                onChange={e => setMsg(e.target.value)}
                rows={2}
                required
                placeholder="Type a quick note..."
                className="w-full px-4 py-4 bg-surface-container-low border border-surface-container rounded-xl text-sm outline-none focus:border-primary/30 resize-none"
              />
              {msgError && <p className="text-xs text-error font-medium">{msgError}</p>}
              <button type="submit" className="w-full py-4 bg-on-surface text-surface rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary transition-all">
                Send Quick Alert
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-[9px] text-on-surface-variant/40 uppercase tracking-[0.3em] py-10">
          Powered by PetConnect Global Smart ID System
        </p>
      </main>
    </div>
  )
}
