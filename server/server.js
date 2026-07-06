import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const EXTERNAL_SUPERVISORS_URL = 'https://o3m5qixdng.execute-api.us-east-1.amazonaws.com/api/managers'

const isValidName = (value) => /^[A-Za-z]+$/.test(value)
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const isValidPhoneNumber = (value) => /^[+]?[(]?[0-9\s.-]{7,15}$/.test(value)

const normalizeSupervisors = (items) => {
  const filtered = items.filter((item) => {
    const jurisdiction = String(item?.jurisdiction ?? '').trim()
    return jurisdiction !== '' && !/^\d+$/.test(jurisdiction)
  })

  return filtered
    .map((item) => ({
      id: item.id,
      label: `${item.jurisdiction} - ${item.lastName}, ${item.firstName}`,
      value: `${item.jurisdiction} - ${item.lastName}, ${item.firstName}`,
      firstName: item.firstName,
      lastName: item.lastName,
      jurisdiction: item.jurisdiction,
    }))
    .sort((a, b) => {
      if (a.jurisdiction !== b.jurisdiction) {
        return a.jurisdiction.localeCompare(b.jurisdiction)
      }
      if (a.lastName !== b.lastName) {
        return a.lastName.localeCompare(b.lastName)
      }
      return a.firstName.localeCompare(b.firstName)
    })
}

app.get('/api/supervisors', async (_req, res) => {
  try {
    const response = await fetch(EXTERNAL_SUPERVISORS_URL)
    if (!response.ok) {
      throw new Error(`Failed to load supervisors: ${response.status}`)
    }

    const data = await response.json()
    res.json(normalizeSupervisors(data))
  } catch (error) {
    console.error('Error loading supervisors', error)
    res.status(502).json({ message: 'Unable to load supervisors at the moment.' })
  }
})

app.post('/api/submit', (req, res) => {
  const { firstName, lastName, email, phoneNumber, supervisor } = req.body || {}

  const errors = []

  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    errors.push('First name is required.')
  } else if (!isValidName(firstName.trim())) {
    errors.push('First name must only contain letters.')
  }

  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    errors.push('Last name is required.')
  } else if (!isValidName(lastName.trim())) {
    errors.push('Last name must only contain letters.')
  }

  if (!supervisor || typeof supervisor !== 'string' || !supervisor.trim()) {
    errors.push('Supervisor is required.')
  }

  if (email && typeof email === 'string' && email.trim() && !isValidEmail(email.trim())) {
    errors.push('Email must be a valid email address.')
  }

  if (
    phoneNumber &&
    typeof phoneNumber === 'string' &&
    phoneNumber.trim() &&
    !isValidPhoneNumber(phoneNumber.trim())
  ) {
    errors.push('Phone number must be a valid format.')
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed.', errors })
  }

  console.log('New notification request:', {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email?.trim() || undefined,
    phoneNumber: phoneNumber?.trim() || undefined,
    supervisor: supervisor.trim(),
  })

  return res.status(200).json({ message: 'Request submitted successfully.' })
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
