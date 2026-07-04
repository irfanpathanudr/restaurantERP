import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Permission } from './Permission.entity';

@Entity('user_permissions')
@Index(['user_id', 'permission_id'], { unique: true })
export class UserPermission extends BaseEntity {
  @Column({ type: 'varchar', length: 36 })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 36 })
  permission_id: string;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({ type: 'boolean', default: true })
  is_granted: boolean;
}
