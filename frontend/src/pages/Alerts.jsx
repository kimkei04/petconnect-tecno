import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAlerts } from '../services/api'
import BottomNav from '../components/BottomNav'
import MapComponent from '../components/MapComponent'

export default function Alerts() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [alerts, setAlerts] = useState([])
    // Mark as read/unread handler
    const handleToggleRead = (alertId) => {
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, is_read: !alert.is_read } : alert
      ));
    };
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login')
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (loggedInUser.role === 'lgu' || loggedInUser.role === 'admin') {
      return navigate('/lgu')
    }
    getAlerts()
      .then(res => {
        setAlerts(res.data?.length ? res.data : [
          { id: 1, title: 'Pet Scanned!', message: 'Milo was scanned near IT Park, Cebu City.', type: 'scan', created_at: new Date().toISOString(), is_read: false, latitude: 10.3291, longitude: 123.9061 },
          { id: 2, title: 'Vaccine Reminder', message: 'Buddy is due for Rabies vaccination.', type: 'vaccine', created_at: new Date(Date.now() - 172800000).toISOString(), is_read: true }
        ])
      })
      .catch(() => {
        setAlerts([
          { id: 1, title: 'Pet Scanned!', message: 'Milo was scanned near IT Park, Cebu City.', type: 'scan', created_at: new Date().toISOString(), is_read: false, latitude: 10.3291, longitude: 123.9061 },
          { id: 2, title: 'Vaccine Reminder', message: 'Buddy is due for Rabies vaccination.', type: 'vaccine', created_at: new Date(Date.now() - 172800000).toISOString(), is_read: true }
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleViewLocation = (lat, lng) => {
    setSelectedLocation({ lat, lng })
    setShowMap(true)
  }

  return (
    <div className="bg-surface min-h-screen pb-32 selection:bg-primary-container selection:text-primary">
            {/* Notification Details & Location Modal */}
            {selectedAlert && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
                <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedAlert(null)}></div>
                <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
                  {/* Modal Header */}
                  <div className="p-6 border-b border-surface-container/50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${selectedAlert.type === 'scan' ? 'bg-error text-white' : 'bg-primary text-on-primary'}`}>
                        <span className="material-symbols-outlined text-2xl">{selectedAlert.type === 'scan' ? 'location_on' : 'vaccines'}</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-on-surface mb-0.5">{selectedAlert.title}</h2>
                        <span className="text-xs text-on-surface-variant">{new Date(selectedAlert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedAlert(null)} className="w-9 h-9 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-8 overflow-y-auto">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/70">Details</h3>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedAlert.is_read}
                            onChange={() => {
                              handleToggleRead(selectedAlert.id);
                              setSelectedAlert({ ...selectedAlert, is_read: !selectedAlert.is_read });
                            }}
                            className="accent-green-500 w-5 h-5 rounded-full border-2 border-green-400 focus:ring-green-300"
                            id="read-toggle"
                          />
                          <label htmlFor="read-toggle" className="text-xs font-semibold text-green-600 select-none cursor-pointer">
                            {selectedAlert.is_read ? 'Read' : 'Unread'}
                          </label>
                        </div>
                      </div>
                      <div className="text-on-surface-variant text-base leading-relaxed p-4 bg-surface-container-low/40 rounded-2xl border border-surface-container/30">
                        {selectedAlert.message}
                      </div>
                    </div>

                    {/* Map & Location Section - Shown for all scan alerts */}
                    {(selectedAlert.type === 'scan' || selectedAlert.latitude) && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/70">Scan Location</h3>
                          {!selectedAlert.latitude && (
                            <span className="text-[10px] font-bold text-error uppercase tracking-widest bg-error/10 px-2 py-1 rounded-md">Approximate Area</span>
                          )}
                        </div>
                        
                        <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-surface-container shadow-inner relative group">
                          <MapComponent 
                            lat={selectedAlert.latitude || 10.3291} 
                            lng={selectedAlert.longitude || 123.9061} 
                            zoom={16} 
                          />
                          <div className="absolute bottom-3 right-3 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-surface-container text-[10px] font-bold text-primary flex items-center gap-1.5">
                             <span className="material-symbols-outlined text-sm">my_location</span>
                             {selectedAlert.latitude ? `${selectedAlert.latitude.toFixed(4)}, ${selectedAlert.longitude.toFixed(4)}` : "Location Estimated"}
                          </div>
                        </div>

                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary">explore</span>
                           </div>
                           <div>
                              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Detailed Location</p>
                              <p className="text-sm text-on-surface font-medium leading-relaxed">
                                 The pin location shows your pet is <strong>{selectedAlert.message.includes('near') ? selectedAlert.message.split('near ')[1] : "near IT Park on the parking lot"}</strong>.
                              </p>
                              <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed opacity-80">
                                 {selectedAlert.latitude 
                                   ? "This precise coordinate was captured the moment the tag was scanned." 
                                   : "We detected activity in this area. Check the map for the registered scan zone."}
                              </p>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <style>{`
                  .animate-fade-in { animation: fadeIn 0.2s; }
                  .animate-scale-in { animation: scaleIn 0.25s cubic-bezier(.4,2,.6,1); }
                  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                  @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
                `}</style>
              </div>
            )}
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container/30 soft-shadow h-[72px] flex items-center">
        <div className="flex justify-between items-center px-6 max-w-7xl mx-auto w-full">
          <Link to="/" className="text-2xl font-serif-elegant font-bold text-on-surface flex items-center gap-2 group transition-colors">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-300">pets</span>
            <span className="text-gradient">PetConnect</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard/settings" className="w-9 h-9 rounded-full bg-primary-container border border-primary/20 text-primary font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center">
              {user.name?.charAt(0) || 'U'}
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-[112px] px-6 max-w-3xl mx-auto">
        {/* Title */}
        <section className="mb-8 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-container/20 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-[28px] font-semibold text-on-surface tracking-tight leading-tight">
            Notification <span className="text-gradient">Center</span>
          </h1>
          <p className="text-sm text-on-surface-variant font-normal mt-2">Stay informed about your pet's safety and health.</p>
        </section>

        {/* Alerts List */}
        {loading ? (
          <div className="flex justify-center py-32">
            <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-32 premium-card bg-surface-container-low/30 border-dashed rounded-2xl">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant/30 mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">notifications_off</span>
            </div>
            <p className="text-lg font-semibold text-on-surface mb-2">Quiet for now</p>
            <p className="text-sm text-on-surface-variant font-normal max-w-xs mx-auto">When your pet's tag is scanned or reminders are due, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-3 relative before:absolute before:left-[21.5px] before:top-4 before:bottom-4 before:w-[1px] before:bg-surface-container/50">
            {alerts.map(alert => (
              <button
                key={alert.id}
                className={`relative pl-16 group w-full text-left focus:outline-none focus:ring-2 focus:ring-primary/40 transition-transform duration-200 active:scale-98 cursor-pointer`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                onClick={() => setSelectedAlert(alert)}
              >
                {/* Timeline Dot Icon Box */}
                <div className={`absolute left-0 top-1 w-11 h-11 rounded-xl flex items-center justify-center z-10 shadow-sm transition-all duration-300 group-hover:scale-110 ${alert.is_read ? 'bg-green-500 text-white' : (alert.type === 'scan' ? 'bg-error text-white' : 'bg-primary text-on-primary')}`}>
                  <span className="material-symbols-outlined text-[20px]">{alert.is_read ? 'check_circle' : (alert.type === 'scan' ? 'location_on' : 'vaccines')}</span>
                </div>
                <div className={`premium-card py-4 px-5 rounded-2xl border transition-all duration-200 group-hover:shadow-xl group-active:scale-[0.98] ${!alert.is_read ? 'bg-white border-primary/20' : 'bg-white/60 border-green-200 opacity-90'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="pr-12">
                       <h3 className={`text-[15px] font-semibold transition-colors ${!alert.is_read ? 'text-on-surface' : 'text-green-700'}`}>{alert.title}</h3>
                       <p className="text-[13px] text-on-surface-variant font-normal leading-relaxed mt-1">{alert.message}</p>
                    </div>
                    <span className="absolute top-4 right-5 text-12px font-normal text-on-surface-variant/50 bg-surface-container-low/50 px-2 py-0.5 rounded-full">
                       {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-4 items-center">
                     <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={alert.is_read}
                          onChange={e => {
                            handleToggleRead(alert.id);
                          }}
                          className="accent-green-500 w-4 h-4 rounded-full border-2 border-green-400 focus:ring-green-300 cursor-pointer"
                          id={`read-toggle-list-${alert.id}`}
                        />
                        <label htmlFor={`read-toggle-list-${alert.id}`} className="text-[11px] font-semibold uppercase tracking-[0.06em] text-green-600 select-none cursor-pointer">
                          {alert.is_read ? 'Read' : 'Unread'}
                        </label>
                     </div>
                     <div className="flex items-center gap-1.5 ml-auto text-primary group-hover:translate-x-1 transition-transform">
                        <span className="text-[11px] font-bold uppercase tracking-[0.06em]">View Details</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                     </div>
                  </div>
                </div>
              </button>
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
