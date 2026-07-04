import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Category } from './Category.entity';

export enum MaterialType {
  RAW_MATERIAL = 'raw_material',
  FINISHED_GOODS = 'finished_goods',
  CONSUMABLE = 'consumable',
}

export enum UnitOfMeasurement {
  KG = 'kg',
  GRAM = 'gram',
  LITER = 'liter',
  ML = 'ml',
  PIECE = 'piece',
  DOZEN = 'dozen',
  PACKET = 'packet',
  BOX = 'box',
}

@Entity('raw_materials')
export class RawMaterial extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.RAW_MATERIAL,
  })
  material_type: MaterialType;

  @Column({ type: 'varchar', length: 36, nullable: true })
  category_id: string | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({
    type: 'enum',
    enum: UnitOfMeasurement,
    default: UnitOfMeasurement.KG,
  })
  unit: UnitOfMeasurement;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost_per_unit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  current_stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimum_stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reorder_level: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  maximum_stock: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  preferred_vendor_id: string | null;

  @Column({ type: 'int', nullable: true })
  lead_time_days: number | null;

  @Column({ type: 'int', nullable: true })
  shelf_life_days: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  storage_location: string | null;

  @Column({ type: 'boolean', default: false })
  is_perishable: boolean;

  @Column({ type: 'boolean', default: false })
  track_batch: boolean;

  @Column({ type: 'boolean', default: false })
  track_expiry: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  hsn_code: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  gst_percentage: number;
}
