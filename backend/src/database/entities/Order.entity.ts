import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Customer } from './Customer.entity';
import { Table } from './Table.entity';
import { Branch } from './Branch.entity';
import { OrderItem } from './OrderItem.entity';

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKE_AWAY = 'take_away',
  DELIVERY = 'delivery',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  order_number: string;

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

  @Column({ type: 'varchar', length: 36, nullable: true })
  table_id: string | null;

  @ManyToOne(() => Table)
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.DINE_IN,
  })
  order_type: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  order_status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percentage: number;

  @Column({
    type: 'enum',
    enum: DiscountType,
    nullable: true,
  })
  discount_type: DiscountType | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  discount_reason: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  coupon_code: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  service_charge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_charge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tips: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rounding_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  grand_total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paid_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  due_amount: number;

  @Column({ type: 'int', default: 1 })
  number_of_guests: number;

  @Column({ type: 'text', nullable: true })
  special_instructions: string | null;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  waiter_id: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  cashier_id: string | null;

  @Column({ type: 'timestamp', nullable: true })
  ordered_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  cashier_confirmed_at: Date | null;

  @Column({ type: 'boolean', default: false })
  is_locked: boolean;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  order_items: OrderItem[];
}
