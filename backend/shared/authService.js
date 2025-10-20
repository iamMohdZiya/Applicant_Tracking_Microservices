const axios = require('axios');

class AuthService {
  constructor(authServiceUrl = 'http://auth-service:8000') {
    this.authServiceUrl = authServiceUrl;
  }

  async validateToken(token) {
    try {
      const response = await axios.post(`${this.authServiceUrl}/api/auth/validate`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Token validation failed');
    }
  }

  async validateServiceToken(serviceToken) {
    try {
      const response = await axios.post(`${this.authServiceUrl}/api/auth/validate-service`, {
        token: serviceToken
      });
      return response.data;
    } catch (error) {
      throw new Error('Service token validation failed');
    }
  }

  async generateServiceToken(serviceName) {
    try {
      const response = await axios.post(`${this.authServiceUrl}/api/auth/generate`, {
        serviceName: serviceName
      });
      return response.data;
    } catch (error) {
      throw new Error('Service token generation failed');
    }
  }
}

module.exports = AuthService;
