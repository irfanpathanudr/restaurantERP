import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export enum MembershipTier {
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Entity('customers')
export class Customer extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pincode: string | null;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date | null;

  @Column({ type: 'date', nullable: true })
  anniversary_date: Date | null;

  @Column({
    type: 'enum',
    enum: MembershipTier,
    nullable: true,
  })
  membership_tier: MembershipTier | null;

  @Column({ type: 'int', default: 0 })
  loyalty_points: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  wallet_balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  credit_limit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  outstanding_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lifetime_value: number;

  @Column({ type: 'int', default: 0 })
  total_visits: number;

  @Column({ type: 'timestamp', nullable: true })
  last_visit_date: Date | null;

  @Column({ type: 'json', nullable: true })
  favorite_items: string[] | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gst_number: string | null;
}
