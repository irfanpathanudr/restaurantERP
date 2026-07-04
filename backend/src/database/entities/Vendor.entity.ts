import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export enum PaymentTerm {
  CASH = 'cash',
  CREDIT = 'credit',
  NET_7 = 'net_7',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
}

@Entity('vendors')
export class Vendor extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company_name: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_person: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  alternate_phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pincode: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gst_number: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pan_number: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bank_account_number: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bank_ifsc_code: string | null;

  @Column({
    type: 'enum',
    enum: PaymentTerm,
    default: PaymentTerm.CASH,
  })
  payment_term: PaymentTerm;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  credit_limit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  opening_balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  current_balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_purchases: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_payments: number;

  @Column({ type: 'int', nullable: true, default: 5 })
  rating: number | null;

  @Column({ type: 'json', nullable: true })
  documents: any[] | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
