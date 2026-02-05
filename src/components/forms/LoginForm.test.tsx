import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { axe } from 'vitest-axe'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn<(data: unknown) => Promise<void>>()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('renders all form fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: /remember me/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const { user } = render(<LoginForm onSubmit={mockOnSubmit} />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const { user } = render(<LoginForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        }),
        expect.anything()
      )
    })
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<LoginForm onSubmit={mockOnSubmit} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
