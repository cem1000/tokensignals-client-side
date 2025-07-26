class ApiService {
  async fetchData(url: string): Promise<any> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService(); 