import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Employee } from './Employee.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  HALF_DAY = 'half_day',
  LEAVE = 'leave',
  HOLIDAY = 'holiday',
  WEEK_OFF = 'week_off',
}

@Entity('attendances')
export class Attendance extends BaseEntity {
  @Column({ type: 'varchar', length: 36 })
  employee_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'date' })
  attendance_date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  attendance_status: AttendanceStatus;

  @Column({ type: 'time', nullable: true })
  check_in_time: string | null;

  @Column({ type: 'time', nullable: true })
  check_out_time: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  total_hours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtime_hours: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  approved_by: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date | null;
}
