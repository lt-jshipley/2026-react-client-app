import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { UserTable } from './UserTable'
import type { User } from '@/types'

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Bob Jones',
    email: 'bob@example.com',
    role: 'user',
    createdAt: '2024-02-20T00:00:00.000Z',
    updatedAt: '2024-02-20T00:00:00.000Z',
  },
]

describe('UserTable', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  it('renders table headers', () => {
    render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
  })

  it('renders user rows', () => {
    render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('calls onEdit when edit action is clicked', async () => {
    const { user } = render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const actionButtons = screen.getAllByRole('button', { name: /actions/i })
    await user.click(actionButtons[0])

    const editItem = screen.getByText('Edit')
    await user.click(editItem)

    expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0])
  })

  it('calls onDelete when delete action is clicked', async () => {
    const { user } = render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const actionButtons = screen.getAllByRole('button', { name: /actions/i })
    await user.click(actionButtons[0])

    const deleteItem = screen.getByText('Delete')
    await user.click(deleteItem)

    expect(mockOnDelete).toHaveBeenCalledWith(mockUsers[0])
  })
})
