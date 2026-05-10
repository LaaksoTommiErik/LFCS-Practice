import { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await onLogin(email, password)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="container">
      <h1>LFCS Login</h1>
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></label>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </main>
  )
}
