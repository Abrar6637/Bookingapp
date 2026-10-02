const API_URL = process.env.EXPO_PUBLIC_API_URL

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  token: string | null
}

export async function apiFetch(endpoint: string, options: FetchOptions) {
  const { method = 'GET', body, token } = options

  if (!token) {
    throw new Error('No auth token available')
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    // Server band ho, internet na ho, ya IP galat ho
    throw new Error('not connect server. Please check your internet connection.')
  }

  let data: any = null
  try {
    data = await response.json()
  } catch {
    // Server ne JSON nahi bheja (jaise Laravel crash ho kar HTML page de)
    if (!response.ok) {
      throw new Error(`Server error (${response.status}). Try again later.`)
    }
  }

 if (!response.ok) {
  console.log(
  'API Error Full Response:',
  response.status,
  JSON.stringify(data, null, 2)
)
  throw new Error(data?.error || data?.message || 'Something went wrong')
}

  return data
}