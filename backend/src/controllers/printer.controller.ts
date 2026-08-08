import { Request, Response } from 'express';
import { PrinterService } from '../services/printer.service';
import { CreatePrinterDto } from '../dto/printer/CreatePrinterDto';
import { UpdatePrinterDto } from '../dto/printer/UpdatePrinterDto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import logger from '../config/logger';

const printerService = new PrinterService();

export async function getAllPrinters(req: Request, res: Response) {
  try {
    const { branchId, printerType, status, isActive } = req.query;

    const printers = await printerService.findAll({
      branchId: branchId as string,
      printerType: printerType as string,
      status: status as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    res.json(printers);
  } catch (error: any) {
    logger.error('Error in getAllPrinters:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch printers' });
  }
}

export async function getPrinterById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const printer = await printerService.findById(id);

    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    res.json(printer);
  } catch (error: any) {
    logger.error('Error in getPrinterById:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch printer' });
  }
}

export async function getPrintersByBranch(req: Request, res: Response) {
  try {
    const { branchId } = req.params;
    const printers = await printerService.findByBranch(branchId);
    res.json(printers);
  } catch (error: any) {
    logger.error('Error in getPrintersByBranch:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch printers' });
  }
}

export async function getDefaultPrinter(req: Request, res: Response) {
  try {
    const { branchId } = req.params;
    const { printerType } = req.query;

    const printer = await printerService.findDefault(branchId, printerType as string);

    if (!printer) {
      return res.status(404).json({ message: 'No default printer found' });
    }

    res.json(printer);
  } catch (error: any) {
    logger.error('Error in getDefaultPrinter:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch default printer' });
  }
}

export async function createPrinter(req: Request, res: Response) {
  try {
    const dto = plainToInstance(CreatePrinterDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        })),
      });
    }

    const printer = await printerService.create(dto);
    res.status(201).json(printer);
  } catch (error: any) {
    logger.error('Error in createPrinter:', error);
    res.status(500).json({ message: error.message || 'Failed to create printer' });
  }
}

export async function updatePrinter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdatePrinterDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        })),
      });
    }

    const printer = await printerService.update(id, dto);
    res.json(printer);
  } catch (error: any) {
    logger.error('Error in updatePrinter:', error);
    if (error.message === 'Printer not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Failed to update printer' });
  }
}

export async function deletePrinter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await printerService.delete(id);
    res.status(204).send();
  } catch (error: any) {
    logger.error('Error in deletePrinter:', error);
    if (error.message === 'Printer not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Failed to delete printer' });
  }
}

export async function testPrinterConnection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await printerService.testConnection(id);
    res.json(result);
  } catch (error: any) {
    logger.error('Error in testPrinterConnection:', error);
    res.status(500).json({ message: error.message || 'Failed to test printer connection' });
  }
}
