export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
} 