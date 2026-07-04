import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { MenuItem } from './MenuItem.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  parent_category_id: string | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'parent_category_id' })
  parent_category: Category;

  @OneToMany(() => Category, (category) => category.parent_category)
  sub_categories: Category[];

  @OneToMany(() => MenuItem, (menuItem) => menuItem.category)
  menu_items: MenuItem[];

  @Column({ type: 'int', default: 0 })
  sort_order: number;
}
