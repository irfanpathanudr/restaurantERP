import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { validateDTO } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';
import { CreateEmployeeDto } from '../dto/employee/CreateEmployeeDto';
import { UpdateEmployeeDto } from '../dto/employee/UpdateEmployeeDto';

const router = Router();
const employeeController = new EmployeeController();

router.use(authenticate);

router.get('/', checkPermission('employees.read'), employeeController.findAll);
router.get('/:id', checkPermission('employees.read'), employeeController.findById);
router.post('/', checkPermission('employees.create'), validateDTO(CreateEmployeeDto), employeeController.create);
router.put('/:id', checkPermission('employees.update'), validateDTO(UpdateEmployeeDto), employeeController.update);
router.delete('/:id', checkPermission('employees.delete'), employeeController.delete);
router.get('/:id/attendance', checkPermission('employees.read'), employeeController.getAttendance);

export default router;
