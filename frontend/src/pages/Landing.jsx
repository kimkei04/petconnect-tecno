import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import petHero from '../assets/pet-hero.png'
import { useEffect } from 'react'

const features = [
  { icon: 'warning',          title: 'Outdated Information',  desc: 'Phone numbers change. Digital profiles update in seconds.' },
  { icon: 'distance',         title: 'Lost Without a Trace',  desc: '1 in 3 pets will go missing in their lifetime.' },
  { icon: 'medical_services', title: 'Hidden Medical Needs',  desc: 'Rescuers need to know about allergies immediately.' },
  { icon: 'search_off',       title: 'The Microchip Barrier', desc: 'PetConnect tags are an obvious signal your pet has a digital home.' },
]

const steps = [
  { icon: 'app_registration', title: 'Register', desc: 'Create a free profile with photos, health info & contacts.' },
  { icon: 'link',             title: 'Attach',   desc: 'Hook the PetConnect tag to any collar or harness.' },
  { icon: 'qr_code_scanner',  title: 'Scan',     desc: 'Anyone with a smartphone can scan — no app required.' },
  { icon: 'sync',             title: 'Update',   desc: 'Change your info or status instantly from your phone.' },
]

const engineered = [
  { icon: 'location_on',   title: 'GPS Coordinates',  desc: "Receive a precise GPS pin of where your pet's tag was scanned." },
  { icon: 'verified_user', title: 'Privacy Shield',   desc: 'Hide your personal number and use our relay messaging.' },
  { icon: 'cloud_done',    title: 'Unlimited Profiles', desc: 'Manage your entire pack from one dashboard.' },
  { icon: 'water_drop',    title: 'Adventure-Proof',  desc: '100% waterproof and scratch-resistant.' },
]

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}') || {}
    if (token && user.role) {
      if (user.role === 'lgu' || user.role === 'admin') {
        navigate('/lgu')
      } else {
        navigate('/dashboard')
      }
    }
  }, [navigate])

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans selection:bg-primary-container selection:text-primary">
      <Navbar />

      {/* Hero */}
      <main className="pt-20">
        <section className="relative overflow-hidden px-6 py-16 md:py-24 lg:py-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 order-2 lg:order-1">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-semibold tracking-wider uppercase mb-6">
                🐾 Smart Pet Safety
              </span>
              <h1 className="text-5xl md:text-7xl font-serif-elegant font-bold text-on-surface leading-tight tracking-tight mb-6">
                Smart ID for <br />
                <span className="text-gradient">Every Pet</span>
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant mb-10 font-light leading-relaxed">
                Tap. Scan. Reunite. Protecting your beloved companion with an instantly accessible digital profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/role-select" className="px-8 py-4 bg-primary text-on-primary rounded-default font-semibold text-lg shadow-lg hover:bg-primary-light active:scale-98 transition-all text-center">
                  Register Your Pet
                </Link>
                <a href="#how" className="px-8 py-4 border border-outline/30 text-primary rounded-default font-semibold text-lg hover:bg-primary/5 active:scale-98 transition-all text-center">
                  Learn How It Works
                </a>
              </div>
            </div>
            <div className="relative order-1 lg:order-2 flex justify-center">
              <div className="absolute inset-0 bg-primary-container/30 rounded-full blur-3xl -z-10 w-72 h-72 md:w-96 md:h-96 mx-auto my-auto" />
              <div className="rounded-2xl overflow-hidden shadow-xl transform rotate-1 bg-surface-container-low max-w-[450px] w-full border border-surface-container">
                <img src={petHero} alt="Happy dog with PetConnect tag" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-5 rounded-xl shadow-lg border border-surface-container max-w-[220px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">Instant Scan Alert</p>
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">Get the exact GPS location the moment your pet's tag is scanned.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why PetConnect */}
        <section className="bg-surface-container-low py-24 px-6 border-y border-surface-container/30">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center lg:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">Why Choose PetConnect</span>
              <h2 className="text-4xl font-serif-elegant font-bold text-on-surface">Designed for Complete Peace of Mind</h2>
              <p className="text-on-surface-variant mt-3 max-w-2xl text-lg font-light">Standard tags wear out. Microchips require expensive scanners. We bridge the gap with elegant, digital connectivity.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map(f => (
                <div key={f.title} className="premium-card p-8 bg-white border border-surface-container/50 shadow-sm flex flex-col items-start">
                  <div className="p-3 bg-primary-container rounded-lg text-primary mb-5">
                    <span className="material-symbols-outlined text-3xl block">{f.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-on-surface mb-2">{f.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">Simple & Effective</span>
            <h2 className="text-4xl font-serif-elegant font-bold text-on-surface mb-4">How It Works</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {steps.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-6 shadow-md relative group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-secondary text-on-secondary text-xs font-bold rounded-full flex items-center justify-center shadow-sm">{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-on-surface mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-[200px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Engineered for Safety */}
        <section className="bg-surface-container-low py-24 px-6 border-t border-surface-container/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">Built Tough</span>
              <h2 className="text-4xl font-serif-elegant font-bold text-on-surface">Engineered for Safety</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {engineered.map(e => (
                <div key={e.title} className="bg-white p-8 rounded-2xl border border-surface-container flex gap-6 items-start shadow-sm">
                  <div className="bg-tertiary-container p-3 rounded-xl text-tertiary shrink-0">
                    <span className="material-symbols-outlined text-3xl block">{e.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface mb-1.5">{e.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LGU Admin Section */}
        <section className="py-24 px-6 bg-primary-container/20 border-t border-surface-container/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">For Local Government Units</span>
                <h2 className="text-4xl md:text-5xl font-serif-elegant font-bold text-on-surface mb-6 leading-tight">
                  Reunite Lost Pets in <br />Your Community
                </h2>
                <p className="text-lg text-on-surface-variant mb-8 leading-relaxed font-light">
                  PetConnect empowers LGU administrative staff to coordinate lost pet listings, register neighborhood tags, and directly communicate with rescuers to bring beloved animals home safely.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary mt-0.5">check_circle</span>
                    <div>
                      <h4 className="font-semibold text-on-surface text-sm">Central Database</h4>
                      <p className="text-on-surface-variant text-xs mt-0.5">Access lost pets in your jurisdiction instantly.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary mt-0.5">check_circle</span>
                    <div>
                      <h4 className="font-semibold text-on-surface text-sm">Community Alerts</h4>
                      <p className="text-on-surface-variant text-xs mt-0.5">Automated geo-matching of scanned pets.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary mt-0.5">check_circle</span>
                    <div>
                      <h4 className="font-semibold text-on-surface text-sm">Adoption Platform</h4>
                      <p className="text-on-surface-variant text-xs mt-0.5">Highlight stray animals needing warm homes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary mt-0.5">check_circle</span>
                    <div>
                      <h4 className="font-semibold text-on-surface text-sm">Community Analytics</h4>
                      <p className="text-on-surface-variant text-xs mt-0.5">Smart data insights on regional pet welfare.</p>
                    </div>
                  </div>
                </div>
                <Link to="/login?role=lgu" className="inline-block px-8 py-4 bg-primary text-on-primary rounded-default font-semibold shadow-md hover:bg-primary-light active:scale-98 transition-all">
                  LGU Admin Portal
                </Link>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="w-full max-w-[400px] aspect-square bg-white rounded-3xl flex flex-col items-center justify-center border border-surface-container shadow-xl p-8 relative">
                  <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-primary-container animate-ping" />
                  <span className="material-symbols-outlined text-8xl text-primary mb-4">admin_panel_settings</span>
                  <h4 className="font-serif-elegant font-bold text-xl text-on-surface text-center">LGU Dashboard</h4>
                  <p className="text-on-surface-variant text-sm text-center mt-2 px-6">Empowering administrators with Lahug's neighborhood database & statistics.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-28 px-6 bg-brown-gradient text-on-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,154,108,0.25),transparent_50%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <blockquote className="text-3xl md:text-5xl font-serif-elegant font-bold text-white leading-tight mb-8">
              "No pet should go unidentified. Give them a digital voice."
            </blockquote>
            <p className="text-on-primary/80 text-lg max-w-xl mx-auto font-light leading-relaxed mb-10">
              Join thousands of pet parents who have upgraded to high-security, smart PetConnect profiles.
            </p>
            <Link to="/register" className="inline-block px-10 py-4.5 bg-secondary text-on-secondary rounded-xl font-semibold text-lg shadow-lg hover:bg-secondary/90 hover:shadow-xl active:scale-98 transition-all">
              Secure Your Pet Today
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1e130c] text-on-primary pt-20 pb-10 px-6 border-t border-surface-container/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="text-2xl font-serif-elegant font-bold flex items-center gap-2 mb-6 text-secondary">
              <span className="material-symbols-outlined text-secondary">pets</span>
              <span>PetConnect</span>
            </div>
            <p className="text-on-primary/60 text-sm leading-relaxed font-light">
              The sanctuary for digital pet safety. We build elegant tools to ensure every lost companion finds their way back home.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-6">Product</h4>
            <ul className="space-y-4 text-on-primary/70 text-sm font-light">
              <li><a href="#" className="hover:text-secondary transition-colors">Smart Tags</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Mobile App</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Subscription Plans</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-6">Support</h4>
            <ul className="space-y-4 text-on-primary/70 text-sm font-light">
              <li><a href="#" className="hover:text-secondary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Contact Us</a></li>
              <li><Link to="/login" className="hover:text-secondary transition-colors">LGU Staff Portal</Link></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-6">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors">
                <span className="material-symbols-outlined text-sm">share</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors">
                <span className="material-symbols-outlined text-sm">group</span>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 text-center text-on-primary/40 text-xs font-light">
          <p>© 2026 PetConnect. All rights reserved. Made for Lahug, Cebu City.</p>
        </div>
      </footer>
    </div>
  )
}
