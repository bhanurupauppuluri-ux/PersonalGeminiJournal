const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Executes an authenticated API fetch request with Bearer ID Token injection
 */
async function fetchWithAuth(url, token, options = {}) {
  if (!token) {
    throw new Error('Authentication Bearer ID token is missing');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export const api = {
  // Secret status check
  getSecretStatus: (token) => fetchWithAuth('/api/secret', token),

  // Save new journal entry with AI analysis
  saveEntry: (token, content) => fetchWithAuth('/api/journal/entry', token, {
    method: 'POST',
    body: JSON.stringify({ content })
  }),

  // Fetch all journal entries for authenticated user
  getEntries: (token) => fetchWithAuth('/api/journal/entries', token),

  // Fetch AI mood & resilience analytics
  getResilienceAnalytics: (token) => fetchWithAuth('/api/analytics/resilience', token)
};
