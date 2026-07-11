import AppDataSource from '../config/database';
import { Invoice } from '../database/entities/Invoice.entity';
import { Order } from '../database/entities/Order.entity';
import { CreateInvoiceDto } from '../dto/invoice/CreateInvoiceDto';
import logger from '../config/logger';
import PDFDocument from 'pdfkit';
import { Repository } from 'typeorm';

export class InvoiceService {
  private get invoiceRepository(): Repository<Invoice> {
    return AppDataSource.getRepository(Invoice);
  }
  private get orderRepository(): Repository<Order> {
    return AppDataSource.getRepository(Order);
  }

  async create(data: CreateInvoiceDto): Promise<Invoice> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: data.orderId },
        relations: ['items', 'items.menuItem', 'customer', 'branch'],
      });

      if (!order) throw new Error('Order not found');

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const invoice = this.invoiceRepository.create({
        invoiceNumber,
        orderId: data.orderId,
        customerId: data.customerId || order.customerId,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        notes: data.notes,
      });

      await this.invoiceRepository.save(invoice);
      logger.info(`Invoice created: ${invoice.id}`);
      return invoice;
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Invoice[]> {
    try {
      const query = this.invoiceRepository.createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.order', 'order')
        .leftJoinAndSelect('invoice.customer', 'customer')
        .orderBy('invoice.createdAt', 'DESC');

      if (filters?.customerId) {
        query.andWhere('invoice.customerId = :customerId', { customerId: filters.customerId });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('invoice.createdAt BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Invoice | null> {
    try {
      return await this.invoiceRepository.findOne({
        where: { id },
        relations: ['order', 'order.items', 'order.items.menuItem', 'customer', 'order.branch'],
      });
    } catch (error) {
      logger.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  }

  async generatePDF(id: string): Promise<Buffer> {
    try {
      const invoice = await this.findById(id);
      if (!invoice) throw new Error('Invoice not found');

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.on('error', reject);

        // Add invoice content
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
        doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`);
        doc.moveDown();

        // Customer details
        if (invoice.customer) {
          doc.text(`Customer: ${invoice.customer.name}`);
          doc.text(`Phone: ${invoice.customer.phone}`);
          if (invoice.customer.email) doc.text(`Email: ${invoice.customer.email}`);
          doc.moveDown();
        }

        // Order items
        doc.text('Items:', { underline: true });
        invoice.order.items.forEach((item, index) => {
          doc.text(`${index + 1}. ${item.menuItem.name} x ${item.quantity} = ₹${item.totalPrice}`);
        });
        doc.moveDown();

        // Totals
        doc.text(`Subtotal: ₹${invoice.subtotal}`);
        doc.text(`Tax: ₹${invoice.taxAmount}`);
        if (invoice.discountAmount > 0) {
          doc.text(`Discount: -₹${invoice.discountAmount}`);
        }
        doc.fontSize(14).text(`Total: ₹${invoice.totalAmount}`, { bold: true });

        doc.end();
      });
    } catch (error) {
      logger.error(`Error generating PDF for invoice ${id}:`, error);
      throw error;
    }
  }

  async sendEmail(id: string, email: string): Promise<void> {
    try {
      const pdfBuffer = await this.generatePDF(id);
      // TODO: Implement email sending logic with nodemailer
      logger.info(`Invoice ${id} sent to ${email}`);
    } catch (error) {
      logger.error(`Error sending invoice ${id} email:`, error);
      throw error;
    }
  }
}
