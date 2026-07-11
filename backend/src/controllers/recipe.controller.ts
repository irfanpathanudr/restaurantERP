import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '../services/recipe.service';

export class RecipeController {
  private recipeService = new RecipeService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipe = await this.recipeService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Recipe created successfully',
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { menuItemId, search } = req.query;
      const recipes = await this.recipeService.findAll({
        menuItemId: menuItemId as string,
        search: search as string,
      });
      res.status(200).json({
        success: true,
        message: 'Recipes retrieved successfully',
        data: recipes,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const recipe = await this.recipeService.findById(id);
      if (!recipe) {
        res.status(404).json({ success: false, message: 'Recipe not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Recipe retrieved successfully',
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  };

  findByMenuItemId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { menuItemId } = req.params;
      const recipe = await this.recipeService.findByMenuItemId(menuItemId);
      if (!recipe) {
        res.status(404).json({ success: false, message: 'Recipe not found for this menu item' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Recipe retrieved successfully',
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const recipe = await this.recipeService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Recipe updated successfully',
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.recipeService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Recipe deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  calculateCost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const costs = await this.recipeService.calculateRecipeCost(id);
      res.status(200).json({
        success: true,
        message: 'Recipe cost calculated successfully',
        data: costs,
      });
    } catch (error) {
      next(error);
    }
  };
}
