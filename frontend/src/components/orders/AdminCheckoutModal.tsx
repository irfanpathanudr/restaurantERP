import React, { useEffect, useState } from 'react';
import {
  Ban,
  Calculator,
  CreditCard,
  IndianRupee,
  Loader2,
  Percent,
  Receipt,
  Wallet,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckoutOrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price: number | string;
  total: number | string;
  special_instructions?: string | null;
}

export interface CheckoutOrder {
  id: string;
  order_number: string;
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  grand_total: number | string;
  service_charge?: number | string;
  table?: { table_number: string } | null;
  order_items?: CheckoutOrderItem[];
}

export interface AdminPaymentLine {
  method: 'cash' | 'card' | 'upi' | 'wallet';
  amount: number;
}

export interface AdminCheckoutData {
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountReason: string;
  taxPercentage: number;
  payments: AdminPaymentLine[];
  grandTotal: number;
}

interface AdminCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  order: CheckoutOrder;
  onConfirm: (data: AdminCheckoutData) => Promise<void>;
  loading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number | string | undefined | null) =>
  '₹' + (Number(n) || 0).toFixed(2);

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  cash: <IndianRupee size={14} />,
  card: <CreditCard size={14} />,
  upi: <span className="text-[11px] font-bold">UPI</span>,
  wallet: <Wallet size={14} />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminCheckoutModal({
  open,
  onClose,
  order,
  onConfirm,
  loading = false,
}: AdminCheckoutModalProps) {
  const subtotal = Number(order.subtotal) || 0;

  // Discount
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('0');
  const [discountReason, setDiscountReason] = useState('');

  // Tax
  const [taxPct, setTaxPct] = useState('18');
  const [taxEnabled, setTaxEnabled] = useState(true);

  // Payments
  const [payments, setPayments] = useState<{ method: AdminPaymentLine['method']; amount: string }[]>(
    [{ method: 'cash', amount: '' }]
  );

  // ── Computed ────────────────────────────────────────────────────────────────
  const discountAmt =
    discountType === 'percentage'
      ? (subtotal * Math.min(Number(discountValue) || 0, 100)) / 100
      : Math.min(Number(discountValue) || 0, subtotal);

  const afterDiscount = subtotal - discountAmt;
  const taxAmt = taxEnabled ? (afterDiscount * (Number(taxPct) || 0)) / 100 : 0;
  const serviceCharge = Number(order.service_charge) || 0;
  const grandTotal = afterDiscount + taxAmt + serviceCharge;

  const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const balance = totalPaid - grandTotal;

  // Auto-fill first cash field when grandTotal is computed
  useEffect(() => {
    if (
      payments.length === 1 &&
      payments[0].method === 'cash' &&
      (!payments[0].amount || payments[0].amount === '0')
    ) {
      setPayments([{ method: 'cash', amount: grandTotal.toFixed(2) }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grandTotal]);

  // ── Payment helpers ─────────────────────────────────────────────────────────
  const addPayment = () =>
    setPayments((p) => [...p, { method: 'cash', amount: '' }]);

  const removePayment = (i: number) =>
    setPayments((p) => p.filter((_, idx) => idx !== i));

  const updatePayment = (
    i: number,
    field: 'method' | 'amount',
    value: string
  ) =>
    setPayments((p) =>
      p.map((row, idx) =>
        idx === i ? { ...row, [field]: field === 'method' ? value : value } : row
      )
    );

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    await onConfirm({
      discountType,
      discountValue: Number(discountValue) || 0,
      discountReason,
      taxPercentage: taxEnabled ? Number(taxPct) || 0 : 0,
      payments: payments.map((p) => ({
        method: p.method,
        amount: Number(p.amount) || 0,
      })),
      grandTotal,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Receipt size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Checkout & Bill
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Order {order.order_number}
                {order.table?.table_number ? ` · Table ${order.table.table_number}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* ── Order items summary ── */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800/60 px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Order Items
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-44 overflow-y-auto">
              {(order.order_items || []).map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {item.item_name}
                    </span>
                    {item.special_instructions && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                        · {item.special_instructions}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <span>{fmt(item.price)} × {item.quantity}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 w-20 text-right">
                      {fmt(item.total)}
                    </span>
                  </div>
                </div>
              ))}
              {(!order.order_items || order.order_items.length === 0) && (
                <p className="px-4 py-4 text-sm text-gray-400 text-center">No items</p>
              )}
            </div>
          </div>

          {/* ── Discount ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Percent size={16} className="text-orange-500" />
                Discount
              </h3>
              {/* Quick picks */}
              <div className="flex gap-1">
                {[5, 10, 15, 20].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setDiscountType('percentage'); setDiscountValue(String(v)); }}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors',
                      discountType === 'percentage' && discountValue === String(v)
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-2">
              {(['percentage', 'fixed'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDiscountType(t)}
                  className={cn(
                    'py-2.5 rounded-lg border text-sm font-medium transition-all',
                    discountType === t
                      ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  {t === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                min="0"
                max={discountType === 'percentage' ? '100' : String(subtotal)}
                step="0.01"
              />
              <div className="px-4 py-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-sm font-semibold text-orange-600 dark:text-orange-400 min-w-[110px] text-right">
                -{fmt(discountAmt)}
              </div>
            </div>

            <input
              type="text"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              placeholder="Discount reason (optional)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* ── Tax / GST ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calculator size={16} className="text-blue-500" />
                GST / Tax
              </h3>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Include GST</span>
              </label>
            </div>

            {taxEnabled && (
              <div className="flex gap-3">
                <select
                  value={taxPct}
                  onChange={(e) => setTaxPct(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="0">0% — No GST</option>
                  <option value="5">5% — Standard</option>
                  <option value="12">12% — Medium</option>
                  <option value="18">18% — Restaurant</option>
                  <option value="28">28% — Luxury</option>
                </select>
                <div className="px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[110px] text-right">
                  +{fmt(taxAmt)}
                </div>
              </div>
            )}
          </div>

          {/* ── Payment methods ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Wallet size={16} className="text-green-500" />
                Payment Method
              </h3>
              <button
                type="button"
                onClick={addPayment}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                + Split payment
              </button>
            </div>

            <div className="space-y-2">
              {payments.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <select
                    value={p.method}
                    onChange={(e) => updatePayment(i, 'method', e.target.value)}
                    className="w-36 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="upi">📱 UPI</option>
                    <option value="wallet">👛 Wallet</option>
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {PAYMENT_ICONS[p.method]}
                    </span>
                    <input
                      type="number"
                      value={p.amount}
                      onChange={(e) => updatePayment(i, 'amount', e.target.value)}
                      placeholder="Amount"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {payments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePayment(i)}
                      className="p-2.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Bill summary ── */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800/60 px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Bill Summary
            </div>
            <div className="px-4 py-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium">{fmt(subtotal)}</span>
              </div>

              {discountAmt > 0 && (
                <div className="flex justify-between text-orange-600 dark:text-orange-400">
                  <span>
                    Discount
                    {discountType === 'percentage' ? ` (${discountValue}%)` : ' (Fixed)'}
                    {discountReason ? ` — ${discountReason}` : ''}
                  </span>
                  <span className="font-medium">-{fmt(discountAmt)}</span>
                </div>
              )}

              {taxEnabled && taxAmt > 0 && (
                <div className="flex justify-between text-blue-600 dark:text-blue-400">
                  <span>GST ({taxPct}%)</span>
                  <span className="font-medium">+{fmt(taxAmt)}</span>
                </div>
              )}

              {serviceCharge > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Service Charge</span>
                  <span className="font-medium">+{fmt(serviceCharge)}</span>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex justify-between font-bold text-base text-gray-900 dark:text-gray-100">
                <span>Grand Total</span>
                <span className="text-emerald-600 dark:text-emerald-400">{fmt(grandTotal)}</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total Paid</span>
                <span
                  className={cn(
                    'font-semibold',
                    totalPaid >= grandTotal
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-900 dark:text-gray-100'
                  )}
                >
                  {fmt(totalPaid)}
                </span>
              </div>

              {totalPaid > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {balance >= 0 ? 'Change' : 'Balance Due'}
                  </span>
                  <span
                    className={cn(
                      'font-bold',
                      balance >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {fmt(Math.abs(balance))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Ban size={16} />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Receipt size={18} />
              )}
              {loading ? 'Processing…' : `Generate Bill & Complete — ${fmt(grandTotal)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
