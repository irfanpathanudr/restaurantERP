# Current Order Tab - Visual Guide

## Quick Reference for Waiters

---

## 🎯 KOT Status Colors

### What Each Color Means:

| Color | Status | What to Do |
|-------|--------|------------|
| 🟡 **Yellow** | **WAITING** | Kitchen received order, not started yet. Tell customer: "Your order is with the kitchen" |
| 🔵 **Blue** | **PREPARING** | Kitchen is cooking. Tell customer: "Your food is being prepared, won't be long" |
| 🟢 **Green** | **READY!** | ✅ **GO SERVE NOW!** Food is ready, pick up and serve immediately! |
| ⚪ **Gray** | **SERVED** | Already served to customer. No action needed. |
| 🔴 **Red** | **CANCELLED** | Order was cancelled. Item removed. |

---

## 📱 Screen Layout

```
┌─────────────────────────────────────────────────┐
│  Table 01                    [Timer] [Print]    │
├─────────────────────────────────────────────────┤
│         [Menu]    [Current Order]               │ ← You're here
├─────────────────────────────────────────────────┤
│                                                  │
│  🟢 KOT-17863024 [READY!] ✓                     │ ← SERVE NOW!
│     2× Samosa                                    │
│     Starter Kitchen · 15m ago                    │
│                                                  │
│  🔵 KOT-17863025 [PREPARING]                    │ ← Still cooking
│     1× Butter Chicken, 2× Naan                  │
│     Main Kitchen · 5m ago                        │
│                                                  │
│  🟡 KOT-17863026 [WAITING]                      │ ← Just sent
│     1× Gulab Jamun                              │
│     Dessert Kitchen · 1m ago                     │
│                                                  │
├─────────────────────────────────────────────────┤
│  🔍 Search items in order...                     │
├─────────────────────────────────────────────────┤
│                                                  │
│  Samosa                          [READY!] 🟢    │
│  ₹300 × 2 = ₹600                                │
│  [-]  2  [+]                           [🗑️]     │
│                                                  │
│  Butter Chicken              [PREPARING] 🔵     │
│  ₹450 × 1 = ₹450                                │
│  [-]  1  [+]                           [🗑️]     │
│                                                  │
│  Naan                        [PREPARING] 🔵     │
│  ₹40 × 2 = ₹80                                  │
│  [-]  2  [+]                           [🗑️]     │
│                                                  │
│  Gulab Jamun                   [WAITING] 🟡     │
│  ₹120 × 1 = ₹120                                │
│  [-]  1  [+]                           [🗑️]     │
│                                                  │
├─────────────────────────────────────────────────┤
│  Order Summary:                                  │
│                                                  │
│  Subtotal                              ₹1250    │
│  Tax (18%)                              ₹225    │
│  ─────────────────────────────────────────────  │
│  Total                                 ₹1475    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🚨 Priority Actions

### 1. Green KOT = URGENT! 🟢
```
┌─────────────────────────────────────────┐
│ 🟢 KOT-17863024 [READY!] ✓              │ ← PULSING GREEN!
│    2× Samosa                             │
│    Starter Kitchen · 15m ago             │
└─────────────────────────────────────────┘
```
**Action:** 
1. Pick up food from kitchen NOW
2. Serve to customer immediately
3. Don't let it get cold!

---

### 2. Blue KOT = Be Ready 🔵
```
┌─────────────────────────────────────────┐
│ 🔵 KOT-17863025 [PREPARING]              │
│    1× Butter Chicken, 2× Naan           │
│    Main Kitchen · 5m ago                 │
└─────────────────────────────────────────┘
```
**Action:**
1. Check again in 2-3 minutes
2. Inform customer: "Almost ready"
3. Prepare to serve soon

---

### 3. Yellow KOT = Just Sent 🟡
```
┌─────────────────────────────────────────┐
│ 🟡 KOT-17863026 [WAITING]               │
│    1× Gulab Jamun                        │
│    Dessert Kitchen · 1m ago              │
└─────────────────────────────────────────┘
```
**Action:**
1. Kitchen hasn't started yet
2. Tell customer: "Order sent to kitchen"
3. Will take normal preparation time

---

## 📋 Item Status Badges

Each item in your order shows its current status:

```
Samosa                    [READY!] 🟢
₹300 × 2 = ₹600
```

This helps you know:
- ✅ Which items are ready to serve
- ⏳ Which items are still cooking
- 🕐 Which items just got ordered

---

## 🔄 What Happens When You Delete Items

### Scenario: Customer changes mind

**Before:**
```
🔵 KOT-17863025 [PREPARING]
   1× Butter Chicken
   2× Naan
   Main Kitchen · 5m ago

Items:
- Butter Chicken [PREPARING]
- Naan [PREPARING]
```

**Customer says:** "Cancel the Naan"

**You do:** Tap 🗑️ on Naan item

**After (automatic update):**
```
🔵 KOT-17863025 [PREPARING]
   1× Butter Chicken
   Main Kitchen · 5m ago

