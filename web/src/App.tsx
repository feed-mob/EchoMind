import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

function App() {
  const [message, setMessage] = useState('Loading...')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/hello`)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const text = await response.text()
        setMessage(text)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    fetchMessage()
  }, [])

  return (
    <>
      <div className="card">
        <h1>Hi</h1>
        {error ? <p>Failed to load: {error}</p> : <p>{message}</p>}
      </div>
    </>
  )
}

export default App
