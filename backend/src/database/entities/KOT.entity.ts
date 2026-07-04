import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order.entity';
import { Kitchen } from './Kitchen.entity';

export enum KOTStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

export enum KOTPriority {
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('kots')
export class KOT extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  kot_number: string;

  @Column({ type: 'varchar', length: 36 })
  order_id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 36 })
  kitchen_id: string;

  @ManyToOne(() => Kitchen)
  @JoinColumn({ name: 'kitchen_id' })
  kitchen: Kitchen;

  @Column({
    type: 'enum',
    enum: KOTStatus,
    default: KOTStatus.PENDING,
  })
  kot_status: KOTStatus;

  @Column({
    type: 'enum',
    enum: KOTPriority,
    default: KOTPriority.NORMAL,
  })
  priority: KOTPriority;

  @Column({ type: 'json' })
  items: any[];

  @Column({ type: 'varchar', length: 36, nullable: true })
  chef_id: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  waiter_id: string | null;

  @Column({ type: 'text', nullable: true })
  special_instructions: string | null;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  ready_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  served_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date | null;

  @Column({ type: 'int', nullable: true })
  preparation_time: number | null;

  @Column({ type: 'int', nullable: true })
  elapsed_time: number | null;

  @Column({ type: 'boolean', default: false })
  is_merged: boolean;

  @Column({ type: 'varchar', length: 36, nullable: true })
  merged_with_kot_id: string | null;

  @Column({ type: 'int', default: 0 })
  print_count: number;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string | null;
}
