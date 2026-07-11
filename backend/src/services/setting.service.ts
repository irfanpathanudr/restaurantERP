import AppDataSource from '../config/database';
import { Setting, SettingCategory } from '../database/entities/Setting.entity';
import { CreateSettingDto } from '../dto/setting/CreateSettingDto';
import { UpdateSettingDto } from '../dto/setting/UpdateSettingDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class SettingService {
  private get settingRepository(): Repository<Setting> {
    return AppDataSource.getRepository(Setting);
  }

  /**
   * Create a new setting
   */
  async create(data: CreateSettingDto, createdBy?: string): Promise<Setting> {
    try {
      // Check if setting key already exists
      const existingSetting = await this.settingRepository.findOne({
        where: { setting_key: data.setting_key },
      });

      if (existingSetting) {
        throw new Error('Setting key already exists');
      }

      const setting = this.settingRepository.create({
        ...data,
        created_by: createdBy,
      });

      await this.settingRepository.save(setting);
      logger.info(`Setting created: ${setting.setting_key}`);
      return setting;
    } catch (error) {
      logger.error('Error creating setting:', error);
      throw error;
    }
  }

  /**
   * Get all settings
   */
  async findAll(category?: SettingCategory, branchId?: string, publicOnly?: boolean): Promise<Setting[]> {
    try {
      const query = this.settingRepository.createQueryBuilder('setting');

      if (category) {
        query.andWhere('setting.category = :category', { category });
      }

      if (branchId) {
        query.andWhere('(setting.branch_id = :branchId OR setting.branch_id IS NULL)', { branchId });
      }

      if (publicOnly) {
        query.andWhere('setting.is_public = :isPublic', { isPublic: true });
      }

      query.orderBy('setting.category', 'ASC').addOrderBy('setting.setting_key', 'ASC');

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching settings:', error);
      throw error;
    }
  }

  /**
   * Get setting by ID
   */
  async findById(id: string): Promise<Setting | null> {
    try {
      return await this.settingRepository.findOne({ where: { id } });
    } catch (error) {
      logger.error(`Error fetching setting ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get setting by key
   */
  async findByKey(key: string, branchId?: string): Promise<Setting | null> {
    try {
      const query = this.settingRepository.createQueryBuilder('setting').where('setting.setting_key = :key', { key });

      if (branchId) {
        query.andWhere('(setting.branch_id = :branchId OR setting.branch_id IS NULL)', { branchId });
        query.orderBy('setting.branch_id', 'DESC');
      }

      return await query.getOne();
    } catch (error) {
      logger.error(`Error fetching setting by key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get parsed setting value (converts to appropriate data type)
   */
  async getValue(key: string, branchId?: string): Promise<any> {
    try {
      const setting = await this.findByKey(key, branchId);
      if (!setting) {
        return null;
      }

      switch (setting.data_type) {
        case 'NUMBER':
          return parseFloat(setting.setting_value);
        case 'BOOLEAN':
          return setting.setting_value.toLowerCase() === 'true';
        case 'JSON':
          return JSON.parse(setting.setting_value);
        case 'DATE':
          return new Date(setting.setting_value);
        default:
          return setting.setting_value;
      }
    } catch (error) {
      logger.error(`Error getting setting value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Update setting
   */
  async update(id: string, data: UpdateSettingDto, updatedBy?: string): Promise<Setting> {
    try {
      const setting = await this.settingRepository.findOne({ where: { id } });
      if (!setting) {
        throw new Error('Setting not found');
      }

      if (!setting.is_editable) {
        throw new Error('This setting is not editable');
      }

      // Check if new key conflicts with existing
      if (data.setting_key && data.setting_key !== setting.setting_key) {
        const existingSetting = await this.settingRepository.findOne({
          where: { setting_key: data.setting_key },
        });
        if (existingSetting) {
          throw new Error('Setting key already exists');
        }
      }

      Object.assign(setting, data);
      if (updatedBy) {
        setting.updated_by = updatedBy;
      }

      await this.settingRepository.save(setting);
      logger.info(`Setting updated: ${id}`);
      return setting;
    } catch (error) {
      logger.error(`Error updating setting ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update setting by key
   */
  async updateByKey(key: string, value: string, branchId?: string, updatedBy?: string): Promise<Setting> {
    try {
      const setting = await this.findByKey(key, branchId);
      if (!setting) {
        throw new Error('Setting not found');
      }

      if (!setting.is_editable) {
        throw new Error('This setting is not editable');
      }

      setting.setting_value = value;
      if (updatedBy) {
        setting.updated_by = updatedBy;
      }

      await this.settingRepository.save(setting);
      logger.info(`Setting updated by key: ${key}`);
      return setting;
    } catch (error) {
      logger.error(`Error updating setting by key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete setting
   */
  async delete(id: string, deletedBy?: string): Promise<void> {
    try {
      const setting = await this.settingRepository.findOne({ where: { id } });
      if (!setting) {
        throw new Error('Setting not found');
      }

      if (!setting.is_editable) {
        throw new Error('This setting cannot be deleted');
      }

      if (deletedBy) {
        setting.deleted_by = deletedBy;
      }
      await this.settingRepository.softRemove(setting);
      logger.info(`Setting deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting setting ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get settings by category
   */
  async findByCategory(category: SettingCategory, branchId?: string): Promise<Setting[]> {
    try {
      const query = this.settingRepository
        .createQueryBuilder('setting')
        .where('setting.category = :category', { category });

      if (branchId) {
        query.andWhere('(setting.branch_id = :branchId OR setting.branch_id IS NULL)', { branchId });
      }

      query.orderBy('setting.setting_key', 'ASC');

      return await query.getMany();
    } catch (error) {
      logger.error(`Error fetching settings by category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Bulk update settings
   */
  async bulkUpdate(settings: { key: string; value: string }[], branchId?: string, updatedBy?: string): Promise<Setting[]> {
    try {
      const updatedSettings: Setting[] = [];

      for (const { key, value } of settings) {
        const setting = await this.updateByKey(key, value, branchId, updatedBy);
        updatedSettings.push(setting);
      }

      logger.info(`Bulk updated ${updatedSettings.length} settings`);
      return updatedSettings;
    } catch (error) {
      logger.error('Error bulk updating settings:', error);
      throw error;
    }
  }

  /**
   * Initialize default settings
   */
  async initializeDefaults(): Promise<void> {
    try {
      const defaultSettings = [
        // General Settings
        { setting_key: 'app_name', setting_value: 'Restaurant ERP', category: SettingCategory.GENERAL, description: 'Application name', is_public: true, is_editable: true },
        { setting_key: 'app_timezone', setting_value: 'UTC', category: SettingCategory.GENERAL, description: 'Application timezone', is_public: true, is_editable: true },
        { setting_key: 'date_format', setting_value: 'YYYY-MM-DD', category: SettingCategory.GENERAL, description: 'Date format', is_public: true, is_editable: true },
        { setting_key: 'time_format', setting_value: '24h', category: SettingCategory.GENERAL, description: 'Time format (12h/24h)', is_public: true, is_editable: true },
        
        // Business Settings
        { setting_key: 'currency', setting_value: 'USD', category: SettingCategory.BUSINESS, description: 'Default currency', is_public: true, is_editable: true },
        { setting_key: 'currency_symbol', setting_value: '$', category: SettingCategory.BUSINESS, description: 'Currency symbol', is_public: true, is_editable: true },
        { setting_key: 'business_email', setting_value: 'info@restaurant.com', category: SettingCategory.BUSINESS, description: 'Business email', is_public: true, is_editable: true },
        { setting_key: 'business_phone', setting_value: '+1234567890', category: SettingCategory.BUSINESS, description: 'Business phone', is_public: true, is_editable: true },
        
        // POS Settings
        { setting_key: 'pos_auto_print_kot', setting_value: 'true', data_type: 'BOOLEAN', category: SettingCategory.POS, description: 'Auto print KOT', is_public: false, is_editable: true },
        { setting_key: 'pos_auto_print_receipt', setting_value: 'false', data_type: 'BOOLEAN', category: SettingCategory.POS, description: 'Auto print receipt', is_public: false, is_editable: true },
        { setting_key: 'pos_order_prefix', setting_value: 'ORD', category: SettingCategory.POS, description: 'Order number prefix', is_public: false, is_editable: true },
        
        // Payment Settings
        { setting_key: 'payment_gateway', setting_value: 'stripe', category: SettingCategory.PAYMENT, description: 'Payment gateway', is_public: false, is_editable: true },
        { setting_key: 'allow_cash_payment', setting_value: 'true', data_type: 'BOOLEAN', category: SettingCategory.PAYMENT, description: 'Allow cash payments', is_public: false, is_editable: true },
        { setting_key: 'allow_card_payment', setting_value: 'true', data_type: 'BOOLEAN', category: SettingCategory.PAYMENT, description: 'Allow card payments', is_public: false, is_editable: true },
        
        // Tax Settings
        { setting_key: 'default_tax_rate', setting_value: '10', data_type: 'NUMBER', category: SettingCategory.TAX, description: 'Default tax rate (%)', is_public: false, is_editable: true },
        { setting_key: 'tax_inclusive', setting_value: 'false', data_type: 'BOOLEAN', category: SettingCategory.TAX, description: 'Tax inclusive pricing', is_public: false, is_editable: true },
        
        // Notification Settings
        { setting_key: 'email_notifications', setting_value: 'true', data_type: 'BOOLEAN', category: SettingCategory.NOTIFICATION, description: 'Enable email notifications', is_public: false, is_editable: true },
        { setting_key: 'sms_notifications', setting_value: 'false', data_type: 'BOOLEAN', category: SettingCategory.NOTIFICATION, description: 'Enable SMS notifications', is_public: false, is_editable: true },
        
        // Security Settings
        { setting_key: 'session_timeout', setting_value: '3600', data_type: 'NUMBER', category: SettingCategory.SECURITY, description: 'Session timeout (seconds)', is_public: false, is_editable: true },
        { setting_key: 'password_min_length', setting_value: '8', data_type: 'NUMBER', category: SettingCategory.SECURITY, description: 'Minimum password length', is_public: false, is_editable: true },
      ];

      for (const settingData of defaultSettings) {
        const exists = await this.findByKey(settingData.setting_key);
        if (!exists) {
          await this.settingRepository.save(this.settingRepository.create(settingData));
        }
      }

      logger.info('Default settings initialized');
    } catch (error) {
      logger.error('Error initializing default settings:', error);
      throw error;
    }
  }
}
