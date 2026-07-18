# Discount and Split Payment Feature Guide

## Overview
This guide explains the new discount and split payment functionality added to the order management system. The features include:

1. **Discount Management**: Apply percentage or fixed discounts to orders
2. **Split Payment**: Accept multiple payment types (cash, online, card) for a single order
3. **Cashier Confirmation**: Lock orders after payment to prevent unauthorized modifications

---

## Database Changes

### New Columns in `orders` Table
- `discount_type`: ENUM ('percentage', 'fixed') - Type of discount applied
- `discount_reason`: VARCHAR(255) - Reason for applying the discount
- `cashier_confirmed_at`: TIMESTAMP - When cashier confirmed the order
- `is_locked`: BOOLEAN - Prevents modifications after cashier confirmation

### New Columns in `payments` Table
- `payment_mode`: ENUM ('cash', 'online', 'card') - Mode of payment
- `is_split_payment`: BOOLEAN - Indicates if this is part of a split payment
- `payment_sequence`: INT - Order sequence for split payments

### Migration
Run the migration to apply these changes:
```bash
cd backend
npm run typeorm migration:run
```

---

## Features

### 1. Discount Management

#### Apply Discount to Order
**Endpoint**: `POST /api/orders/:id/discount`

**Request Body**:
```json
{
  "discountType": "percentage",  // or "fixed"
  "discountValue": 10,            // 10% or $10 based on type
  "discountReason": "Customer loyalty discount",
  "couponCode": "SUMMER2026"      // Optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Discount applied successfully",
  "data": {
    "id": "order-uuid",
    "order_number": "ORD-123456",
    "subtotal": 100.00,
    "discount_type": "percentage",
    "discount_percentage": 10.00,
    "discount_amount": 10.00,
    "discount_reason": "Customer loyalty discount",
    "tax_amount": 4.50,
    "grand_total": 94.50,
    "due_amount": 94.50,
    ...
  }
}
```

**Validations**:
- Cannot apply discount if order is locked (cashier confirmed)
- Cannot apply discount if order is completed or cancelled
- Percentage discount cannot exceed 100%
- Fixed discount cannot exceed subtotal amount
- Automatically recalculates grand_total and due_amount

---

### 2. Split Payment (Mixed Payment)

#### Process Split Payment
**Endpoint**: `POST /api/payments/split`

**Request Body**:
```json
{
  "orderId": "order-uuid",
  "payments": [
    {
      "paymentMode": "cash",
      "paymentMethod": "cash",
      "amount": 50.00,
      "notes": "Cash payment"
    },
    {
      "paymentMode": "online",
      "paymentMethod": "upi",
      "amount": 44.50,
      "transactionId": "TXN123456789",
      "referenceNumber": "UPI/123456",
      "notes": "UPI payment via PhonePe"
    }
  ],
  "notes": "Split payment: partial cash and partial online"
}
```

**Payment Modes**:
- `cash`: Cash payment
- `online`: Online payment (UPI, wallet, net banking)
- `card`: Card payment (credit/debit)

**Payment Methods**:
- `cash`: Cash
- `card`: Credit/Debit Card
- `upi`: UPI (Google Pay, PhonePe, Paytm)
- `wallet`: Digital Wallet
- `net_banking`: Net Banking
- `credit`: Credit Account

**Response**:
```json
{
  "success": true,
  "message": "Split payment processed successfully",
  "data": {
    "payments": [
      {
        "id": "payment1-uuid",
        "payment_number": "PAY-123456",
        "order_id": "order-uuid",
        "payment_mode": "cash",
        "payment_method": "cash",
        "amount": 50.00,
        "is_split_payment": true,
        "payment_sequence": 1,
        ...
      },
      {
        "id": "payment2-uuid",
        "payment_number": "PAY-123457",
        "order_id": "order-uuid",
        "payment_mode": "online",
        "payment_method": "upi",
        "amount": 44.50,
        "transaction_id": "TXN123456789",
        "is_split_payment": true,
        "payment_sequence": 2,
        ...
      }
    ],
    "order": {
      "id": "order-uuid",
      "grand_total": 94.50,
      "paid_amount": 94.50,
      "due_amount": 0.00,
      "payment_status": "paid",
      ...
    }
  }
}
```

