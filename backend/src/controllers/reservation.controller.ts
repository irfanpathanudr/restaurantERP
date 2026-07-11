import { Request, Response, NextFunction } from 'express';
import { ReservationService } from '../services/reservation.service';
import { ReservationStatus } from '../database/entities/Reservation.entity';

export class ReservationController {
  private reservationService = new ReservationService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reservation = await this.reservationService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, customerId, status, date, startDate, endDate } = req.query;
      const reservations = await this.reservationService.findAll({
        branchId: branchId as string,
        customerId: customerId as string,
        status: status as ReservationStatus,
        date: date ? new Date(date as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Reservations retrieved successfully',
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const reservation = await this.reservationService.findById(id);
      if (!reservation) {
        res.status(404).json({ success: false, message: 'Reservation not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Reservation retrieved successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  findByReservationNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reservationNumber } = req.params;
      const reservation = await this.reservationService.findByReservationNumber(reservationNumber);
      if (!reservation) {
        res.status(404).json({ success: false, message: 'Reservation not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Reservation retrieved successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const reservation = await this.reservationService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Reservation updated successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.reservationService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Reservation deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const reservation = await this.reservationService.confirm(id);
      res.status(200).json({
        success: true,
        message: 'Reservation confirmed successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const reservation = await this.reservationService.cancel(id, reason);
      res.status(200).json({
        success: true,
        message: 'Reservation cancelled successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const reservation = await this.reservationService.checkIn(id);
      res.status(200).json({
        success: true,
        message: 'Reservation checked in successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsNoShow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const reservation = await this.reservationService.markAsNoShow(id);
      res.status(200).json({
        success: true,
        message: 'Reservation marked as no-show successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  assignTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { table_id } = req.body;
      const reservation = await this.reservationService.assignTable(id, table_id);
      res.status(200).json({
        success: true,
        message: 'Table assigned successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  getUpcoming = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, hours } = req.query;
      const reservations = await this.reservationService.getUpcomingReservations(
        branchId as string,
        hours ? parseInt(hours as string) : 24
      );
      res.status(200).json({
        success: true,
        message: 'Upcoming reservations retrieved successfully',
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  };
}
