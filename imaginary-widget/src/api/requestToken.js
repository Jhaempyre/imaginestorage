export async function requestUploadToken(apiUrl, publicKey) {
  try {
    const response = await fetch(`${apiUrl}/upload/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey,
        origin: window.location.origin
      })
    });

    if (!response.ok) {
      throw new Error('Failed to request upload token');
    }

    const data = await response.json();
    // Handle both direct response and wrapped response formats
    return data.token || data.data?.token;
  } catch (error) {
    console.error('Token request error:', error);
    throw error;
  }
}