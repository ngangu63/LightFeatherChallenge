import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import './App.css'

type Supervisor = {
  id: string
  label: string
  value: string
}

type FormState = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  supervisor: string
}

const initialFormState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  supervisor: '',
}

function App() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [form, setForm] = useState<FormState>(initialFormState)
  const [errors, setErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadSupervisors = async () => {
      try {
        const response = await fetch('/api/supervisors')
        if (!response.ok) {
          throw new Error('Unable to load supervisors')
        }
        const data = await response.json()
        setSupervisors(data)
      } catch {
        setErrors((prev) => [...prev, 'Unable to load supervisors right now.'])
      }
    }

    void loadSupervisors()
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors([])
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const payload = await response.json()

      if (!response.ok) {
        const validationErrors = payload.errors ?? [payload.message ?? 'Request failed.']
        setErrors(Array.isArray(validationErrors) ? validationErrors : [validationErrors])
        return
      }

      setSuccessMessage(payload.message ?? 'Request submitted successfully.')
      setForm(initialFormState)
    } catch {
      setErrors(['Unable to submit request right now.'])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="card">
        <div className="card-header">
          <h1>Supervisor Notification Request</h1>
          <p className="subtitle">
            Submit your contact information so the selected supervisor can be notified.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="message error" role="alert">
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {successMessage && (
          <div className="message success" role="status">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            First name
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Last name
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Phone number
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
            />
          </label>

          <label>
            Supervisor
            <select name="supervisor" value={form.supervisor} onChange={handleChange} required>
              <option value="">Select a supervisor</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.label}>
                  {supervisor.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit request'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default App
