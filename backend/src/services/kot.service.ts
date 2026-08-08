import AppDataSource from '../config/database';
import { KOT, KOTStatus, KOTPriority } from '../database/entities/KOT.entity';
import { Order } from '../database/entities/Order.entity';
import { MenuItem } from '../database/entities/MenuItem.entity';
import { Kitchen } from '../database/entities/Kitchen.entity';
import { CreateKOTDto } from '../dto/kot/CreateKOTDto';
import logger from '../config/logger';
import { In, Repository } from 'typeorm';

const STATUS_ALIASES: Record<string, KOTStatus> = {
  pending: KOTStatus.PENDING,
  preparing: KOTStatus.IN_PROGRESS,
  in_progress: KOTStatus.IN_PROGRESS,
  ready: KOTStatus.READY,
  served: KOTStatus.SERVED,
  cancelled: KOTStatus.CANCELLED,
};

export class KOTService {
  private get kotRepository(): Repository<KOT> {
    return AppDataSource.getRepository(KOT);
  }

  private get orderRepository(): Repository<Order> {
    return AppDataSource.getRepository(Order);
  }

  private get menuItemRepository(): Repository<MenuItem> {
    return AppDataSource.getRepository(MenuItem);
  }

  private get kitchenRepository(): Repository<Kitchen> {
    return AppDataSource.getRepository(Kitchen);
  }

  /**
   * Resolves the kitchen ID to use for a KOT.
   * - If kitchenId is provided, use it directly.
   * - If only ONE kitchen exists for the branch, auto-select it.
   * - If multiple kitchens exist, prefer one named "Main Kitchen", otherwise use the first one.
   * - Never throws — always picks a kitchen automatically.
   */
  private async resolveKitchenId(kitchenId: string | undefined, branchId: string): Promise<string> {
    if (kitchenId) return kitchenId;

    const kitchens = await this.kitchenRepository.find({
      where: { branch_id: branchId, is_active: true },
    });

    if (kitchens.length === 0) {
      throw new Error('No active kitchen found for this branch. Please create a kitchen first.');
    }

    if (kitchens.length === 1) {
      logger.info(`KOT: auto-selected kitchen "${kitchens[0].name}" (only one in branch)`);
      return kitchens[0].id;
    }

    // Multiple kitchens — prefer "Main Kitchen", fallback to first
    const main = kitchens.find(k => k.name.toLowerCase().includes('main kitchen'));
    const selected = main || kitchens[0];
    logger.info(`KOT: auto-selected kitchen "${selected.name}" (multiple kitchens, picked default)`);
    return selected.id;
  }

  private normalizeStatus(status: string): KOTStatus {
    const normalized = STATUS_ALIASES[String(status).toLowerCase()];
    if (!normalized) {
      throw new Error(`Invalid KOT status: ${status}`);
    }
    return normalized;
  }

  private async enrichItems(items: CreateKOTDto['items']) {
    const menuIds = items.map((i) => i.menuItemId);
    const menuItems = await this.menuItemRepository.find({
      where: { id: In(menuIds) },
    });
    const byId = new Map(menuItems.map((m) => [m.id, m]));

    return items.map((item) => {
      const menu = byId.get(item.menuItemId);
      return {
        menu_item_id: item.menuItemId,
        menuItemId: item.menuItemId,
        name: menu?.name || 'Unknown item',
        quantity: item.quantity,
        special_instructions: item.specialInstructions || null,
        specialInstructions: item.specialInstructions || null,
        price: menu ? Number(menu.price) : 0,
      };
    });
  }

