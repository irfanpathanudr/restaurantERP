import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';

export class EmployeeController {
  private employeeService = new EmployeeService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.employeeService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, status, department } = req.query;
      const employees = await this.employeeService.findAll({
        branchId: branchId as string,
        status: status as string,
        department: department as string,
      });
      res.status(200).json({
        success: true,
        message: 'Employees retrieved successfully',
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const employee = await this.employeeService.findById(id);
      if (!employee) {
        res.status(404).json({ success: false, message: 'Employee not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Employee retrieved successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const employee = await this.employeeService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.employeeService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { month, year } = req.query;
      const attendance = await this.employeeService.getAttendance(
        id,
        parseInt(month as string),
        parseInt(year as string)
      );
      res.status(200).json({
        success: true,
        message: 'Attendance retrieved successfully',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  };
}
