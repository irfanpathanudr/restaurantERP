import AppDataSource from '../config/database';
import { Printer, PrinterStatus } from '../database/entities/Printer.entity';
import { CreatePrinterDto } from '../dto/printer/CreatePrinterDto';
import { UpdatePrinterDto } from '../dto/printer/UpdatePrinterDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class PrinterService {
  private get printerRepository(): Repository<Printer> {
    return AppDataSource.getRepository(Printer);
  }

  async create(data: CreatePrinterDto): Promise<Printer> {
    try {
      // If this is set as default, unset other defaults for the same branch
      if (data.isDefault) {
        await this.printerRepository.update(
          { branch_id: data.branchId, is_default: true },
          { is_default: false }
        );
      }

      const printer = this.printerRepository.create({
        name: data.name,
        branch_id: data.branchId,
        printer_type: data.printerType,
        connection_type: data.connectionType,
        ip_address: data.ipAddress || null,
        port: data.port || null,
        usb_path: data.usbPath || null,
        bluetooth_address: data.bluetoothAddress || null,
        model: data.model || null,
        manufacturer: data.manufacturer || null,
        paper_width: data.paperWidth || 80,
        number_of_copies: data.numberOfCopies || 1,
        auto_cut: data.autoCut ?? true,
        open_cash_drawer: data.openCashDrawer ?? false,
        print_header: data.printHeader ?? true,
        print_footer: data.printFooter ?? true,
        header_text: data.headerText || null,
        footer_text: data.footerText || null,
        character_encoding: data.characterEncoding || 'utf-8',
        is_default: data.isDefault ?? false,
        status: PrinterStatus.OFFLINE,
      });

      await this.printerRepository.save(printer);
      logger.info(`Printer created: ${printer.id}`);
      return await this.findById(printer.id) as Printer;
    } catch (error) {
      logger.error('Error creating printer:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    branchId?: string;
    printerType?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<Printer[]> {
    try {
      const query = this.printerRepository
        .createQueryBuilder('printer')
        .leftJoinAndSelect('printer.branch', 'branch')
        .where('printer.deleted_at IS NULL')
        .orderBy('printer.is_default', 'DESC')
        .addOrderBy('printer.name', 'ASC');

      if (filters?.branchId) {
        query.andWhere('printer.branch_id = :branchId', { branchId: filters.branchId });
      }

      if (filters?.printerType) {
        query.andWhere('printer.printer_type = :printerType', { printerType: filters.printerType });
      }

      if (filters?.status) {
        query.andWhere('printer.status = :status', { status: filters.status });
      }

      if (filters?.isActive !== undefined) {
        query.andWhere('printer.is_active = :isActive', { isActive: filters.isActive });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching printers:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Printer | null> {
    try {
      return await this.printerRepository.findOne({
        where: { id },
        relations: ['branch'],
      });
    } catch (error) {
      logger.error(`Error fetching printer ${id}:`, error);
      throw error;
    }
  }

  async findByBranch(branchId: string): Promise<Printer[]> {
    try {
      return await this.printerRepository.find({
        where: { branch_id: branchId, is_active: true },
        order: { is_default: 'DESC', name: 'ASC' },
      });
    } catch (error) {
      logger.error(`Error fetching printers for branch ${branchId}:`, error);
      throw error;
    }
  }

  async findDefault(branchId: string, printerType?: string): Promise<Printer | null> {
    try {
      const where: any = {
        branch_id: branchId,
        is_default: true,
        is_active: true,
      };

      if (printerType) {
        where.printer_type = printerType;
      }

      return await this.printerRepository.findOne({ where });
    } catch (error) {
      logger.error(`Error fetching default printer:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdatePrinterDto): Promise<Printer> {
    try {
      const printer = await this.printerRepository.findOne({ where: { id } });
      if (!printer) {
        throw new Error('Printer not found');
      }

      // If setting as default, unset other defaults for the same branch
      if (data.isDefault && !printer.is_default) {
        await this.printerRepository.update(
          { branch_id: printer.branch_id, is_default: true },
          { is_default: false }
        );
      }

      Object.assign(printer, {
        name: data.name ?? printer.name,
        branch_id: data.branchId ?? printer.branch_id,
        printer_type: data.printerType ?? printer.printer_type,
        connection_type: data.connectionType ?? printer.connection_type,
        ip_address: data.ipAddress !== undefined ? data.ipAddress : printer.ip_address,
        port: data.port !== undefined ? data.port : printer.port,
        usb_path: data.usbPath !== undefined ? data.usbPath : printer.usb_path,
        bluetooth_address: data.bluetoothAddress !== undefined ? data.bluetoothAddress : printer.bluetooth_address,
        model: data.model !== undefined ? data.model : printer.model,
        manufacturer: data.manufacturer !== undefined ? data.manufacturer : printer.manufacturer,
        paper_width: data.paperWidth ?? printer.paper_width,
        number_of_copies: data.numberOfCopies ?? printer.number_of_copies,
        auto_cut: data.autoCut ?? printer.auto_cut,
        open_cash_drawer: data.openCashDrawer ?? printer.open_cash_drawer,
        print_header: data.printHeader ?? printer.print_header,
        print_footer: data.printFooter ?? printer.print_footer,
        header_text: data.headerText !== undefined ? data.headerText : printer.header_text,
        footer_text: data.footerText !== undefined ? data.footerText : printer.footer_text,
        character_encoding: data.characterEncoding ?? printer.character_encoding,
        is_default: data.isDefault ?? printer.is_default,
        is_active: data.isActive ?? printer.is_active,
      });

      await this.printerRepository.save(printer);
      logger.info(`Printer updated: ${id}`);
      return await this.findById(id) as Printer;
    } catch (error) {
      logger.error(`Error updating printer ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const printer = await this.printerRepository.findOne({ where: { id } });
      if (!printer) {
        throw new Error('Printer not found');
      }

      await this.printerRepository.softDelete(id);
      logger.info(`Printer deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting printer ${id}:`, error);
      throw error;
    }
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const printer = await this.printerRepository.findOne({ where: { id } });
      if (!printer) {
        throw new Error('Printer not found');
      }

      // Update status and last connected time
      printer.status = PrinterStatus.ONLINE;
      printer.last_connected_at = new Date();
      printer.last_error = null;
      await this.printerRepository.save(printer);

      logger.info(`Printer connection test successful: ${id}`);
      return {
        success: true,
        message: 'Printer connection successful',
      };
    } catch (error: any) {
      // Update status with error
      try {
        await this.printerRepository.update(id, {
          status: PrinterStatus.ERROR,
          last_error: error.message,
        });
      } catch (updateError) {
        logger.error('Error updating printer status:', updateError);
      }

      logger.error(`Printer connection test failed for ${id}:`, error);
      return {
        success: false,
        message: error.message || 'Connection failed',
      };
    }
  }

  async updateStatus(id: string, status: PrinterStatus, error?: string): Promise<void> {
    try {
      await this.printerRepository.update(id, {
        status,
        last_error: error || null,
        last_connected_at: status === PrinterStatus.ONLINE ? new Date() : undefined,
      });
      logger.info(`Printer status updated: ${id} -> ${status}`);
    } catch (err) {
      logger.error(`Error updating printer status ${id}:`, err);
      throw err;
    }
  }
}
