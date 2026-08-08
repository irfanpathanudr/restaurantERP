import { Router } from 'express';
import {
  getAllPrinters,
  getPrinterById,
  getPrintersByBranch,
  getDefaultPrinter,
  createPrinter,
  updatePrinter,
  deletePrinter,
  testPrinterConnection,
} from '../controllers/printer.controller';

const router = Router();

router.get('/', getAllPrinters);
router.get('/:id', getPrinterById);
router.get('/branch/:branchId', getPrintersByBranch);
router.get('/branch/:branchId/default', getDefaultPrinter);
router.post('/', createPrinter);
router.put('/:id', updatePrinter);
router.patch('/:id', updatePrinter);
router.delete('/:id', deletePrinter);
router.post('/:id/test', testPrinterConnection);

export default router;
