import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLostPets, submitSighting } from '../services/api'

export default function CommunityLostPets() {
  const [lostPets, setLostPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Sighting Modal State
  const [selectedReport, setSelectedReport] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [sightingForm, setSightingForm] = useState({
    reporter_name: '',
    reporter_phone: '',
    message: '',
    latitude: '',
    longitude: ''
  })
  
  const [locShared, setLocShared] = useState(false)

  useEffect(() => {
    fetchLostPets()
  }, [])

  const fetchLostPets = async () => {
    try {
      const res = await getLostPets()
      setLostPets(res.data)
    } catch (err) {
      console.error('Failed to fetch lost pets:', err)
      setError('Could not retrieve lost pet board. Please try again.')
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
        (error) => {
          console.warn('Geolocation error:', error)
          alert('Could not access your location. Please type it in the description.')
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
      await submitSighting(selectedReport.id, sightingForm)
      setSuccess(`Thank you! Sighting reported to ${selectedReport.pet_name}'s owner.`)
      setSelectedReport(null)
      // reset form
      setSightingForm({
        reporter_name: '',
        reporter_phone: '',
        message: '',
        latitude: '',
        longitude: ''
      })
      setLocShared(false)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError('Failed to report sighting. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface min-h-screen pb-24 font-sans selection:bg-primary-container selection:text-primary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container/30 soft-shadow h-[72px] flex items-center">
        <div className="flex justify-between items-center px-6 md:px-10 max-w-7xl mx-auto w-full">
          <Link to="/" className="text-2xl font-serif-elegant font-bold text-on-surface flex items-center gap-2 group transition-colors">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-300">pets</span>
            <span className="text-gradient">PetConnect</span>
          </Link>
          <Link to="/role-select" className="text-xs font-bold text-primary uppercase tracking-widest border-2 border-primary/20 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all">
            Join Platform
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-[110px] px-6 max-w-7xl mx-auto">
        <section className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif-elegant font-bold text-on-surface tracking-tight leading-tight">
            Community <span className="text-gradient">Lost Pets</span> Board
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-light max-w-xl mx-auto">
            Help reunite lost pets in your local neighborhood. If you spot any of these pets, tap to report a sighting with your location.
          </p>
        </section>

        {/* Success Sighting Alert */}
        {success && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-tertiary-container/30 border border-tertiary/20 rounded-2xl text-tertiary text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-in zoom-in duration-300">
            <span className="material-symbols-outlined text-lg">verified</span>
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">Loading bulletin...</p>
          </div>
        ) : lostPets.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 border border-dashed border-surface-container rounded-[2.5rem] space-y-4 bg-white/50">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">pets</span>
            <h3 className="font-serif-elegant font-bold text-on-surface text-lg">No Active Lost Reports</h3>
            <p className="text-xs text-on-surface-variant font-light px-6">All neighborhood pets are safe and accounted for! Thank you for watching out.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lostPets.map(report => (
              <div key={report.id} className="premium-card p-6 flex flex-col justify-between overflow-hidden relative group">
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-container-low shadow-inner">
                    <img 
                      src={report.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={report.pet_name} 
                    />
                    {report.reward_amount && (
                      <span className="absolute top-4 right-4 bg-secondary text-on-secondary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                        ₱{report.reward_amount} Reward
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-serif-elegant font-bold text-on-surface group-hover:text-primary transition-colors">{report.pet_name}</h3>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">{report.breed || report.species} • {report.sex || 'Unknown'}</p>
                    <p className="text-xs text-on-surface font-light mt-3 leading-relaxed">"{report.description || 'No description provided.'}"</p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-surface-container/30 space-y-4">
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
                      Last Seen
                    </p>
                    <p className="text-xs text-on-surface font-medium leading-relaxed">{report.last_seen_location || 'Unknown'}</p>
                  </div>

                  <button
                    onClick={() => setSelectedReport(report)}
                    className="w-full py-4 bg-brown-gradient text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Report Sighting
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sighting Modal Popup */}
      {selectedReport && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-serif-elegant font-bold text-on-surface">Report Sighting for {selectedReport.pet_name}</h3>
                <p className="text-xs text-on-surface-variant font-light mt-1">This report will be sent instantly to the owner.</p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/80 hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSightingSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    value={sightingForm.reporter_name}
                    onChange={(e) => setSightingForm({...sightingForm, reporter_name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Your Contact Phone</label>
                  <input
                    type="text"
                    value={sightingForm.reporter_phone}
                    onChange={(e) => setSightingForm({...sightingForm, reporter_phone: e.target.value})}
                    placeholder="e.g. 0917xxxxxxx"
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sighting Details / Message</label>
                <textarea
                  required
                  rows="3"
                  value={sightingForm.message}
                  onChange={(e) => setSightingForm({...sightingForm, message: e.target.value})}
                  placeholder="Describe last seen details, behavior, specific address..."
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-4 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-surface-container/50">
                <div>
                  <p className="text-xs font-bold text-on-surface">Share GPS Coordinates</p>
                  <p className="text-[10px] text-on-surface-variant font-light">Shares your current coordinates to guide the owner's search.</p>
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
                className="w-full py-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg transition-all active:scale-[0.98]"
              >
                {submitting ? 'Submitting Sighting...' : 'Submit Sighting Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
