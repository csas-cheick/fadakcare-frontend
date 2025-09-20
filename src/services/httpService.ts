// Service HTTP utilitaire pour gérer les appels API
// Fournit une couche d'abstraction avec gestion d'erreurs améliorée

interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
  ok: boolean;
}

class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

export class HttpService {
  private static readonly DEFAULT_TIMEOUT = 10000;
  private static readonly DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  static async request<T = unknown>(
    url: string, 
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.DEFAULT_TIMEOUT
    } = options;

    // Préparer les headers
    const requestHeaders: Record<string, string> = {
      ...this.DEFAULT_HEADERS,
      ...headers
    };

    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('authToken');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Configuration de la requête
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    };

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
  let response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

  let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
  data = await response.text() as unknown as T;
      }

      if (!response.ok) {
        // Extract error message from response if available
        let errorMessage = response.statusText;
        if (contentType && contentType.includes('application/json')) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorData = data as any;
            if (errorData && typeof errorData === 'object' && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // Fall back to status text if JSON parsing fails
          }
        }
        
        // If unauthorized, try refresh once
        if (response.status === 401 && !headers['x-no-retry']) {
          const refreshToken = localStorage.getItem('refreshToken');
          const userId = localStorage.getItem('userId');
          if (refreshToken && userId) {
            try {
              const refreshResp = await fetch('https://fadakcare-backend-1.onrender.com/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: Number(userId), refreshToken })
              });
              if (refreshResp.ok) {
                const refreshData: { accessToken?: string } = await refreshResp.json();
                if (refreshData.accessToken) {
                  localStorage.setItem('authToken', refreshData.accessToken);
                  // retry original request once with new token
                  requestHeaders['Authorization'] = `Bearer ${refreshData.accessToken}`;
                  requestHeaders['x-no-retry'] = '1';
                  response = await fetch(url, { ...fetchOptions, headers: requestHeaders, signal: controller.signal });
                  const retryContentType = response.headers.get('content-type');
                  if (retryContentType && retryContentType.includes('application/json')) {
                    data = await response.json();
                  } else {
                    data = await response.text() as unknown as T;
                  }
                  if (!response.ok) {
                    // Extract error message from retry response too
                    let retryErrorMessage = response.statusText;
                    if (retryContentType && retryContentType.includes('application/json')) {
                      try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const retryErrorData = data as any;
                        if (retryErrorData && typeof retryErrorData === 'object' && retryErrorData.message) {
                          retryErrorMessage = retryErrorData.message;
                        }
                      } catch {
                        // Fall back to status text
                      }
                    }
                    throw new HttpError(response.status, response.statusText, retryErrorMessage);
                  }
                  return {
                    data,
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok
                  };
                }
              }
            } catch { /* ignore refresh errors */ }
          }
        }
        throw new HttpError(response.status, response.statusText, errorMessage);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      };

    } catch (error: unknown) {
      clearTimeout(timeoutId);
      
      if (error instanceof HttpError) throw error;
      if (error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name === 'AbortError') {
        throw new Error('Request timeout');
      }
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(`Network error: ${(error as { message?: string }).message}`);
      }
      throw new Error('Network error: Unknown error');
    }
  }

  // Méthodes raccourcis
  static async get<T = unknown>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { method: 'GET', headers });
  }

  static async post<T = unknown>(url: string, body?: unknown, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { method: 'POST', body, headers });
  }

  static async put<T = unknown>(url: string, body?: unknown, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { method: 'PUT', body, headers });
  }

  static async delete<T = unknown>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { method: 'DELETE', headers });
  }
}

export { HttpError };
export type { HttpOptions, HttpResponse };
