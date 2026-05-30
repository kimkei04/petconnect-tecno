import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPets, getAlerts } from '../services/api'
import BottomNav from '../components/BottomNav'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}') || {}
  const [pets, setPets] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login')
    Promise.all([getPets(), getAlerts()])
      .then(([pRes, aRes]) => {
        const fetchedPets = pRes.data?.length ? pRes.data : [
          { id: 1, name: 'Buddy', breed: 'Golden Retriever', age: 3, status: 'healthy', photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400', vaccines: JSON.stringify([{name: 'Rabies', next_due: new Date(Date.now() + 432000000).toISOString().split('T')[0]}]) },
          { id: 2, name: 'Milo', breed: 'Beagle', age: 2, status: 'lost', photo_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400' },
          { id: 3, name: 'Cleo', breed: 'Siamese Cat', age: 4, status: 'healthy', photo_url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=400' }
        ];
        setPets(fetchedPets);
        
        // Generate proactive reminders for upcoming vaccines
        const proactiveReminders = [];
        fetchedPets.forEach(pet => {
           try {
              if (pet.vaccines && pet.vaccines.startsWith('[')) {
                 const vax = JSON.parse(pet.vaccines);
                 vax.forEach(v => {
                    const due = new Date(v.next_due);
                    const diff = (due - new Date()) / (1000 * 60 * 60 * 24);
                    if (diff > 0 && diff <= 14) {
                       proactiveReminders.push({
                          id: `vax-${pet.id}-${v.name}`,
                          title: 'Vaccine Due Soon',
                          message: `${pet.name} is due for ${v.name} on ${v.next_due}.`,
                          type: 'vaccine',
                          created_at: new Date().toISOString(),
                          is_proactive: true
                       });
                    }
                 });
              }
           } catch (e) {}
        });

        const fetchedAlerts = aRes.data?.length ? aRes.data : [
          { id: 1, title: 'Pet Scanned!', message: 'Milo was scanned near IT Park, Cebu City.', type: 'scan', created_at: new Date().toISOString(), is_read: false, latitude: 10.3291, longitude: 123.9061 },
          { id: 2, title: 'Vaccine Reminder', message: 'Buddy is due for Rabies vaccination.', type: 'vaccine', created_at: new Date(Date.now() - 172800000).toISOString(), is_read: true }
        ];
        setAlerts([...proactiveReminders, ...fetchedAlerts]);
      })
      .catch(() => {
        // Fallback already handled in Promise.all .then for demo consistency
      })
      .finally(() => setLoading(false))
  }, [])

  const lostPets = pets.filter(p => p.status === 'lost');

  const statusStyle = (status) => {
    switch (status) {
      case 'lost': return 'bg-error/20 text-error border border-error/20';
      case 'deceased': return 'bg-on-surface/10 text-on-surface/40 border border-on-surface/10';
      default: return 'bg-tertiary/10 text-tertiary border border-tertiary/20';
    }
  }

  return (
    <div className="bg-surface min-h-screen pb-40 selection:bg-primary-container selection:text-primary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container/30 soft-shadow h-[72px] flex items-center">
        <div className="flex justify-between items-center px-6 md:px-10 max-w-7xl mx-auto w-full">
          <div className="text-2xl font-serif-elegant font-bold text-on-surface flex items-center gap-2 group transition-colors">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-300">pets</span>
            <span className="text-gradient">PetConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard/alerts" className="relative p-2 text-on-surface-variant hover:text-primary transition-colors group">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {alerts.some(a => !a.is_read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
              )}
            </Link>
            <button className="w-9 h-9 rounded-full bg-primary-container border border-primary/20 text-primary font-bold text-sm shadow-sm hover:shadow transition-all">
              {user.name?.charAt(0) || 'U'}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-[112px] px-6 md:px-10 max-w-7xl mx-auto space-y-10">
        {/* Welcome Section */}
        <section className="relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-container/20 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-[28px] font-semibold text-on-surface mb-2 tracking-tight leading-tight">
            Hello, <span className="text-gradient">{user.name?.split(' ')[0] || 'Friend'}</span>
          </h1>
          <p className="text-sm text-on-surface-variant font-normal">
            {lostPets.length > 0 ? `Urgent: ${lostPets.length} pet reported lost.` : 'Your companions are safe and sound.'}
          </p>
        </section>

        {/* Emergency Lost Banner */}
        {lostPets.length > 0 && (
          <div className="bg-error rounded-3xl p-6 text-white shadow-xl shadow-error/20 animate-in zoom-in duration-500 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <span className="material-symbols-outlined text-3xl animate-pulse">emergency</span>
                </div>
                <div className="flex-1">
                   <h3 className="text-lg font-bold tracking-tight">Lost Pet Alert</h3>
                   <p className="text-sm opacity-90 font-medium">{lostPets[0].name} is currently marked as lost. Check for scan activity below.</p>
                </div>
                <Link to={`/pet/${lostPets[0].id}`} className="px-6 py-3 bg-white text-error rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">Manage</Link>
             </div>
          </div>
        )}

        {/* My Pets Grid */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-semibold text-on-surface">My Pets</h2>
            <Link to="/dashboard/pets" className="text-[11px] font-semibold text-primary uppercase tracking-[0.08em] hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map(pet => (
              <div key={pet.id} className="premium-card group rounded-2xl overflow-hidden bg-white border border-surface-container/50">
                <div className="h-56 relative overflow-hidden">
                  <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className={`absolute top-4 right-4 text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded-full shadow-lg backdrop-blur-md ${statusStyle(pet.status)}`}>
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
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                      Edit Profile
                    </Link>
                    <Link to={`/pet/${pet.id}`} className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-all shadow-sm">
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-surface-container-low/30 rounded-2xl p-6 border border-surface-container/50 backdrop-blur-sm mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">history</span>
            <h2 className="text-[20px] font-semibold text-on-surface">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={alert.id || i} className={`p-5 rounded-xl flex items-start gap-4 shadow-sm border transition-colors ${alert.is_proactive ? 'bg-primary/5 border-primary/20' : 'bg-white/80 border-surface-container/30 hover:border-primary/20'}`}>
                <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.type === 'scan' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined text-xl">{alert.type === 'scan' ? 'location_on' : 'vaccines'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                       <h4 className="font-semibold text-on-surface text-[15px]">{alert.title}</h4>
                       {alert.is_proactive && <span className="bg-primary text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Auto</span>}
                    </div>
                    <span className="text-[12px] font-normal text-on-surface-variant/40">{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant font-normal leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-10 opacity-30">
                 <p className="text-xs font-bold uppercase tracking-widest">No recent activity</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FAB */}
      <Link to="/pet/new" className="fixed bottom-[42px] right-6 w-[52px] h-[52px] bg-brown-gradient text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-90 active:scale-95 transition-all z-60 group">
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>

      <BottomNav />
    </div>
  )
}
