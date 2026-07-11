import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Customer } from './Customer.entity';
import { Table } from './Table.entity';
import { Branch } from './Branch.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

@Entity('reservations')
export class Reservation extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  reservation_number: string;

  @Column({ type: 'varchar', length: 36 })
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'varchar', length: 36, nullable: true })
  customer_id: string | null;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'varchar', length: 255 })
  customer_name: string;

  @Column({ type: 'varchar', length: 20 })
  customer_phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customer_email: string | null;

  @Column({ type: 'date' })
  reservation_date: Date;

  @Column({ type: 'time' })
  reservation_time: string;

  @Column({ type: 'int', default: 2 })
  party_size: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  table_id: string | null;

  @ManyToOne(() => Table)
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  reservation_status: ReservationStatus;

  @Column({ type: 'text', nullable: true })
  special_requests: string | null;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  checked_in_at: Date | null;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string | null;
}
