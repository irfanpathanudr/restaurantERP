import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import AppDataSource from '../config/database';
import { Permission, PermissionType } from '../database/entities/Permission.entity';
import { Role } from '../database/entities/Role.entity';
import { UserPermission } from '../database/entities/UserPermission.entity';
import logger from '../config/logger';

export class RBACMiddleware {
  /**
   * Check if user has required permission
   */
  static checkPermission(permissionCode: string) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized',
          });
        }

        const hasPermission = await this.userHasPermission(req.user.userId, permissionCode);

        if (!hasPermission) {
          logger.warn('Permission denied', {
            userId: req.user.userId,
            permission: permissionCode,
          });

          return res.status(403).json({
            success: false,
            message: 'You do not have permission to perform this action',
          });
        }

        next();
      } catch (error) {
        logger.error('RBAC middleware error', { error, permissionCode });
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    };
  }

  /**
   * Check if user has any of the required permissions
   */
  static checkAnyPermission(...permissionCodes: string[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized',
          });
        }

        for (const permissionCode of permissionCodes) {
          const hasPermission = await this.userHasPermission(req.user.userId, permissionCode);
          if (hasPermission) {
            return next();
          }
        }

        logger.warn('Permission denied - none matched', {
          userId: req.user.userId,
          permissions: permissionCodes,
        });

        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
        });
      } catch (error) {
        logger.error('RBAC middleware error', { error, permissionCodes });
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    };
  }

  /**
   * Check if user has all required permissions
   */
  static checkAllPermissions(...permissionCodes: string[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized',
          });
        }

        for (const permissionCode of permissionCodes) {
          const hasPermission = await this.userHasPermission(req.user.userId, permissionCode);
          if (!hasPermission) {
            logger.warn('Permission denied - missing permission', {
              userId: req.user.userId,
              permission: permissionCode,
            });

            return res.status(403).json({
              success: false,
              message: 'You do not have permission to perform this action',
            });
          }
        }

        next();
      } catch (error) {
        logger.error('RBAC middleware error', { error, permissionCodes });
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    };
  }

  /**
   * Check if user has specific role
   */
  static checkRole(...roleCodes: string[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user || !req.user.roleId) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized',
          });
        }

        const roleRepository = AppDataSource.getRepository(Role);
        const role = await roleRepository.findOne({
          where: { id: req.user.roleId },
        });

        if (!role || !roleCodes.includes(role.code)) {
          logger.warn('Role denied', {
            userId: req.user.userId,
            requiredRoles: roleCodes,
            userRole: role?.code,
          });

          return res.status(403).json({
            success: false,
            message: 'You do not have the required role to perform this action',
          });
        }

        next();
      } catch (error) {
        logger.error('RBAC role middleware error', { error, roleCodes });
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    };
  }

  /**
   * Helper method to check if user has permission
   * Checks both role-based and user-specific permissions (UBAC)
   */
  private static async userHasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const permissionRepository = AppDataSource.getRepository(Permission);
    const userPermissionRepository = AppDataSource.getRepository(UserPermission);

    // Find the permission
    const permission = await permissionRepository.findOne({
      where: { code: permissionCode },
    });

    if (!permission) {
      logger.warn('Permission not found', { permissionCode });
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
  }
}
