import AppDataSource from '../config/database';
import { Invoice, InvoiceType } from '../database/entities/Invoice.entity';
import { Order, OrderStatus, PaymentStatus } from '../database/entities/Order.entity';
import { Table, TableStatus } from '../database/entities/Table.entity';
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
        relations: ['order_items', 'order_items.menu_item', 'customer', 'branch', 'table'],
      });

      if (!order) throw new Error('Order not found');

      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const taxHalf = Number((Number(order.tax_amount) / 2).toFixed(2));

      const invoice = this.invoiceRepository.create({
        invoice_number: invoiceNumber,
        invoice_type: InvoiceType.INVOICE,
        order_id: data.orderId,
        customer_id: data.customerId || order.customer_id,
        branch_id: order.branch_id,
        invoice_date: new Date(),
        subtotal: Number(order.subtotal),
        discount_amount: Number(order.discount_amount) || 0,
        cgst_amount: taxHalf,
        cgst_percentage: Number(order.tax_percentage) / 2 || 2.5,
        sgst_amount: taxHalf,
        sgst_percentage: Number(order.tax_percentage) / 2 || 2.5,
        igst_amount: 0,
        igst_percentage: 0,
        service_charge: Number(order.service_charge) || 0,
        rounding_amount: Number(order.rounding_amount) || 0,
        grand_total: Number(order.grand_total),
        notes: data.notes || null,
        print_count: 0,
      });

      await this.invoiceRepository.save(invoice);

      order.order_status = OrderStatus.COMPLETED;
      order.payment_status = PaymentStatus.PAID;
      order.paid_amount = Number(order.grand_total);
      order.due_amount = 0;
      order.completed_at = new Date();
      await this.orderRepository.save(order);

      if (order.table_id) {
        await AppDataSource.getRepository(Table).update(order.table_id, {
          table_status: TableStatus.AVAILABLE,
          current_order_id: null,
        });
      }

      logger.info(`Invoice created: ${invoice.id}`);
      return (await this.findById(invoice.id)) as Invoice;
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
      const query = this.invoiceRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.order', 'order')
        .leftJoinAndSelect('invoice.customer', 'customer')
        .where('invoice.deleted_at IS NULL')
        .orderBy('invoice.created_at', 'DESC');

      if (filters?.customerId) {
        query.andWhere('invoice.customer_id = :customerId', { customerId: filters.customerId });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('invoice.created_at BETWEEN :startDate AND :endDate', {
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
        relations: [
          'order',
          'order.order_items',
          'order.order_items.menu_item',
          'order.table',
          'customer',
          'branch',
        ],
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
          resolve(Buffer.concat(buffers));
        });
        doc.on('error', reject);

        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice Number: ${invoice.invoice_number}`);
        doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`);
        doc.moveDown();

        if (invoice.customer) {
          doc.text(`Customer: ${(invoice.customer as any).name || ''}`);
          doc.moveDown();
        }

        if (invoice.order?.table) {
          doc.text(`Table: ${invoice.order.table.table_number}`);
          doc.moveDown();
        }

        doc.text('Items:');
        doc.moveDown(0.5);
        (invoice.order?.order_items || []).forEach((item) => {
          doc.text(
            `${item.item_name} x${item.quantity} - ₹${Number(item.total).toFixed(2)}`
          );
        });

        doc.moveDown();
        doc.text(`Subtotal: ₹${Number(invoice.subtotal).toFixed(2)}`);
        doc.text(`CGST: ₹${Number(invoice.cgst_amount).toFixed(2)}`);
        doc.text(`SGST: ₹${Number(invoice.sgst_amount).toFixed(2)}`);
        doc.text(`Grand Total: ₹${Number(invoice.grand_total).toFixed(2)}`);
        doc.end();
      });
    } catch (error) {
      logger.error(`Error generating PDF for invoice ${id}:`, error);
      throw error;
    }
  }

  async sendEmail(_id: string, _email: string): Promise<void> {
    logger.info('Invoice email send is not configured yet');
  }
}
