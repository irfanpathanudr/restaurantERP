import { Entity, Column, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role.entity';
import { PermissionGroup } from './PermissionGroup.entity';

export enum PermissionType {
  PAGE = 'page',
  BUTTON = 'button',
  API = 'api',
  FIELD = 'field',
  RECORD = 'record',
  BRANCH = 'branch',
  KITCHEN = 'kitchen',
}

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: PermissionType,
    default: PermissionType.API,
  })
  type: PermissionType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resource: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  action: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  permission_group_id: string | null;

  @ManyToOne(() => PermissionGroup, (group) => group.permissions)
  @JoinColumn({ name: 'permission_group_id' })
  permission_group: PermissionGroup;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
