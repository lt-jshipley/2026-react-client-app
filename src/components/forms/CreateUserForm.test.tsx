import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { axe } from 'vitest-axe'
import { CreateUserForm } from './CreateUserForm'

describe('CreateUserForm', () => {
  const mockOnSubmit = vi.fn<(data: unknown) => Promise<void>>()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('renders all form fields', () => {
    render(<CreateUserForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByText(/role/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create user/i })
    ).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const { user } = render(<CreateUserForm onSubmit={mockOnSubmit} />)

    // Clear the name field (it starts empty, but we need to trigger validation)
    await user.click(screen.getByRole('button', { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const { user } = render(<CreateUserForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText(/^name$/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create user/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'user',
        }),
        expect.anything()
      )
    })
  })

  it('shows loading state', () => {
    render(<CreateUserForm onSubmit={mockOnSubmit} isLoading />)

    const button = screen.getByRole('button', { name: /creating/i })
    expect(button).toBeDisabled()
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<CreateUserForm onSubmit={mockOnSubmit} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
