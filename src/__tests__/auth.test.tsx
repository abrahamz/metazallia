import { render, screen } from '@testing-library/react'
import SignIn from '@/app/auth/signin/page'

describe('SignIn Page', () => {
  it('renders sign in form', () => {
    render(<SignIn />)

    expect(screen.getByText('Sign in to your account')).toBeTruthy()
    expect(screen.getByPlaceholderText('Username')).toBeTruthy()
    expect(screen.getByPlaceholderText('Password')).toBeTruthy()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy()
  })

  it('displays app title', () => {
    render(<SignIn />)

    expect(screen.getByText('Pet Medical Records Tracker')).toBeTruthy()
  })
})
