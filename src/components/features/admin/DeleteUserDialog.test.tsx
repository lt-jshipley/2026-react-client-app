import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { DeleteUserDialog } from './DeleteUserDialog'
import type { User } from '@/types'

const mockUser: User = {
  id: '1',
  name: 'Alice Smith',
  email: 'alice@example.com',
  role: 'admin',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
}

describe('DeleteUserDialog', () => {
  const mockOnConfirm = vi.fn()
  const mockOnOpenChange = vi.fn()

  it('renders confirmation message with user name', () => {
    render(
      <DeleteUserDialog
        open
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument()
    expect(screen.getByText(/alice smith/i)).toBeInTheDocument()
  })

  it('calls onConfirm when delete is clicked', async () => {
    const { user } = render(
      <DeleteUserDialog
        open
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onConfirm={mockOnConfirm}
      />
    )

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(mockOnConfirm).toHaveBeenCalled()
  })

  it('calls onOpenChange when cancel is clicked', async () => {
    const { user } = render(
      <DeleteUserDialog
        open
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onConfirm={mockOnConfirm}
      />
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnOpenChange).toHaveBeenCalled()
  })

  it('shows loading state when deleting', () => {
    render(
      <DeleteUserDialog
        open
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onConfirm={mockOnConfirm}
        isLoading
      />
    )

    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
  })

  it('does not render when user is null', () => {
    const { container } = render(
      <DeleteUserDialog
        open
        onOpenChange={mockOnOpenChange}
        user={null}
        onConfirm={mockOnConfirm}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })
})
