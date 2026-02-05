import { http, HttpResponse } from 'msw'

const API_URL = '/api'

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string
      password: string
    }

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: { id: '1', name: 'Test User', email: body.email },
      })
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      email: string
      password: string
    }

    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: { id: '1', name: body.name, email: body.email },
    })
  }),

  // Dashboard handlers
  http.get(`${API_URL}/dashboard`, () => {
    return HttpResponse.json({
      totalUsers: 42,
      totalPosts: 128,
      recentActivity: [
        {
          id: '1',
          type: 'user_registered',
          description: 'New user registered',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'post_created',
          description: 'New post published',
          createdAt: new Date().toISOString(),
        },
      ],
    })
  }),

  // User handlers
  http.get(`${API_URL}/users`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'user',
        createdAt: '2025-01-15T00:00:00.000Z',
        updatedAt: '2025-01-15T00:00:00.000Z',
      },
    ])
  }),

  http.get(`${API_URL}/users/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    })
  }),

  http.get(`${API_URL}/users/:userId/posts`, ({ params }) => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'First Post',
        content: 'This is the first post content.',
        authorId: params.userId as string,
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
      },
      {
        id: '2',
        title: 'Second Post',
        content: 'This is the second post content.',
        authorId: params.userId as string,
        createdAt: '2025-02-10T00:00:00.000Z',
        updatedAt: '2025-02-10T00:00:00.000Z',
      },
    ])
  }),

  http.post(`${API_URL}/users`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      email: string
      password: string
      role?: 'admin' | 'user'
    }

    return HttpResponse.json(
      {
        id: '3',
        name: body.name,
        email: body.email,
        role: body.role ?? 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.put(`${API_URL}/users/:id`, async ({ params, request }) => {
    const body = (await request.json()) as {
      name?: string
      email?: string
      role?: 'admin' | 'user'
    }

    return HttpResponse.json({
      id: params.id,
      name: body.name ?? 'John Doe',
      email: body.email ?? 'john@example.com',
      role: body.role ?? 'admin',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    })
  }),

  http.delete(`${API_URL}/users/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
