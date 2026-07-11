import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PAYMENT = 'payment',
  PERMISSION_CHANGE = 'permission_change',
}

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Column({ type: 'varchar', length: 36, nullable: true })
  user_id: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'varchar', length: 100 })
  entity_type: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  entity_id: string | null;

  @Column({ type: 'json', nullable: true })
  old_values: any;

  @Column({ type: 'json', nullable: true })
  new_values: any;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
