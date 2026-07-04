import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order.entity';
import { Customer } from './Customer.entity';
import { Branch } from './Branch.entity';

export enum InvoiceType {
  INVOICE = 'invoice',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
}

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  invoice_number: string;

  @Column({
    type: 'enum',
    enum: InvoiceType,
    default: InvoiceType.INVOICE,
  })
  invoice_type: InvoiceType;

  @Column({ type: 'varchar', length: 36 })
  order_id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 36, nullable: true })
  customer_id: string | null;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'varchar', length: 36 })
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'date' })
  invoice_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cgst_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  cgst_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sgst_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  sgst_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  igst_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  igst_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  service_charge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rounding_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grand_total: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdf_path: string | null;

  @Column({ type: 'text', nullable: true })
  qr_code: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  generated_by: string | null;

  @Column({ type: 'int', default: 0 })
  print_count: number;

  @Column({ type: 'boolean', default: false })
  is_duplicate: boolean;
}
