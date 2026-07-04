import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Restaurant } from './Restaurant.entity';
import { Kitchen } from './Kitchen.entity';
import { Table } from './Table.entity';

@Entity('branches')
export class Branch extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 36 })
  restaurant_id: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.branches)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 20 })
  pincode: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gst_number: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  parent_branch_id: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  manager_id: string | null;

  @Column({ type: 'json', nullable: true })
  business_hours: any;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  service_charge_percentage: number;

  @Column({ type: 'json', nullable: true })
  tax_configuration: any;

  @OneToMany(() => Kitchen, (kitchen) => kitchen.branch)
  kitchens: Kitchen[];

  @OneToMany(() => Table, (table) => table.branch)
  tables: Table[];
}
