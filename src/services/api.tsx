import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { createErrorResponse, AppError } from '../utils/errorHandling';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e78ed76b`;

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  reorderLevel: number;
  createdAt?: string;
  updatedAt?: string;
}

class ApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      // Get the current user's session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication failed');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      };

      // If user is authenticated, use their access token instead
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('Making authenticated request to:', `${API_BASE}${endpoint}`);
      } else {
        console.log('No session found, using anon key for:', `${API_BASE}${endpoint}`);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      console.log('API Response status:', response.status, 'for endpoint:', endpoint);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('API Error:', {
          endpoint,
          status: response.status,
          error: errorData
        });
        
        const errorDetails = createErrorResponse(errorData.error || `HTTP error! status: ${response.status}`, `API:${endpoint}`);
        throw new AppError(errorDetails);
      }

      const data = await response.json();
      console.log('API Success:', { endpoint, dataReceived: !!data });
      return data;
    } catch (error) {
      console.error('Request failed:', {
        endpoint,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const data = await this.makeRequest('/products');
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const data = await this.makeRequest('/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
      return data.product;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateStock(productId: string, quantityChange: number): Promise<Product> {
    try {
      const data = await this.makeRequest(`/products/${productId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ quantityChange }),
      });
      return data.product;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    try {
      const data = await this.makeRequest(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return data.product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.makeRequest(`/products/${productId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async initSampleData(): Promise<void> {
    try {
      await this.makeRequest('/init-sample-data', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      console.log('Attempting health check at:', `${API_BASE}/health`);
      
      // Use a simple fetch without authentication for health check
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Health check response status:', response.status);
      
      if (!response.ok) {
        // Try the test endpoint as a fallback
        console.log('Health check failed, trying test endpoint...');
        const testResponse = await fetch(`${API_BASE}/test`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Test endpoint response status:', testResponse.status);
        
        if (!testResponse.ok) {
          throw new Error(`Server connectivity failed: ${response.status} (health), ${testResponse.status} (test)`);
        }
        
        return { status: 'ok', timestamp: new Date().toISOString() };
      }
      
      const data = await response.json();
      console.log('Health check successful:', data);
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  async debugAuth(): Promise<any> {
    try {
      const data = await this.makeRequest('/debug-auth');
      return data;
    } catch (error) {
      console.error('Debug auth error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export type { Product };