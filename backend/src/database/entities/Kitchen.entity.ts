import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Branch } from './Branch.entity';

@Entity('kitchens')
export class Kitchen extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 36 })
  branch_id: string;

  @ManyToOne(() => Branch, (branch) => branch.kitchens)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  manager_id: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  printer_ip: string | null;

  @Column({ type: 'int', nullable: true })
  printer_port: number | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;
}
