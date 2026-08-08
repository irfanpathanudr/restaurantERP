import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Branch } from './Branch.entity';

export enum PrinterType {
  RECEIPT = 'receipt',
  KITCHEN = 'kitchen',
  BAR = 'bar',
  LABEL = 'label',
}

export enum PrinterConnection {
  NETWORK = 'network',
  USB = 'usb',
  BLUETOOTH = 'bluetooth',
}

export enum PrinterStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
}

@Entity('printers')
export class Printer extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 36 })
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({
    type: 'enum',
    enum: PrinterType,
    default: PrinterType.RECEIPT,
  })
  printer_type: PrinterType;

  @Column({
    type: 'enum',
    enum: PrinterConnection,
    default: PrinterConnection.NETWORK,
  })
  connection_type: PrinterConnection;

  @Column({
    type: 'enum',
    enum: PrinterStatus,
    default: PrinterStatus.OFFLINE,
    name: 'printer_status',
  })
  status: PrinterStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ip_address: string | null;

  @Column({ type: 'int', nullable: true })
  port: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  usb_path: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bluetooth_address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string | null;

  @Column({ type: 'int', default: 80 })
  paper_width: number;

  @Column({ type: 'int', default: 1 })
  number_of_copies: number;

  @Column({ type: 'boolean', default: true })
  auto_cut: boolean;

  @Column({ type: 'boolean', default: false })
  open_cash_drawer: boolean;

  @Column({ type: 'boolean', default: true })
  print_header: boolean;

  @Column({ type: 'boolean', default: true })
  print_footer: boolean;

  @Column({ type: 'text', nullable: true })
  header_text: string | null;

  @Column({ type: 'text', nullable: true })
  footer_text: string | null;

  @Column({ type: 'varchar', length: 20, default: 'utf-8' })
  character_encoding: string;

  @Column({ type: 'boolean', default: true })
  is_default: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_connected_at: Date | null;

  @Column({ type: 'text', nullable: true })
  last_error: string | null;

  @Column({ type: 'text', nullable: true })
  config_json: string | null;
}
