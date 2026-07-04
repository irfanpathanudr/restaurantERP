import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Branch } from './Branch.entity';

export enum TableShape {
  ROUND = 'round',
  SQUARE = 'square',
  RECTANGLE = 'rectangle',
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
}

export enum TableType {
  TWO_SEATER = '2-seater',
  FOUR_SEATER = '4-seater',
  SIX_SEATER = '6-seater',
  EIGHT_SEATER = '8-seater',
  CUSTOM = 'custom',
}

@Entity('tables')
export class Table extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  table_number: string;

  @Column({ type: 'varchar', length: 36 })
  branch_id: string;

  @ManyToOne(() => Branch, (branch) => branch.tables)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({
    type: 'enum',
    enum: TableType,
    default: TableType.FOUR_SEATER,
  })
  table_type: TableType;

  @Column({ type: 'int', default: 4 })
  capacity: number;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  table_status: TableStatus;

  @Column({
    type: 'enum',
    enum: TableShape,
    default: TableShape.SQUARE,
  })
  shape: TableShape;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dining_area: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  position_x: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  position_y: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  width: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  current_order_id: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  merged_with_table_id: string | null;

  @Column({ type: 'boolean', default: false })
  is_merged: boolean;
}