Items:
- Butter Chicken [PREPARING]
```

✅ **System automatically:**
- Updates the KOT
- Refreshes status
- Recalculates total
- Notifies kitchen (if needed)

---

## 💡 Pro Tips

### Tip 1: Check Top First
Always check KOT cards at the **top** of the screen first!
- Green ones need immediate action
- This is the most important information

### Tip 2: Time Awareness
Watch the time stamps:
```
Main Kitchen · 15m ago  ← Been a while, check progress
Main Kitchen · 2m ago   ← Just sent, be patient
```

### Tip 3: Multiple KOTs
One order can have multiple KOTs:
- Starters go to Starter Kitchen
- Mains go to Main Kitchen
- Desserts go to Dessert Kitchen

They cook **simultaneously** = faster service!

### Tip 4: Status Badge on Items
Don't need to scroll up to KOT cards every time:
```
Samosa [READY!] ← See status right here!
```

---

## 🎬 Common Workflows

### Workflow 1: Checking What's Ready
```
1. Open "Current Order" tab
2. Look at top KOT cards
3. See green ones? → Go serve!
4. See blue ones? → Almost ready
5. See yellow ones? → Still waiting
```

### Workflow 2: Serving Ready Items
```
1. See green KOT at top: 🟢 [READY!] ✓
2. Read items: "2× Samosa"
3. Go to Starter Kitchen
4. Pick up 2 Samosas
5. Serve to Table
6. Status updates to [SERVED]
```

### Workflow 3: Customer Asks "How Long?"
```
Customer: "When will my Butter Chicken arrive?"

You:
1. Check "Current Order" tab
2. Find Butter Chicken item
3. See status badge:
   - [READY!] → "It's ready! Getting it now"
   - [PREPARING] → "Being prepared, 5 more minutes"
   - [WAITING] → "Kitchen just received, 15-20 minutes"
```

### Workflow 4: Cancelling Items
```
Customer: "Remove the dessert please"

You:
1. Find dessert item
2. Tap 🗑️ (trash icon)
3. Item removed
4. KOT automatically updates
5. Bill automatically recalculates
6. Show customer new total
```

---

## 🚦 Quick Decision Matrix

| KOT Status | Time | Action |
|-----------|------|---------|
| 🟢 READY | Any | **GO SERVE NOW** |
| 🔵 PREPARING | <5 min | Wait, check again in 2 min |
| 🔵 PREPARING | 5-15 min | Normal, be ready soon |
| 🔵 PREPARING | >15 min | Check with kitchen |
| 🟡 WAITING | <3 min | Normal, just sent |
| 🟡 WAITING | >5 min | Check with kitchen |

---

## 📱 Touch Targets

All buttons are **big enough to tap easily**:

```
Large Buttons (Easy to Tap):
┌─────┐  ┌───┐  ┌─────┐  ┌──────┐
│  -  │  │ 2 │  │  +  │  │  🗑️  │
└─────┘  └───┘  └─────┘  └──────┘
```

No more misclicks! 👆

---

## 🔔 Notifications

### When Item Becomes Ready:
```
┌────────────────────────────────────────┐
│  🍽 KOT-17863024 is ready to serve!    │
└────────────────────────────────────────┘
```

- Toast notification appears
- Green KOT card pulses
- [READY!] badge on items
- Checkmark icon ✓

**Don't miss it!**

---

## 📊 Reading Time Stamps

### Time Display:
- "Just now" = Less than 1 minute ago
- "5m ago" = 5 minutes ago
- "15m ago" = 15 minutes ago
- "62m ago" = Over 1 hour ago (check status!)

### What Time Means:
```
Starters:    5-10 minutes normal
Mains:      15-25 minutes normal
Desserts:    5-10 minutes normal
Beverages:   2-5 minutes normal
```

If time is **2× normal**, check with kitchen!

---

## 🎨 Color Psychology

### Why These Colors?

🟡 **Yellow (Waiting)**
- Caution: Order sent
- Be patient
- Kitchen will start soon

🔵 **Blue (Preparing)**
- Active: Work in progress
- Stay aware
- Almost there

🟢 **Green (Ready)**
- Go! Action required
- Serve immediately
- Success state

---

## 🎯 Success Metrics

### Good Performance:
- ✅ Serve within **1 minute** of [READY!] status
- ✅ Check status every **2-3 minutes**
- ✅ No item waits more than **5 minutes** after ready
- ✅ Customer always informed of status

### Great Performance:
- 🌟 Serve within **30 seconds** of [READY!]
- 🌟 Anticipate ready items (see PREPARING → be ready)
- 🌟 Proactive customer communication
- 🌟 Zero cold food complaints

---

## 🆘 Troubleshooting

### Problem: "Status not updating"
**Solution:** Tap "Refresh Kitchen Status" button at bottom

### Problem: "Can't see KOT cards"
**Solution:** Make sure you're on "Current Order" tab (not Menu)

### Problem: "Item shows wrong status"
**Solution:** Refresh order, if persists check with kitchen

### Problem: "Deleted item still shows"
**Solution:** Wait 1 second for auto-refresh, or tap refresh manually

---

## 📖 Glossary

- **KOT**: Kitchen Order Ticket - order sent to kitchen
- **Status Badge**: Colored label showing current state
- **Pulsing**: Animated glow effect (means active/important)
- **Time Stamp**: "5m ago" - how long since KOT created
- **Item Status**: Status badge on individual menu items

---

## 🎓 Training Checklist

After reading this guide, you should be able to:

- [ ] Identify KOT status by color
- [ ] Know when to serve (green = go)
- [ ] Read item status badges
- [ ] Use quantity controls (+/-)
- [ ] Delete items properly
- [ ] Understand time stamps
- [ ] Know when to check with kitchen
- [ ] Use search to find items
- [ ] Read order summary
- [ ] Refresh status manually

---

**Print this guide and keep it at your station!** 📄

**Remember: Green means GO! 🟢 → Serve immediately!**
