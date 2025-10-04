const jwt = require('jsonwebtoken');
const config = require("../../shared/config");

class TokenService {
  static generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid Access Token');
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwtRefreshSecret);
    } catch (error) {
      throw new Error('Invalid Refresh Token');
    }
  }

  static async refreshTokens(refreshToken) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Remove timing fields before creating new token
      delete decoded.iat;
      delete decoded.exp;
      
      const newAccessToken = jwt.sign(decoded, config.jwtSecret, { expiresIn: '1h' });
      const newRefreshToken = jwt.sign(decoded, config.jwtRefreshSecret, { expiresIn: '7d' });

      return { accessToken: newAccessToken, newRefreshToken };
    } catch (error) {
      throw new Error('Invalid Refresh Token');
    }
  }

  static generateServiceToken(serviceName) {
    const payload = {
      service: serviceName,
      type: 'service',
      iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });
  }

  static verifyServiceToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      if (decoded.type !== 'service') {
        throw new Error('Invalid service token');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid Service Token');
    }
  }
}

module.exports = { TokenService };
