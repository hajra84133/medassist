import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('username', email)
      form.append('password', password)
      const res = await API.post('/auth/register', form)
      localStorage.setItem('token', res.data.access_token)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🏥</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join MedAssist today</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={styles.link}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  card: { background: 'white', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  logo: { fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem' },
  title: { textAlign: 'center', fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.25rem' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem', outline: 'none' },
  button: { padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  link: { textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }
}
