import jwt from 'jsonwebtoken';
import { User } from '../database/entities/User.entity';

export interface JWTPayload {
  userId: string;
  email: string;
  roleId: string | null;
  branchId: string | null;
  type: 'access' | 'refresh';
}

export class JWTUtil {
  private static accessTokenSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
  private static refreshTokenSecret =
    process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
  private static accessTokenExpiration = process.env.JWT_EXPIRES_IN || '1d';
  private static refreshTokenExpiration = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  static generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
      branchId: user.branch_id,
      type: 'access',
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiration,
      issuer: 'restaurant-erp-api',
      audience: 'restaurant-erp-client',
    });
  }

  static generateRefreshToken(user: User, rememberMe: boolean = false): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
      branchId: user.branch_id,
      type: 'refresh',
    };

    const expiration = rememberMe ? '30d' : this.refreshTokenExpiration;

    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: expiration,
      issuer: 'restaurant-erp-api',
      audience: 'restaurant-erp-client',
    });
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'restaurant-erp-api',
        audience: 'restaurant-erp-client',
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'restaurant-erp-api',
        audience: 'restaurant-erp-client',
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static generatePasswordResetToken(userId: string): string {
    return jwt.sign({ userId, purpose: 'password-reset' }, this.accessTokenSecret, {
      expiresIn: '1h',
    });
  }

  static verifyPasswordResetToken(token: string): string {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as {
        userId: string;
        purpose: string;
      };

      if (decoded.purpose !== 'password-reset') {
        throw new Error('Invalid token purpose');
      }

      return decoded.userId;
    } catch (error) {
      throw new Error('Invalid or expired password reset token');
    }
  }
}
