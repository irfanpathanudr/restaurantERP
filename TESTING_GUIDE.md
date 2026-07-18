# Testing Guide for Discount and Split Payment Features

## ✅ Migration Completed Successfully

The database migration has been applied. The following columns have been added:

### Orders Table:
- `discount_type` - ENUM ('percentage', 'fixed')
- `discount_reason` - VARCHAR(255)
- `cashier_confirmed_at` - TIMESTAMP
- `is_locked` - BOOLEAN (DEFAULT false)

### Payments Table:
- `payment_mode` - ENUM ('cash', 'online', 'card')
- `is_split_payment` - BOOLEAN (DEFAULT false)
- `payment_sequence` - INT (DEFAULT 1)

---

## API Testing with cURL or Postman

### Prerequisites
1. Have an authentication token
2. Have an existing order ID
3. Server should be running on port 3000 (or your configured port)

---

## Test 1: Apply Percentage Discount

```bash
curl -X POST http://localhost:3000/api/orders/{ORDER_ID}/discount \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "discountType": "percentage",
    "discountValue": 15,
    "discountReason": "Happy hour discount"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Discount applied successfully",
  "data": {
    "id": "...",
    "subtotal": 100.00,
    "discount_type": "percentage",
    "discount_percentage": 15.00,
    "discount_amount": 15.00,
    "discount_reason": "Happy hour discount",
    "grand_total": 89.50,
    ...
  }
}
```

---

## Test 2: Apply Fixed Discount

```bash
curl -X POST http://localhost:3000/api/orders/{ORDER_ID}/discount \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "discountType": "fixed",
    "discountValue": 20,
    "discountReason": "Manager approval",
    "couponCode": "SAVE20"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Discount applied successfully",
  "data": {
    "discount_type": "fixed",
    "discount_amount": 20.00,
    "discount_reason": "Manager approval",
    "coupon_code": "SAVE20",
    ...
  }
}
```

---

## Test 3: Process Split Payment (Cash + Online)

```bash
curl -X POST http://localhost:3000/api/payments/split \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER_ID",
    "payments": [
      {
        "paymentMode": "cash",
        "paymentMethod": "cash",
        "amount": 50.00,
        "notes": "Cash from customer"
      },
      {
        "paymentMode": "online",
        "paymentMethod": "upi",
        "amount": 39.50,
        "transactionId": "UPI2026071812345",
        "referenceNumber": "REF123456",
        "notes": "PhonePe payment"
      }
    ],
    "notes": "Split payment: 50 cash + 39.50 online"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Split payment processed successfully",
  "data": {
    "payments": [
      {
        "id": "...",
        "payment_mode": "cash",
        "amount": 50.00,
        "is_split_payment": true,
        "payment_sequence": 1,
        ...
      },
      {
        "id": "...",
        "payment_mode": "online",
        "amount": 39.50,
        "transaction_id": "UPI2026071812345",
        "is_split_payment": true,
        "payment_sequence": 2,
        ...
      }
    ],
    "order": {
      "paid_amount": 89.50,
      "due_amount": 0.00,
      "payment_status": "paid",
      ...
    }
  }
}
```

---

## Test 4: Get Order Payments

```bash
curl -X GET http://localhost:3000/api/payments/order/{ORDER_ID} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order payments retrieved successfully",
  "data": [
    {
      "id": "...",
      "payment_mode": "cash",
      "payment_method": "cash",
      "amount": 50.00,
      "payment_sequence": 1,
      ...
    },
    {
      "id": "...",
      "payment_mode": "online",
      "payment_method": "upi",
      "amount": 39.50,
      "payment_sequence": 2,
      ...
    }
  ]
}
```

---

## Test 5: Cashier Confirmation

```bash
curl -X POST http://localhost:3000/api/orders/{ORDER_ID}/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cashierId": "CASHIER_USER_ID"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order confirmed and locked by cashier",
  "data": {
    "id": "...",
    "is_locked": true,
    "cashier_id": "...",
    "cashier_confirmed_at": "2026-07-18T19:45:00.000Z",
    "order_status": "completed",
    "payment_status": "paid",
    ...
  }
}
```

---

## Test 6: Try to Modify Locked Order (Should Fail)

After confirming an order, try to add items:

```bash
curl -X POST http://localhost:3000/api/orders/{ORDER_ID}/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "menuItemId": "MENU_ITEM_ID",
        "quantity": 1,
        "unitPrice": 10.00
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Cannot add items to a locked order. Order has been confirmed by cashier."
}
```

