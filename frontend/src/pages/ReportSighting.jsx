import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { submitSighting } from '../services/api'

export default function ReportSighting() {
  const { reportId } = useParams()
  const navigate = useNavigate()
  
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [form, setForm] = useState({
    reporter_name: '',
    reporter_phone: '',
    message: '',
    latitude: '',
    longitude: ''
  })
  
  const [locShared, setLocShared] = useState(false)

  useEffect(() => {
    fetchReportDetails()
  }, [reportId])

  const fetchReportDetails = async () => {
    try {
      // Find this lost pet from the list of lost pets
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname.match(/\d+\.\d+\.\d+\.\d+/);
      const baseURL = isLocal ? `http://${window.location.hostname}:5000/api` : `https://${window.location.hostname}/api`;
      
      const res = await axios.get(`${baseURL}/public/lost`)
      const found = res.data.find(r => r.id === parseInt(reportId))
      
      if (!found) {
        setError('Lost pet report not found or already resolved.')
      } else {
        setReport(found)
      }
    } catch (err) {
      console.error('Fetch report details error:', err)
      setError('Could not retrieve lost pet details.')
    } finally {
      setLoading(false)
    }
  }

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }))
          setLocShared(true)
        },
        (err) => {
          console.warn('Geolocation error:', err)
          alert('Could not capture browser geolocation. Please describe the location in the details field.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.message.trim()) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    
    try {
      await submitSighting(reportId, form)
      setSuccess(`Sighting report logged. Thank you for helping reunite ${report?.pet_name}!`)
      setTimeout(() => {
        navigate('/community/lost')
      }, 3000)
    } catch (err) {
      setError('Failed to submit report. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface min-h-screen pb-24 font-sans flex flex-col justify-between selection:bg-primary-container selection:text-primary">
      {/* Header */}
      <header className="px-6 py-6 border-b border-surface-container/30 h-[72px] flex items-center shrink-0">
        <Link to="/" className="text-2xl font-serif-elegant font-bold text-on-surface flex items-center gap-2 group transition-colors mx-auto max-w-lg w-full">
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-300">pets</span>
          <span className="text-gradient text-xl">PetConnect Recovery</span>
        </Link>
      </header>

      {/* Main Form container */}
      <main className="flex-1 px-6 py-10 flex items-center justify-center">
        <div className="max-w-md w-full">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/40">Loading details...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container/50 shadow-xl shadow-primary/5 text-center space-y-6">
              <span className="material-symbols-outlined text-5xl text-error">warning</span>
              <h2 className="text-xl font-serif-elegant font-bold text-on-surface">Unable to load report</h2>
              <p className="text-xs text-on-surface-variant font-light leading-relaxed">{error}</p>
              <Link to="/community/lost" className="inline-block py-3 px-6 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl">
                Go to Lost Board
              </Link>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Pet Card Banner */}
              <div className="bg-white rounded-[2rem] p-6 border border-surface-container/50 shadow-sm flex items-center gap-5">
                <img 
                  src={report.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'} 
                  className="w-20 h-20 rounded-2xl object-cover shadow-sm" 
                  alt="" 
                />
                <div>
                  <span className="bg-error/10 text-error px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    Lost Pet Alert
                  </span>
                  <h3 className="text-xl font-serif-elegant font-bold text-on-surface leading-tight mt-1">{report.pet_name}</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{report.breed || report.species}</p>
                </div>
              </div>

              {/* Success Sighting Message */}
              {success && (
                <div className="p-4 bg-tertiary-container/30 border border-tertiary/20 rounded-2xl text-tertiary text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">verified</span>
                  {success}
                </div>
              )}

              {/* Sighting form */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-xl shadow-primary/5 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
                
                <div>
                  <h2 className="text-2xl font-serif-elegant font-bold text-on-surface">Report Sighting</h2>
                  <p className="text-xs text-on-surface-variant font-light mt-1">If you have seen this pet, share what you saw below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={form.reporter_name}
                      onChange={(e) => setForm({...form, reporter_name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-4 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Your Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={form.reporter_phone}
                      onChange={(e) => setForm({...form, reporter_phone: e.target.value})}
                      placeholder="e.g. 0917xxxxxxx"
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-4 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sighting Details</label>
                    <textarea
                      required
                      rows="3"
                      value={form.message}
                      onChange={(e) => setForm({...form, message: e.target.value})}
                      placeholder="Where did you see the pet? What direction was it heading? Any specific landmarks?"
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-4 text-xs resize-none focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-surface-container/50">
                    <div>
                      <p className="text-xs font-bold text-on-surface">Attach Current Location</p>
                      <p className="text-[10px] text-on-surface-variant font-light">Shares GPS pins to owner.</p>
                    </div>
                    <button
                      type="button"
                      onClick={shareLocation}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${locShared ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container text-primary hover:bg-surface-container-high'}`}
                    >
                      {locShared ? 'Shared ✓' : 'Share Location'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow transition-all"
                  >
                    {submitting ? 'Submitting...' : 'Submit Sighting'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
