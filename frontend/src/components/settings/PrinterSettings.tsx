import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { getThermalPrinter } from '@/utils/thermalPrinter';
import { Printer, Bluetooth, Usb, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PrinterSettingsProps {
  onClose?: () => void;
}

export const PrinterSettings: React.FC<PrinterSettingsProps> = ({ onClose }) => {
  const [printerType, setPrinterType] = useState<'browser' | 'bluetooth' | 'usb'>(
    (localStorage.getItem('printerType') as any) || 'browser'
  );
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Check if thermal printer is connected
    const printer = getThermalPrinter();
    setIsConnected(printer.isConnected());
  }, []);

  const handlePrinterTypeChange = (type: 'browser' | 'bluetooth' | 'usb') => {
    setPrinterType(type);
    localStorage.setItem('printerType', type);
    
    if (type === 'browser') {
      toast.success('Printer set to use browser print dialog');
    }
  };

  const handleConnectBluetooth = async () => {
    try {
      setConnecting(true);
      const printer = getThermalPrinter({ type: 'bluetooth', characterWidth: 32 });
      await printer.connectBluetooth();
      setIsConnected(true);
      toast.success('Bluetooth printer connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect to Bluetooth printer');
      setIsConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectUSB = async () => {
    try {
      setConnecting(true);
      const printer = getThermalPrinter({ type: 'usb', characterWidth: 32 });
      await printer.connectUSB();
      setIsConnected(true);
      toast.success('USB printer connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect to USB printer');
      setIsConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const handleTestPrint = async () => {
    try {
      setTesting(true);
      const printer = getThermalPrinter();
      
      if (!printer.isConnected()) {
        toast.error('Please connect to printer first');
        return;
      }

      await printer.testPrint();
      toast.success('Test print sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Test print failed');
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const printer = getThermalPrinter();
      await printer.disconnect();
      setIsConnected(false);
      toast.success('Printer disconnected');
    } catch (error: any) {
      toast.error('Failed to disconnect printer');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Printer Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose how you want to print orders and receipts
        </p>
      </div>

      {/* Printer Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium mb-2">Printer Type</label>
        
        {/* Browser Print */}
        <button
          onClick={() => handlePrinterTypeChange('browser')}
          className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
            printerType === 'browser'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <Printer className="h-6 w-6" />
          <div className="flex-1 text-left">
            <div className="font-medium">Browser Print Dialog</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Use default browser print (PDF, home printers)
            </div>
          </div>
          {printerType === 'browser' && <Check className="h-5 w-5 text-blue-500" />}
        </button>

        {/* Bluetooth Thermal Printer */}
        <button
          onClick={() => handlePrinterTypeChange('bluetooth')}
          className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
            printerType === 'bluetooth'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <Bluetooth className="h-6 w-6" />
          <div className="flex-1 text-left">
            <div className="font-medium">Bluetooth Thermal Printer</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Connect to ESC/POS thermal printer via Bluetooth
            </div>
          </div>
          {printerType === 'bluetooth' && <Check className="h-5 w-5 text-blue-500" />}
        </button>

        {/* USB Thermal Printer */}
        <button
          onClick={() => handlePrinterTypeChange('usb')}
          className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
            printerType === 'usb'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <Usb className="h-6 w-6" />
          <div className="flex-1 text-left">
            <div className="font-medium">USB Thermal Printer</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Connect to ESC/POS thermal printer via USB
            </div>
          </div>
          {printerType === 'usb' && <Check className="h-5 w-5 text-blue-500" />}
        </button>
      </div>

      {/* Connection Controls */}
      {printerType !== 'browser' && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Connection Status</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Connected
                  </span>
                ) : (
                  <span className="text-gray-500 flex items-center gap-1">
                    <X className="h-4 w-4" /> Not connected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={
                  printerType === 'bluetooth' ? handleConnectBluetooth : handleConnectUSB
                }
                disabled={connecting}
                className="flex-1"
              >
                {connecting ? 'Connecting...' : 'Connect Printer'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleTestPrint}
                  disabled={testing}
                  variant="outline"
                  className="flex-1"
                >
                  {testing ? 'Printing...' : 'Test Print'}
                </Button>
                <Button onClick={handleDisconnect} variant="outline" className="flex-1">
                  Disconnect
                </Button>
              </>
            )}
          </div>

          {printerType === 'bluetooth' && !isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                Bluetooth Pairing Instructions:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-yellow-700 dark:text-yellow-400">
                <li>Turn on your Bluetooth printer</li>
                <li>Make sure printer is in pairing mode</li>
                <li>Click "Connect Printer" and select your device</li>
                <li>Chrome browser is recommended for best compatibility</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {onClose && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      )}
    </div>
  );
};
