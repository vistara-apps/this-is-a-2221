/**
 * Base API Service
 * 
 * This service provides common functionality for all API integrations,
 * including request handling, error management, and retry logic.
 */

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  maxRetries?: number;
}

interface ApiServiceConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  maxRetries?: number;
}

export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private maxRetries: number;
  
  constructor(config: ApiServiceConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.defaultHeaders || {};
    this.timeout = config.timeout || 30000; // Default 30 seconds
    this.maxRetries = config.maxRetries || 3;
  }
  
  /**
   * Make an API request with retry logic
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const headers = { ...this.defaultHeaders, ...options.headers };
    const timeout = options.timeout || this.timeout;
    const maxRetries = options.maxRetries || this.maxRetries;
    
    let body: string | undefined;
    if (options.body) {
      body = JSON.stringify(options.body);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }
    
    let retries = 0;
    let lastError: Error | null = null;
    
    while (retries <= maxRetries) {
      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        // Handle non-2xx responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new ApiError(
            `API request failed with status ${response.status}`,
            response.status,
            errorData
          );
        }
        
        // Parse response
        if (response.status === 204) {
          return {} as T; // No content
        }
        
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
          return await response.json() as T;
        } else {
          return await response.text() as unknown as T;
        }
      } catch (error: any) {
        lastError = error;
        
        // Don't retry if it's a client error (4xx)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Don't retry if it's an abort error (timeout)
        if (error.name === 'AbortError') {
          throw new Error(`Request timed out after ${timeout}ms`);
        }
        
        // Retry with exponential backoff
        if (retries < maxRetries) {
          const delay = Math.pow(2, retries) * 100; // 100, 200, 400, 800, ...
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          throw lastError;
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Helper methods for common HTTP methods
   */
  async get<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  async post<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data });
  }
  
  async put<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }
  
  async delete<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
  
  async patch<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: data });
  }
}

