/**
 * Test script to verify network printer connectivity
 * Usage: node test-printer-connection.js <printer_ip> <port>
 * Example: node test-printer-connection.js 192.168.1.100 9100
 */

const net = require('net');

const printerIP = process.argv[2] || '192.168.1.100';
const printerPort = parseInt(process.argv[3] || '9100', 10);

console.log(`\n🖨️  Testing printer connection to ${printerIP}:${printerPort}...`);

const client = new net.Socket();
let connected = false;

// ESC/POS test print commands
const testData = Buffer.from([
  0x1b, 0x40, // Initialize
  0x1b, 0x61, 0x01, // Center align
  ...Buffer.from('TEST PRINT\n'),
  0x1b, 0x61, 0x00, // Left align
  ...Buffer.from('Printer is working!\n'),
  ...Buffer.from(`IP: ${printerIP}:${printerPort}\n`),
  ...Buffer.from(`Time: ${new Date().toLocaleString()}\n`),
  0x0a, 0x0a, 0x0a, // Feed lines
  0x1d, 0x56, 0x01, // Cut paper
]);

client.setTimeout(5000);

client.connect(printerPort, printerIP, () => {
  connected = true;
  console.log('✅ Connected successfully!');
  console.log('📄 Sending test print...');
  client.write(testData);
  
  setTimeout(() => {
    client.end();
  }, 1000);
});

client.on('data', (data) => {
  console.log('📥 Received response from printer:', data.toString('hex'));
});

client.on('close', () => {
  if (connected) {
    console.log('✅ Test completed - check if printer printed the test page');
    console.log('\n✨ Printer is ready for use!');
  } else {
    console.log('❌ Connection closed without success');
  }
  process.exit(connected ? 0 : 1);
});

client.on('error', (err) => {
  console.error('\n❌ Connection failed:', err.message);
  console.log('\n🔍 Troubleshooting:');
  console.log('   1. Check if printer IP address is correct');
  console.log('   2. Verify printer is powered on and connected to network');
  console.log('   3. Ping the printer: ping', printerIP);
  console.log('   4. Check firewall settings');
  console.log('   5. Verify printer supports RAW printing on port', printerPort);
  console.log('   6. Try telnet test: telnet', printerIP, printerPort);
  process.exit(1);
});

client.on('timeout', () => {
  console.error('\n⏱️  Connection timeout!');
  console.log('Printer is not responding. Check network connectivity.');
  client.destroy();
  process.exit(1);
});
