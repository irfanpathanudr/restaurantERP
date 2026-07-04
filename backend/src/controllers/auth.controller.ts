import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { LoginDto } from '../dto/auth/LoginDto';
import { RegisterDto } from '../dto/auth/RegisterDto';
import { ForgotPasswordDto } from '../dto/auth/ForgotPasswordDto';
import { ResetPasswordDto } from '../dto/auth/ResetPasswordDto';
import { VerifyOtpDto } from '../dto/auth/VerifyOtpDto';
import { RefreshTokenDto } from '../dto/auth/RefreshTokenDto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * @route   POST /api/v1/auth/register
   * @desc    Register a new user
   * @access  Public
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerDto: RegisterDto = req.body;
      const result = await this.authService.register(registerDto);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            first_name: result.user.first_name,
            last_name: result.user.last_name,
            phone: result.user.phone,
            role_id: result.user.role_id,
            branch_id: result.user.branch_id,
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /api/v1/auth/login
   * @desc    Login user
   * @access  Public
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const device = req.headers['user-agent'] || 'unknown';

      const result = await this.authService.login(loginDto, ip, device);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            first_name: result.user.first_name,
            last_name: result.user.last_name,
            phone: result.user.phone,
            role_id: result.user.role_id,
            branch_id: result.user.branch_id,
            role: result.user.role,
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /api/v1/auth/refresh-token
   * @desc    Refresh access token
   * @access  Public
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenDto = req.body;
      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /api/v1/auth/forgot-password
   * @desc    Request password reset
   * @access  Public
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email }: ForgotPasswordDto = req.body;
      const result = await this.authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.resetToken ? { resetToken: result.resetToken } : undefined,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /api/v1/auth/reset-password
   * @desc    Reset password with token
   * @access  Public
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password }: ResetPasswordDto = req.body;
      const result = await this.authService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /api/v1/auth/send-otp
   * @desc    Send OTP to user email
   * @access  Public
   */
  sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.authService.sendOtp(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.otp ? { otp: result.otp } : undefined,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /api/v1/auth/verify-otp
   * @desc    Verify OTP
   * @access  Public
   */
  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp }: VerifyOtpDto = req.body;
      const result = await this.authService.verifyOtp(email, otp);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   GET /api/v1/auth/me
   * @desc    Get current user profile
   * @access  Private
   */
  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const user = await this.authService.getCurrentUser(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          avatar: user.avatar,
          role_id: user.role_id,
          branch_id: user.branch_id,
          role: user.role,
          is_email_verified: user.is_email_verified,
          last_login_at: user.last_login_at,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /api/v1/auth/logout
   * @desc    Logout user
   * @access  Private
   */
  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const result = await this.authService.logout(req.user.userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}
