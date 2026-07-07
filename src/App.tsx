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
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [phoneEnabled, setPhoneEnabled] = useState(false)
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
      setEmailEnabled(false)
      setPhoneEnabled(false)
    } catch {
      setErrors(['Unable to submit request right now.'])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="card">
        <header className="card-header">
          <h1>Notification Form</h1>
        </header>

        <div className="card-body">
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

          <form onSubmit={handleSubmit} className="form">
            <div className="field-row">
              <label className="field">
                <span className="field-label">First Name</span>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span className="field-label">Last Name</span>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <p className="notify-heading">How would you prefer to be notified?</p>

            <div className="field-row">
              <div className="field">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(event) => {
                      setEmailEnabled(event.target.checked)
                      if (!event.target.checked) {
                        setForm((current) => ({ ...current, email: '' }))
                      }
                    }}
                  />
                  <span>Email</span>
                </label>
                <input
                  name="email"
                  type="email"
                  aria-label="Email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!emailEnabled}
                />
              </div>

              <div className="field">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={phoneEnabled}
                    onChange={(event) => {
                      setPhoneEnabled(event.target.checked)
                      if (!event.target.checked) {
                        setForm((current) => ({ ...current, phoneNumber: '' }))
                      }
                    }}
                  />
                  <span>Phone Number</span>
                </label>
                <input
                  name="phoneNumber"
                  aria-label="Phone Number"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  disabled={!phoneEnabled}
                />
              </div>
            </div>

            <div className="supervisor-field">
              <label className="field">
                <span className="field-label">Supervisor</span>
                <select
                  name="supervisor"
                  value={form.supervisor}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select...</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.label}>
                      {supervisor.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="submit-row">
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'SUBMITTING...' : 'SUBMIT'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default App
