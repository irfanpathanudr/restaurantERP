import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export enum SettingCategory {
  GENERAL = 'GENERAL',
  BUSINESS = 'BUSINESS',
  POS = 'POS',
  PAYMENT = 'PAYMENT',
  TAX = 'TAX',
  NOTIFICATION = 'NOTIFICATION',
  SECURITY = 'SECURITY',
  INTEGRATION = 'INTEGRATION',
}

export enum SettingDataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  DATE = 'DATE',
}

@Entity('settings')
export class Setting extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  setting_key!: string;

  @Column({ type: 'text' })
  setting_value!: string;

  @Column({
    type: 'enum',
    enum: SettingDataType,
    default: SettingDataType.STRING,
  })
  data_type!: SettingDataType;

  @Column({
    type: 'enum',
    enum: SettingCategory,
    default: SettingCategory.GENERAL,
  })
  category!: SettingCategory;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  is_public!: boolean;

  @Column({ type: 'boolean', default: true })
  is_editable!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  branch_id?: string;
}
