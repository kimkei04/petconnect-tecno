import { useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { register, createPet } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'owner'
  const fileInputRef = useRef(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    barangay: '',
    clinicName: '',
    licenseNumber: '',
    petName: '',
    species: 'Dog',
    breed: '',
    note: '',
    tagId: '',
    qrUrl: '',
    image: null,
    previewUrl: null
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: file, previewUrl: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        return setError('Please fill in all account details.')
      }
    }
    if (step === 2) {
      if (!formData.petName) return setError('Please provide your pet\'s name.')
    }
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setError('')
    
    // Add validations for LGU
    if (role === 'lgu') {
      if (!formData.fullName || !formData.email || !formData.password || !formData.barangay) {
        setLoading(false)
        return setError('Please fill in all LGU details including Barangay.')
      }
    }

    try {
      const authRes = await register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.mobile,
        password: formData.password,
        role: role,
        barangay: formData.barangay || null,
        clinic_name: null,
        license_number: null
      })

      localStorage.setItem('token', authRes.data.token)
      localStorage.setItem('user', JSON.stringify(authRes.data.user))

      if (role === 'lgu') {
        navigate('/lgu')
      } else {
        const petRes = await createPet({
          name: formData.petName,
          species: formData.species,
          breed: formData.breed,
          note: formData.note,
          photo_url: formData.previewUrl
        })
        setFormData(prev => ({ ...prev, tagId: petRes.data.tag_id, qrUrl: petRes.data.qr_code_url }))
        setStep(3) // Move to Link Tag Step to show the generated tag
      }
    } catch (err) {
      console.error('Registration/Pet creation error:', err)
      if (!err.response) {
        setError(`Connection refused. Start the backend with "npm run dev" from the project root.`)
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, label: 'ACCOUNT', icon: 'account_circle' },
    { id: 2, label: 'PET INFO', icon: 'pets' },
    { id: 3, label: 'LINK TAG', icon: 'sensors' },
    { id: 4, label: 'CONFIRM', icon: 'check_circle' }
  ]

  return (
    <div className="min-h-screen bg-surface font-sans antialiased flex flex-col">
      <header className="flex justify-between items-center px-10 py-8 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="material-symbols-outlined text-primary text-2xl group-hover:rotate-12 transition-transform duration-300">pets</span>
          <span className="text-on-surface text-xl font-serif-elegant font-bold tracking-tight text-gradient">PetConnect</span>
        </Link>
        <button onClick={() => navigate('/')} className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] hover:text-primary transition-all">
          Save & Exit
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-40 selection:bg-primary-container selection:text-primary">
        <div className="max-w-md mx-auto w-full">
          {role !== 'lgu' && (
            <div className="flex justify-between items-center mb-16 relative px-2">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-surface-container -translate-y-1/2 z-0"></div>
              {steps.map((s) => (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${step >= s.id ? 'bg-primary text-on-primary' : 'bg-white border border-surface-container text-on-surface-variant/40'}`}>
                    <span className={`material-symbols-outlined text-xl ${step >= s.id ? 'fill-1' : ''}`} style={{ fontVariationSettings: step >= s.id ? "'FILL' 1" : "" }}>{s.icon}</span>
                  </div>
                  <span className={`text-[9px] font-bold tracking-[0.15em] hidden sm:block ${step >= s.id ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-error/5 border border-error/20 rounded-2xl text-error text-[11px] font-bold uppercase tracking-widest text-center animate-in zoom-in duration-300">
              {error}
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            {step === 1 && (
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-4xl font-serif-elegant font-bold text-on-surface tracking-tight">
                    {role === 'lgu' ? 'Create LGU Admin Account' : 'Create your account'}
                  </h1>
                  <p className="text-sm text-on-surface-variant font-light tracking-wide">
                    {role === 'lgu' ? "Start managing your community's pet safety." : 'Start your journey to ultimate pet safety.'}
                  </p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container/50 shadow-xl shadow-primary/5 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} type="text" placeholder="John Doe" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-medium text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="john@example.com" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-medium text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Password</label>
                    <div className="relative">
                      <input name="password" value={formData.password} onChange={handleChange} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-medium text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-2xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-light ml-1">At least 8 characters with one number</p>
                  </div>

                  {role === 'lgu' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Barangay</label>
                      <input name="barangay" value={formData.barangay} onChange={handleChange} type="text" placeholder="e.g. Lahug" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-medium text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10">
                <div className="flex items-center gap-6 text-on-surface-variant/30">
                   <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-sm text-primary">2</div>
                   <h2 className="text-2xl font-serif-elegant font-bold tracking-tight text-on-surface">Tell us about your pet</h2>
                   <div className="flex-1 h-[1px] bg-surface-container"></div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-xl shadow-primary/5 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Pet's Name</label>
                    <input name="petName" value={formData.petName} onChange={handleChange} type="text" placeholder="e.g. Buddy" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-medium text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Species</label>
                      <select name="species" value={formData.species} onChange={handleChange} className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-medium text-on-surface appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all">
                        <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Breed</label>
                      <input name="breed" value={formData.breed} onChange={handleChange} type="text" placeholder="e.g. Beagle" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-medium text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Note (Personality/Behavior)</label>
                    <textarea name="note" value={formData.note} onChange={handleChange} rows="3" placeholder="Describe your pet's attitude, behavior, or personality (e.g. friendly, shy, may bite if startled)." className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-medium text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"></textarea>
                  </div>
                  
                  {/* REAL PHOTO UPLOAD */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group ${formData.previewUrl ? 'border-primary bg-primary-container/30' : 'border-surface-container bg-surface-container-low/30 hover:border-primary/30'}`}
                  >
                    {formData.previewUrl ? (
                      <div className="relative">
                        <img src={formData.previewUrl} className="w-32 h-32 rounded-3xl object-cover animate-in zoom-in duration-500 shadow-lg" alt="Preview" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                      </div>
                    )}
                    <div className="text-center mt-2">
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-1">
                        {formData.previewUrl ? 'Photo Captured' : 'Upload Pet Photo'}
                      </p>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em] opacity-60">
                        {formData.previewUrl ? 'Click to change' : 'JPEG or PNG format'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10">
                <div className="flex items-center gap-6 text-on-surface-variant/30">
                   <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-sm text-primary">3</div>
                   <h2 className="text-2xl font-serif-elegant font-bold tracking-tight text-on-surface">Link NFC Tag</h2>
                   <div className="flex-1 h-[1px] bg-surface-container"></div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-12 border border-surface-container shadow-xl shadow-primary/5 flex flex-col items-center gap-10">
                  <div className="w-48 h-48 bg-white border border-surface-container p-4 rounded-3xl shadow-md flex items-center justify-center">
                    {formData.qrUrl && (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(formData.qrUrl)}`} 
                        alt="QR Code" 
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  
                  <div className="w-full space-y-6">
                    <div className="space-y-3 text-center">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Generated Tag ID</label>
                      <p className="text-2xl font-bold tracking-[0.1em] text-primary">{formData.tagId}</p>
                    </div>
                    <div className="space-y-3 text-center">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">QR Code URL</label>
                      <p className="text-xs font-medium text-on-surface-variant break-all bg-surface-container-low/50 rounded-2xl p-4">{formData.qrUrl}</p>
                    </div>
                    <div className="bg-primary-container/30 rounded-2xl p-5 flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary text-2xl mt-0.5">info</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        This unique QR code and Tag ID have been automatically generated for <strong>{formData.petName}</strong>. 
                        Write this Tag ID on your pet's NFC tag, or scan the QR code to access your pet's public profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-10">
                <div className="flex items-center gap-6 text-on-surface-variant/30">
                   <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-sm text-primary">4</div>
                   <h2 className="text-2xl font-serif-elegant font-bold tracking-tight text-on-surface">Confirmation</h2>
                   <div className="flex-1 h-[1px] bg-surface-container"></div>
                </div>

                <div className="bg-primary-container/30 rounded-[3rem] p-12 border border-primary/10 flex flex-col items-center text-center gap-10 shadow-xl shadow-primary/5">
                  <div className="w-24 h-24 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                    <span className="material-symbols-outlined text-5xl">check</span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-serif-elegant font-bold text-on-surface tracking-tight">Protected!</h2>
                    <p className="text-base text-on-surface-variant font-light leading-relaxed">Everything is set up. Your pet is now part of the PetConnect community.</p>
                  </div>

                  <div className="w-full bg-white rounded-3xl p-6 flex items-center justify-between border border-surface-container/50 shadow-sm">
                    <div className="flex items-center gap-5">
                      <img src={formData.previewUrl || 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=120'} className="w-16 h-16 rounded-2xl object-cover shadow-md" alt="" />
                      <div className="text-left">
                        <p className="text-lg font-serif-elegant font-bold text-on-surface leading-tight">{formData.petName || 'Buddy'}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{formData.breed || 'Companion'}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-tertiary-container rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary text-2xl">verified</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-surface/80 backdrop-blur-xl border-t border-surface-container/50 p-8 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center px-4">
          <button 
            onClick={step === 4 ? () => {} : (step === 3 ? () => {} : (role === 'lgu' ? () => navigate(`/login?role=${role}`) : prevStep))} 
            className={`flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${(step === 1 && role !== 'lgu') || step >= 3 ? 'opacity-0 pointer-events-none' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span> Back
          </button>
          <button 
            onClick={
              step === 4 ? () => navigate('/dashboard') :
              step === 3 ? () => setStep(4) :
              role === 'lgu' ? handleFinalSubmit :
              step === 2 ? handleFinalSubmit :
              nextStep
            }
            disabled={loading}
            className="px-12 py-5 bg-brown-gradient text-on-primary rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 group"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : 
              step === 4 ? 'Go to Dashboard' :
              step === 3 ? 'Continue' :
              (role === 'lgu' || step === 2) ? 'Complete Registration' : 'Next Step'}
            {!loading && <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>}
          </button>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
        .text-gradient { background: linear-gradient(to right, var(--color-primary), var(--color-primary-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}} />
    </div>
  )
}