---

## Test 7: Partial Payment Scenario

**Step 1:** Create an order with grand_total = 100.00

**Step 2:** Make partial payment
```bash
curl -X POST http://localhost:3000/api/payments/split \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER_ID",
    "payments": [
      {
        "paymentMode": "cash",
        "paymentMethod": "cash",
        "amount": 50.00
      }
    ]
  }'
```

**Expected:** Order payment_status should be "partial", paid_amount = 50, due_amount = 50

**Step 3:** Complete the payment
```bash
curl -X POST http://localhost:3000/api/payments/split \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER_ID",
    "payments": [
      {
        "paymentMode": "online",
        "paymentMethod": "upi",
        "amount": 50.00,
        "transactionId": "UPI123"
      }
    ]
  }'
```

**Expected:** Order payment_status should be "paid", paid_amount = 100, due_amount = 0

---

## Error Scenarios to Test

### 1. Discount Validation Errors

**Test:** Apply 150% discount (should fail)
```bash
{
  "discountType": "percentage",
  "discountValue": 150
}
```
**Expected Error:** "Discount percentage cannot exceed 100%"

---

**Test:** Apply fixed discount greater than subtotal (should fail)
```bash
{
  "discountType": "fixed",
  "discountValue": 500
}
```
**Expected Error:** "Discount amount cannot exceed subtotal"

---

### 2. Payment Validation Errors

**Test:** Overpayment (should fail)
```bash
{
  "orderId": "ORDER_ID",
  "payments": [
    {
      "paymentMode": "cash",
      "paymentMethod": "cash",
      "amount": 200.00
    }
  ]
}
```
**Expected Error:** "Payment amount (200.00) exceeds remaining amount (89.50)"

---

### 3. Confirmation Errors

**Test:** Confirm order without full payment (should fail)
- Order with due_amount > 0
- Try to confirm

**Expected Error:** "Cannot confirm order. Payment is not complete."

---

## Database Verification

Check the database directly to verify data:

```sql
-- Check order discount details
SELECT 
  id, 
  order_number,
  subtotal,
  discount_type,
  discount_amount,
  discount_percentage,
  discount_reason,
  grand_total,
  is_locked,
  cashier_confirmed_at
FROM orders 
WHERE id = 'YOUR_ORDER_ID';

-- Check split payment details
SELECT 
  id,
  payment_number,
  order_id,
  payment_mode,
  payment_method,
  amount,
  is_split_payment,
  payment_sequence,
  transaction_id
FROM payments 
WHERE order_id = 'YOUR_ORDER_ID'
ORDER BY payment_sequence;
```

---

## Frontend Integration Checklist

When integrating with your frontend:

- [ ] Display discount section in order details
- [ ] Show discount type (percentage/fixed icon)
- [ ] Display discount reason tooltip
- [ ] Show payment breakdown for split payments
- [ ] Display lock icon for confirmed orders
- [ ] Disable edit buttons when is_locked = true
- [ ] Show cashier name and confirmation time
- [ ] Add split payment form with multiple rows
- [ ] Real-time calculation of payment totals
- [ ] Validate payment doesn't exceed due amount
- [ ] Show warning before cashier confirmation
- [ ] Display "Order Locked" badge on confirmed orders

---

## Common Issues and Solutions

### Issue: "Cannot apply discount to a locked order"
**Solution:** Order has been confirmed by cashier. Cannot modify.

### Issue: "Payment amount exceeds remaining amount"
**Solution:** Check the current due_amount and ensure total doesn't exceed it.

### Issue: Migration not applied
**Solution:** Run `npm run migration:run` in the backend directory.

### Issue: Permission denied errors
**Solution:** Ensure user has proper permissions: `orders.update`, `orders.confirm`, `payments.create`

---

## Success Metrics

✅ Discount applied correctly and reflected in grand_total
✅ Split payments tracked separately with sequence
✅ Order payment_status updates correctly (pending → partial → paid)
✅ Locked orders cannot be modified
✅ Cashier confirmation records timestamp and user
✅ Payment breakdown shows in order details
✅ All validations work as expected

---

## Next Steps

1. Test all API endpoints with your actual data
2. Update frontend to display new fields
3. Add UI for discount application
4. Create split payment modal
5. Add cashier confirmation workflow
6. Update order detail page with lock indicator
7. Test end-to-end flow with real orders

For detailed API documentation, refer to `DISCOUNT_AND_SPLIT_PAYMENT_GUIDE.md`
