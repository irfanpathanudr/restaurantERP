import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurant.service';

export class RestaurantController {
  private restaurantService = new RestaurantService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const restaurant = await this.restaurantService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Restaurant created successfully',
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const restaurants = await this.restaurantService.findAll();

      res.status(200).json({
        success: true,
        message: 'Restaurants retrieved successfully',
        data: restaurants,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const restaurant = await this.restaurantService.findById(id);

      if (!restaurant) {
        res.status(404).json({
          success: false,
          message: 'Restaurant not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Restaurant retrieved successfully',
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const restaurant = await this.restaurantService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Restaurant updated successfully',
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.restaurantService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Restaurant deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
