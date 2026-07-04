import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  last_login_ip: string | null;

  @Column({ type: 'text', nullable: true })
  last_login_device: string | null;

  @Column({ type: 'int', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reset_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expiry: Date | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  otp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otp_expiry: Date | null;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'boolean', default: true })
  is_password_change_required: boolean;

  @Column({ type: 'varchar', length: 36, nullable: true })
  role_id: string | null;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'varchar', length: 36, nullable: true })
  branch_id: string | null;

  // Virtual fields
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
