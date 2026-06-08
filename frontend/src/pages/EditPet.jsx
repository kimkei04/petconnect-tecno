import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPet, createPet, updatePet } from '../services/api'
import QRCode from 'react-qr-code'

export default function EditPet() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const markingInputRef = useRef(null)
  
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState(null)
  
  const [form, setForm] = useState({
    name: '', 
    species: 'Dog', 
    breed: '', 
    sex: 'Unknown',
    date_of_birth: '',
    weight: '',
    color: '', 
    microchip_id: '',
    address: '',
    barangay: '',
    hide_phone: 0,
    hide_address: 0,
    hide_medical: 0,
    tag_id: '',
    note: ''
  })
  
  const [petPhoto, setPetPhoto] = useState(null)
  const [petPhotoPreview, setPetPhotoPreview] = useState(null)
  const [markingImages, setMarkingImages] = useState([])
  const [markingImagePreviews, setMarkingImagePreviews] = useState([])
  const [vaccineList, setVaccineList] = useState([])
  const [emergencyContacts, setEmergencyContacts] = useState([])

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/role-select')
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (loggedInUser.role === 'lgu' || loggedInUser.role === 'admin') {
      return navigate('/lgu')
    }
    
    if (!isNew) {
      getPet(id).then(r => {
        const birthDate = r.data.date_of_birth ? new Date(r.data.date_of_birth).toISOString().split('T')[0] : '';
        setForm({
          ...r.data,
          date_of_birth: birthDate
        })
        if (r.data.photo_url) setPetPhotoPreview(r.data.photo_url)
        
        // Map vaccine records from vaccinations table
        if (r.data.vaccinations) {
          const mapped = r.data.vaccinations.map(v => ({
            name: v.vaccine_name,
            date: v.date_given ? new Date(v.date_given).toISOString().split('T')[0] : '',
            next_due: v.next_due_date ? new Date(v.next_due_date).toISOString().split('T')[0] : ''
          }))
          setVaccineList(mapped)
        }

        // Map emergency contacts
        if (r.data.emergencyContacts) {
          setEmergencyContacts(r.data.emergencyContacts)
        }

        // Parse marking images
        try {
          if (r.data.marking_images && r.data.marking_images.startsWith('[')) {
            setMarkingImagePreviews(JSON.parse(r.data.marking_images))
          }
        } catch (e) {
          setMarkingImagePreviews([])
        }
      }).catch((err) => {
        console.error('Failed to load pet details:', err)
        setError('Pet profile not found.')
      }).finally(() => setLoading(false))
    }
  }, [id, isNew, navigate])

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

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { contact_name: '', contact_phone: '', relationship: '', is_primary: 0 }])
  }

  const removeEmergencyContact = (index) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index))
  }

  const handleContactChange = (index, field, value) => {
    const updated = [...emergencyContacts]
    updated[index][field] = value
    setEmergencyContacts(updated)
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? (checked ? 1 : 0) : value
    setForm(prev => ({ ...prev, [name]: val }))
  }

  const compressImage = (file, callback) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 400
        const MAX_HEIGHT = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Start with quality 0.4, reduce further if still too large (max ~500KB base64)
        let quality = 0.4
        let result = canvas.toDataURL('image/jpeg', quality)
        while (result.length > 500000 && quality > 0.1) {
          quality -= 0.1
          result = canvas.toDataURL('image/jpeg', quality)
        }
        callback(result)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handlePetPhotoChange = e => {
    const file = e.target.files[0]
    if (file) {
      setPetPhoto(file)
      compressImage(file, (compressedUrl) => {
        setPetPhotoPreview(compressedUrl)
      })
    }
  }

  const handleMarkingImagesChange = e => {
    const files = Array.from(e.target.files)
    const newImages = [...markingImages]
    const newPreviews = [...markingImagePreviews]

    files.forEach(file => {
      if (newPreviews.length < 4) {
        newImages.push(file)
        compressImage(file, (compressedUrl) => {
          newPreviews.push(compressedUrl)
          setMarkingImagePreviews([...newPreviews])
        })
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
      // Guard: strip photos that are still too large for Vercel's body limit
      let safePhoto = petPhotoPreview
      if (safePhoto && safePhoto.length > 500000) {
        console.warn('Photo too large even after compression, skipping photo upload')
        safePhoto = null
      }
      let safeMarkings = markingImagePreviews.filter(img => !img || img.length <= 500000)

      const payload = {
        ...form,
        photo_url: safePhoto,
        vaccines: vaccineList,
        emergencyContacts: emergencyContacts,
        marking_images: JSON.stringify(safeMarkings)
      }
      
      if (isNew) {
        const petRes = await createPet(payload)
        setSuccessData({
          tagId: petRes.data.tag_id,
          qrUrl: petRes.data.qr_code_url,
          petName: form.name
        })
        setShowSuccess(true)
      } else {
        await updatePet(id, payload)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save pet profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
    </div>
  )

  if (showSuccess && successData) {
    return (
      <div className="min-h-screen bg-surface pb-40 selection:bg-primary-container selection:text-primary font-sans flex flex-col">
        <header className="bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 px-6 h-[72px] flex items-center gap-4 border-b border-surface-container/30 soft-shadow">
          <h1 className="text-[20px] font-semibold text-on-surface tracking-tight leading-none mx-auto">Registration Complete</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-[112px] animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-xl shadow-primary/5 flex flex-col items-center gap-8 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg mb-2">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h2 className="text-3xl font-serif-elegant font-bold tracking-tight text-on-surface">Protected!</h2>
            <p className="text-on-surface-variant">{successData.petName} is now successfully registered.</p>
            
            <div className="w-48 h-48 bg-white border border-surface-container p-4 rounded-3xl shadow-md flex items-center justify-center">
              {successData.qrUrl && <QRCode value={successData.qrUrl} size={160} />}
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Generated Tag ID</p>
              <p className="text-2xl font-bold tracking-[0.1em] text-primary">{successData.tagId}</p>
            </div>
            
            <button onClick={() => navigate('/dashboard')} className="w-full mt-4 py-5 bg-brown-gradient text-on-primary rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pb-40 selection:bg-primary-container selection:text-primary font-sans">
      <header className="bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 px-6 h-[72px] flex items-center gap-4 border-b border-surface-container/30 soft-shadow">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-primary-container text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all shadow-sm">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="text-[20px] font-semibold text-on-surface tracking-tight leading-none">{isNew ? 'Register New Pet' : 'Edit Pet Profile'}</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-6 pt-[112px] space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {error && (
          <div className="p-4 bg-error/5 border border-error/20 rounded-2xl text-error text-xs font-bold uppercase tracking-widest text-center shadow-sm">{error}</div>
        )}

        {/* Display Photo */}
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
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Pet Name</label>
              <input required name="name" value={form.name || ''} onChange={handleChange} placeholder="e.g. Buddy" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Sex</label>
              <select name="sex" value={form.sex || 'Unknown'} onChange={handleChange} className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Species</label>
              <select name="species" value={form.species || 'Dog'} onChange={handleChange} className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none">
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Breed</label>
              <input name="breed" value={form.breed || ''} onChange={handleChange} placeholder="e.g. Beagle" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Note (Personality/Behavior)</label>
            <textarea name="note" value={form.note || ''} onChange={handleChange} rows="3" placeholder="Describe your pet's attitude, behavior, or personality (e.g. friendly, shy, may bite if startled)." className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-medium text-on-surface focus:outline-none resize-none"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Date of Birth</label>
              <input name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={handleChange} className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-xs font-bold text-on-surface focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Weight (KG)</label>
              <input name="weight" type="number" step="0.1" value={form.weight || ''} onChange={handleChange} placeholder="12.5" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Color / Coat</label>
              <input name="color" value={form.color || ''} onChange={handleChange} placeholder="e.g. Brown/White" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Microchip ID (Optional)</label>
              <input name="microchip_id" value={form.microchip_id || ''} onChange={handleChange} placeholder="RFID Chip number" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Barangay</label>
              <input required name="barangay" value={form.barangay || ''} onChange={handleChange} placeholder="e.g. Lahug" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Home Address</label>
              <input name="address" value={form.address || ''} onChange={handleChange} placeholder="Street details" className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none" />
            </div>
          </div>

          {!isNew && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">NFC/QR Tag ID</label>
              <input name="tag_id" value={form.tag_id || ''} disabled className="w-full bg-surface-container-low border border-surface-container rounded-2xl p-5 text-sm font-bold text-on-surface focus:outline-none cursor-not-allowed" />
            </div>
          )}

          {/* Identifying Photos */}
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
          </div>
        </div>

        {/* Emergency Contacts Section */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-xl shadow-primary/5 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">contact_emergency</span>
              <h2 className="text-lg font-serif-elegant font-bold text-on-surface">Emergency Contacts</h2>
            </div>
            
            <div className="space-y-3">
              {emergencyContacts.map((c, i) => (
                <div key={i} className="p-5 bg-surface-container-low/30 border border-surface-container/50 rounded-2xl space-y-4 relative">
                  <button type="button" onClick={() => removeEmergencyContact(i)} className="absolute top-4 right-4 text-on-surface-variant/30 hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Contact Name</label>
                    <input 
                      required
                      value={c.contact_name} 
                      onChange={e => handleContactChange(i, 'contact_name', e.target.value)} 
                      placeholder="e.g. Spouse, Friend, Neighbor" 
                      className="w-full bg-white border border-surface-container rounded-xl p-3 text-xs font-bold outline-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Phone Number</label>
                      <input 
                        required
                        value={c.contact_phone} 
                        onChange={e => handleContactChange(i, 'contact_phone', e.target.value)} 
                        placeholder="e.g. +639xxxxxxxxx" 
                        className="w-full bg-white border border-surface-container rounded-xl p-3 text-xs font-bold outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Relationship</label>
                      <input 
                        value={c.relationship || ''} 
                        onChange={e => handleContactChange(i, 'relationship', e.target.value)} 
                        placeholder="e.g. Co-owner, Neighbor" 
                        className="w-full bg-white border border-surface-container rounded-xl p-3 text-xs font-bold outline-none" 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {emergencyContacts.length < 3 && (
                <button type="button" onClick={addEmergencyContact} className="w-full py-4 bg-surface-container-low text-on-surface-variant rounded-2xl border border-dashed border-surface-container flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all">
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add Contact</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Medical & Vaccines Section (Owner Records) */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-xl shadow-primary/5 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-tertiary"></div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">medical_information</span>
              <h2 className="text-lg font-serif-elegant font-bold text-on-surface">Medical Conditions & Vaccines</h2>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Medical Conditions</label>
              <textarea name="medical_conditions" value={form.medical_conditions || ''} onChange={handleChange} rows={3} placeholder="Allergies, chronic issues, dietary rules..." className="w-full bg-surface-container-low/50 border border-surface-container rounded-2xl p-5 text-sm font-medium text-on-surface focus:outline-none resize-none" />
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
                  <div key={i} className="p-5 bg-surface-container-low/30 border border-surface-container/50 rounded-2xl space-y-4 relative">
                    <button type="button" onClick={() => removeVaccine(i)} className="absolute top-4 right-4 text-on-surface-variant/30 hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Vaccine Name</label>
                      <input 
                        value={v.name} 
                        onChange={e => handleVaccineChange(i, 'name', e.target.value)} 
                        placeholder="e.g. Anti-Rabies" 
                        className="w-full bg-white border border-surface-container rounded-xl p-3 text-sm font-bold outline-none" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Date Given</label>
                          <input 
                            type="date"
                            value={v.date} 
                            onChange={e => handleVaccineChange(i, 'date', e.target.value)} 
                            className="w-full bg-white border border-surface-container rounded-xl p-3 text-xs font-medium outline-none" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Next Due</label>
                          <input 
                            type="date"
                            value={v.next_due} 
                            onChange={e => handleVaccineChange(i, 'next_due', e.target.value)} 
                            className="w-full bg-white border border-surface-container rounded-xl p-3 text-xs font-medium outline-none" 
                          />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-xl shadow-primary/5 space-y-6">
          <h3 className="font-serif-elegant font-bold text-on-surface text-lg">Privacy Preferences</h3>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.1em]">Hide Phone Number from Scan</label>
                <input type="checkbox" name="hide_phone" checked={!!form.hide_phone} onChange={handleChange} className="w-5 h-5 accent-primary" />
             </div>
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.1em]">Hide Address from Scan</label>
                <input type="checkbox" name="hide_address" checked={!!form.hide_address} onChange={handleChange} className="w-5 h-5 accent-primary" />
             </div>
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.1em]">Hide Medical Records from Scan</label>
                <input type="checkbox" name="hide_medical" checked={!!form.hide_medical} onChange={handleChange} className="w-5 h-5 accent-primary" />
             </div>
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
            {saving ? 'Processing...' : (isNew ? 'Register Pet Profile' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  )
}
