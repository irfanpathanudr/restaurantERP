import AppDataSource from '../config/database';
import { Reservation, ReservationStatus } from '../database/entities/Reservation.entity';
import { Table } from '../database/entities/Table.entity';
import { CreateReservationDto } from '../dto/reservation/CreateReservationDto';
import { UpdateReservationDto } from '../dto/reservation/UpdateReservationDto';
import logger from '../config/logger';
import { Repository, Between } from 'typeorm';

export class ReservationService {
  private get reservationRepository(): Repository<Reservation> {
    return AppDataSource.getRepository(Reservation);
  }

  private get tableRepository(): Repository<Table> {
    return AppDataSource.getRepository(Table);
  }

  async create(data: CreateReservationDto): Promise<Reservation> {
    try {
      const reservation = this.reservationRepository.create(data);
      await this.reservationRepository.save(reservation);
      logger.info(`Reservation created: ${reservation.id}`);
      return reservation;
    } catch (error) {
      logger.error('Error creating reservation:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    branchId?: string;
    customerId?: string;
    status?: ReservationStatus;
    date?: Date;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Reservation[]> {
    try {
      const query = this.reservationRepository
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.branch', 'branch')
        .leftJoinAndSelect('reservation.customer', 'customer')
        .leftJoinAndSelect('reservation.table', 'table')
        .orderBy('reservation.reservation_date', 'DESC')
        .addOrderBy('reservation.reservation_time', 'ASC');

      if (filters?.branchId) {
        query.andWhere('reservation.branch_id = :branchId', { branchId: filters.branchId });
      }

      if (filters?.customerId) {
        query.andWhere('reservation.customer_id = :customerId', { customerId: filters.customerId });
      }

      if (filters?.status) {
        query.andWhere('reservation.reservation_status = :status', { status: filters.status });
      }

      if (filters?.date) {
        query.andWhere('reservation.reservation_date = :date', { date: filters.date });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('reservation.reservation_date BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching reservations:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Reservation | null> {
    try {
      return await this.reservationRepository.findOne({
        where: { id },
        relations: ['branch', 'customer', 'table'],
      });
    } catch (error) {
      logger.error(`Error fetching reservation ${id}:`, error);
      throw error;
    }
  }

  async findByReservationNumber(reservationNumber: string): Promise<Reservation | null> {
    try {
      return await this.reservationRepository.findOne({
        where: { reservation_number: reservationNumber },
        relations: ['branch', 'customer', 'table'],
      });
    } catch (error) {
      logger.error(`Error fetching reservation with number ${reservationNumber}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateReservationDto): Promise<Reservation> {
    try {
      const reservation = await this.reservationRepository.findOne({ where: { id } });
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      Object.assign(reservation, data);
      await this.reservationRepository.save(reservation);
      logger.info(`Reservation updated: ${id}`);
      return reservation;
    } catch (error) {
      logger.error(`Error updating reservation ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const reservation = await this.reservationRepository.findOne({ where: { id } });
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      await this.reservationRepository.softRemove(reservation);
      logger.info(`Reservation deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting reservation ${id}:`, error);
      throw error;
    }
  }

  async confirm(id: string): Promise<Reservation> {
    try {
      const reservation = await this.reservationRepository.findOne({ where: { id } });
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      reservation.reservation_status = ReservationStatus.CONFIRMED;
      reservation.confirmed_at = new Date();
      await this.reservationRepository.save(reservation);
      logger.info(`Reservation confirmed: ${id}`);
      return reservation;
    } catch (error) {
      logger.error(`Error confirming reservation ${id}:`, error);
      throw error;
    }
  }

  async cancel(id: string, reason?: string): Promise<Reservation> {
    try {
      const reservation = await this.reservationRepository.findOne({ where: { id } });
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      reservation.reservation_status = ReservationStatus.CANCELLED;
      reservation.cancelled_at = new Date();
      reservation.cancellation_reason = reason || null;
      await this.reservationRepository.save(reservation);
      logger.info(`Reservation cancelled: ${id}`);
      return reservation;
    } catch (error) {
      logger.error(`Error cancelling reservation ${id}:`, error);
      throw error;
    }
  }

  async checkIn(id: string): Promise<Reservation> {
    try {
      const reservation = await this.reservationRepository.findOne({ where: { id } });
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      reservation.reservation_status = ReservationStatus.COMPLETED;
      reservation.checked_in_at = new Date();
      await this.reservationRepository.save(reservation);
      logger.info(`Reservation checked in: ${id}`);
      return reservation;
    } catch (error) {
      logger.error(`Error checking in reservation ${id}:`, error);
      throw error;
    }
  }

  async markAsNoShow(id: string): Promise<Reservation> {
    try {
      const reservation = await this.reservationRepository.findOne({ where: { id } });
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      reservation.reservation_status = ReservationStatus.NO_SHOW;
      await this.reservationRepository.save(reservation);
      logger.info(`Reservation marked as no-show: ${id}`);
      return reservation;
    } catch (error) {
      logger.error(`Error marking reservation as no-show ${id}:`, error);
      throw error;
    }
  }

  async assignTable(id: string, tableId: string): Promise<Reservation> {
    try {
      const reservation = await this.reservationRepository.findOne({ where: { id } });
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      const table = await this.tableRepository.findOne({ where: { id: tableId } });
      if (!table) {
        throw new Error('Table not found');
      }

      reservation.table_id = tableId;
      await this.reservationRepository.save(reservation);
      logger.info(`Table ${tableId} assigned to reservation ${id}`);
      return reservation;
    } catch (error) {
      logger.error(`Error assigning table to reservation ${id}:`, error);
      throw error;
    }
  }

  async getUpcomingReservations(branchId?: string, hours: number = 24): Promise<Reservation[]> {
    try {
      const now = new Date();
      const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

      const query = this.reservationRepository
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.branch', 'branch')
        .leftJoinAndSelect('reservation.customer', 'customer')
        .leftJoinAndSelect('reservation.table', 'table')
        .where('reservation.reservation_status IN (:...statuses)', {
          statuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        })
        .andWhere('reservation.reservation_date <= :future', { future })
        .orderBy('reservation.reservation_date', 'ASC')
        .addOrderBy('reservation.reservation_time', 'ASC');

      if (branchId) {
        query.andWhere('reservation.branch_id = :branchId', { branchId });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching upcoming reservations:', error);
      throw error;
    }
  }

  async checkExpiredReservations(): Promise<void> {
    try {
      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      const expiredReservations = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.reservation_status IN (:...statuses)', {
          statuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        })
        .andWhere('reservation.reservation_date < :date', { date: fifteenMinutesAgo })
        .getMany();

      for (const reservation of expiredReservations) {
        reservation.reservation_status = ReservationStatus.NO_SHOW;
        await this.reservationRepository.save(reservation);
        logger.info(`Reservation marked as no-show due to expiration: ${reservation.id}`);
      }
    } catch (error) {
      logger.error('Error checking expired reservations:', error);
      throw error;
    }
  }
}
