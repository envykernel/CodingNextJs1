// ** Fake user data and data type

// ** Please remove below user data and data type in production and verify user with Real Database
export type UserTable = {
  id: number
  name: string
  email: string
  image: string
  password: string
  organisationId: number
}

export const users: UserTable[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    image: '',
    password: 'password123',
    organisationId: 101
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    image: '',
    password: 'password456',
    organisationId: 102
  }
]
