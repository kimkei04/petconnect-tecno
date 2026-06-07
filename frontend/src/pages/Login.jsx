import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'owner'
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login({ ...form, role })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      // Redirect based on role
      if (res.data.user.role === 'lgu' || res.data.user.role === 'admin') {
        navigate('/lgu')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 selection:bg-primary-container selection:text-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-serif-elegant font-bold text-on-surface group">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform duration-300">pets</span>
            <span className="text-gradient">PetConnect</span>
          </Link>
          <h1 className="mt-8 text-3xl md:text-4xl font-serif-elegant font-bold text-on-surface tracking-tight">
            {role === 'lgu' ? 'LGU Admin Portal' : 'Welcome back'}
          </h1>
          <p className="mt-3 text-on-surface-variant font-light">
            {role === 'lgu' ? 'Sign in to manage community pet safety' : 'Sign in to access your pet dashboard'}
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-surface-container/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brown-gradient"></div>
          
          {error && (
            <div className="mb-6 p-4 bg-error/5 border border-error/20 rounded-xl text-error text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">mail</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low/50 border border-surface-container rounded-xl text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">Password</label>
                <a href="#" className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low/50 border border-surface-container rounded-xl text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brown-gradient text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : null}
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-surface-container/50 text-center">
            <p className="text-sm text-on-surface-variant font-light">
              Don't have an account?{' '}
              <Link to={`/register?role=${role}`} className="text-primary font-bold hover:underline ml-1">Create one free</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/role-select" className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant/60 hover:text-primary transition-colors uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
            Switch Role
          </Link>
        </div>
      </div>
    </div>
  )
}
