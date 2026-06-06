import { useState, useEffect } from 'react'
import API from '../api'

export default function Sidebar({ currentSession, onSelectSession, onNewChat }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadHistory()
  }, [currentSession])

  const loadHistory = async () => {
    try {
      const res = await API.get('/history/')
      setHistory(res.data)
    } catch (err) {}
  }

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation()
    await API.delete(`/history/${sessionId}`)
    loadHistory()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.logo}>🏥 MedAssist</span>
      </div>
      <button style={styles.newChat} onClick={onNewChat}>+ New Chat</button>
      <div style={styles.historyList}>
        {history.map(s => (
          <div key={s.session_id} style={{ ...styles.historyItem, background: currentSession === s.session_id ? '#e0e7ff' : 'transparent' }} onClick={() => onSelectSession(s.session_id)}>
            <span style={styles.historyTitle}>{s.title}</span>
            <button style={styles.deleteBtn} onClick={e => handleDelete(e, s.session_id)}>✕</button>
          </div>
        ))}
      </div>
      <button style={styles.logout} onClick={handleLogout}>Logout</button>
    </div>
  )
}

const styles = {
  sidebar: { width: '260px', minWidth: '260px', background: '#1e293b', display: 'flex', flexDirection: 'column', height: '100vh' },
  header: { padding: '1.25rem', borderBottom: '1px solid #334155' },
  logo: { color: 'white', fontWeight: '700', fontSize: '1.1rem' },
  newChat: { margin: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.95rem' },
  historyList: { flex: 1, overflowY: 'auto', padding: '0 0.5rem' },
  historyItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.75rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px' },
  historyTitle: { color: '#cbd5e1', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  deleteBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.75rem', padding: '0 0 0 8px' },
  logout: { margin: '1rem', padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontSize: '0.95rem' }
}
