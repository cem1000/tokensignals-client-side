class AuthService {
  private token: string | null = null;
  private apiKey = 'test-api-key-123'; 

  async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    try {

      const response = await fetch('http://localhost:3000/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: this.apiKey }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get token: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Handle different possible response structures
      if (data.data && data.data.token) {
        this.token = data.data.token;
      } else if (data.token) {
        this.token = data.token;
      } else if (data.access_token) {
        this.token = data.access_token;
      } else {
        throw new Error('No token found in response');
      }
      
      return this.token!;
    } catch (error) {
      throw error;
    }
  }

  async fetchWithAuth(url: string): Promise<any> {
    const token = await this.getToken();
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }
}

export const authService = new AuthService(); 