import { useState, useCallback } from 'react';
import {
  connectPrinter,
  disconnectPrinter,
  printKotBluetooth,
  printBillBluetooth,
  printKotFallback,
  printBillFallback,
} from '@/utils/escpos';

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * usePrinter
 *
 * Manages a Bluetooth ESC/POS printer connection (Pegasus PM5822 / any 58mm BT printer).
 * Falls back to browser window.print() if Web Bluetooth is unavailable or user skips BT.
 */
export function usePrinter() {
  const [status, setStatus]         = useState<PrinterStatus>('disconnected');
  const [printerName, setPrinterName] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const isBluetoothAvailable = typeof navigator !== 'undefined' && !!navigator.bluetooth;

  /** Manually connect to a Bluetooth printer */
  const connect = useCallback(async (): Promise<boolean> => {
    if (!isBluetoothAvailable) {
      setError('Web Bluetooth not supported. Using browser print fallback.');
      return false;
    }
    setStatus('connecting');
    setError(null);
    try {
      await connectPrinter();
      // Get device name from cached device
      const deviceName = (navigator.bluetooth as any)._lastDevice?.name || 'Bluetooth Printer';
      setPrinterName(deviceName);
      setStatus('connected');
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Connection failed';
      setError(msg);
      setStatus('error');
      return false;
    }
  }, [isBluetoothAvailable]);

  /** Disconnect from Bluetooth printer */
  const disconnect = useCallback(() => {
    disconnectPrinter();
    setStatus('disconnected');
    setPrinterName(null);
    setError(null);
  }, []);

  /**
   * Print a KOT ticket.
   * Tries Bluetooth first; falls back to browser print dialog if BT unavailable.
   */
  const printKot = useCallback(
    async (payload: Parameters<typeof printKotBluetooth>[0]): Promise<void> => {
      if (isBluetoothAvailable) {
        try {
          setStatus('connecting');
          await printKotBluetooth(payload);
          setStatus('connected');
          return;
        } catch (err: any) {
          const msg = err?.message || 'Bluetooth print failed';
          setError(msg);
          setStatus('error');
          // Fallback to browser print
          printKotFallback(payload);
        }
      } else {
        printKotFallback(payload);
      }
    },
    [isBluetoothAvailable]
  );

  /**
   * Print a bill/receipt.
   * Tries Bluetooth first; falls back to browser print dialog if BT unavailable.
   */
  const printBill = useCallback(
    async (order: Parameters<typeof printBillBluetooth>[0]): Promise<void> => {
      if (isBluetoothAvailable) {
        try {
          setStatus('connecting');
          await printBillBluetooth(order);
          setStatus('connected');
          return;
        } catch (err: any) {
          const msg = err?.message || 'Bluetooth print failed';
          setError(msg);
          setStatus('error');
          // Fallback to browser print
          printBillFallback(order);
        }
      } else {
        printBillFallback(order);
      }
    },
    [isBluetoothAvailable]
  );

  return {
    status,
    printerName,
    error,
    isBluetoothAvailable,
    connect,
    disconnect,
    printKot,
    printBill,
  };
}
