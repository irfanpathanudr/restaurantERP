import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Permission } from './Permission.entity';

@Entity('permission_groups')
export class PermissionGroup extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @OneToMany(() => Permission, (permission) => permission.permission_group)
  permissions: Permission[];
}
