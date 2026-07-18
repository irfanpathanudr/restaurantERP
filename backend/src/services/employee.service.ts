import AppDataSource from '../config/database';
import { Employee } from '../database/entities/Employee.entity';
import { Attendance } from '../database/entities/Attendance.entity';
import { CreateEmployeeDto } from '../dto/employee/CreateEmployeeDto';
import { UpdateEmployeeDto } from '../dto/employee/UpdateEmployeeDto';
import logger from '../config/logger';
import { Repository } from 'typeorm';

export class EmployeeService {
  private get employeeRepository(): Repository<Employee> {
    return AppDataSource.getRepository(Employee);
  }
  private get attendanceRepository(): Repository<Attendance> {
    return AppDataSource.getRepository(Attendance);
  }

  async create(data: CreateEmployeeDto): Promise<Employee> {
    try {
      const employee = this.employeeRepository.create(data);
      await this.employeeRepository.save(employee);
      logger.info(`Employee created: ${employee.id}`);
      return employee;
    } catch (error) {
      logger.error('Error creating employee:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    branchId?: string;
    status?: string;
    department?: string;
  }): Promise<Employee[]> {
    try {
      const query = this.employeeRepository.createQueryBuilder('employee')
        .leftJoinAndSelect('employee.branch', 'branch')
        .orderBy('employee.first_name', 'ASC');

      if (filters?.branchId) {
        query.andWhere('employee.branchId = :branchId', { branchId: filters.branchId });
      }

      if (filters?.status) {
        query.andWhere('employee.status = :status', { status: filters.status });
      }

      if (filters?.department) {
        query.andWhere('employee.department = :department', { department: filters.department });
      }

      return await query.getMany();
    } catch (error) {
      logger.error('Error fetching employees:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Employee | null> {
    try {
      return await this.employeeRepository.findOne({
        where: { id },
        relations: ['branch'],
      });
    } catch (error) {
      logger.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    try {
      const employee = await this.employeeRepository.findOne({ where: { id } });
      if (!employee) throw new Error('Employee not found');

      Object.assign(employee, data);
      await this.employeeRepository.save(employee);
      logger.info(`Employee updated: ${id}`);
      return employee;
    } catch (error) {
      logger.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const employee = await this.employeeRepository.findOne({ where: { id } });
      if (!employee) throw new Error('Employee not found');

      await this.employeeRepository.softRemove(employee);
      logger.info(`Employee deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  }

  async getAttendance(employeeId: string, month: number, year: number): Promise<any> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const attendance = await this.attendanceRepository.createQueryBuilder('attendance')
        .where('attendance.employeeId = :employeeId', { employeeId })
        .andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
        .orderBy('attendance.date', 'ASC')
        .getMany();

      const presentDays = attendance.filter(a => a.status === 'present').length;
      const absentDays = attendance.filter(a => a.status === 'absent').length;
      const leaveDays = attendance.filter(a => a.status === 'leave').length;

      return {
        month,
        year,
        presentDays,
        absentDays,
        leaveDays,
        totalDays: attendance.length,
        records: attendance,
      };
    } catch (error) {
      logger.error(`Error fetching attendance for employee ${employeeId}:`, error);
      throw error;
    }
  }
}
