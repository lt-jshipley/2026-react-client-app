import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { axe } from 'vitest-axe'
import { ProfileForm } from './ProfileForm'

describe('ProfileForm', () => {
  const mockOnSubmit = vi.fn<(data: unknown) => Promise<void>>()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('renders all form fields', () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument()
  })

  it('pre-populates from defaultValues', () => {
    render(
      <ProfileForm
        onSubmit={mockOnSubmit}
        defaultValues={{ name: 'Jane Doe', email: 'jane@example.com' }}
      />
    )

    expect(screen.getByLabelText(/name/i)).toHaveValue('Jane Doe')
    expect(screen.getByLabelText(/email/i)).toHaveValue('jane@example.com')
  })

  it('shows validation errors for empty fields', async () => {
    const { user } = render(<ProfileForm onSubmit={mockOnSubmit} />)

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const { user } = render(<ProfileForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'jane@example.com',
        }),
        expect.anything()
      )
    })
  })

  it('shows loading state', () => {
    render(<ProfileForm onSubmit={mockOnSubmit} isLoading />)

    const button = screen.getByRole('button', { name: /saving/i })
    expect(button).toBeDisabled()
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<ProfileForm onSubmit={mockOnSubmit} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
