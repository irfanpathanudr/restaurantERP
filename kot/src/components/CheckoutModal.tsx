import { useState, useEffect } from 'react';
import { X, Percent, IndianRupee, CreditCard, Banknote, Wallet, Calculator } from 'lucide-react';
import { cn, formatMoney } from '@/utils/helpers';
import type { Order } from '@/types';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  onConfirm: (paymentData: PaymentData) => void;
  loading?: boolean;
}

export interface PaymentData {
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
    reason?: string;
  };
  gst: {
    enabled: boolean;
    percentage: number;
  };
  payments: {
    method: 'cash' | 'card' | 'upi' | 'wallet';
    amount: number;
  }[];
}

export function CheckoutModal({ open, onClose, order, onConfirm, loading }: CheckoutModalProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('0');
  const [discountReason, setDiscountReason] = useState('');
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstPercentage, setGstPercentage] = useState('18');
  
  const [payments, setPayments] = useState<{ method: 'cash' | 'card' | 'upi' | 'wallet'; amount: string }[]>([
    { method: 'cash', amount: '0' }
  ]);

  const subtotal = Number(order.subtotal) || 0;
  
  // Calculate discount amount
  const discountAmount = discountType === 'percentage'
    ? (subtotal * Number(discountValue)) / 100
    : Number(discountValue);
  
  const afterDiscount = subtotal - discountAmount;
  
  // Calculate GST
  const gstAmount = gstEnabled ? (afterDiscount * Number(gstPercentage)) / 100 : 0;
  
  // Calculate service charge if any
  const serviceCharge = Number(order.service_charge) || 0;
  
  // Final total
  const grandTotal = afterDiscount + gstAmount + serviceCharge;
  
  // Calculate total paid
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const balance = grandTotal - totalPaid;

  // Auto-fill cash if only one payment method
  useEffect(() => {
    if (payments.length === 1 && payments[0].method === 'cash' && Number(payments[0].amount) === 0) {
      setPayments([{ method: 'cash', amount: grandTotal.toFixed(2) }]);
    }
  }, [grandTotal, payments.length]);

  const addPaymentMethod = () => {
    setPayments([...payments, { method: 'cash', amount: '0' }]);
  };

  const removePaymentMethod = (index: number) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index: number, field: 'method' | 'amount', value: string) => {
    const updated = [...payments];
    if (field === 'method') {
      updated[index].method = value as any;
    } else {
      updated[index].amount = value;
    }
    setPayments(updated);
  };

  const handleSubmit = () => {
    const paymentData: PaymentData = {
      discount: {
        type: discountType,
        value: Number(discountValue),
        reason: discountReason || undefined,
      },
      gst: {
        enabled: gstEnabled,
        percentage: Number(gstPercentage),
      },
      payments: payments.map(p => ({
        method: p.method,
        amount: Number(p.amount),
      })),
    };
    onConfirm(paymentData);
  };

  const quickDiscount = (value: number) => {
    setDiscountType('percentage');
    setDiscountValue(value.toString());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Checkout</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Discount Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Percent size={18} className="text-orange-400" />
                Discount
              </h3>
              <div className="flex gap-1">
                {[5, 10, 15, 20].map(val => (
                  <button
                    key={val}
                    onClick={() => quickDiscount(val)}
                    className="px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDiscountType('percentage')}
                className={cn(
                  'px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
                  discountType === 'percentage'
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-surface-card border-white/10 text-white/60'
                )}
              >
                Percentage (%)
              </button>
              <button
                onClick={() => setDiscountType('fixed')}
                className={cn(
                  'px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
                  discountType === 'fixed'
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-surface-card border-white/10 text-white/60'
                )}
              >
                Fixed Amount (₹)
              </button>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter ₹'}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-card border border-white/10 text-sm"
                  min="0"
                  max={discountType === 'percentage' ? '100' : subtotal.toString()}
                  step="0.01"
                />
              </div>
              <div className="px-4 py-2.5 rounded-lg bg-surface-elevated border border-white/10 text-sm font-semibold min-w-[100px] text-right">
                -{formatMoney(discountAmount)}
              </div>
            </div>

            <input
              type="text"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              placeholder="Discount reason (optional)"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-card border border-white/10 text-sm"
            />
          </div>

          {/* GST Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Calculator size={18} className="text-blue-400" />
                GST/Tax
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gstEnabled}
                  onChange={(e) => setGstEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-surface-card text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                />
                <span className="text-sm text-white/60">Include GST</span>
              </label>
            </div>

            {gstEnabled && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <select
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface-card border border-white/10 text-sm"
                  >
                    <option value="0">0% - No GST</option>
                    <option value="5">5% - Standard</option>
                    <option value="12">12% - Medium</option>
                    <option value="18">18% - High</option>
                    <option value="28">28% - Luxury</option>
                  </select>
                </div>
                <div className="px-4 py-2.5 rounded-lg bg-surface-elevated border border-white/10 text-sm font-semibold min-w-[100px] text-right">
                  +{formatMoney(gstAmount)}
                </div>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Wallet size={18} className="text-green-400" />
                Payment Method
              </h3>
              <button
                onClick={addPaymentMethod}
                className="text-xs text-brand-400 hover:text-brand-300"
              >
                + Split Payment
              </button>
            </div>

            {payments.map((payment, index) => (
              <div key={index} className="flex gap-3">
                <select
                  value={payment.method}
                  onChange={(e) => updatePayment(index, 'method', e.target.value)}
                  className="w-32 px-3 py-2.5 rounded-lg bg-surface-card border border-white/10 text-sm"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="card">💳 Card</option>
                  <option value="upi">📱 UPI</option>
                  <option value="wallet">👛 Wallet</option>
                </select>
                <input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-surface-card border border-white/10 text-sm"
                  min="0"
                  step="0.01"
                />
                {payments.length > 1 && (
                  <button
                    onClick={() => removePaymentMethod(index)}
                    className="p-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-gradient-to-br from-surface-card to-surface-elevated border border-white/10 p-4 space-y-2.5">
            <div className="flex justify-between text-sm text-white/60">
              <span>Subtotal</span>
              <span className="font-semibold">{formatMoney(subtotal)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-orange-400">
                <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'})</span>
                <span className="font-semibold">-{formatMoney(discountAmount)}</span>
              </div>
            )}

            {gstEnabled && gstAmount > 0 && (
              <div className="flex justify-between text-sm text-blue-400">
                <span>GST ({gstPercentage}%)</span>
                <span className="font-semibold">+{formatMoney(gstAmount)}</span>
              </div>
            )}

            {serviceCharge > 0 && (
              <div className="flex justify-between text-sm text-white/60">
                <span>Service Charge</span>
                <span className="font-semibold">+{formatMoney(serviceCharge)}</span>
              </div>
            )}

            <div className="border-t border-white/10 pt-2.5 flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span className="text-brand-400">{formatMoney(grandTotal)}</span>
            </div>

            <div className="border-t border-white/10 pt-2.5 flex justify-between text-sm">
              <span className="text-white/60">Total Paid</span>
              <span className={cn(
                "font-semibold",
                totalPaid >= grandTotal ? 'text-green-400' : 'text-white'
              )}>
                {formatMoney(totalPaid)}
              </span>
            </div>

            {balance !== 0 && (
              <div className="flex justify-between text-sm font-semibold">
                <span className={balance > 0 ? 'text-red-400' : 'text-green-400'}>
                  {balance > 0 ? 'Balance Due' : 'Change to Return'}
                </span>
                <span className={balance > 0 ? 'text-red-400' : 'text-green-400'}>
                  {formatMoney(Math.abs(balance))}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || totalPaid < grandTotal}
              className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 font-semibold text-sm hover:from-green-500 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
            >
              {loading ? 'Processing...' : 'Complete Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
