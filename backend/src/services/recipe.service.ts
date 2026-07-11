import AppDataSource from '../config/database';
import { Recipe } from '../database/entities/Recipe.entity';
import { RecipeIngredient } from '../database/entities/RecipeIngredient.entity';
import { RawMaterial } from '../database/entities/RawMaterial.entity';
import { CreateRecipeDto } from '../dto/recipe/CreateRecipeDto';
import { UpdateRecipeDto } from '../dto/recipe/UpdateRecipeDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class RecipeService {
  private get recipeRepository(): Repository<Recipe> {
    return AppDataSource.getRepository(Recipe);
  }

  private get recipeIngredientRepository(): Repository<RecipeIngredient> {
    return AppDataSource.getRepository(RecipeIngredient);
  }

  private get rawMaterialRepository(): Repository<RawMaterial> {
    return AppDataSource.getRepository(RawMaterial);
  }

  async create(data: CreateRecipeDto): Promise<Recipe> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create recipe
      const recipe = this.recipeRepository.create({
        name: data.name,
        code: data.code,
        description: data.description,
        menu_item_id: data.menu_item_id,
        preparation_time: data.preparation_time,
        cooking_time: data.cooking_time,
        serving_size: data.serving_size || 1,
        preparation_steps: data.preparation_steps,
        version: 1,
      });

      await queryRunner.manager.save(recipe);

      // Create recipe ingredients and calculate total cost
      let totalCost = 0;
      for (const ingredientData of data.ingredients) {
        const rawMaterial = await this.rawMaterialRepository.findOne({
          where: { id: ingredientData.raw_material_id },
        });

        if (!rawMaterial) {
          throw new Error(`Raw material not found: ${ingredientData.raw_material_id}`);
        }

        const cost = ingredientData.cost || (rawMaterial.cost_per_unit * ingredientData.quantity);
        totalCost += cost;

        const ingredient = this.recipeIngredientRepository.create({
          recipe_id: recipe.id,
          raw_material_id: ingredientData.raw_material_id,
          quantity: ingredientData.quantity,
          unit: ingredientData.unit,
          cost,
          sort_order: ingredientData.sort_order || 0,
          preparation_notes: ingredientData.preparation_notes,
        });

        await queryRunner.manager.save(ingredient);
      }

      // Update recipe with total cost
      recipe.total_cost = totalCost;
      recipe.cost_per_serving = totalCost / recipe.serving_size;
      await queryRunner.manager.save(recipe);

      await queryRunner.commitTransaction();
      logger.info(`Recipe created: ${recipe.id}`);

      return await this.findById(recipe.id) as Recipe;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Error creating recipe:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: {
    menuItemId?: string;
    search?: string;
  }): Promise<Recipe[]> {
    try {
      const query = this.recipeRepository
        .createQueryBuilder('recipe')
        .leftJoinAndSelect('recipe.menu_item', 'menu_item')
        .leftJoinAndSelect('recipe.ingredients', 'ingredients')
        .leftJoinAndSelect('ingredients.raw_material', 'raw_material')
        .orderBy('recipe.name', 'ASC')
        .addOrderBy('ingredients.sort_order', 'ASC');

      if (filters?.menuItemId) {
        query.andWhere('recipe.menu_item_id = :menuItemId', { menuItemId: filters.menuItemId });
      }

      if (filters?.search) {
        query.andWhere('(recipe.name LIKE :search OR recipe.code LIKE :search)', {
          search: `%${filters.search}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching recipes:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Recipe | null> {
    try {
      return await this.recipeRepository.findOne({
        where: { id },
        relations: ['menu_item', 'ingredients', 'ingredients.raw_material'],
        order: {
          ingredients: {
            sort_order: 'ASC',
          },
        },
      });
    } catch (error) {
      logger.error(`Error fetching recipe ${id}:`, error);
      throw error;
    }
  }

  async findByMenuItemId(menuItemId: string): Promise<Recipe | null> {
    try {
      return await this.recipeRepository.findOne({
        where: { menu_item_id: menuItemId },
        relations: ['menu_item', 'ingredients', 'ingredients.raw_material'],
        order: {
          ingredients: {
            sort_order: 'ASC',
          },
        },
      });
    } catch (error) {
      logger.error(`Error fetching recipe for menu item ${menuItemId}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateRecipeDto): Promise<Recipe> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const recipe = await this.recipeRepository.findOne({
        where: { id },
        relations: ['ingredients'],
      });

      if (!recipe) {
        throw new Error('Recipe not found');
      }

      // Update recipe basic info
      if (data.name) recipe.name = data.name;
      if (data.code) recipe.code = data.code;
      if (data.description !== undefined) recipe.description = data.description;
      if (data.menu_item_id) recipe.menu_item_id = data.menu_item_id;
      if (data.preparation_time !== undefined) recipe.preparation_time = data.preparation_time;
      if (data.cooking_time !== undefined) recipe.cooking_time = data.cooking_time;
      if (data.serving_size) recipe.serving_size = data.serving_size;
      if (data.preparation_steps !== undefined) recipe.preparation_steps = data.preparation_steps;

      // Increment version
      recipe.version += 1;

      await queryRunner.manager.save(recipe);

      // Update ingredients if provided
      if (data.ingredients) {
        // Delete existing ingredients
        await queryRunner.manager.delete(RecipeIngredient, { recipe_id: id });

        // Create new ingredients
        let totalCost = 0;
        for (const ingredientData of data.ingredients) {
          const rawMaterial = await this.rawMaterialRepository.findOne({
            where: { id: ingredientData.raw_material_id },
          });

          if (!rawMaterial) {
            throw new Error(`Raw material not found: ${ingredientData.raw_material_id}`);
          }

          const cost = ingredientData.cost || (rawMaterial.cost_per_unit * ingredientData.quantity);
          totalCost += cost;

          const ingredient = this.recipeIngredientRepository.create({
            recipe_id: recipe.id,
            raw_material_id: ingredientData.raw_material_id,
            quantity: ingredientData.quantity,
            unit: ingredientData.unit,
            cost,
            sort_order: ingredientData.sort_order || 0,
            preparation_notes: ingredientData.preparation_notes,
          });

          await queryRunner.manager.save(ingredient);
        }

        // Update recipe cost
        recipe.total_cost = totalCost;
        recipe.cost_per_serving = totalCost / recipe.serving_size;
        await queryRunner.manager.save(recipe);
      }

      await queryRunner.commitTransaction();
      logger.info(`Recipe updated: ${id}`);

      return await this.findById(id) as Recipe;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error updating recipe ${id}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const recipe = await this.recipeRepository.findOne({ where: { id } });
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      await this.recipeRepository.softRemove(recipe);
      logger.info(`Recipe deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting recipe ${id}:`, error);
      throw error;
    }
  }

  async calculateRecipeCost(id: string): Promise<{ totalCost: number; costPerServing: number }> {
    try {
      const recipe = await this.recipeRepository.findOne({
        where: { id },
        relations: ['ingredients', 'ingredients.raw_material'],
      });

      if (!recipe) {
        throw new Error('Recipe not found');
      }

      let totalCost = 0;
      for (const ingredient of recipe.ingredients) {
        const cost = ingredient.raw_material.cost_per_unit * ingredient.quantity;
        totalCost += cost;
      }

      const costPerServing = totalCost / recipe.serving_size;

      // Update recipe with calculated costs
      recipe.total_cost = totalCost;
      recipe.cost_per_serving = costPerServing;
      await this.recipeRepository.save(recipe);

      logger.info(`Recipe cost calculated: ${id} -> Total: ${totalCost}, Per Serving: ${costPerServing}`);

      return { totalCost, costPerServing };
    } catch (error) {
      logger.error(`Error calculating recipe cost ${id}:`, error);
      throw error;
    }
  }
}
