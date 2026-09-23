import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { ApiError } from '../api/http.ts'
import { useAuth } from '../auth/useAuth.ts'
import './Login.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Field = 'email' | 'password'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState<Record<Field, boolean>>({ email: false, password: false })
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const errors: Record<Field, string | null> = {
    email: !email ? 'Email is required.' : !EMAIL_PATTERN.test(email) ? 'Enter a valid email address.' : null,
    password: !password ? 'Password is required.' : null,
  }
  const showError = (field: Field) => touched[field] && errors[field] !== null
  const markTouched = (field: Field) => setTouched((current) => ({ ...current, [field]: true }))

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (errors.email || errors.password) {
      setTouched({ email: true, password: true })
      return
    }

    setSubmitting(true)
    setErrorMessage(null)
    try {
      await login(email, password)
      navigate('/chat')
    } catch (error) {
      setSubmitting(false)
      setErrorMessage(
        error instanceof ApiError && error.status === 401
          ? 'Incorrect email or password.'
          : 'Could not reach the server. Is the backend running?',
      )
    }
  }

  return (
    <div className="login-page">
      <title>Sign in</title>
      <section className="card login-card">
        <header className="login-header">
          <span className="brand-mark brand-mark-lg" aria-hidden="true">
            IC
          </span>
          <h1>Sign in</h1>
          <p className="text-muted">Use any of the seeded accounts listed in the README.</p>
        </header>

        {errorMessage && (
          <div className="alert alert-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="login-form" onSubmit={submit} noValidate>
          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="aarti@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => markTouched('email')}
              aria-invalid={showError('email')}
              aria-describedby="email-error"
            />
            {showError('email') && (
              <p id="email-error" className="field-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => markTouched('password')}
              aria-invalid={showError('password')}
              aria-describedby="password-error"
            />
            {showError('password') && (
              <p id="password-error" className="field-error">
                {errors.password}
              </p>
            )}
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </section>
    </div>
  )
}