  async create(data: CreateKOTDto & { waiterId?: string; priority?: KOTPriority }): Promise<KOT> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: data.orderId },
        relations: ['table'],
      });
      if (!order) throw new Error('Order not found');

      // Auto-select kitchen when only one exists; error only when ambiguous
      const kitchenId = await this.resolveKitchenId(data.kitchenId, order.branch_id);

      const enrichedItems = await this.enrichItems(data.items);
      const kotNumber = `KOT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const kot = this.kotRepository.create({
        kot_number: kotNumber,
        order_id: data.orderId,
        kitchen_id: kitchenId,
        kot_status: KOTStatus.PENDING,
        priority: data.priority || KOTPriority.NORMAL,
        items: enrichedItems,
        waiter_id: data.waiterId || order.waiter_id || null,
        special_instructions: data.notes || null,
        print_count: 0,
      });

      await this.kotRepository.save(kot);
      logger.info(`KOT created: ${kot.id}`);
      return (await this.findById(kot.id)) as KOT;
    } catch (error) {
      logger.error('Error creating KOT:', error);
      throw error;
    }
  }

  private sanitizeKOTData(kot: KOT): KOT {
    if (kot.order) {
      // Remove payment-sensitive fields from order
      delete (kot.order as any).payment_status;
      delete (kot.order as any).subtotal;
      delete (kot.order as any).discount_amount;
      delete (kot.order as any).discount_percentage;
      delete (kot.order as any).discount_type;
      delete (kot.order as any).discount_reason;
      delete (kot.order as any).coupon_code;
      delete (kot.order as any).tax_amount;
      delete (kot.order as any).tax_percentage;
      delete (kot.order as any).service_charge;
      delete (kot.order as any).delivery_charge;
      delete (kot.order as any).tips;
      delete (kot.order as any).rounding_amount;
      delete (kot.order as any).grand_total;
      delete (kot.order as any).paid_amount;
      delete (kot.order as any).due_amount;
      delete (kot.order as any).cashier_id;
      delete (kot.order as any).cashier_confirmed_at;
    }
    return kot;
  }

  async findAll(filters?: {
    orderId?: string;
    kitchenId?: string;
    status?: string;
    branchId?: string;
    activeOnly?: boolean;
  }): Promise<KOT[]> {
    try {
      const query = this.kotRepository
        .createQueryBuilder('kot')
        .leftJoinAndSelect('kot.order', 'order')
        .leftJoinAndSelect('order.table', 'table')
        .leftJoinAndSelect('kot.kitchen', 'kitchen')
        .where('kot.deleted_at IS NULL')
        .orderBy('kot.created_at', 'DESC');

      if (filters?.orderId) {
        query.andWhere('kot.order_id = :orderId', { orderId: filters.orderId });
      }

      if (filters?.kitchenId) {
        query.andWhere('kot.kitchen_id = :kitchenId', { kitchenId: filters.kitchenId });
      }

      if (filters?.status) {
        query.andWhere('kot.kot_status = :status', {
          status: this.normalizeStatus(filters.status),
        });
      }

      if (filters?.branchId) {
        query.andWhere('order.branch_id = :branchId', { branchId: filters.branchId });
      }

      if (filters?.activeOnly) {
        query.andWhere('kot.kot_status IN (:...active)', {
          active: [KOTStatus.PENDING, KOTStatus.IN_PROGRESS, KOTStatus.READY],
        });
      }

      const kots = await query.getMany();
      return kots.map(kot => this.sanitizeKOTData(kot));
    } catch (error) {
      logger.error('Error fetching KOTs:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<KOT | null> {
    try {
      const kot = await this.kotRepository.findOne({
        where: { id },
        relations: ['order', 'order.table', 'kitchen'],
      });
      return kot ? this.sanitizeKOTData(kot) : null;
    } catch (error) {
      logger.error(`Error fetching KOT ${id}:`, error);
      throw error;
    }
  }

  async changeStatus(id: string, status: string): Promise<KOT> {
    try {
      const kot = await this.kotRepository.findOne({ where: { id } });
      if (!kot) throw new Error('KOT not found');

      const nextStatus = this.normalizeStatus(status);
      kot.kot_status = nextStatus;

      if (nextStatus === KOTStatus.IN_PROGRESS && !kot.started_at) {
        kot.started_at = new Date();
      } else if (nextStatus === KOTStatus.READY && !kot.ready_at) {
        kot.ready_at = new Date();
        if (kot.started_at) {
          kot.preparation_time = Math.round(
            (kot.ready_at.getTime() - kot.started_at.getTime()) / 60000
          );
        }
      } else if (nextStatus === KOTStatus.SERVED && !kot.served_at) {
        kot.served_at = new Date();
      } else if (nextStatus === KOTStatus.CANCELLED && !kot.cancelled_at) {
        kot.cancelled_at = new Date();
      }

      await this.kotRepository.save(kot);
      logger.info(`KOT status changed: ${id} -> ${nextStatus}`);
      return (await this.findById(id)) as KOT;
    } catch (error) {
      logger.error(`Error changing KOT status ${id}:`, error);
      throw error;
    }
  }

  async completeKOT(id: string): Promise<KOT> {
    return this.changeStatus(id, KOTStatus.SERVED);
  }

  async printKOT(id: string): Promise<{ kot: KOT; printPayload: Record<string, unknown> }> {
    try {
      const kot = await this.findById(id);
      if (!kot) throw new Error('KOT not found');

      kot.print_count = (kot.print_count || 0) + 1;
      await this.kotRepository.save(kot);

      const tableNumber = kot.order?.table?.table_number || 'N/A';
      const printPayload = {
        kotNumber: kot.kot_number,
        printCount: kot.print_count,
        isReprint: kot.print_count > 1,
        tableNumber,
        kitchen: kot.kitchen?.name || '',
        status: kot.kot_status,
        orderedAt: kot.created_at,
        specialInstructions: kot.special_instructions,
        items: (kot.items || []).map((item: any) => ({
          name: item.name || item.item_name || 'Item',
          quantity: item.quantity,
          specialInstructions: item.special_instructions || item.specialInstructions || null,
        })),
      };

      logger.info(`KOT printed: ${id} (count=${kot.print_count})`);
      return { kot: (await this.findById(id)) as KOT, printPayload };
    } catch (error) {
      logger.error(`Error printing KOT ${id}:`, error);
      throw error;
    }
  }
}
