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

  // User handlers
  http.get(`${API_URL}/users`, () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
    ])
  }),

  http.get(`${API_URL}/users/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
    })
  }),
]
