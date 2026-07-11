import AppDataSource from '../config/database';
import { PurchaseOrder, PurchaseOrderStatus } from '../database/entities/PurchaseOrder.entity';
import { PurchaseOrderItem } from '../database/entities/PurchaseOrderItem.entity';
import { RawMaterial } from '../database/entities/RawMaterial.entity';
import { CreatePurchaseOrderDto } from '../dto/purchase-order/CreatePurchaseOrderDto';
import { UpdatePurchaseOrderDto } from '../dto/purchase-order/UpdatePurchaseOrderDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class PurchaseOrderService {
  private get purchaseOrderRepository(): Repository<PurchaseOrder> {
    return AppDataSource.getRepository(PurchaseOrder);
  }

  private get purchaseOrderItemRepository(): Repository<PurchaseOrderItem> {
    return AppDataSource.getRepository(PurchaseOrderItem);
  }

  private get rawMaterialRepository(): Repository<RawMaterial> {
    return AppDataSource.getRepository(RawMaterial);
  }

  async create(data: CreatePurchaseOrderDto, createdBy?: string): Promise<PurchaseOrder> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate totals
      let subtotal = 0;
      for (const item of data.items) {
        subtotal += item.quantity * item.unit_price;
      }

      const taxPercentage = data.tax_percentage || 0;
      const taxAmount = (subtotal * taxPercentage) / 100;
      const discountAmount = data.discount_amount || 0;
      const shippingCost = data.shipping_cost || 0;
      const totalAmount = subtotal + taxAmount - discountAmount + shippingCost;

      // Create purchase order
      const purchaseOrder = this.purchaseOrderRepository.create({
        po_number: data.po_number,
        vendor_id: data.vendor_id,
        branch_id: data.branch_id,
        order_date: new Date(data.order_date),
        expected_delivery_date: data.expected_delivery_date ? new Date(data.expected_delivery_date) : null,
        payment_term: data.payment_term,
        subtotal,
        tax_percentage: taxPercentage,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        notes: data.notes,
        delivery_address: data.delivery_address,
        created_by: createdBy,
      });

      await queryRunner.manager.save(purchaseOrder);

      // Create purchase order items
      for (const itemData of data.items) {
        const totalPrice = itemData.quantity * itemData.unit_price;
        const item = this.purchaseOrderItemRepository.create({
          purchase_order_id: purchaseOrder.id,
          raw_material_id: itemData.raw_material_id,
          quantity: itemData.quantity,
          unit: itemData.unit,
          unit_price: itemData.unit_price,
          total_price: totalPrice,
          notes: itemData.notes,
        });
        await queryRunner.manager.save(item);
      }

      await queryRunner.commitTransaction();
      logger.info(`Purchase order created: ${purchaseOrder.id}`);

      return await this.findById(purchaseOrder.id) as PurchaseOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Error creating purchase order:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: {
    vendorId?: string;
    branchId?: string;
    status?: PurchaseOrderStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PurchaseOrder[]> {
    try {
      const query = this.purchaseOrderRepository
        .createQueryBuilder('po')
        .leftJoinAndSelect('po.vendor', 'vendor')
        .leftJoinAndSelect('po.branch', 'branch')
        .leftJoinAndSelect('po.items', 'items')
        .leftJoinAndSelect('items.raw_material', 'raw_material')
        .orderBy('po.order_date', 'DESC')
        .addOrderBy('po.created_at', 'DESC');

      if (filters?.vendorId) {
        query.andWhere('po.vendor_id = :vendorId', { vendorId: filters.vendorId });
      }

      if (filters?.branchId) {
        query.andWhere('po.branch_id = :branchId', { branchId: filters.branchId });
      }

      if (filters?.status) {
        query.andWhere('po.po_status = :status', { status: filters.status });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('po.order_date BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching purchase orders:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<PurchaseOrder | null> {
    try {
      return await this.purchaseOrderRepository.findOne({
        where: { id },
        relations: ['vendor', 'branch', 'items', 'items.raw_material'],
      });
    } catch (error) {
      logger.error(`Error fetching purchase order ${id}:`, error);
      throw error;
    }
  }

  async findByPONumber(poNumber: string): Promise<PurchaseOrder | null> {
    try {
      return await this.purchaseOrderRepository.findOne({
        where: { po_number: poNumber },
        relations: ['vendor', 'branch', 'items', 'items.raw_material'],
      });
    } catch (error) {
      logger.error(`Error fetching purchase order with number ${poNumber}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdatePurchaseOrderDto, updatedBy?: string): Promise<PurchaseOrder> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({
        where: { id },
        relations: ['items'],
      });

      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      // Update basic info
      if (data.po_number) purchaseOrder.po_number = data.po_number;
      if (data.vendor_id) purchaseOrder.vendor_id = data.vendor_id;
      if (data.branch_id) purchaseOrder.branch_id = data.branch_id;
      if (data.order_date) purchaseOrder.order_date = new Date(data.order_date);
      if (data.expected_delivery_date) purchaseOrder.expected_delivery_date = new Date(data.expected_delivery_date);
      if (data.payment_term) purchaseOrder.payment_term = data.payment_term;
      if (data.notes !== undefined) purchaseOrder.notes = data.notes;
      if (data.delivery_address !== undefined) purchaseOrder.delivery_address = data.delivery_address;
      if (updatedBy) purchaseOrder.updated_by = updatedBy;

      // Update items if provided
      if (data.items) {
        // Delete old items
        await queryRunner.manager.delete(PurchaseOrderItem, { purchase_order_id: id });

        // Calculate new totals
        let subtotal = 0;
        for (const itemData of data.items) {
          subtotal += itemData.quantity * itemData.unit_price;
        }

        const taxPercentage = data.tax_percentage !== undefined ? data.tax_percentage : purchaseOrder.tax_percentage;
        const taxAmount = (subtotal * taxPercentage) / 100;
        const discountAmount = data.discount_amount !== undefined ? data.discount_amount : purchaseOrder.discount_amount;
        const shippingCost = data.shipping_cost !== undefined ? data.shipping_cost : purchaseOrder.shipping_cost;
        const totalAmount = subtotal + taxAmount - discountAmount + shippingCost;

        purchaseOrder.subtotal = subtotal;
        purchaseOrder.tax_percentage = taxPercentage;
        purchaseOrder.tax_amount = taxAmount;
        purchaseOrder.discount_amount = discountAmount;
        purchaseOrder.shipping_cost = shippingCost;
        purchaseOrder.total_amount = totalAmount;

        // Create new items
        for (const itemData of data.items) {
          const totalPrice = itemData.quantity * itemData.unit_price;
          const item = this.purchaseOrderItemRepository.create({
            purchase_order_id: purchaseOrder.id,
            raw_material_id: itemData.raw_material_id,
            quantity: itemData.quantity,
            unit: itemData.unit,
            unit_price: itemData.unit_price,
            total_price: totalPrice,
            notes: itemData.notes,
          });
          await queryRunner.manager.save(item);
        }
      }

      await queryRunner.manager.save(purchaseOrder);
      await queryRunner.commitTransaction();
      logger.info(`Purchase order updated: ${id}`);

      return await this.findById(id) as PurchaseOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error updating purchase order ${id}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      if (deletedBy) {
        purchaseOrder.deleted_by = deletedBy;
      }
      await this.purchaseOrderRepository.softRemove(purchaseOrder);
      logger.info(`Purchase order deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting purchase order ${id}:`, error);
      throw error;
    }
  }

  async submitForApproval(id: string): Promise<PurchaseOrder> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      purchaseOrder.po_status = PurchaseOrderStatus.PENDING_APPROVAL;
      await this.purchaseOrderRepository.save(purchaseOrder);
      logger.info(`Purchase order submitted for approval: ${id}`);
      return purchaseOrder;
    } catch (error) {
      logger.error(`Error submitting purchase order ${id}:`, error);
      throw error;
    }
  }

  async approve(id: string, approvedBy: string): Promise<PurchaseOrder> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      purchaseOrder.po_status = PurchaseOrderStatus.APPROVED;
      purchaseOrder.approved_by = approvedBy;
      purchaseOrder.approved_at = new Date();
      await this.purchaseOrderRepository.save(purchaseOrder);
      logger.info(`Purchase order approved: ${id} by ${approvedBy}`);
      return purchaseOrder;
    } catch (error) {
      logger.error(`Error approving purchase order ${id}:`, error);
      throw error;
    }
  }

  async reject(id: string, approvedBy: string, reason: string): Promise<PurchaseOrder> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      purchaseOrder.po_status = PurchaseOrderStatus.REJECTED;
      purchaseOrder.approved_by = approvedBy;
      purchaseOrder.approved_at = new Date();
      purchaseOrder.rejection_reason = reason;
      await this.purchaseOrderRepository.save(purchaseOrder);
      logger.info(`Purchase order rejected: ${id} by ${approvedBy}`);
      return purchaseOrder;
    } catch (error) {
      logger.error(`Error rejecting purchase order ${id}:`, error);
      throw error;
    }
  }

  async markAsOrdered(id: string): Promise<PurchaseOrder> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      purchaseOrder.po_status = PurchaseOrderStatus.ORDERED;
      await this.purchaseOrderRepository.save(purchaseOrder);
      logger.info(`Purchase order marked as ordered: ${id}`);
      return purchaseOrder;
    } catch (error) {
      logger.error(`Error marking purchase order as ordered ${id}:`, error);
      throw error;
    }
  }

  async receiveItems(id: string, receivedItems: { item_id: string; received_quantity: number }[]): Promise<PurchaseOrder> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({
        where: { id },
        relations: ['items'],
      });

      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      let allReceived = true;
      for (const receivedItem of receivedItems) {
        const item = purchaseOrder.items.find(i => i.id === receivedItem.item_id);
        if (item) {
          item.received_quantity += receivedItem.received_quantity;
          await queryRunner.manager.save(item);

          // Update raw material stock
          const rawMaterial = await this.rawMaterialRepository.findOne({
            where: { id: item.raw_material_id },
          });
          if (rawMaterial) {
            rawMaterial.current_stock += receivedItem.received_quantity;
            await queryRunner.manager.save(rawMaterial);
          }

          if (item.received_quantity < item.quantity) {
            allReceived = false;
          }
        }
      }

      purchaseOrder.po_status = allReceived ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIALLY_RECEIVED;
      await queryRunner.manager.save(purchaseOrder);

      await queryRunner.commitTransaction();
      logger.info(`Purchase order items received: ${id}`);

      return await this.findById(id) as PurchaseOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error receiving purchase order items ${id}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string): Promise<PurchaseOrder> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      purchaseOrder.po_status = PurchaseOrderStatus.CANCELLED;
      await this.purchaseOrderRepository.save(purchaseOrder);
      logger.info(`Purchase order cancelled: ${id}`);
      return purchaseOrder;
    } catch (error) {
      logger.error(`Error cancelling purchase order ${id}:`, error);
      throw error;
    }
  }
}
