import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { setRememberSession, supabase } from '../lib/supabase'
import './Auth.css'

function Auth() {
  const location = useLocation()
  const isRegister = location.pathname === '/register'
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState(location.state?.message ?? '')
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isRecovery, setIsRecovery] = useState(
    new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
  )

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (!isRecovery && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      setErrorMessage('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }
    if (isRegister && !name) {
      setErrorMessage('Enter your full name.')
      return
    }
    if ((isRegister || isRecovery) && password !== confirmPassword) {
      setErrorMessage('The passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isRecovery) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setIsRecovery(false)
        navigate('/login', {
          state: { message: 'Your password has been updated. Please log in.' }
        })
      } else if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        })
        if (error) throw error

        if (data.session) {
          navigate('/')
        } else {
          navigate('/login', {
            state: { message: 'Account created. Check your email to confirm your account, then log in.' }
          })
        }
      } else {
        setRememberSession(rememberMe)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate(location.state?.from ?? '/')
      }
    } catch (error) {
      setErrorMessage(error.message || 'We could not complete your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Enter a valid email address to receive a reset link.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      })
      if (error) throw error
      setSuccessMessage('If an account exists for that email, a password reset link is on its way.')
      setIsResettingPassword(false)
    } catch (error) {
      setErrorMessage(error.message || 'We could not send the reset link. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">{isRegister ? 'Join our artisan community' : 'Welcome back'}</p>
        <h1>{isRecovery ? 'Choose a new password' : isResettingPassword ? 'Reset your password' : isRegister ? 'Create an account' : 'Login to CraftVerse'}</h1>
        <p className="auth-intro">
          {isRecovery
            ? 'Choose a new password for your CraftVerse account.'
            : isResettingPassword
            ? 'Enter your email and we’ll send you a password reset link.'
            : isRegister
              ? 'Save your favourite handmade finds and stay close to the makers.'
              : 'Sign in to continue exploring thoughtful, handmade pieces.'}
        </p>

        <form className="auth-form" onSubmit={isResettingPassword ? handlePasswordReset : handleSubmit} noValidate>
          {isRegister && !isResettingPassword && (
            <label>
              Full Name
              <input name="name" type="text" autoComplete="name" required />
            </label>
          )}
          {!isRecovery && (
            <label>
              Email
              <input name="email" type="email" autoComplete="email" defaultValue={location.state?.email ?? ''} required />
            </label>
          )}
          {!isResettingPassword && (
            <>
              <label>
                {isRecovery ? 'New Password' : 'Password'}
                <span className="password-input">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegister || isRecovery ? 'new-password' : 'current-password'}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </span>
              </label>
              {(isRegister || isRecovery) && (
                <label>
                  Confirm Password
                  <input name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required />
                </label>
              )}
            </>
          )}

          {!isRegister && !isResettingPassword && !isRecovery && (
            <div className="auth-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={event => setRememberMe(event.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className="auth-text-button" onClick={() => setIsResettingPassword(true)}>
                Forgot Password?
              </button>
            </div>
          )}

          {errorMessage && <p className="auth-message auth-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="auth-message auth-success" role="status">{successMessage}</p>}

          <button className="button button-dark auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait...'
              : isResettingPassword
                ? 'Send reset link'
                : isRecovery
                  ? 'Update password'
                : isRegister
                  ? 'Register'
                  : 'Login'}
            {!isSubmitting && <span aria-hidden="true">↗</span>}
          </button>
        </form>

        <p className="auth-switch">
          {isResettingPassword || isRecovery ? (
            <button type="button" className="auth-text-button" onClick={() => setIsResettingPassword(false)}>
              Back to Login
            </button>
          ) : isRegister ? (
            <>Already have an account? <Link to="/login">Login</Link></>
          ) : (
            <>Don&apos;t have an account? <Link to="/register">Create Account</Link></>
          )}
        </p>
      </section>
    </main>
  )
}

export default Auth
