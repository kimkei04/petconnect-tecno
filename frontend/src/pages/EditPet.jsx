import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPet, createPet, updatePet } from '../services/api'

export default function EditPet() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const markingInputRef = useRef(null)
  
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', species: 'Dog', breed: '', age: '', weight: '',
    color: '', medical_conditions: '', vaccines: '', hide_phone: false, address: '',
  })
  
  const [petPhoto, setPetPhoto] = useState(null)
  const [petPhotoPreview, setPetPhotoPreview] = useState(null)
  const [markingImages, setMarkingImages] = useState([])
  const [markingImagePreviews, setMarkingImagePreviews] = useState([])

  const [vaccineList, setVaccineList] = useState([])

  useEffect(() => {
    if (!isNew) {
      getPet(id).then(r => {
        setForm(r.data)
        if (r.data.photo_url) setPetPhotoPreview(r.data.photo_url)
        
        // Parse vaccines if structured
        try {
          if (r.data.vaccines && r.data.vaccines.startsWith('[')) {
            setVaccineList(JSON.parse(r.data.vaccines))
          } else if (r.data.vaccines) {
            setVaccineList([{ name: 'General', date: r.data.vaccines, next_due: '—' }])
          }
        } catch (e) {
          setVaccineList([])
        }

        // Parse marking images
        try {
          if (r.data.marking_images && r.data.marking_images.startsWith('[')) {
            setMarkingImagePreviews(JSON.parse(r.data.marking_images))
          }
        } catch (e) {
          setMarkingImagePreviews([])
        }
      }).catch(() => {
        // Fallback mockup
        const mock = { id: '1', name: 'Buddy', breed: 'Golden Retriever', species: 'Dog', age: 3, weight: 28, color: 'Golden', photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400' }
        if (id === '1') {
          setForm(mock)
          setPetPhotoPreview(mock.photo_url)
          setVaccineList([
            { name: 'Rabies', date: '2024-05-15', next_due: '2025-05-15' },
            { name: 'Parvovirus', date: '2024-02-10', next_due: '2025-02-10' }
          ])
        }
      }).finally(() => setLoading(false))
    }
  }, [id, isNew])

  const addVaccine = () => {
    setVaccineList([...vaccineList, { name: '', date: '', next_due: '' }])
  }

  const removeVaccine = (index) => {
    setVaccineList(vaccineList.filter((_, i) => i !== index))
  }

  const handleVaccineChange = (index, field, value) => {
    const updated = [...vaccineList]
    updated[index][field] = value
    setVaccineList(updated)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePetPhotoChange = e => {
    const file = e.target.files[0]
    if (file) {
      setPetPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setPetPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleMarkingImagesChange = e => {
    const files = Array.from(e.target.files)
    const newImages = [...markingImages]
    const newPreviews = [...markingImagePreviews]

    files.forEach(file => {
      if (newPreviews.length < 4) {
        newImages.push(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result)
          setMarkingImagePreviews([...newPreviews])
        }
        reader.readAsDataURL(file)
      }
    })
    setMarkingImages(newImages)
  }

  const removeMarkingImage = (index) => {
    setMarkingImages(markingImages.filter((_, i) => i !== index))
    setMarkingImagePreviews(markingImagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        photo_url: petPhotoPreview,
        vaccines: JSON.stringify(vaccineList),
        marking_images: JSON.stringify(markingImagePreviews)
      }
      
      if (isNew) await createPet(payload)
      else await updatePet(id, payload)
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to save pet profile. Redirecting...')
      setTimeout(() => navigate('/dashboard'), 1500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface pb-40 selection:bg-primary-container selection:text-primary">
      <header className="bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 px-6 h-[72px] flex items-center gap-4 border-b border-surface-container/30 soft-shadow">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-primary-container text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all shadow-sm">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="text-[20px] font-semibold text-on-surface tracking-tight leading-none">{isNew ? 'New Pet Profile' : 'Edit Profile'}</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-6 pt-[112px] space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {error && (
          <div className="p-4 bg-error/5 border border-error/20 rounded-2xl text-error text-[10px] font-bold uppercase tracking-widest text-center shadow-sm">{error}</div>
        )}

        {/* Primary Photo Section */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-2">Display Profile Photo</label>
          <div className="relative group">
            {petPhotoPreview ? (
              <div className="relative overflow-hidden rounded-[3rem] shadow-2xl border-4 border-white aspect-[4/3]">
                <img src={petPhotoPreview} alt="Pet" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button
                    type="button"
                    onClick={() => { setPetPhoto(null); setPetPhotoPreview(null) }}
                    className="bg-white text-error w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-2xl">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-[4/3] bg-white border-2 border-dashed border-surface-container rounded-[3rem] cursor-pointer hover:bg-surface-container-low hover:border-primary/30 transition-all shadow-sm group">
                <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                </div>
                <p className="text-sm font-serif-elegant font-bold text-on-surface">Click to upload photo</p>
                <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-2">JPG, PNG or WEBP</p>
                <input type="file" accept="image/*" onChange={handlePetPhotoChange} className="hidden" />
              </label>
            )}
          </div>
        </section>

        {/* Identity Details */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-xl shadow-primary/5 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Pet Name</label>
            <input name="name" value={form.name || ''} onChange={handleChange} placeholder="e.g. Buddy" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Age (Years)</label>
              <input name="age" type="number" value={form.age || ''} onChange={handleChange} placeholder="3" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Weight (KG)</label>
              <input name="weight" type="number" value={form.weight || ''} onChange={handleChange} placeholder="12" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Color / Fur Markings</label>
            <input name="color" value={form.color || ''} onChange={handleChange} placeholder="Describe unique features" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-base font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
          </div>

          {/* Identification Photos */}
          <div className="space-y-5 pt-6 border-t border-surface-container/50">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">IDENTIFYING PHOTOS</label>
              <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{markingImagePreviews.length}/4 ATTACHED</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {markingImagePreviews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-surface-container/30 group">
                  <img src={url} alt="Marking" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeMarkingImage(i)}
                    className="absolute inset-0 bg-error/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-white text-lg">close</span>
                  </button>
                </div>
              ))}
              
              {markingImagePreviews.length < 4 && (
                <button 
                  type="button"
                  onClick={() => markingInputRef.current?.click()}
                  className="aspect-square bg-surface-container-low/50 border-2 border-dashed border-surface-container rounded-2xl flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all group"
                >
                  <span className="material-symbols-outlined text-primary group-hover:scale-125 transition-transform duration-500">add_circle</span>
                </button>
              )}
            </div>
            <input type="file" multiple accept="image/*" className="hidden" ref={markingInputRef} onChange={handleMarkingImagesChange} />
            <p className="text-[9px] text-on-surface-variant/60 font-medium leading-relaxed uppercase tracking-widest">Unique marks, scars, or patterns help LGU staff confirm identity.</p>
          </div>
        </div>

        {/* Medical Section */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-xl shadow-primary/5 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-tertiary"></div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">medical_information</span>
              <h2 className="text-lg font-serif-elegant font-bold text-on-surface">Medical & Health</h2>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Medical Conditions</label>
              <textarea name="medical_conditions" value={form.medical_conditions || ''} onChange={handleChange} rows={3} placeholder="Allergies, chronic issues, etc." className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-medium text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none" />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Vaccine History</label>
                <button type="button" onClick={addVaccine} className="bg-tertiary text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-sm shadow-tertiary/20">
                  <span className="material-symbols-outlined text-sm">add</span> Add Record
                </button>
              </div>

              <div className="space-y-3">
                {vaccineList.map((v, i) => (
                  <div key={i} className="p-5 bg-surface-container-low/30 border border-surface-container/50 rounded-2xl space-y-4 relative group">
                    <button type="button" onClick={() => removeVaccine(i)} className="absolute top-4 right-4 text-on-surface-variant/30 hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Vaccine Name</label>
                      <input 
                        value={v.name} 
                        onChange={e => handleVaccineChange(i, 'name', e.target.value)} 
                        placeholder="e.g. Rabies" 
                        className="w-full bg-white border border-surface-container rounded-xl p-3 text-sm font-bold outline-none focus:border-tertiary/50" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Date Given</label>
                          <input 
                            type="date"
                            value={v.date} 
                            onChange={e => handleVaccineChange(i, 'date', e.target.value)} 
                            className="w-full bg-white border border-surface-container rounded-xl p-3 text-xs font-medium outline-none focus:border-tertiary/50" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Next Due</label>
                          <input 
                            type="date"
                            value={v.next_due} 
                            onChange={e => handleVaccineChange(i, 'next_due', e.target.value)} 
                            className="w-full bg-white border border-surface-container rounded-xl p-3 text-xs font-medium outline-none focus:border-tertiary/50" 
                          />
                       </div>
                    </div>
                  </div>
                ))}
                {vaccineList.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-surface-container rounded-2xl opacity-40">
                    <span className="material-symbols-outlined text-4xl mb-2">vaccines</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest">No vaccines recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t border-surface-container/50">
             <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Contact Visibility</label>
                <div className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.hide_phone ? 'bg-error/30' : 'bg-tertiary-container'}`} onClick={() => setForm(f => ({...f, hide_phone: !f.hide_phone}))}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${form.hide_phone ? 'left-7 bg-error' : 'left-1 bg-tertiary'}`} />
                </div>
             </div>
             <p className="text-[10px] text-on-surface-variant font-light italic">{form.hide_phone ? 'Your phone number will be hidden from public scans.' : 'Your phone number will be visible to anyone who scans the tag.'}</p>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-brown-gradient text-on-primary font-bold text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">verified</span>}
            {saving ? 'Processing...' : (isNew ? 'Register Pet' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  )
}
