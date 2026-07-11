import { Repository } from 'typeorm';
import AppDataSource from '../config/database';
import { User } from '../database/entities/User.entity';

export class UserRepository {
  private get repository(): Repository<User> {
    return AppDataSource.getRepository(User);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['role', 'role.permissions'],
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });
  }

  /**
   * Create new user
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  /**
   * Update user
   */
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  /**
   * Soft delete user
   */
  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    const result = await this.repository.update(id, {
      deleted_at: new Date(),
      deleted_by: deletedBy,
      is_active: false,
    });
    return result.affected !== 0;
  }

  /**
   * Find all users with pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: any
  ): Promise<{ users: User[]; total: number }> {
    const query = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.deleted_at IS NULL');

    if (filters?.search) {
      query.andWhere(
        '(user.first_name LIKE :search OR user.last_name LIKE :search OR user.email LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.role_id) {
      query.andWhere('user.role_id = :role_id', { role_id: filters.role_id });
    }

    if (filters?.branch_id) {
      query.andWhere('user.branch_id = :branch_id', { branch_id: filters.branch_id });
    }

    if (filters?.is_active !== undefined) {
      query.andWhere('user.is_active = :is_active', { is_active: filters.is_active });
    }

    const total = await query.getCount();
    const users = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.created_at', 'DESC')
      .getMany();

    return { users, total };
  }

  /**
   * Update last login information
   */
  async updateLastLogin(id: string, ip: string, device: string): Promise<void> {
    await this.repository.update(id, {
      last_login_at: new Date(),
      last_login_ip: ip,
      last_login_device: device,
      failed_login_attempts: 0,
      locked_until: null,
    });
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedLoginAttempts(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) return;

    const failedAttempts = user.failed_login_attempts + 1;
    const updateData: Partial<User> = {
      failed_login_attempts: failedAttempts,
    };

    // Lock account after 5 failed attempts for 30 minutes
    if (failedAttempts >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30);
      updateData.locked_until = lockUntil;
    }

    await this.repository.update(id, updateData);
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user || !user.locked_until) return false;

    const now = new Date();
    if (now < user.locked_until) {
      return true;
    }

    // Unlock account if lock period has expired
    await this.repository.update(id, {
      locked_until: null,
      failed_login_attempts: 0,
    });

    return false;
  }

  /**
   * Update password reset token
   */
  async updateResetToken(id: string, token: string, expiry: Date): Promise<void> {
    await this.repository.update(id, {
      reset_token: token,
      reset_token_expiry: expiry,
    });
  }

  /**
   * Find user by reset token
   */
  async findByResetToken(token: string): Promise<User | null> {
    return this.repository.findOne({
      where: { reset_token: token },
    });
  }

  /**
   * Update OTP
   */
  async updateOtp(id: string, otp: string, expiry: Date): Promise<void> {
    await this.repository.update(id, {
      otp,
      otp_expiry: expiry,
    });
  }

  /**
   * Clear OTP
   */
  async clearOtp(id: string): Promise<void> {
    await this.repository.update(id, {
      otp: null,
      otp_expiry: null,
    });
  }

  /**
   * Verify email
   */
  async verifyEmail(id: string): Promise<void> {
    await this.repository.update(id, {
      is_email_verified: true,
    });
  }

  /**
   * Update password
   */
  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.repository.update(id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null,
      is_password_change_required: false,
    });
  }
}
