import { Request, Response, NextFunction } from 'express';
import { MenuItemService } from '../services/menu-item.service';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export class MenuItemController {
  private menuItemService = new MenuItemService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const menuItem = await this.menuItemService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, categoryId, type, isAvailable, search } = req.query;
      const menuItems = await this.menuItemService.findAll({
        branchId: branchId as string | undefined,
        categoryId: categoryId as string | undefined,
        type: type as string | undefined,
        isAvailable:
          typeof isAvailable === 'string' ? isAvailable === 'true' : undefined,
        search: search as string | undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        data: menuItems,
      });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q, categoryId, foodType, isAvailable } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const menuItems = await this.menuItemService.searchMenuItems(q, {
        categoryId: categoryId as string | undefined,
        foodType: foodType as string | undefined,
        isAvailable: typeof isAvailable === 'string' ? isAvailable === 'true' : undefined,
      });

      res.status(200).json({
        success: true,
        message: `Found ${menuItems.length} menu items`,
        data: menuItems,
      });
    } catch (error) {
      next(error);
    }
  };

  getWithImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { categoryId, isAvailable } = req.query;
      const menuItems = await this.menuItemService.getMenuItemsWithImages({
        categoryId: categoryId as string | undefined,
        isAvailable: typeof isAvailable === 'string' ? isAvailable === 'true' : undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Menu items with images retrieved successfully',
        data: menuItems,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const menuItem = await this.menuItemService.findById(id);
      if (!menuItem) {
        res.status(404).json({ success: false, message: 'Menu item not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Menu item retrieved successfully',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const menuItem = await this.menuItemService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Menu item updated successfully',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.menuItemService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Menu item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  toggleAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const menuItem = await this.menuItemService.toggleAvailability(id);
      res.status(200).json({
        success: true,
        message: 'Menu item availability updated successfully',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file uploaded',
        });
        return;
      }

      const imageUrl = `/uploads/menu-images/${req.file.filename}`;
      
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: { imageUrl, filename: req.file.filename },
      });
    } catch (error) {
      next(error);
    }
  };

  exportTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get categories for reference
      const categories = await this.menuItemService.getAllCategories();
      
      // Create template data
      const templateData = [
        {
          name: 'Example Pizza',
          sku: 'PIZZA-001',
          description: 'Delicious cheese pizza',
          price: 12.99,
          cost_price: 6.50,
          category_name: categories[0]?.name || 'Main Course',
          food_type: 'veg',
          spicy_level: 'mild',
          portion_size: 'medium',
          preparation_time: 20,
          image_url: 'https://example.com/pizza.jpg',
          allergens: 'Dairy, Gluten',
          is_available: 'yes',
        },
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, // name
        { wch: 15 }, // sku
        { wch: 30 }, // description
        { wch: 10 }, // price
        { wch: 12 }, // cost_price
        { wch: 15 }, // category_name
        { wch: 12 }, // food_type
        { wch: 12 }, // spicy_level
        { wch: 12 }, // portion_size
        { wch: 15 }, // preparation_time
        { wch: 40 }, // image_url
        { wch: 20 }, // allergens
        { wch: 12 }, // is_available
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Menu Items');

      // Create categories sheet
      const categoriesData = categories.map(cat => ({
        category_name: cat.name,
        description: cat.description || '',
      }));
      const categoriesWs = XLSX.utils.json_to_sheet(categoriesData);
      XLSX.utils.book_append_sheet(wb, categoriesWs, 'Categories');

      // Create instructions sheet
      const instructions = [
        { Field: 'name', Required: 'Yes', Description: 'Name of the menu item' },
        { Field: 'sku', Required: 'Yes', Description: 'Unique SKU code' },
        { Field: 'description', Required: 'No', Description: 'Item description' },
        { Field: 'price', Required: 'Yes', Description: 'Selling price (number)' },
        { Field: 'cost_price', Required: 'No', Description: 'Cost price (number)' },
        { Field: 'category_name', Required: 'Yes', Description: 'Category name (must match existing category)' },
        { Field: 'food_type', Required: 'No', Description: 'veg, non_veg, egg, or jain' },
        { Field: 'spicy_level', Required: 'No', Description: 'none, mild, medium, hot, or extra_hot' },
        { Field: 'portion_size', Required: 'No', Description: 'small, medium, large, or custom' },
        { Field: 'preparation_time', Required: 'No', Description: 'Prep time in minutes (number)' },
        { Field: 'image_url', Required: 'No', Description: 'URL to image or upload separately' },
        { Field: 'allergens', Required: 'No', Description: 'Comma-separated allergens' },
        { Field: 'is_available', Required: 'No', Description: 'yes or no (default: yes)' },
      ];
      const instructionsWs = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=menu-items-template-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  importMenus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      // Read the Excel file
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No data found in the file',
        });
        return;
      }

      // Get all categories for mapping
      const categories = await this.menuItemService.getAllCategories();
      const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));

      const results = {
        success: [] as any[],
        failed: [] as any[],
      };

      // Process each row
      for (const [index, row] of data.entries()) {
        try {
          const rowData = row as any;

          // Validate required fields
          if (!rowData.name || !rowData.sku || !rowData.price) {
            results.failed.push({
              row: index + 2,
              data: rowData,
              error: 'Missing required fields (name, sku, or price)',
            });
            continue;
          }

          // Find category
          const categoryName = rowData.category_name?.toLowerCase();
          const categoryId = categoryName ? categoryMap.get(categoryName) : null;

          if (!categoryId) {
            results.failed.push({
              row: index + 2,
              data: rowData,
              error: `Category '${rowData.category_name}' not found`,
            });
            continue;
          }

          // Prepare menu item data
          const menuItemData = {
            name: rowData.name.trim(),
            sku: rowData.sku.trim(),
            description: rowData.description?.trim() || undefined,
            price: parseFloat(rowData.price),
            cost_price: rowData.cost_price ? parseFloat(rowData.cost_price) : undefined,
            category_id: categoryId,
            food_type: rowData.food_type || 'veg',
            spicy_level: rowData.spicy_level || undefined,
            portion_size: rowData.portion_size || undefined,
            preparation_time: rowData.preparation_time ? parseInt(rowData.preparation_time) : undefined,
            image: rowData.image_url?.trim() || undefined,
            allergens: rowData.allergens ? rowData.allergens.split(',').map((a: string) => a.trim()) : undefined,
            is_available: rowData.is_available?.toLowerCase() !== 'no',
          };

          // Create menu item
          const menuItem = await this.menuItemService.create(menuItemData);
          results.success.push({
            row: index + 2,
            name: menuItem.name,
            sku: menuItem.sku,
          });
        } catch (error: any) {
          results.failed.push({
            row: index + 2,
            data: row,
            error: error.message || 'Unknown error',
          });
        }
      }

      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});

      res.status(200).json({
        success: true,
        message: `Import completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  };

  exportMenus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { categoryId, isAvailable } = req.query;
      
      // Get menu items
      const menuItems = await this.menuItemService.findAll({
        categoryId: categoryId as string | undefined,
        isAvailable: typeof isAvailable === 'string' ? isAvailable === 'true' : undefined,
      });

      // Transform data for export
      const exportData = menuItems.map((item: any) => ({
        name: item.name,
        sku: item.sku,
        description: item.description || '',
        price: item.price,
        cost_price: item.cost_price || '',
        category_name: item.category?.name || '',
        food_type: item.food_type || 'veg',
        spicy_level: item.spicy_level || '',
        portion_size: item.portion_size || '',
        preparation_time: item.preparation_time || '',
        image_url: item.image || '',
        allergens: Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens || '',
        is_available: item.is_available ? 'yes' : 'no',
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 12 },
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
        { wch: 40 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Menu Items');

      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=menu-items-export-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}
