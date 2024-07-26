export async function fetchNewAuthToken(refreshToken: string | null): Promise<string | null> {
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    } else {
      console.error('Failed to refresh token');
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token', error);
    return null;
  }
}