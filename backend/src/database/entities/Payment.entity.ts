import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  WALLET = 'wallet',
  CREDIT = 'credit',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentMode {
  CASH = 'cash',
  ONLINE = 'online',
  CARD = 'card',
}

export enum PaymentGateway {
  RAZORPAY = 'razorpay',
  PAYTM = 'paytm',
  PHONEPE = 'phonepe',
  GPAY = 'gpay',
  STRIPE = 'stripe',
  MANUAL = 'manual',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  payment_number: string;

  @Column({ type: 'varchar', length: 36 })
  order_id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  payment_method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentGateway,
    default: PaymentGateway.MANUAL,
  })
  payment_gateway: PaymentGateway | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference_number: string | null;

  @Column({ type: 'varchar', length: 50, default: 'success' })
  payment_status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  payment_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  processed_by: string | null;

  @Column({
    type: 'enum',
    enum: PaymentMode,
    default: PaymentMode.CASH,
  })
  payment_mode: PaymentMode;

  @Column({ type: 'boolean', default: false })
  is_split_payment: boolean;

  @Column({ type: 'int', default: 1 })
  payment_sequence: number;
}
