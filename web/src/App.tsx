import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch('/api/hello')
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
