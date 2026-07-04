import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { MenuItem } from './MenuItem.entity';
import { RecipeIngredient } from './RecipeIngredient.entity';

@Entity('recipes')
export class Recipe extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 36 })
  menu_item_id: string;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'menu_item_id' })
  menu_item: MenuItem;

  @Column({ type: 'int', nullable: true })
  preparation_time: number | null;

  @Column({ type: 'int', nullable: true })
  cooking_time: number | null;

  @Column({ type: 'int', default: 1 })
  serving_size: number;

  @Column({ type: 'text', nullable: true })
  preparation_steps: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost_per_serving: number;

  @Column({ type: 'int', default: 1 })
  version: number;

  @OneToMany(() => RecipeIngredient, (ingredient) => ingredient.recipe, { cascade: true })
  ingredients: RecipeIngredient[];
}
