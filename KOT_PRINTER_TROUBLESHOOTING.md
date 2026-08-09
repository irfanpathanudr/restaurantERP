# KOT Printer Not Working - Troubleshooting Guide

## 🔍 Problem Diagnosed

When logging in as a waiter on the network, the KOT printer shows as "connected from server" but **printing does not work**. 

### Root Cause
The system currently does **NOT print from the server**. All printing happens on the **client device** (waiter's phone/tablet/computer). The backend only generates print data and sends it to the frontend.

## 🎯 Current System Architecture

```
Order Created → Backend generates print payload → Frontend receives JSON
                                                      ↓
                                      Frontend tries to print:
                                      - Bluetooth (manual connection needed)
                                      - Browser print dialog (fallback)
```

**The server never sends anything to a physical printer!**

## ✅ Solution Options

### Option 1: Client-Side Bluetooth Printing (Current System)

**Best for:** Mobile tablets/phones with Bluetooth thermal printers

**Requirements:**
- Chrome browser (Web Bluetooth API support)
- Bluetooth thermal printer (like Pegasus PM5822)
- Printer paired with the waiter's device

**Steps to Fix:**

1. **Ensure Chrome Browser**
   - Only Chrome supports Web Bluetooth
   - Safari, Firefox, Edge don't support this feature

2. **Pair Bluetooth Printer**
   - Power on the printer
   - On the device (phone/tablet), go to Bluetooth settings
   - Pair with the printer (usually named "Pegasus" or similar)
   - Keep the printer close (within 10 meters)

3. **Grant Browser Permissions**
   - When printing KOT, browser will ask for Bluetooth permission
   - Click "Allow" or "Pair"
   - Select your printer from the list

4. **Test Printing**
   - Create an order
   - Send to kitchen
   - Browser should show printer selection dialog
   - Choose your printer and test

**Limitations:**
- Each device needs to connect individually
- Printer must stay close to the device
- Only works in Chrome browser

---

### Option 2: Browser Print Dialog (Fallback)

**Best for:** Desktop computers with USB or network printers

**How it works:**
- Opens a print preview window
- User clicks "Print" manually
- Uses system printers (Windows/Mac printer setup)

**To use this:**
1. Ensure your printer is installed on Windows/Mac
2. When KOT print dialog opens, select your printer
3. Click Print

**Limitations:**
- Requires manual action each time
- Opens new windows
- Not suitable for fast-paced restaurant environment

---

### Option 3: Server-Side Network Printing (RECOMMENDED FOR YOUR SETUP)

**Best for:** Network thermal printers (Ethernet/WiFi) shared by multiple devices

**Advantages:**
✅ No Bluetooth pairing needed on each device
✅ Works from any device on the network
✅ Automatic printing without user interaction
✅ Centralized printer management
✅ Better for multi-user restaurant environment

**Implementation Required:** See `NETWORK_PRINTER_SETUP.md`

---

## 🔧 Quick Diagnostic Steps

### Step 1: Check Your Network Printer IP

```powershell
# Find printer IP on your network
arp -a

# Test if printer is reachable
ping 192.168.1.100

# Test if printer port is open
Test-NetConnection -ComputerName 192.168.1.100 -Port 9100
```

### Step 2: Test Printer Connection

```bash
# From backend directory
cd backend
node test-printer-connection.js 192.168.1.100 9100
```

Replace `192.168.1.100` with your actual printer IP address.

### Step 3: Check Printer Configuration in Database

```sql
-- Check configured printers
SELECT 
    name, 
    printer_type, 
    connection_type, 
    ip_address, 
    port, 
    status 
FROM printers 
WHERE is_active = 1;
```

---

## 🚀 Recommended Solution for Your Setup

Based on your description "print by kot printer is connected from server", you likely want **server-side printing**.

### Implementation Steps:

1. **Install Required Package**
   ```powershell
   cd backend
   npm install node-thermal-printer
   ```

2. **Get Your Printer's IP Address**
   - Check printer's LCD screen menu (if available)
   - Print configuration page from printer
   - Check your router's connected devices list
   - Use printer discovery tool

3. **Configure Printer in System**
   - Go to Printer Management in your ERP
   - Add/Edit Kitchen Printer
   - Set:
     - Connection Type: Network
     - IP Address: (your printer's IP)
     - Port: 9100 (standard for ESC/POS)
     - Printer Type: Kitchen/KOT

4. **Test Connection**
   ```bash
   node test-printer-connection.js <YOUR_PRINTER_IP> 9100
   ```

5. **Implement Server-Side Printing**
   - Follow instructions in `NETWORK_PRINTER_SETUP.md`
   - This requires code changes to the backend

---

## 📝 Common Issues & Solutions

### Issue: "Printer shows offline"
**Solution:** 
- Check printer is powered on
- Verify network cable is connected
- Ping the printer IP
- Check printer settings are correct

### Issue: "Connection timeout"
**Solution:**
- Firewall may be blocking port 9100
- Add firewall exception:
  ```powershell
  New-NetFirewallRule -DisplayName "Printer Port 9100" -Direction Outbound -LocalPort 9100 -Protocol TCP -Action Allow
  ```

### Issue: "Bluetooth not connecting"
**Solution:**
- Use Chrome browser only
- Printer must be paired in system Bluetooth first
- Keep printer within 10 meters
- Try unpairing and pairing again

### Issue: "Print job sent but nothing prints"
**Solution:**
- Check printer has paper
- Check printer is not in error state (paper jam, cover open)
- Verify correct ESC/POS commands for your printer model
- Some printers need specific initialization sequences

---

## 🎓 Understanding Your Options

| Method | Setup Complexity | User Experience | Best For |
|--------|-----------------|-----------------|----------|
| **Bluetooth** | Easy | Manual connect per device | 1-2 tablets |
| **Browser Print** | Very Easy | Manual print each time | Desktop only |
| **Network (Server)** | Medium | Fully automatic | Multi-device restaurant |

---

## 💡 Quick Fix for Right Now

If you need printing to work **immediately** without code changes:

1. **Use a Windows/Desktop computer** for the waiter station
2. **Install the printer drivers** on that computer
3. **Set the printer as default** in Windows
4. When KOT print dialog opens, **select your printer and click Print**

This is not ideal for a busy restaurant, but it will work while you implement proper network printing.

---

## 📞 Next Steps

Choose your path:

**A) Implement Server-Side Network Printing** (Recommended)
   → Read: `NETWORK_PRINTER_SETUP.md`
   → Requires: Backend code changes
   → Time: 2-4 hours development

**B) Use Bluetooth Printing** (Quick start)
   → Use Chrome on Android tablet
   → Pair Bluetooth printer
   → Time: 15 minutes setup

**C) Use Browser Printing** (Desktop only)
   → Install printer on Windows
   → Manual print each time
   → Time: 5 minutes setup

---

## 🔍 Still Need Help?

Check the logs for errors:
```powershell
# Backend logs
Get-Content backend\logs\error-2026-08-09.log -Tail 50

# Application logs
Get-Content backend\logs\application-2026-08-09.log -Tail 50
```

Look for printer-related errors or connection failures.
