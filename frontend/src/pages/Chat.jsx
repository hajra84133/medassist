import { useState, useEffect, useRef } from 'react'
import API from '../api'
import Sidebar from '../components/Sidebar'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => { startNewChat() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const startNewChat = async () => {
    try {
      const res = await API.post('/chat/session')
      setSessionId(res.data.session_id)
      setMessages([{ role: 'assistant', content: 'Hello! I am MedAssist, your medical information assistant. I can help you understand symptoms, medications, and general health questions. How can I help you today?\n\n⚠️ Please note: I provide general information only — always consult a doctor for personal medical advice.' }])
    } catch (err) {}
  }

  const loadSession = async (id) => {
    setSessionId(id)
    try {
      const res = await API.get(`/chat/session/${id}/messages`)
      setMessages(res.data)
    } catch (err) {}
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await API.post('/chat/message', { session_id: sessionId, content: input })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <Sidebar currentSession={sessionId} onSelectSession={loadSession} onNewChat={startNewChat} />
      <div style={styles.main}>
        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{ ...styles.msgRow, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && <div style={styles.avatar}>🏥</div>}
              <div style={{ ...styles.bubble, background: m.role === 'user' ? '#2563eb' : 'white', color: m.role === 'user' ? 'white' : '#1a1a2e' }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msgRow, justifyContent: 'flex-start' }}>
              <div style={styles.avatar}>🏥</div>
              <div style={{ ...styles.bubble, background: 'white', color: '#666' }}>Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={sendMessage} style={styles.inputArea}>
          <input style={styles.input} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a health question..." disabled={loading} />
          <button style={styles.sendBtn} type="submit" disabled={loading || !input.trim()}>Send</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', height: '100vh', background: '#f0f4f8' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  messages: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  avatar: { fontSize: '1.5rem', marginBottom: '4px' },
  bubble: { maxWidth: '65%', padding: '0.85rem 1.1rem', borderRadius: '16px', fontSize: '0.95rem', lineHeight: '1.5', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', whiteSpace: 'pre-wrap' },
  inputArea: { display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', background: 'white', borderTop: '1px solid #e2e8f0' },
  input: { flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '1rem', outline: 'none' },
  sendBtn: { padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }
}
