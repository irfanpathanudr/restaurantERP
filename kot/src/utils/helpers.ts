import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_CONFIG } from '@/config/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | string | undefined | null) {
  const n = Number(amount) || 0;
  return `₹${n.toFixed(2)}`;
}

/** Turn API image paths (/uploads/...) into absolute backend URLs */
export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_CONFIG.SERVER_URL.replace(/\/$/, '');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

export function printKotTicket(payload: {
  kotNumber: string;
  tableNumber: string;
  kitchen: string;
  printCount: number;
  isReprint: boolean;
  specialInstructions?: string | null;
  items: { name: string; quantity: number; specialInstructions?: string | null }[];
}) {
  const win = window.open('', '_blank', 'width=320,height=600');
  if (!win) return;

  const rows = payload.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 0">${i.quantity}x</td><td style="padding:4px 0">${i.name}${
          i.specialInstructions ? `<br/><small>${i.specialInstructions}</small>` : ''
        }</td></tr>`
    )
    .join('');

  win.document.write(`<!DOCTYPE html><html><head><title>${payload.kotNumber}</title>
    <style>
      body{font-family:monospace;padding:12px;font-size:13px}
      h1{font-size:16px;margin:0 0 8px}
      table{width:100%;border-collapse:collapse}
      .meta{margin:8px 0;border-bottom:1px dashed #000;padding-bottom:8px}
    </style></head><body>
    <h1>KOT ${payload.kotNumber}${payload.isReprint ? ' (REPRINT)' : ''}</h1>
    <div class="meta">
      <div>Table: <b>${payload.tableNumber}</b></div>
      <div>Kitchen: ${payload.kitchen || '-'}</div>
      <div>Print #${payload.printCount}</div>
      ${payload.specialInstructions ? `<div>Note: ${payload.specialInstructions}</div>` : ''}
    </div>
    <table>${rows}</table>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),400)}</script>
    </body></html>`);
  win.document.close();
}

export function printBill(order: {
  order_number: string;
  table?: { table_number: string } | null;
  order_items?: { item_name: string; quantity: number; total: number | string }[];
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount?: number | string;
  grand_total: number | string;
}) {
  const win = window.open('', '_blank', 'width=320,height=700');
  if (!win) return;

  const rows = (order.order_items || [])
    .map(
      (i) =>
        `<tr><td>${i.item_name} x${i.quantity}</td><td style="text-align:right">${formatMoney(
          i.total
        )}</td></tr>`
    )
    .join('');

  win.document.write(`<!DOCTYPE html><html><head><title>Bill ${order.order_number}</title>
    <style>
      body{font-family:monospace;padding:12px;font-size:13px}
      h1{font-size:16px;margin:0 0 8px}
      table{width:100%;border-collapse:collapse}
      .tot{border-top:1px dashed #000;margin-top:8px;padding-top:8px}
    </style></head><body>
    <h1>BILL</h1>
    <div>Order: ${order.order_number}</div>
    <div>Table: ${order.table?.table_number || 'N/A'}</div>
    <hr/>
    <table>${rows}</table>
    <div class="tot">
      <div>Subtotal: ${formatMoney(order.subtotal)}</div>
      <div>Tax: ${formatMoney(order.tax_amount)}</div>
      <div>Discount: ${formatMoney(order.discount_amount)}</div>
      <div><b>Total: ${formatMoney(order.grand_total)}</b></div>
    </div>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),400)}</script>
    </body></html>`);
  win.document.close();
}
