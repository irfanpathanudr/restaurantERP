import { Request, Response, NextFunction } from 'express';
import { JWTUtil, JWTPayload } from '../utils/jwt.util';
import logger from '../config/logger';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = JWTUtil.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Invalid token attempt', { token: token.substring(0, 20), error });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    logger.error('Authentication error', { error });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = JWTUtil.verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we don't fail the request
      logger.debug('Invalid token in optional auth', { error });
    }
  }

  next();
};
