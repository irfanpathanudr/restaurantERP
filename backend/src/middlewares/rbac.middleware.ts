import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import AppDataSource from '../config/database';
import { Permission } from '../database/entities/Permission.entity';
import { Role } from '../database/entities/Role.entity';
import { UserPermission } from '../database/entities/UserPermission.entity';
import logger from '../config/logger';

/**
 * Check if user has required permission
 */
export const checkPermission = (permissionName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const hasPermission = await userHasPermission(req.user.userId, permissionName);

      if (!hasPermission) {
        logger.warn('Permission denied', {
          userId: req.user.userId,
          permission: permissionName,
        });

        res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('RBAC middleware error', { error, permissionName });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

/**
 * Check if user has any of the required permissions
 */
export const checkAnyPermission = (...permissionNames: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      for (const permissionName of permissionNames) {
        const hasPermission = await userHasPermission(req.user.userId, permissionName);
        if (hasPermission) {
          next();
          return;
        }
      }

      logger.warn('Permission denied - none matched', {
        userId: req.user.userId,
        permissions: permissionNames,
      });

      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    } catch (error) {
      logger.error('RBAC middleware error', { error, permissionNames });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

/**
 * Check if user has all required permissions
 */
export const checkAllPermissions = (...permissionNames: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      for (const permissionName of permissionNames) {
        const hasPermission = await userHasPermission(req.user.userId, permissionName);
        if (!hasPermission) {
          logger.warn('Permission denied - missing permission', {
            userId: req.user.userId,
            permission: permissionName,
          });

          res.status(403).json({
            success: false,
            message: 'You do not have permission to perform this action',
          });
          return;
        }
      }

      next();
    } catch (error) {
      logger.error('RBAC middleware error', { error, permissionNames });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

/**
 * Helper method to check if user has permission
 * Checks both role-based and user-specific permissions (UBAC)
 */
const userHasPermission = async (userId: string, permissionName: string): Promise<boolean> => {
  const permissionRepository = AppDataSource.getRepository(Permission);
  const userPermissionRepository = AppDataSource.getRepository(UserPermission);

  // Find the permission
  const permission = await permissionRepository.findOne({
    where: { name: permissionName },
  });

  if (!permission) {
    logger.warn('Permission not found', { permissionName });
    return false;
  }

  // Check user-specific permissions (UBAC) - these override role permissions
  const userPermission = await userPermissionRepository.findOne({
    where: {
      user_id: userId,
      permission_id: permission.id,
    },
  });

  if (userPermission) {
    return userPermission.is_granted;
  }

  // Check role-based permissions (RBAC)
  const roleRepository = AppDataSource.getRepository(Role);
  const userRole = await roleRepository
    .createQueryBuilder('role')
    .innerJoin('role.users', 'user', 'user.id = :userId', { userId })
    .innerJoinAndSelect('role.permissions', 'permission')
    .where('permission.id = :permissionId', { permissionId: permission.id })
    .getOne();

  return !!userRole;
};
