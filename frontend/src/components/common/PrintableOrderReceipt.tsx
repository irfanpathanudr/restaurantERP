import React, { forwardRef } from 'react';

interface OrderItem {
  id: string;
  item_name: string;
  price: number | string;
  quantity: number;
  total: number | string;
  special_instructions?: string | null;
}

interface Payment {
  id: string;
  payment_number: string;
  payment_method: string;
  amount: number | string;
  payment_date: string;
  payment_status: string;
  transaction_id?: string | null;
  reference_number?: string | null;
  payment_mode?: string;
  payment_gateway?: string;
}

interface OrderData {
  id: string;
  order_number: string;
  order_type: string;
  order_status: string;
  payment_status: string;
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  grand_total: number | string;
  paid_amount?: number | string;
  due_amount?: number | string;
  special_instructions?: string | null;
  created_at?: string;
  ordered_at?: string;
  table?: { id: string; table_number: string; name?: string } | null;
  customer?: { id: string; name?: string; first_name?: string; last_name?: string } | null;
  order_items?: OrderItem[];
  branch?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    gst_number?: string;
    restaurant?: {
      id: string;
      name: string;
      logo?: string;
      phone?: string;
      gst_number?: string;
    };
  };
  payments?: Payment[];
}

interface PrintableOrderReceiptProps {
  order: OrderData;
  showPaymentDetails?: boolean;
}

const money = (value: number | string | undefined | null) =>
  `₹${Number(value || 0).toFixed(2)}`;

const formatStatus = (status: string) =>
  (status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const PrintableOrderReceipt = forwardRef<HTMLDivElement, PrintableOrderReceiptProps>(
  ({ order, showPaymentDetails = true }, ref) => {
    const restaurantName = order.branch?.restaurant?.name || 'Restaurant';
    const branchName = order.branch?.name || '';
    const restaurantLogo = order.branch?.restaurant?.logo;
    const address = order.branch?.address || '';
    const phone = order.branch?.phone || order.branch?.restaurant?.phone || '';
    const gstNumber =
      order.branch?.gst_number || order.branch?.restaurant?.gst_number || '';

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 max-w-3xl mx-auto"
        style={{ fontFamily: 'monospace' }}
      >
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          {restaurantLogo && (
            <img
              src={restaurantLogo}
              alt={restaurantName}
              className="h-16 mx-auto mb-2"
            />
          )}
          <h1 className="text-3xl font-bold mb-1">{restaurantName}</h1>
          {branchName && <h2 className="text-xl mb-2">{branchName}</h2>}
          {address && <p className="text-sm">{address}</p>}
          {phone && <p className="text-sm">Phone: {phone}</p>}
          {gstNumber && <p className="text-sm">GST: {gstNumber}</p>}
        </div>

        {/* Order Info */}
        <div className="mb-4 border-b border-black pb-3">
          <div className="flex justify-between mb-1">
            <span className="font-bold">Order #:</span>
            <span>{order.order_number}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-bold">Date/Time:</span>
            <span>{formatDateTime(order.ordered_at || order.created_at)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-bold">Order Type:</span>
            <span>{formatStatus(order.order_type)}</span>
          </div>
          {order.table && (
            <div className="flex justify-between mb-1">
              <span className="font-bold">Table:</span>
              <span>
                {order.table.table_number}
                {order.table.name ? ` (${order.table.name})` : ''}
              </span>
            </div>
          )}
          {order.customer && (
            <div className="flex justify-between mb-1">
              <span className="font-bold">Customer:</span>
              <span>
                {order.customer.name ||
                  `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() ||
                  'Guest'}
              </span>
            </div>
          )}
          <div className="flex justify-between mb-1">
            <span className="font-bold">Status:</span>
            <span>{formatStatus(order.order_status)}</span>
          </div>
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <div className="mb-4 p-2 bg-gray-100 border border-gray-300 rounded">
            <p className="font-bold mb-1">Special Instructions:</p>
            <p className="text-sm">{order.special_instructions}</p>
          </div>
        )}

        {/* Items */}
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2 border-b border-black">ORDER ITEMS</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-1">Item</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Qty</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.order_items || []).map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="border-b border-gray-300">
                    <td className="py-2">{item.item_name}</td>
                    <td className="text-right py-2">{money(item.price)}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2 font-semibold">
                      {money(item.total)}
                    </td>
                  </tr>
                  {item.special_instructions && (
                    <tr>
                      <td colSpan={4} className="text-xs italic text-gray-600 pb-1">
                        Note: {item.special_instructions}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-4 border-t-2 border-black pt-3">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>{money(order.subtotal)}</span>
          </div>
          {Number(order.tax_amount) > 0 && (
            <div className="flex justify-between mb-2">
              <span>Tax:</span>
              <span>{money(order.tax_amount)}</span>
            </div>
          )}
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Discount:</span>
              <span>-{money(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold border-t border-black pt-2 mt-2">
            <span>GRAND TOTAL:</span>
            <span>{money(order.grand_total)}</span>
          </div>
        </div>

        {/* Payment Details */}
        {showPaymentDetails && (
          <div className="mb-4 border-t-2 border-black pt-3">
            <h3 className="font-bold text-lg mb-2">PAYMENT DETAILS</h3>
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">Payment Status:</span>
                <span className="uppercase">{formatStatus(order.payment_status)}</span>
              </div>
              {order.paid_amount !== undefined && Number(order.paid_amount) > 0 && (
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">Paid Amount:</span>
                  <span className="text-green-600 font-bold">
                    {money(order.paid_amount)}
                  </span>
                </div>
              )}
              {order.due_amount !== undefined && Number(order.due_amount) > 0 && (
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">Due Amount:</span>
                  <span className="text-red-600 font-bold">{money(order.due_amount)}</span>
                </div>
              )}
            </div>

            {/* Payment Transactions */}
            {order.payments && order.payments.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold mb-2 border-b border-gray-300 pb-1">
                  Payment Transactions:
                </h4>
                {order.payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold">
                        Payment #{index + 1}
                      </span>
                      <span className="text-sm">{payment.payment_number}</span>
                    </div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Method:</span>
                      <span className="uppercase">
                        {formatStatus(payment.payment_method)}
                        {payment.payment_mode &&
                          payment.payment_mode !== payment.payment_method &&
                          ` (${formatStatus(payment.payment_mode)})`}
                      </span>
                    </div>
                    {payment.payment_gateway && payment.payment_gateway !== 'manual' && (
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Gateway:</span>
                        <span className="uppercase">
                          {formatStatus(payment.payment_gateway)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Amount:</span>
                      <span className="font-bold">{money(payment.amount)}</span>
                    </div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Date:</span>
                      <span>{formatDateTime(payment.payment_date)}</span>
                    </div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Status:</span>
                      <span className="uppercase">
                        {formatStatus(payment.payment_status)}
                      </span>
                    </div>
                    {payment.transaction_id && (
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Transaction ID:</span>
                        <span className="font-mono">{payment.transaction_id}</span>
                      </div>
                    )}
                    {payment.reference_number && (
                      <div className="flex justify-between text-sm">
                        <span>Reference:</span>
                        <span className="font-mono">{payment.reference_number}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t-2 border-black text-sm">
          <p className="mb-1">Thank you for dining with us!</p>
          <p className="text-xs">Please visit again</p>
          <p className="text-xs mt-2">
            Printed on: {new Date().toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    );
  }
);

PrintableOrderReceipt.displayName = 'PrintableOrderReceipt';

export default PrintableOrderReceipt;
