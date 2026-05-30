import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { updateProfile } from '../services/api'
import BottomNav from '../components/BottomNav'

export default function Settings() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    email_alerts: user.email_alerts ?? true,
    sms_alerts: user.sms_alerts ?? false,
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile(formData)
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
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
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-primary-container border border-primary/20 text-primary font-bold text-sm shadow-sm hover:shadow transition-all"
          >
            {user.name?.charAt(0) || 'U'}
          </button>
        </div>
      </header>

      <main className="pt-[112px] px-6 md:px-10 max-w-2xl mx-auto">
        {/* Title */}
        <section className="mb-8 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-container/20 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-[28px] font-semibold text-on-surface tracking-tight leading-tight">
            Account <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-sm text-on-surface-variant font-normal mt-2">Manage your personal information and preferences.</p>
        </section>

        {/* Settings Form */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-primary/5 p-10 border border-surface-container/50 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
          
          {saved && (
            <div className="p-4 bg-tertiary-container/30 border border-tertiary/20 rounded-2xl text-tertiary text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-in zoom-in duration-300">
              <span className="material-symbols-outlined text-lg">verified</span>
              Profile updated successfully
            </div>
          )}

          {/* Profile Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <span className="material-symbols-outlined text-primary">person_edit</span>
               <h2 className="text-lg font-serif-elegant font-bold text-on-surface">Personal Information</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-xl">person</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low/50 border border-surface-container rounded-2xl text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-xl">mail</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low/50 border border-surface-container rounded-2xl text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-xl">call</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low/50 border border-surface-container rounded-2xl text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-4 bg-brown-gradient text-on-primary font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all mt-4"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-8 pt-10 border-t border-surface-container/50">
            <div className="flex items-center gap-3">
               <span className="material-symbols-outlined text-primary">notifications_active</span>
               <h2 className="text-lg font-serif-elegant font-bold text-on-surface">Notification Preferences</h2>
            </div>
            
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-surface-container-low/30 rounded-3xl border border-surface-container/50 group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">mail</span>
                     </div>
                     <div>
                        <p className="font-bold text-on-surface text-sm">Email Alerts</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">Scan reports & reminders</p>
                     </div>
                  </div>
                  <div className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${formData.email_alerts ? 'bg-primary' : 'bg-surface-container'}`} onClick={() => handleChange({target: {name: 'email_alerts', type: 'checkbox', checked: !formData.email_alerts}})}>
                     <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${formData.email_alerts ? 'left-7 bg-white' : 'left-1 bg-on-surface-variant/30'}`} />
                  </div>
               </div>

               <div className="flex items-center justify-between p-6 bg-surface-container-low/30 rounded-3xl border border-surface-container/50 group hover:border-secondary/20 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors">
                        <span className="material-symbols-outlined">sms</span>
                     </div>
                     <div>
                        <p className="font-bold text-on-surface text-sm">SMS Notifications</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">Critical lost pet updates</p>
                     </div>
                  </div>
                  <div className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${formData.sms_alerts ? 'bg-secondary' : 'bg-surface-container'}`} onClick={() => handleChange({target: {name: 'sms_alerts', type: 'checkbox', checked: !formData.sms_alerts}})}>
                     <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${formData.sms_alerts ? 'left-7 bg-white' : 'left-1 bg-on-surface-variant/30'}`} />
                  </div>
               </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-10 border-t border-surface-container/50">
            <h2 className="text-lg font-serif-elegant font-bold text-error mb-6">Danger Zone</h2>
            <button
              onClick={handleLogout}
              className="w-full py-4 border-2 border-error/20 text-error font-bold rounded-2xl hover:bg-error hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign Out from Account
            </button>
          </div>
        </div>
      </main>

      {/* FAB */}
      <Link
        to="/pet/new"
        className="fixed right-6 bottom-[42px] w-[52px] h-[52px] bg-brown-gradient text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-60 group"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>

      <BottomNav />
    </div>
  )
}
