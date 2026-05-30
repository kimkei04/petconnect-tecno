import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPets } from '../services/api'

export default function LostPet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPets().then(r => {
      const found = r.data.find(p => String(p.id) === String(id))
      if (found) {
        setPet({
          ...found,
          gender: 'Male',
          registered_at: 'Cebu City',
          owner_name: 'Michael Henderson',
          owner_phone: '+63 912 345 6789',
          references: [
            'https://images.unsplash.com/photo-1541364983171-a8ba01d95cfc?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1591160674255-fc8b9f7edee1?auto=format&fit=crop&q=80&w=200'
          ]
        })
      } else {
        setPet({
          id,
          name: 'Cooper',
          breed: 'Beagle',
          species: 'Dog',
          age: 3,
          gender: 'Male',
          status: 'lost',
          registered_at: 'Cebu City',
          medical_conditions: ['Sensitive stomach', 'Microchipped (ID: 982****41)'],
          vaccines: 'Up to date',
          owner_name: 'Michael Henderson',
          owner_phone: '+63 912 345 6789',
          photo_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400',
          references: [
            'https://images.unsplash.com/photo-1541364983171-a8ba01d95cfc?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1591160674255-fc8b9f7edee1?auto=format&fit=crop&q=80&w=200'
          ]
        })
      }
    }).catch(() => {
      setPet({
        id,
        name: 'Cooper',
        breed: 'Beagle',
        species: 'Dog',
        age: 3,
        gender: 'Male',
        status: 'lost',
        registered_at: 'Cebu City',
        medical_conditions: ['Sensitive stomach', 'Microchipped (ID: 982****41)'],
        vaccines: 'Up to date',
        owner_name: 'Michael Henderson',
        owner_phone: '+63 912 345 6789',
        photo_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400',
        references: [
          'https://images.unsplash.com/photo-1541364983171-a8ba01d95cfc?auto=format&fit=crop&q=80&w=200',
          'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200',
          'https://images.unsplash.com/photo-1591160674255-fc8b9f7edee1?auto=format&fit=crop&q=80&w=200'
        ]
      })
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
    </div>
  )

  if (!pet) return null

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md flex justify-between items-center px-6 h-16 border-b border-surface-container">
        <span className="material-symbols-outlined text-primary">pets</span>
        <h1 className="text-lg font-black text-primary tracking-[0.2em] uppercase">Pet Alert</h1>
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="pt-24 pb-12 px-5 max-w-lg mx-auto w-full space-y-6">
        {/* Emergency Alert Banner */}
        <div className="bg-error rounded-2xl p-5 flex flex-col items-center gap-3 shadow-xl shadow-error/20 animate-pulse">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-white text-xl">warning</span>
             <span className="font-black text-white text-[11px] tracking-widest uppercase">🚨 Emergency: This Pet is Lost</span>
             <span className="material-symbols-outlined text-white text-xl">warning</span>
          </div>
          {pet.reward_amount && (
            <div className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20">
               Reward: {pet.reward_amount}
            </div>
          )}
        </div>

        {/* Incident Details Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-error/10 space-y-6 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
                 <span className="material-symbols-outlined text-2xl">my_location</span>
              </div>
              <div>
                 <p className="text-[10px] font-black text-error uppercase tracking-widest mb-1">Last Seen At</p>
                 <p className="text-lg font-black text-on-surface leading-tight">{pet.last_seen_location || 'Lahug, Cebu City'}</p>
              </div>
           </div>

           <div className="p-5 bg-surface-container-low/50 rounded-2xl border border-surface-container italic">
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                 "{pet.lost_description || 'Please help me get back home. I am friendly but might be scared if approached too quickly.'}"
              </p>
           </div>
        </div>

        {/* Profile Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            <img
              src={pet.photo_url}
              alt={pet.name}
              className="w-44 h-44 rounded-full object-cover border-4 border-white shadow-2xl"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-surface-container flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-500 text-[14px]">verified</span>
              <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest leading-none">Registered Tag</span>
            </div>
          </div>
          <h2 className="text-4xl font-black text-primary mb-1 tracking-tight">{pet.name}</h2>
          <p className="text-on-surface-variant font-bold text-sm mb-4">{pet.breed} • {pet.gender} • {pet.age} Years Old</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{pet.registered_at}</span>
          </div>
        </div>

        {/* Owner Contact Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-surface-container">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Owner Contact</p>
              <h3 className="text-2xl font-black text-primary tracking-tight">{pet.owner_name}</h3>
            </div>
            <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary border border-surface-container">
              <span className="material-symbols-outlined">person</span>
            </div>
          </div>
          <div className="space-y-3">
            <a href={`tel:${pet.owner_phone}`} className="flex items-center justify-center gap-3 py-4 bg-primary text-on-primary rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all active:scale-95">
              <span className="material-symbols-outlined">call</span>
              Call Michael
            </a>
            <button className="w-full flex items-center justify-center gap-3 py-4 bg-surface-container-low text-on-surface rounded-2xl font-black hover:bg-surface-variant transition-all active:scale-95 border border-surface-container">
              <span className="material-symbols-outlined">chat</span>
              Send Message
            </button>
          </div>
        </div>

        {/* Reference Photos */}
        <div className="bg-surface-container-low/50 rounded-[2.5rem] p-8 border border-surface-container shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-surface-container">
              <span className="material-symbols-outlined">photo_library</span>
            </div>
            <h3 className="font-black text-xs uppercase tracking-widest text-on-surface-variant">Reference Photos</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {pet.references.map((url, i) => (
              <img key={i} src={url} className="w-full h-24 object-cover rounded-2xl border border-white shadow-sm" alt="" />
            ))}
          </div>
        </div>

        {/* Info Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Medical Notes */}
          <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-sm">medical_information</span>
              </div>
              <h3 className="font-black text-[10px] uppercase tracking-widest text-on-surface-variant">Medical</h3>
            </div>
            <ul className="space-y-2">
              {(Array.isArray(pet.medical_conditions) ? pet.medical_conditions : [pet.medical_conditions]).map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-bold text-on-surface leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1.5 shrink-0"></div>
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* Vaccination Status */}
          <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm">vaccines</span>
              </div>
              <h3 className="font-black text-[10px] uppercase tracking-widest text-on-surface-variant">Vaccination</h3>
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{pet.vaccines}</span>
            </div>
          </div>
        </div>

        {/* Footer Prompt */}
        <div className="text-center py-8 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Powered by PetConnect Smart ID</p>
          <p className="text-[10px] font-bold">If you've seen this pet, please notify the owner immediately.</p>
        </div>
      </main>
    </div>
  )
}