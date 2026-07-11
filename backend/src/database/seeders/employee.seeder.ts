import { DataSource } from 'typeorm';
import { Employee } from '../entities/Employee.entity';
import { Branch } from '../entities/Branch.entity';

export async function seedEmployees(dataSource: DataSource): Promise<void> {
  const employeeRepo = dataSource.getRepository(Employee);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find();
  if (branches.length === 0) {
    console.log('⚠️ Branches not found. Please seed branches first.');
    return;
  }

  const employees = [
    // Management
    { first_name: 'Alice', last_name: 'Manager', employee_code: 'EMP001', branch_id: branches[0].id, position: 'General Manager', department: 'Management', phone: '+1555100001', email: 'alice.m@restaurant.com', salary: 75000, employment_type: 'FULL_TIME', hire_date: new Date('2022-01-15'), is_active: true },
    { first_name: 'Bob', last_name: 'Assistant', employee_code: 'EMP002', branch_id: branches[0].id, position: 'Assistant Manager', department: 'Management', phone: '+1555100002', email: 'bob.a@restaurant.com', salary: 55000, employment_type: 'FULL_TIME', hire_date: new Date('2022-03-20'), is_active: true },
    
    // Kitchen Staff
    { first_name: 'Carlos', last_name: 'Chef', employee_code: 'EMP003', branch_id: branches[0].id, position: 'Head Chef', department: 'Kitchen', phone: '+1555100003', email: 'carlos.c@restaurant.com', salary: 65000, employment_type: 'FULL_TIME', hire_date: new Date('2022-02-01'), is_active: true },
    { first_name: 'Diana', last_name: 'Cook', employee_code: 'EMP004', branch_id: branches[0].id, position: 'Sous Chef', department: 'Kitchen', phone: '+1555100004', email: 'diana.c@restaurant.com', salary: 45000, employment_type: 'FULL_TIME', hire_date: new Date('2022-04-10'), is_active: true },
    { first_name: 'Erik', last_name: 'Prep', employee_code: 'EMP005', branch_id: branches[0].id, position: 'Line Cook', department: 'Kitchen', phone: '+1555100005', email: 'erik.p@restaurant.com', salary: 35000, employment_type: 'FULL_TIME', hire_date: new Date('2022-06-15'), is_active: true },
    { first_name: 'Fiona', last_name: 'Baker', employee_code: 'EMP006', branch_id: branches[0].id, position: 'Pastry Chef', department: 'Kitchen', phone: '+1555100006', email: 'fiona.b@restaurant.com', salary: 42000, employment_type: 'FULL_TIME', hire_date: new Date('2022-05-01'), is_active: true },
    
    // Service Staff
    { first_name: 'George', last_name: 'Server', employee_code: 'EMP007', branch_id: branches[0].id, position: 'Head Waiter', department: 'Service', phone: '+1555100007', email: 'george.s@restaurant.com', salary: 32000, employment_type: 'FULL_TIME', hire_date: new Date('2022-03-15'), is_active: true },
    { first_name: 'Hannah', last_name: 'Waiter', employee_code: 'EMP008', branch_id: branches[0].id, position: 'Server', department: 'Service', phone: '+1555100008', email: 'hannah.w@restaurant.com', salary: 28000, employment_type: 'FULL_TIME', hire_date: new Date('2022-07-01'), is_active: true },
    { first_name: 'Ian', last_name: 'Waiter', employee_code: 'EMP009', branch_id: branches[0].id, position: 'Server', department: 'Service', phone: '+1555100009', email: 'ian.w@restaurant.com', salary: 28000, employment_type: 'PART_TIME', hire_date: new Date('2023-01-10'), is_active: true },
    { first_name: 'Julia', last_name: 'Hostess', employee_code: 'EMP010', branch_id: branches[0].id, position: 'Host', department: 'Service', phone: '+1555100010', email: 'julia.h@restaurant.com', salary: 26000, employment_type: 'FULL_TIME', hire_date: new Date('2022-08-20'), is_active: true },
    
    // Bar Staff
    { first_name: 'Kevin', last_name: 'Bartender', employee_code: 'EMP011', branch_id: branches[0].id, position: 'Head Bartender', department: 'Bar', phone: '+1555100011', email: 'kevin.b@restaurant.com', salary: 38000, employment_type: 'FULL_TIME', hire_date: new Date('2022-04-05'), is_active: true },
    { first_name: 'Laura', last_name: 'Bar', employee_code: 'EMP012', branch_id: branches[0].id, position: 'Bartender', department: 'Bar', phone: '+1555100012', email: 'laura.b@restaurant.com', salary: 32000, employment_type: 'FULL_TIME', hire_date: new Date('2022-09-15'), is_active: true },
    
    // Support Staff
    { first_name: 'Mike', last_name: 'Dishwasher', employee_code: 'EMP013', branch_id: branches[0].id, position: 'Dishwasher', department: 'Kitchen', phone: '+1555100013', email: 'mike.d@restaurant.com', salary: 24000, employment_type: 'FULL_TIME', hire_date: new Date('2023-02-01'), is_active: true },
    { first_name: 'Nina', last_name: 'Cleaner', employee_code: 'EMP014', branch_id: branches[0].id, position: 'Cleaner', department: 'Maintenance', phone: '+1555100014', email: 'nina.c@restaurant.com', salary: 22000, employment_type: 'PART_TIME', hire_date: new Date('2023-03-10'), is_active: true },
    
    // Second Branch Staff (if exists)
    ...(branches[1] ? [
      { first_name: 'Oscar', last_name: 'Manager', employee_code: 'EMP015', branch_id: branches[1].id, position: 'Branch Manager', department: 'Management', phone: '+1555100015', email: 'oscar.m@restaurant.com', salary: 70000, employment_type: 'FULL_TIME', hire_date: new Date('2022-02-20'), is_active: true },
      { first_name: 'Paula', last_name: 'Chef', employee_code: 'EMP016', branch_id: branches[1].id, position: 'Head Chef', department: 'Kitchen', phone: '+1555100016', email: 'paula.c@restaurant.com', salary: 60000, employment_type: 'FULL_TIME', hire_date: new Date('2022-03-15'), is_active: true },
      { first_name: 'Quinn', last_name: 'Server', employee_code: 'EMP017', branch_id: branches[1].id, position: 'Head Waiter', department: 'Service', phone: '+1555100017', email: 'quinn.s@restaurant.com', salary: 30000, employment_type: 'FULL_TIME', hire_date: new Date('2022-05-01'), is_active: true },
    ] : []),
  ];

  for (const employeeData of employees) {
    const exists = await employeeRepo.findOne({
      where: { employee_code: employeeData.employee_code },
    });
    if (!exists) {
      const employee = employeeRepo.create(employeeData);
      await employeeRepo.save(employee);
      console.log(`✅ Employee seeded: ${employee.first_name} ${employee.last_name}`);
    }
  }
}
