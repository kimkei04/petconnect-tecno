import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPets } from '../services/api'
import BottomNav from '../components/BottomNav'

export default function MyPets() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}') || {}
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/role-select')
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (loggedInUser.role === 'lgu' || loggedInUser.role === 'admin') {
      return navigate('/lgu')
    }
    getPets()
      .then(res => setPets(res.data || []))
      .catch((err) => {
        console.error('Failed to load pets:', err)
        setPets([])
      })
      .finally(() => setLoading(false))
  }, [])

  const statusColor = status => {
    if (status === 'healthy') return 'bg-tertiary-container text-on-tertiary-container'
    if (status === 'lost')    return 'bg-error text-on-error'
    return 'bg-secondary-container text-on-secondary-container'
  }

  return (
    <div className="bg-surface min-h-screen pb-40 selection:bg-primary-container selection:text-primary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container/30 soft-shadow h-[72px] flex items-center">
        <div className="flex justify-between items-center px-6 md:px-10 max-w-7xl mx-auto w-full">
          <Link to="/" className="text-2xl font-serif-elegant font-bold text-on-surface flex items-center gap-2 group transition-colors">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-300">pets</span>
            <span className="text-gradient">PetConnect</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard/alerts" className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </Link>
            <Link to="/dashboard/settings" className="w-9 h-9 rounded-full bg-primary-container border border-primary/20 text-primary font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center">
              {user.name?.charAt(0) || 'U'}
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-[112px] px-6 md:px-10 max-w-7xl mx-auto">
        {/* Title */}
        <section className="mb-8 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-container/20 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-[28px] font-semibold text-on-surface tracking-tight leading-tight">
            My <span className="text-gradient">Pets</span>
          </h1>
          <p className="text-sm text-on-surface-variant font-normal mt-2">Manage your beloved companions and their digital profiles.</p>
        </section>

        {/* Pets Grid */}
        {loading ? (
          <div className="flex justify-center py-32">
            <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-32 premium-card bg-surface-container-low/30 border-dashed rounded-2xl">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-primary mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">pets</span>
            </div>
            <p className="text-lg font-semibold text-on-surface mb-2">No pets registered yet</p>
            <p className="text-sm text-on-surface-variant font-normal mb-8 max-w-xs mx-auto">Start by adding your first companion to the PetConnect community.</p>
            <Link to="/pet/new" className="inline-block px-8 py-3.5 bg-brown-gradient text-on-primary font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm">
              Add First Pet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map(pet => (
              <div key={pet.id} className="premium-card group rounded-2xl overflow-hidden bg-white border border-surface-container/50">
                <div className="h-56 w-full bg-surface-container overflow-hidden relative">
                  {pet.photo_url
                    ? <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    : <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-on-surface-variant/20"><span className="material-symbols-outlined text-7xl">pets</span></div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className={`absolute top-4 right-4 text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded-full shadow-lg backdrop-blur-md ${statusColor(pet.status)}`}>
                    {pet.status}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-on-surface group-hover:text-primary transition-colors">{pet.name}</h3>
                      <p className="text-on-surface-variant text-[13px] font-normal mt-1">{pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
                    </div>
                    <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:bg-primary-container transition-all">
                      <span className="material-symbols-outlined text-xl">nfc</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-surface-container/50">
                    <Link to={`/pet/${pet.id}/edit`} className="flex items-center gap-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.08em] hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">edit_note</span> Edit Profile
                    </Link>
                    <Link to={`/manage/pet/${pet.id}`} className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-all shadow-sm">
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <Link
        to="/pet/new"
        className="fixed right-6 bottom-[42px] w-[52px] h-[52px] bg-brown-gradient text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-90 active:scale-95 transition-all z-60 group"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>

      <BottomNav />
    </div>
  )
}
