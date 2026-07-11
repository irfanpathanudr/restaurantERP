import AppDataSource from '../config/database';
import { Restaurant } from '../database/entities/Restaurant.entity';
import { CreateRestaurantDto } from '../dto/restaurant/CreateRestaurantDto';
import { UpdateRestaurantDto } from '../dto/restaurant/UpdateRestaurantDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class RestaurantService {
  private get restaurantRepository(): Repository<Restaurant> {
    return AppDataSource.getRepository(Restaurant);
  }

  async create(data: CreateRestaurantDto): Promise<Restaurant> {
    try {
      // Check if restaurant with same name already exists
      const existingRestaurant = await this.restaurantRepository.findOne({
        where: { name: data.name },
      });

      if (existingRestaurant) {
        throw new Error('Restaurant with this name already exists');
      }

      const restaurant = this.restaurantRepository.create(data);
      await this.restaurantRepository.save(restaurant);

      logger.info(`Restaurant created: ${restaurant.id}`);
      return restaurant;
    } catch (error) {
      logger.error('Error creating restaurant:', error);
      throw error;
    }
  }

  async findAll(): Promise<Restaurant[]> {
    try {
      const restaurants = await this.restaurantRepository.find({
        relations: ['branches'],
        order: { createdAt: 'DESC' },
      });
      return restaurants;
    } catch (error) {
      logger.error('Error fetching restaurants:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Restaurant | null> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id },
        relations: ['branches'],
      });
      return restaurant;
    } catch (error) {
      logger.error(`Error fetching restaurant ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateRestaurantDto): Promise<Restaurant> {
    try {
      const restaurant = await this.restaurantRepository.findOne({ where: { id } });

      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      Object.assign(restaurant, data);
      await this.restaurantRepository.save(restaurant);

      logger.info(`Restaurant updated: ${restaurant.id}`);
      return restaurant;
    } catch (error) {
      logger.error(`Error updating restaurant ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const restaurant = await this.restaurantRepository.findOne({ where: { id } });

      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      await this.restaurantRepository.softRemove(restaurant);
      logger.info(`Restaurant deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting restaurant ${id}:`, error);
      throw error;
    }
  }
}