**Validations**:
- Total payment amount cannot exceed remaining due amount
- Cannot process payment for locked orders
- Automatically updates order payment_status:
  - `pending`: No payment made
  - `partial`: Some payment made but not full
  - `paid`: Full payment received

---

### 3. Get Order Payments
**Endpoint**: `GET /api/payments/order/:orderId`

Retrieves all payments for a specific order, useful for viewing split payment details.

**Response**:
```json
{
  "success": true,
  "message": "Order payments retrieved successfully",
  "data": [
    {
      "id": "payment1-uuid",
      "payment_mode": "cash",
      "amount": 50.00,
      "payment_sequence": 1,
      ...
    },
    {
      "id": "payment2-uuid",
      "payment_mode": "online",
      "amount": 44.50,
      "payment_sequence": 2,
      ...
    }
  ]
}
```

---

### 4. Cashier Confirmation (Lock Order)

#### Confirm Order by Cashier
**Endpoint**: `POST /api/orders/:id/confirm`

**Request Body**:
```json
{
  "cashierId": "user-uuid"  // Optional if authenticated user is cashier
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order confirmed and locked by cashier",
  "data": {
    "id": "order-uuid",
    "order_status": "completed",
    "payment_status": "paid",
    "cashier_id": "user-uuid",
    "cashier_confirmed_at": "2026-07-18T10:30:00Z",
    "is_locked": true,
    "completed_at": "2026-07-18T10:30:00Z",
    ...
  }
}
```

**What Happens**:
1. Sets `is_locked` to `true`
2. Records cashier ID and confirmation timestamp
3. Sets order status to `completed`
4. Frees up the table (if dine-in)
5. **Prevents any further modifications to the order**

**Validations**:
- Order must be fully paid (`payment_status = 'paid'`)
- Cannot confirm already locked orders
- Once locked, the following operations are blocked:
  - Adding items
  - Removing items
  - Updating order details
  - Applying discounts

---

## Complete Order Flow Example

### Scenario: Customer orders food, gets discount, and pays partially in cash and online

#### Step 1: Create Order
```bash
POST /api/orders
{
  "branchId": "branch-uuid",
  "orderType": "dine_in",
  "tableId": "table-uuid",
  "customerId": "customer-uuid",
  "items": [
    {
      "menuItemId": "item1-uuid",
      "quantity": 2,
      "unitPrice": 25.00
    },
    {
      "menuItemId": "item2-uuid",
      "quantity": 1,
      "unitPrice": 50.00
    }
  ]
}
```
**Result**: Order created with subtotal = $100.00, tax = $5.00, grand_total = $105.00

---

#### Step 2: Apply Discount
```bash
POST /api/orders/{orderId}/discount
{
  "discountType": "percentage",
  "discountValue": 10,
  "discountReason": "Regular customer discount"
}
```
**Result**: Discount of $10.00 applied, new grand_total = $95.00

---

#### Step 3: Process Split Payment
```bash
POST /api/payments/split
{
  "orderId": "order-uuid",
  "payments": [
    {
      "paymentMode": "cash",
      "paymentMethod": "cash",
      "amount": 50.00
    },
    {
      "paymentMode": "online",
      "paymentMethod": "upi",
      "amount": 45.00,
      "transactionId": "UPI123456"
    }
  ]
}
```
**Result**: Two payment records created, order paid_amount = $95.00, payment_status = 'paid'

---

#### Step 4: Cashier Confirms Order
```bash
POST /api/orders/{orderId}/confirm
{
  "cashierId": "cashier-uuid"
}
```
**Result**: Order locked, completed, and table freed

---

