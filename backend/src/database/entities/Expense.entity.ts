import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Branch } from './Branch.entity';

export enum ExpenseCategory {
  ELECTRICITY = 'electricity',
  GAS = 'gas',
  RENT = 'rent',
  MAINTENANCE = 'maintenance',
  MARKETING = 'marketing',
  PETTY_CASH = 'petty_cash',
  SALARY = 'salary',
  TRANSPORTATION = 'transportation',
  OFFICE_SUPPLIES = 'office_supplies',
  MISCELLANEOUS = 'miscellaneous',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

@Entity('expenses')
export class Expense extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  expense_number: string;

  @Column({ type: 'varchar', length: 36 })
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
  })
  category: ExpenseCategory;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  expense_date: Date;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  expense_status: ExpenseStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendor_name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bill_number: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachment: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  approved_by: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date | null;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string | null;

  @Column({ type: 'boolean', default: false })
  is_recurring: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recurring_frequency: string | null;
}
