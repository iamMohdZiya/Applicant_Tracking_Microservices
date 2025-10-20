const bcrypt = require('bcryptjs');
const { TokenService } = require('../services/tokenService');
const { Kafka } = require('kafkajs');
const User = require('../models/userModel');

const kafka = new Kafka({
  clientId: 'auth-service',
  brokers: process.env.KAFKA_BROKERS.split(',')
});

const producer = kafka.producer();

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'User already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new User({
        email,
        password: hashedPassword,
        role
      });

      await user.save();

      // Produce Kafka message for user creation
      await producer.connect();
      await producer.send({
        topic: 'user-events',
        messages: [
          {
            key: user._id.toString(),
            value: JSON.stringify({
              type: 'USER_CREATED',
              payload: {
                userId: user._id,
                email: user.email,
                role: user.role
              }
            })
          }
        ]
      });

      // Generate tokens
      const { accessToken, refreshToken } = TokenService.generateTokens(user);

      res.status(201).json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Invalid credentials'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = TokenService.generateTokens(user);

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Refresh token is required'
        });
      }

      const { accessToken, newRefreshToken } = await TokenService.refreshTokens(refreshToken);

      res.json({
        accessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      res.status(401).json({
        error: 'Invalid Token',
        message: error.message
      });
    }
  }

  static async validateToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'No token provided'
        });
      }

      const decoded = TokenService.verifyAccessToken(token);
      res.json({
        valid: true,
        user: decoded
      });
    } catch (error) {
      res.status(401).json({
        error: 'Invalid Token',
        message: error.message
      });
    }
  }

  static async validateServiceToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Service token is required'
        });
      }

      const decoded = TokenService.verifyServiceToken(token);
      res.json({
        valid: true,
        service: decoded.service
      });
    } catch (error) {
      res.status(401).json({
        error: 'Invalid Service Token',
        message: error.message
      });
    }
  }

  static async generateToken(req, res) {
    try {
      const { userId, role } = req.body;
      
      if (!userId || !role) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'userId and role are required'
        });
      }

      // Generate a service token for the requesting service
      const serviceToken = TokenService.generateServiceToken(req.user.service);
      
      res.json({
        serviceToken,
        message: 'Service token generated successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
