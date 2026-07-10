// API service for backend communication
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';
const API_PREFIX = (import.meta as any).env.VITE_API_PREFIX || '/api';
const FULL_API_URL = `${API_URL}${API_PREFIX}`;

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface User {
  email: string;
  name: string;
  role: 'citizen' | 'admin';
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  error?: string;
}

export interface SignupResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  error?: string;
}

export interface ReportSubmitData {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  latitude: number;
  longitude: number;
  priority: 'High' | 'Medium' | 'Low';
  severity: number;
  riskFactor: number;
  status: string;
  dateReported: string;
  dateUpdated: string;
  reportedBy?: string;
  imageUrl?: string;
  frequency?: number; // how many similar reports in area
}

class ApiService {
  private getHeaders(accessToken?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  // Auth endpoints
  async signup(email: string, password: string, name: string, role: 'citizen' | 'admin'): Promise<SignupResponse> {
    try {
      const response = await fetch(`${FULL_API_URL}/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password, name, role }),
      });
      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: String(error) };
    }
  }

  async login(email: string, password: string, role: 'citizen' | 'admin'): Promise<LoginResponse> {
    try {
      const response = await fetch(`${FULL_API_URL}/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password, role }),
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: String(error) };
    }
  }

  async verifySession(accessToken: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${FULL_API_URL}/verify-session`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });
      return await response.json();
    } catch (error) {
      console.error('Session verification error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Report endpoints
  async submitReport(report: ReportSubmitData, accessToken: string): Promise<ApiResponse<Report>> {
    try {
      const response = await fetch(`${FULL_API_URL}/reports`, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(report),
      });
      return await response.json();
    } catch (error) {
      console.error('Report submission error:', error);
      return { success: false, error: String(error) };
    }
  }

  async getReports(accessToken: string): Promise<ApiResponse<Report[]>> {
    try {
      const response = await fetch(`${FULL_API_URL}/reports`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });
      return await response.json();
    } catch (error) {
      console.error('Get reports error:', error);
      return { success: false, error: String(error) };
    }
  }

  async getReportsByUser(userId: string, accessToken: string): Promise<ApiResponse<Report[]>> {
    try {
      const response = await fetch(`${FULL_API_URL}/reports/user/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });
      return await response.json();
    } catch (error) {
      console.error('Get user reports error:', error);
      return { success: false, error: String(error) };
    }
  }

  async updateReportStatus(reportId: string, status: string, accessToken: string): Promise<ApiResponse<Report>> {
    try {
      const response = await fetch(`${FULL_API_URL}/reports/${reportId}`, {
        method: 'PUT',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify({ status }),
      });
      return await response.json();
    } catch (error) {
      console.error('Update report status error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Analytics endpoints
  async getAnalytics(accessToken: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${FULL_API_URL}/analytics`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });
      return await response.json();
    } catch (error) {
      console.error('Get analytics error:', error);
      return { success: false, error: String(error) };
    }
  }

  // ML Training endpoints
  async submitTrainingData(reportId: string, correctedPriority: string, correctedSeverity: number, correctedRiskFactor: number, accessToken: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${FULL_API_URL}/training`, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify({ reportId, correctedPriority, correctedSeverity, correctedRiskFactor }),
      });
      return await response.json();
    } catch (error) {
      console.error('Submit training data error:', error);
      return { success: false, error: String(error) };
    }
  }

  async getTrainingData(accessToken: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${FULL_API_URL}/training`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });
      return await response.json();
    } catch (error) {
      console.error('Get training data error:', error);
      return { success: false, error: String(error) };
    }
  }

  async getMLStats(accessToken: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${FULL_API_URL}/ml-stats`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });
      return await response.json();
    } catch (error) {
      console.error('Get ML stats error:', error);
      return { success: false, error: String(error) };
    }
  }

  async retrainModel(accessToken: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${FULL_API_URL}/retrain`, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify({}),
      });
      return await response.json();
    } catch (error) {
      console.error('Retrain model error:', error);
      return { success: false, error: String(error) };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${FULL_API_URL}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
  }
}

export default new ApiService();