## Permission Requirements

Add these permissions to your system:
- `orders.read`: View orders
- `orders.create`: Create new orders
- `orders.update`: Update orders, add/remove items, apply discounts
- `orders.confirm`: Confirm and lock orders (cashier only)
- `payments.read`: View payments
- `payments.create`: Process payments
- `payments.refund`: Refund payments

---

## UI/Frontend Integration Guidelines

### Order View Page
1. **Display discount section**:
   - Show discount type, percentage, amount
   - Show discount reason if available
   - Display adjusted grand total

2. **Payment section**:
   - Show all payments with mode and amount
   - Display payment breakdown for split payments
   - Show total paid and remaining due

3. **Lock indicator**:
   - Show lock icon if `is_locked = true`
   - Display cashier name and confirmation time
   - Disable edit buttons for locked orders

4. **Split payment form**:
   - Multiple payment input rows
   - Each row: payment mode, method, amount
   - Real-time total calculation
   - Validation: total should not exceed due amount

### Example UI Flow:
```
Order #ORD-123456                           [LOCKED 🔒]
----------------------------------------
Subtotal:           $100.00
Discount (10%):     -$10.00
Tax (5%):           +$4.50
----------------------------------------
Grand Total:        $94.50

Payments:
  💵 Cash            $50.00
  📱 UPI             $44.50
----------------------------------------
Total Paid:         $94.50
Due Amount:         $0.00

Confirmed by: John Doe (Cashier)
Confirmed at: 2026-07-18 10:30 AM
```

---

## Error Messages

Common error scenarios:

1. **Locked Order Modification**:
   ```
   "Cannot add items to a locked order. Order has been confirmed by cashier."
   ```

2. **Invalid Discount**:
   ```
   "Discount percentage cannot exceed 100%"
   "Discount amount cannot exceed subtotal"
   ```

3. **Payment Issues**:
   ```
   "Payment amount ($105.00) exceeds remaining amount ($94.50)"
   "Cannot process payment for a locked order"
   ```

4. **Confirmation Issues**:
   ```
   "Cannot confirm order. Payment is not complete."
   "Order is already confirmed and locked"
   ```

---

## Testing

### Test Discount Feature
```bash
# Apply percentage discount
curl -X POST http://localhost:3000/api/orders/{orderId}/discount \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "discountType": "percentage",
    "discountValue": 15,
    "discountReason": "Happy hour discount"
  }'

# Apply fixed discount
curl -X POST http://localhost:3000/api/orders/{orderId}/discount \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "discountType": "fixed",
    "discountValue": 20,
    "discountReason": "Complaint compensation"
  }'
```

### Test Split Payment
```bash
curl -X POST http://localhost:3000/api/payments/split \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "{orderId}",
    "payments": [
      {
        "paymentMode": "cash",
        "paymentMethod": "cash",
        "amount": 30
      },
      {
        "paymentMode": "online",
        "paymentMethod": "upi",
        "amount": 64.50,
        "transactionId": "TEST123"
      }
    ]
  }'
```

### Test Cashier Confirmation
```bash
curl -X POST http://localhost:3000/api/orders/{orderId}/confirm \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cashierId": "{cashierId}"
  }'
```

---

## Security Considerations

1. **Role-Based Access**:
   - Only authorized users can apply discounts
   - Only cashiers can confirm orders
   - Audit log all discount applications

2. **Validation**:
   - Always validate discount amounts server-side
   - Ensure payment totals match order totals
   - Prevent double payments

3. **Order Locking**:
   - Once confirmed, orders are immutable
   - Prevents fraud and unauthorized modifications
   - Maintains data integrity for reporting

---

## Summary

The new features provide:
✅ Flexible discount management (percentage or fixed)
✅ Split payment support (cash + online + card)
✅ Order locking after cashier confirmation
✅ Complete payment audit trail
✅ Protection against unauthorized modifications

All features are properly validated, secured, and integrated with the existing order and payment flow.
