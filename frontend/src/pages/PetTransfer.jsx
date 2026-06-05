import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPet, getMyTransfers, initiateTransfer, acceptTransfer, rejectTransfer } from '../services/api'
import BottomNav from '../components/BottomNav'

export default function PetTransfer() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [pet, setPet] = useState(null)
  const [transfers, setTransfers] = useState({ sent: [], received: [] })
  
  const [targetEmail, setTargetEmail] = useState('')
  const [reason, setReason] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (id) {
      fetchPetDetails()
    }
    fetchTransfers()
  }, [id])

  const fetchPetDetails = async () => {
    try {
      const res = await getPet(id)
      setPet(res.data)
    } catch (err) {
      console.error('Failed to fetch pet:', err)
      setError('Could not load pet details.')
    }
  }

  const fetchTransfers = async () => {
    try {
      const res = await getMyTransfers()
      setTransfers(res.data)
    } catch (err) {
      console.error('Failed to fetch transfers:', err)
    } finally {
      setFetching(false)
    }
  }

  const handleTransferSubmit = async (e) => {
    e.preventDefault()
    if (!targetEmail.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await initiateTransfer({
        pet_id: id,
        target_email: targetEmail.trim(),
        reason
      })
      setSuccess('Ownership transfer request sent successfully!')
      setTargetEmail('')
      setReason('')
      fetchTransfers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate transfer request.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (transferId) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await acceptTransfer(transferId)
      setSuccess(res.data.message)
      fetchTransfers()
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError('Failed to accept transfer.')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (transferId) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await rejectTransfer(transferId)
      setSuccess(res.data.message)
      fetchTransfers()
    } catch (err) {
      setError('Failed to decline transfer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface min-h-screen pb-40 font-sans selection:bg-primary-container selection:text-primary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container/30 soft-shadow h-[72px] flex items-center">
        <div className="flex justify-between items-center px-6 md:px-10 max-w-7xl mx-auto w-full">
          <Link to="/dashboard" className="text-2xl font-serif-elegant font-bold text-on-surface flex items-center gap-2 group transition-colors">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-300">pets</span>
            <span className="text-gradient">PetConnect</span>
          </Link>
          <button onClick={() => navigate(-1)} className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] hover:text-primary transition-all">
            Back
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-[112px] px-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Transfer Pet Form (only if pet id is in URL) */}
        <section className="md:col-span-6 space-y-6">
          {success && (
            <div className="p-4 bg-tertiary-container/30 border border-tertiary/20 rounded-2xl text-tertiary text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-in zoom-in">
              <span className="material-symbols-outlined text-lg">verified</span>
              {success}
            </div>
          )}
          {error && (
            <div className="p-4 bg-error/5 border border-error/20 rounded-2xl text-error text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-in zoom-in">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {id && pet && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-surface-container/50 shadow-xl shadow-primary/5 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
              
              <div className="flex items-center gap-4 border-b border-surface-container/30 pb-4">
                <img src={pet.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div>
                  <h2 className="text-lg font-serif-elegant font-bold text-on-surface">Transfer {pet.name}</h2>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Transfer ownership to another user</p>
                </div>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Recipient Email Address</label>
                  <input
                    required
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full bg-surface-container-low border border-surface-container rounded-2xl p-4 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Reason for Transfer</label>
                  <textarea
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain the reason for ownership transfer..."
                    className="w-full bg-surface-container-low border border-surface-container rounded-2xl p-4 text-xs resize-none focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brown-gradient text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg transition-all"
                >
                  {loading ? 'Processing Transfer...' : 'Initiate Transfer'}
                </button>
              </form>
            </div>
          )}

          {!id && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-surface-container/50 shadow shadow-primary/5 text-center py-12">
              <span className="material-symbols-outlined text-4xl text-primary mb-3">swap_horiz</span>
              <h3 className="font-serif-elegant font-bold text-on-surface">Transfer Pet Ownership</h3>
              <p className="text-xs text-on-surface-variant font-light mt-2 leading-relaxed px-4">
                To transfer a pet's ownership, navigate to your pet's profile page and select the transfer ownership option.
              </p>
            </div>
          )}
        </section>

        {/* Right Column: Pending Incoming / Outgoing Requests */}
        <section className="md:col-span-6 space-y-6">
          
          {/* Incoming requests */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-surface-container/50 shadow-sm space-y-6">
            <h3 className="font-serif-elegant font-bold text-on-surface text-lg border-b border-surface-container/30 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">arrow_downward</span>
              Incoming Requests
            </h3>
            
            {fetching ? (
              <p className="text-xs text-on-surface-variant/40">Loading requests...</p>
            ) : transfers.received.length === 0 ? (
              <p className="text-xs text-on-surface-variant/60 font-light">No pending incoming transfer requests.</p>
            ) : (
              <div className="space-y-4">
                {transfers.received.map(t => (
                  <div key={t.id} className="p-4 bg-surface-container-low/50 border rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img src={t.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                        <div>
                          <h4 className="font-bold text-on-surface text-xs">{t.pet_name}</h4>
                          <p className="text-[9px] text-on-surface-variant font-medium">From: {t.owner_name}</p>
                        </div>
                      </div>
                    </div>
                    {t.reason && <p className="text-[11px] font-light text-on-surface-variant italic">"{t.reason}"</p>}
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleAccept(t.id)}
                        disabled={loading}
                        className="flex-1 py-2 bg-primary text-on-primary font-bold text-[10px] uppercase tracking-wider rounded-lg text-center"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(t.id)}
                        disabled={loading}
                        className="flex-1 py-2 border border-error/30 text-error font-bold text-[10px] uppercase tracking-wider rounded-lg text-center"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-surface-container/50 shadow-sm space-y-6">
            <h3 className="font-serif-elegant font-bold text-on-surface text-lg border-b border-surface-container/30 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">arrow_upward</span>
              Sent Requests
            </h3>
            
            {fetching ? (
              <p className="text-xs text-on-surface-variant/40">Loading requests...</p>
            ) : transfers.sent.length === 0 ? (
              <p className="text-xs text-on-surface-variant/60 font-light">No pending sent requests.</p>
            ) : (
              <div className="space-y-4">
                {transfers.sent.map(t => (
                  <div key={t.id} className="p-4 bg-surface-container-low/50 border rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={t.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <div>
                        <h4 className="font-bold text-on-surface text-xs">{t.pet_name}</h4>
                        <p className="text-[9px] text-on-surface-variant font-medium">To: {t.target_name} ({t.target_email})</p>
                      </div>
                    </div>
                    <span className="bg-secondary/15 text-secondary px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>
      </main>

      <BottomNav />
    </div>
  )
}
