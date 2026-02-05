import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { axe } from 'vitest-axe'
import { EditUserForm } from './EditUserForm'

describe('EditUserForm', () => {
  const mockOnSubmit = vi.fn<(data: unknown) => Promise<void>>()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('renders all form fields', () => {
    render(<EditUserForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/role/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /edit user/i })
    ).toBeInTheDocument()
  })

  it('does not render a password field', () => {
    render(<EditUserForm onSubmit={mockOnSubmit} />)

    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument()
  })

  it('pre-populates from defaultValues', () => {
    render(
      <EditUserForm
        onSubmit={mockOnSubmit}
        defaultValues={{
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'admin',
        }}
      />
    )

    expect(screen.getByLabelText(/^name$/i)).toHaveValue('Jane Doe')
    expect(screen.getByLabelText(/email/i)).toHaveValue('jane@example.com')
  })

  it('submits form with valid data', async () => {
    const { user } = render(
      <EditUserForm
        onSubmit={mockOnSubmit}
        defaultValues={{
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'user',
        }}
      />
    )

    await user.clear(screen.getByLabelText(/^name$/i))
    await user.type(screen.getByLabelText(/^name$/i), 'John Smith')
    await user.click(screen.getByRole('button', { name: /edit user/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Smith',
          email: 'jane@example.com',
        }),
        expect.anything()
      )
    })
  })

  it('shows loading state', () => {
    render(<EditUserForm onSubmit={mockOnSubmit} isLoading />)

    const button = screen.getByRole('button', { name: /saving/i })
    expect(button).toBeDisabled()
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<EditUserForm onSubmit={mockOnSubmit} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
