# Order Update Cascade Fix

## Problem
When submitting checkout with discount/GST, the order update was failing with:
```
Cannot add or update a child row: a foreign key constraint fails 
(`restaurant_erp`.`order_items`, CONSTRAINT `FK_e462517174f561ece2916701c0a` 
FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`)...)
```

## Root Cause
The error showed: `UPDATE order_items SET menu_item_id = NULL`

When we loaded the order with relations (`order_items` and `order_items.menu_item`) and then saved it, TypeORM tried to cascade the save operation to the related `order_items` entities. This caused TypeORM to attempt to set `menu_item_id = NULL`, violating the foreign key constraint.

## Solution
Modified the `update()` method in `order.service.ts`:

**BEFORE:**
```typescript
const order = await this.orderRepository.findOne({ 
  where: { id },
  relations: ['order_items', 'order_items.menu_item']
});
// ... update fields ...
await this.orderRepository.save(order);
```

**AFTER:**
```typescript
const order = await this.orderRepository.findOne({ 
  where: { id }
  // NO relations loaded
});
// ... update fields ...
await this.orderRepository.save(order); // Only saves order entity
return (await this.findById(id)) as Order; // Load relations after save
```

## Key Changes
1. **Removed relations** from the initial order fetch
2. **Save only the order entity** without cascading to order_items
3. **Return full order with relations** by calling `findById()` after save
4. **Added .toFixed(2)** to discount_amount calculation for consistency

## Testing Required
After restarting the backend server:

1. Create a new order with items
2. Click "Generate Bill" 
3. Apply discount (percentage or fixed)
4. Set GST percentage
5. Add payment amount
6. Click "Complete Payment"
7. Verify order updates successfully
8. Check database values are correct
9. Verify invoice is generated

## Files Modified
- `backend/src/services/order.service.ts` - Fixed update method

## Next Steps
1. **RESTART BACKEND SERVER** - Changes must be loaded
2. Test complete checkout flow
3. Verify all calculations are correct
4. Check that invoice generation works
5. Monitor backend logs for any new errors
