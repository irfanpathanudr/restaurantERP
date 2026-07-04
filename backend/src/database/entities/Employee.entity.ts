import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Branch } from './Branch.entity';
import { User } from './User.entity';

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('employees')
export class Employee extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  employee_code: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  user_id: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pincode: string | null;

  @Column({ type: 'varchar', length: 36 })
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'varchar', length: 100 })
  designation: string;

  @Column({ type: 'varchar', length: 100 })
  department: string;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employment_type: EmploymentType;

  @Column({ type: 'date' })
  joining_date: Date;

  @Column({ type: 'date', nullable: true })
  confirmation_date: Date | null;

  @Column({ type: 'date', nullable: true })
  resignation_date: Date | null;

  @Column({ type: 'date', nullable: true })
  relieving_date: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basic_salary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  gross_salary: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pan_number: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aadhar_number: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  uan_number: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  esi_number: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bank_account_number: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bank_ifsc_code: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo: string | null;

  @Column({ type: 'json', nullable: true })
  documents: any[] | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_contact_name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_contact_phone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emergency_contact_relation: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
