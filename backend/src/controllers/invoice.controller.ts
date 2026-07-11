import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoice.service';

export class InvoiceController {
  private invoiceService = new InvoiceService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoice = await this.invoiceService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerId, startDate, endDate } = req.query;
      const invoices = await this.invoiceService.findAll({
        customerId: customerId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Invoices retrieved successfully',
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await this.invoiceService.findById(id);
      if (!invoice) {
        res.status(404).json({ success: false, message: 'Invoice not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Invoice retrieved successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  };

  generatePDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pdfBuffer = await this.invoiceService.generatePDF(id);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      await this.invoiceService.sendEmail(id, email);
      res.status(200).json({
        success: true,
        message: 'Invoice sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
