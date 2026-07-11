import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Recipe } from './Recipe.entity';
import { RawMaterial } from './RawMaterial.entity';

@Entity('recipe_ingredients')
export class RecipeIngredient extends BaseEntity {
  @Column({ type: 'varchar', length: 36 })
  recipe_id: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients)
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @Column({ type: 'varchar', length: 36 })
  raw_material_id: string;

  @ManyToOne(() => RawMaterial)
  @JoinColumn({ name: 'raw_material_id' })
  raw_material: RawMaterial;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'text', nullable: true })
  preparation_notes: string | null;
}
