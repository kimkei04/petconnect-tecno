import { Link } from 'react-router-dom'

export default function RoleSelect() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12 selection:bg-primary-container selection:text-primary">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-serif-elegant font-bold text-on-surface mb-10 group">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform duration-300">pets</span>
            <span className="text-gradient">PetConnect</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif-elegant font-bold text-on-surface mb-4 tracking-tight">How are you joining us?</h1>
          <p className="text-lg text-on-surface-variant font-light">Choose your path to get started with our community.</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Pet Owner Card */}
          <Link
            to="/login?role=owner"
            className="premium-card p-8 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-all duration-500 shadow-sm">
              <span className="material-symbols-outlined text-2xl text-primary group-hover:text-on-primary group-hover:rotate-12 transition-all">favorite</span>
            </div>
            <h2 className="text-xl font-serif-elegant font-bold text-on-surface mb-3">Pet Owner</h2>
            <p className="text-xs text-on-surface-variant font-light mb-6 leading-relaxed">Protect your beloved companions with digital profiles and smart alerts.</p>
            <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all uppercase text-[10px] tracking-widest mt-auto">
              <span>Enter Portal</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </div>
          </Link>

          {/* LGU Admin Card */}
          <Link
            to="/login?role=lgu"
            className="premium-card p-8 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-secondary-container rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-500 shadow-sm">
              <span className="material-symbols-outlined text-2xl text-secondary group-hover:text-on-secondary group-hover:-rotate-12 transition-all">admin_panel_settings</span>
            </div>
            <h2 className="text-xl font-serif-elegant font-bold text-on-surface mb-3">LGU Admin</h2>
            <p className="text-xs text-on-surface-variant font-light mb-6 leading-relaxed">Coordinate lost pet listings, vaccination campaigns, and manage neighborhood pet safety.</p>
            <div className="flex items-center gap-2 text-secondary font-semibold group-hover:gap-4 transition-all uppercase text-[10px] tracking-widest mt-auto">
              <span>Admin Login</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="bg-surface-container-low/50 rounded-2xl p-8 border border-surface-container/50 backdrop-blur-sm">
          <h3 className="font-serif-elegant font-bold text-primary mb-6 text-center">Platform Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-base">verified</span>
                For Pet Owners
              </h4>
              <ul className="text-xs text-on-surface-variant space-y-2 font-light">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary/30 rounded-full"></span> Register multiple pets & link NFC tags</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary/30 rounded-full"></span> Instant scan GPS location sharing</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary/30 rounded-full"></span> Self-report vaccinations and pet medical profiles</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-base">verified</span>
                For LGU Staff
              </h4>
              <ul className="text-xs text-on-surface-variant space-y-2 font-light">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary/30 rounded-full"></span> Regional lost & stray pet tracking</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary/30 rounded-full"></span> Coordinate vaccination campaigns</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary/30 rounded-full"></span> Data-driven community rabies prevention</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


