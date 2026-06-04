import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function LguDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('OVERVIEW')
  const [loading, setLoading] = useState(true)
  const [hoveredBar, setHoveredBar] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      return navigate('/login?role=lgu')
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'lgu' && user.role !== 'admin') {
      return navigate('/dashboard')
    }
    setTimeout(() => setLoading(false), 500)
  }, [navigate])

  const navItems = [
    { icon: 'grid_view', label: 'Overview' },
    { icon: 'emergency_share', label: 'Alerts' },
    { icon: 'pets', label: 'Adoption' },
    { icon: 'monitoring', label: 'Reports' }
  ]

  const mainStats = [
    { icon: 'pets', label: 'Registered Pets', value: '3,450', trend: '+12%', color: 'bg-primary/10 text-primary' },
    { icon: 'warning', label: 'Strays Reported', value: '112', trend: '-5%', color: 'bg-error/10 text-error' },
    { icon: 'favorite', label: 'Pending Adoptions', value: '45', trend: '+15', color: 'bg-secondary/10 text-secondary' },
    { icon: 'verified', label: 'Vax Compliance', value: '92%', trend: 'High', color: 'bg-tertiary/10 text-tertiary' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
    </div>
  )

  const renderOverview = () => (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        {mainStats.map(s => (
          <div key={s.label} className="premium-card p-5 group hover:border-primary/20 min-h-[140px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-full bg-primary-container text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full ${s.color} shadow-sm`}>{s.trend}</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.08em] mt-3">{s.label}</p>
              <p className="text-[32px] font-bold text-on-surface leading-tight mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container/50 shadow-xl shadow-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex justify-between items-end mb-12 relative z-10">
          <div>
            <h2 className="text-2xl font-serif-elegant font-bold text-on-surface flex items-center gap-3">
              Registration Activity
              <span className="material-symbols-outlined text-primary/40 text-xl animate-pulse">monitoring</span>
            </h2>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">Real-time neighborhood data</p>
          </div>
          <div className="flex bg-surface-container-low/50 backdrop-blur-sm rounded-2xl p-1.5 text-[10px] font-bold border border-surface-container">
            <button className="px-6 py-2 bg-white text-primary rounded-xl shadow-sm transition-all uppercase tracking-widest">Weekly</button>
            <button className="px-6 py-2 text-on-surface-variant hover:text-primary transition-all uppercase tracking-widest">Monthly</button>
          </div>
        </div>
        
        <div className="flex items-end justify-between h-56 gap-6 px-2 relative z-10">
          {[35, 55, 95, 45, 70, 60, 85].map((h, i) => (
            <div 
              key={i} 
              className="flex-1 flex flex-col items-center h-full group"
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div className="relative w-full h-full flex flex-col justify-end">
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-on-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all duration-300 shadow-xl ${hoveredBar === i ? 'opacity-100 -translate-y-2' : 'opacity-0 translate-y-0 pointer-events-none'}`}>
                  {Math.round(h * 1.5)} Pets
                </div>
                <div 
                  className={`w-full rounded-t-2xl transition-all duration-700 ease-out cursor-pointer shadow-sm ${i === 2 ? 'bg-primary' : 'bg-surface-container-low hover:bg-primary/30'}`} 
                  style={{ height: `${h}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase mt-5 tracking-[0.1em]">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-brown-gradient rounded-[2.5rem] p-10 text-on-primary shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="flex items-center justify-between mb-10 relative z-10">
          <h2 className="text-xl font-serif-elegant font-bold flex items-center gap-3">
            System Live Feed
            <span className="w-2 h-2 bg-secondary rounded-full animate-ping"></span>
          </h2>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-60">Last sync: Just now</span>
        </div>
        <div className="space-y-8 relative z-10 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
          {[
            { title: 'New Pet Registered', desc: '"Oreo" (Aspin) to Ricardo Abellana', time: '2 mins ago', icon: 'app_registration' },
            { title: 'Stray Report Received', desc: 'Paseo Arcenas, reported by local tanod', time: '10 mins ago', icon: 'report_problem' },
            { title: 'Vaccination Updated', desc: '"Choco" (Shih Tzu) by Maria Garcia', time: '1 hour ago', icon: 'verified' }
          ].map((a, i) => (
            <div key={i} className="flex gap-6 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-secondary group-hover:text-on-secondary transition-all">
                <span className="material-symbols-outlined text-xl">{a.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{a.title}</h4>
                <p className="text-sm opacity-60 font-light mb-2">{a.desc}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'ALERTS':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-serif-elegant font-bold text-on-surface tracking-tight mb-2">Community Alerts</h2>
                  <p className="text-on-surface-variant font-light">Monitor critical incidents in the Lahug jurisdiction.</p>
                </div>
                <div className="w-12 h-12 bg-error/10 text-error rounded-2xl flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-3xl">emergency</span>
                </div>
             </div>
             <div className="space-y-4">
               {[
                 { id: 1, title: 'Unregistered Tag Scan', location: 'Sitio Sudlon', time: '12m ago', type: 'error', icon: 'sensors_off' },
                 { id: 2, title: 'Lost Pet Reported', location: 'Lahug Heights', time: '45m ago', type: 'warning', icon: 'search_check' },
                 { id: 3, title: 'Stray Sighting Confirmed', location: 'Lahug Plaza', time: '2h ago', type: 'info', icon: 'visibility' }
               ].map(alert => (
                 <div key={alert.id} className="premium-card p-6 flex justify-between items-center group">
                   <div className="flex items-center gap-5">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${alert.type === 'error' ? 'bg-error/10 text-error' : 'bg-secondary-container text-secondary'}`}>
                       <span className="material-symbols-outlined text-3xl">{alert.icon}</span>
                     </div>
                     <div>
                       <p className="font-serif-elegant font-bold text-on-surface text-lg leading-none mb-2">{alert.title}</p>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{alert.location}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low px-3 py-1.5 rounded-full">{alert.time}</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )
      case 'ADOPTION':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="bg-brown-gradient p-10 rounded-[3rem] text-on-primary shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
               <div className="flex justify-between items-center relative z-10">
                 <div>
                  <h2 className="text-3xl font-serif-elegant font-bold mb-2 tracking-tight">Adoption Pipeline</h2>
                  <p className="text-xs font-light opacity-60 uppercase tracking-[0.2em]">Lahug Rescue Center</p>
                 </div>
                 <div className="text-right">
                   <p className="text-5xl font-serif-elegant font-bold text-secondary">45</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Active Cases</p>
                 </div>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
               {[
                 { name: 'Luna', breed: 'Aspin', age: '2y', status: 'In Interview', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400' },
                 { name: 'Cooper', breed: 'Beagle', age: '1y', status: 'Home Visit', img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400' }
               ].map(pet => (
                 <div key={pet.name} className="premium-card p-6 flex flex-col gap-6 group cursor-pointer">
                   <div className="relative overflow-hidden rounded-[2rem] shadow-lg">
                    <img src={pet.img} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-bold text-primary uppercase tracking-widest shadow-sm">
                      {pet.status}
                    </div>
                   </div>
                   <div className="px-2">
                     <p className="font-serif-elegant font-bold text-on-surface text-2xl leading-none mb-2">{pet.name}</p>
                     <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{pet.breed} • {pet.age}</p>
                   </div>
                   <button className="w-full py-4 bg-surface-container-low text-primary rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-on-primary transition-all">Review Application</button>
                 </div>
               ))}
             </div>
          </div>
        )
      case 'REPORTS':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
             <div className="flex justify-between items-end">
               <div>
                <h2 className="text-3xl font-serif-elegant font-bold text-on-surface tracking-tight mb-2">Administrative Analytics</h2>
                <p className="text-on-surface-variant font-light">Performance summary for Q2 2024.</p>
               </div>
               <button className="bg-on-surface text-surface px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-on-surface/20">
                 <span className="material-symbols-outlined text-sm">picture_as_pdf</span> Export
               </button>
             </div>

             <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Compliance', value: '92%', trend: '+3%', icon: 'verified_user', color: 'text-tertiary' },
                  { label: 'Rescue Rate', value: '78%', trend: '+4%', icon: 'volunteer_activism', color: 'text-primary' },
                  { label: 'Avg Wait', value: '14d', trend: '-2d', icon: 'schedule', color: 'text-secondary' },
                  { label: 'Active Tags', value: '3.1k', trend: '98%', icon: 'sensors', color: 'text-on-surface' }
                ].map(metric => (
                  <div key={metric.label} className="bg-white p-8 rounded-[2.5rem] border border-surface-container/50 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
                    <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-7xl text-surface-container/50 group-hover:text-primary-container/20 transition-colors">{metric.icon}</span>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 mb-4 relative z-10">{metric.label}</p>
                    <p className={`text-4xl font-serif-elegant font-bold ${metric.color} mb-2 relative z-10`}>{metric.value}</p>
                    <p className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-widest relative z-10">{metric.trend} vs last quarter</p>
                  </div>
                ))}
             </div>

             <div className="bg-white rounded-[3rem] p-10 border border-surface-container shadow-xl shadow-primary/5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
               <h3 className="text-lg font-serif-elegant font-bold text-on-surface mb-10 flex items-center gap-4">
                 <span className="material-symbols-outlined text-primary">analytics</span>
                 Vaccination Coverage by Sitio
               </h3>
               <div className="space-y-10">
                 {[
                   { name: 'Sitio Salinas', rate: 95, color: 'bg-primary' },
                   { name: 'Sitio La Guardia', rate: 88, color: 'bg-secondary' },
                   { name: 'Sitio Sudlon', rate: 72, color: 'bg-tertiary' },
                   { name: 'Beverly Hills', rate: 91, color: 'bg-on-surface' }
                 ].map(sitio => (
                   <div key={sitio.name} className="space-y-4 group">
                     <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em]">
                       <span className="text-on-surface-variant group-hover:text-primary transition-colors">{sitio.name}</span>
                       <span className="text-on-surface">{sitio.rate}%</span>
                     </div>
                     <div className="h-3 bg-surface-container-low rounded-full overflow-hidden shadow-inner">
                       <div className={`h-full ${sitio.color} rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${sitio.rate}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  return (
    <div className="bg-surface min-h-screen pb-40 selection:bg-primary-container selection:text-primary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container/30 h-[72px] flex items-center">
        <div className="flex justify-between items-center px-10 w-full max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-11 h-11 bg-brown-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-on-primary text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-on-surface leading-none tracking-tight">Lahug Admin</h1>
              <p className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-[0.2em] mt-1">LGU Cebu City</p>
            </div>
          </Link>
          <button 
            onClick={() => { localStorage.clear(); navigate('/') }}
            className="px-6 py-2 bg-surface border border-error/20 rounded-xl text-[11px] font-semibold text-error hover:bg-error hover:text-white transition-all uppercase tracking-[0.08em] shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="pt-28 px-10 max-w-7xl mx-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-[68px] bg-white/90 backdrop-blur-xl border-t border-surface-container/50 flex justify-around items-center px-6 z-50">
        {navItems.map(item => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab(item.label.toUpperCase())}
            className={`flex items-center justify-center transition-all duration-300 ${activeTab === item.label.toUpperCase() ? 'bg-primary text-on-primary shadow-md px-5 h-11 rounded-full gap-2' : 'text-on-surface-variant hover:text-primary w-11 h-11 rounded-full'}`}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            {activeTab === item.label.toUpperCase() && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
