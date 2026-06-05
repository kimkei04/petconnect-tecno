import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPublicAdoptions } from '../services/api'

export default function AdoptionGallery() {
  const [adoptions, setAdoptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState(null)

  useEffect(() => {
    fetchAdoptions()
  }, [])

  const fetchAdoptions = async () => {
    try {
      const res = await getPublicAdoptions()
      setAdoptions(res.data)
    } catch (err) {
      console.error('Failed to fetch adoptions:', err)
      setError('Could not retrieve adoption gallery.')
      // Fallback mock adoptions for demo
      setAdoptions([
        {
          id: 1,
          pet_name: 'Max',
          species: 'Dog',
          breed: 'Askal / Mixed',
          estimated_age: '6 months',
          description: 'Very energetic and loves playing fetch. Looking for a loving home with a yard.',
          barangay: 'Lahug',
          photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
          posted_by_name: 'Lahug Rescue',
          posted_by_phone: '0917-123-4567',
          posted_by_email: 'rescue@lahug.gov.ph'
        },
        {
          id: 2,
          pet_name: 'Milo',
          species: 'Cat',
          breed: 'Domestic Shorthair',
          estimated_age: '1 year',
          description: 'A quiet, gentle companion who loves lounging by the window.',
          barangay: 'Mabolo',
          photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
          posted_by_name: 'Milo Care',
          posted_by_phone: '0918-987-6543',
          posted_by_email: 'mabolo@cebu.gov.ph'
        }
      ])
    } finally {
      setLoading(false)
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
            Adoption <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-light max-w-xl mx-auto">
            Give a second chance to pets waiting for their forever homes. Browse available pets and contact the LGU or owner directly.
          </p>
        </section>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">Loading adoption gallery...</p>
          </div>
        ) : adoptions.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 border border-dashed border-surface-container rounded-[2.5rem] space-y-4 bg-white/50">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">volunteer_activism</span>
            <h3 className="font-serif-elegant font-bold text-on-surface text-lg">Gallery is empty</h3>
            <p className="text-xs text-on-surface-variant font-light px-6">There are currently no pets listed for adoption. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adoptions.map(pet => (
              <div key={pet.id} className="premium-card p-6 flex flex-col justify-between overflow-hidden relative group">
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-container-low shadow-inner">
                    <img 
                      src={pet.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={pet.pet_name} 
                    />
                    <span className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-md">
                      {pet.species}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-serif-elegant font-bold text-on-surface group-hover:text-primary transition-colors">{pet.pet_name}</h3>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">{pet.breed || 'Mixed Breed'} • {pet.estimated_age}</p>
                    <p className="text-xs text-on-surface font-light mt-3 leading-relaxed">"{pet.description || 'No description available.'}"</p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-surface-container/30 space-y-4">
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
                      Location
                    </p>
                    <p className="text-xs text-on-surface font-medium leading-relaxed">Barangay {pet.barangay || 'Not specified'}</p>
                  </div>

                  <button
                    onClick={() => setSelectedInquiry(pet)}
                    className="w-full py-4 bg-brown-gradient text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    Inquire to Adopt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Inquiry Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-serif-elegant font-bold text-on-surface">Adoption Contact</h3>
                <p className="text-xs text-on-surface-variant font-light mt-1">Get in touch with the LGU or owner hosting {selectedInquiry.pet_name}.</p>
              </div>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/80 hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-low/50 rounded-2xl p-6 space-y-4 border border-surface-container/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-container text-primary rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Contact Person / LGU</p>
                    <p className="text-sm font-bold text-on-surface">{selectedInquiry.posted_by_name || 'PetConnect Custodian'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-container text-primary rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Mobile / Phone</p>
                    <p className="text-sm font-bold text-on-surface">{selectedInquiry.posted_by_phone || 'None'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-container text-primary rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-bold text-on-surface break-all">{selectedInquiry.posted_by_email || 'support@petconnect.com'}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-on-surface-variant font-light text-center leading-relaxed">
                Please mention that you saw <span className="font-bold text-on-surface">{selectedInquiry.pet_name}</span> on <span className="font-bold text-primary">PetConnect</span> when contacting them.
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="w-full py-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
