import { UserRepository } from '../repositories/user.repository';
import { User } from '../database/entities/User.entity';
import { PasswordUtil } from '../utils/password.util';
import { JWTUtil } from '../utils/jwt.util';
import { AppError } from '../middlewares/error.middleware';
import logger from '../config/logger';
import { LoginDto } from '../dto/auth/LoginDto';
import { RegisterDto } from '../dto/auth/RegisterDto';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Validate password policy
    const passwordValidation = PasswordUtil.validatePasswordPolicy(registerDto.password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.errors.join(', '), 400);
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(registerDto.password);

    // Create user
    const userData: Partial<User> = {
      email: registerDto.email,
      password: hashedPassword,
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      phone: registerDto.phone || null,
      role_id: registerDto.role_id || null,
      branch_id: registerDto.branch_id || null,
      is_email_verified: false,
      is_password_change_required: false,
    };

    const user = await this.userRepository.create(userData);

    // Generate tokens
    const accessToken = JWTUtil.generateAccessToken(user);
    const refreshToken = JWTUtil.generateRefreshToken(user, false);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return { user, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login(
    loginDto: LoginDto,
    ip: string,
    device: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is locked
    const isLocked = await this.userRepository.isAccountLocked(user.id);
    if (isLocked) {
      throw new AppError('Account is locked due to multiple failed login attempts. Please try again later.', 423);
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      await this.userRepository.incrementFailedLoginAttempts(user.id);
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AppError('Account is inactive', 403);
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id, ip, device);

    // Generate tokens
    const accessToken = JWTUtil.generateAccessToken(user);
    const refreshToken = JWTUtil.generateRefreshToken(user, loginDto.rememberMe || false);

    logger.info('User logged in successfully', { userId: user.id, email: user.email, ip });

    return { user, accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);

      // Find user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.is_active) {
        throw new AppError('Account is inactive', 403);
      }

      // Generate new tokens
      const newAccessToken = JWTUtil.generateAccessToken(user);
      const newRefreshToken = JWTUtil.generateRefreshToken(user, false);

      logger.info('Token refreshed successfully', { userId: user.id });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal that user doesn't exist
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = PasswordUtil.generateSecureToken();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Token valid for 1 hour

    await this.userRepository.updateResetToken(user.id, resetToken, expiry);

    logger.info('Password reset requested', { userId: user.id, email: user.email });

    // In production, send email here
    // For now, return token (remove in production)
    return {
      message: 'If the email exists, a password reset link has been sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Find user by reset token
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Check if token has expired
    if (!user.reset_token_expiry || new Date() > user.reset_token_expiry) {
      throw new AppError('Reset token has expired', 400);
    }

    // Validate new password
    const passwordValidation = PasswordUtil.validatePasswordPolicy(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.errors.join(', '), 400);
    }

    // Hash new password
    const hashedPassword = await PasswordUtil.hash(newPassword);

    // Update password
    await this.userRepository.updatePassword(user.id, hashedPassword);

    logger.info('Password reset successfully', { userId: user.id });

    return { message: 'Password reset successfully' };
  }

  /**
   * Send OTP
   */
  async sendOtp(email: string): Promise<{ message: string; otp?: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate OTP
    const otp = PasswordUtil.generateOTP(6);
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid for 10 minutes

    await this.userRepository.updateOtp(user.id, otp, expiry);

    logger.info('OTP sent', { userId: user.id, email: user.email });

    // In production, send OTP via SMS/Email
    // For now, return OTP (remove in production)
    return {
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    // Check if OTP has expired
    if (!user.otp_expiry || new Date() > user.otp_expiry) {
      throw new AppError('OTP has expired', 400);
    }

    // Clear OTP and verify email
    await this.userRepository.clearOtp(user.id);
    await this.userRepository.verifyEmail(user.id);

    logger.info('OTP verified successfully', { userId: user.id });

    return { message: 'OTP verified successfully' };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Logout user (client-side token removal)
   */
  async logout(userId: string): Promise<{ message: string }> {
    logger.info('User logged out', { userId });

    // In a more advanced implementation, you could blacklist the token
    // or maintain a session table to invalidate

    return { message: 'Logged out successfully' };
  }
}
