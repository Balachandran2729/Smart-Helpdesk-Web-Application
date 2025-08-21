// src/tests/unit/auth.service.test.js
const authService = require('../../services/auth.service');
const User = require('../../models/User');

describe('Auth Service', () => {
  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.registerUser(userData);

      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('id');
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
      expect(result.user.role).toBe('user'); // Default role

      // Verify user was actually created in DB
      const userInDb = await User.findOne({ email: userData.email });
      expect(userInDb).toBeDefined();
      expect(await userInDb.comparePassword(userData.password)).toBe(true);
    });

    it('should fail to register a user with an existing email', async () => {
      const userData1 = {
        name: 'User One',
        email: 'duplicate@example.com',
        password: 'password123',
      };
      const userData2 = {
        name: 'User Two',
        email: 'duplicate@example.com', // Same email
        password: 'password456',
      };

      await authService.registerUser(userData1);
      await expect(authService.registerUser(userData2)).rejects.toThrow('User already exists with this email');
    });
  });

  describe('loginUser', () => {
    it('should login a user with correct credentials', async () => {
      const userData = {
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'correctpassword',
      };
      // Pre-create user
      await User.create({ ...userData });

      const result = await authService.loginUser(userData.email, userData.password);

      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('id');
      expect(result.user.email).toBe(userData.email);
    });

    it('should fail to login with incorrect password', async () => {
      const userData = {
        name: 'Fail Login User',
        email: 'faillogin@example.com',
        password: 'realpassword',
      };
      await User.create({ ...userData });

      await expect(authService.loginUser(userData.email, 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should fail to login with non-existent email', async () => {
      await expect(authService.loginUser('nonexistent@example.com', 'anypassword')).rejects.toThrow('Invalid credentials');
    });
  });
});