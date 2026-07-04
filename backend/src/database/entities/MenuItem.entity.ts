import { Entity, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Category } from './Category.entity';
import { Kitchen } from './Kitchen.entity';

export enum FoodType {
  VEG = 'veg',
  NON_VEG = 'non_veg',
  EGG = 'egg',
  JAIN = 'jain',
}

export enum SpicyLevel {
  NONE = 'none',
  MILD = 'mild',
  MEDIUM = 'medium',
  HOT = 'hot',
  EXTRA_HOT = 'extra_hot',
}

export enum PortionSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  CUSTOM = 'custom',
}

@Entity('menu_items')
export class MenuItem extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 36 })
  category_id: string;

  @ManyToOne(() => Category, (category) => category.menu_items)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost_price: number | null;

  @Column({
    type: 'enum',
    enum: FoodType,
    default: FoodType.VEG,
  })
  food_type: FoodType;

  @Column({
    type: 'enum',
    enum: SpicyLevel,
    default: SpicyLevel.NONE,
  })
  spicy_level: SpicyLevel;

  @Column({
    type: 'enum',
    enum: PortionSize,
    default: PortionSize.MEDIUM,
  })
  portion_size: PortionSize;

  @Column({ type: 'int', nullable: true })
  preparation_time: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @Column({ type: 'json', nullable: true })
  gallery: string[] | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  barcode: string | null;

  @Column({ type: 'text', nullable: true })
  qr_code: string | null;

  @Column({ type: 'json', nullable: true })
  nutritional_values: any;

  @Column({ type: 'json', nullable: true })
  allergens: string[] | null;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @Column({ type: 'boolean', default: false })
  is_combo: boolean;

  @Column({ type: 'json', nullable: true })
  combo_items: any[] | null;

  @Column({ type: 'json', nullable: true })
  variants: any[] | null;

  @Column({ type: 'json', nullable: true })
  add_ons: any[] | null;

  @Column({ type: 'json', nullable: true })
  modifiers: any[] | null;

  @Column({ type: 'json', nullable: true })
  dynamic_pricing: any;

  @Column({ type: 'date', nullable: true })
  seasonal_price_start: Date | null;

  @Column({ type: 'date', nullable: true })
  seasonal_price_end: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  seasonal_price: number | null;

  @ManyToMany(() => Kitchen)
  @JoinTable({
    name: 'menu_item_kitchens',
    joinColumn: { name: 'menu_item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'kitchen_id', referencedColumnName: 'id' },
  })
  kitchens: Kitchen[];

  @Column({ type: 'varchar', length: 36, nullable: true })
  printer_id: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'int', default: 0 })
  total_sold: number;
}
