import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order.entity';
import { MenuItem } from './MenuItem.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ type: 'varchar', length: 36 })
  order_id: string;

  @ManyToOne(() => Order, (order) => order.order_items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 36 })
  menu_item_id: string;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'menu_item_id' })
  menu_item: MenuItem;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'json', nullable: true })
  variants: any;

  @Column({ type: 'json', nullable: true })
  add_ons: any[] | null;

  @Column({ type: 'json', nullable: true })
  modifiers: any[] | null;

  @Column({ type: 'text', nullable: true })
  special_instructions: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  kot_id: string | null;
}
