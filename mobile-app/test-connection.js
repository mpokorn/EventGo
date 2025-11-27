// Test script to check backend connectivity
// Run this with: node test-connection.js

const axios = require('axios');

// Update this IP to match your computer's IP address
const BASE_URL = 'http://192.168.1.66:5000';

async function testConnection() {
  console.log('Testing connection to:', BASE_URL);
  console.log('-----------------------------------');
  
  try {
    // Test 1: Basic connectivity
    console.log('Test 1: Checking if server is reachable...');
    const response = await axios.get(`${BASE_URL}/events`, {
      timeout: 5000
    });
    console.log('✅ SUCCESS: Server is reachable!');
    console.log('✅ Got events:', response.data.events?.length || 0);
    
    // Test 2: Login endpoint
    console.log('\nTest 2: Testing login endpoint...');
    const loginTest = await axios.post(`${BASE_URL}/users/login`, {
      email: 'test@test.com',
      password: 'wrongpassword'
    }, {
      timeout: 5000,
      validateStatus: () => true // Accept any status
    });
    console.log('✅ Login endpoint responded with status:', loginTest.status);
    
    console.log('\n✅ All tests passed! Your backend is working correctly.');
    console.log('\n📱 Make sure your phone/emulator is on the same WiFi network!');
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Your backend is not running!');
      console.log('   Start it with: cd backend && npm start');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.log('\n💡 Solution: Cannot reach the server at', BASE_URL);
      console.log('   1. Check your IP address with: ipconfig');
      console.log('   2. Look for "IPv4 Address" under your WiFi adapter');
      console.log('   3. Update BASE_URL in mobile-app/services/api.ts');
      console.log('   4. Make sure Windows Firewall allows Node.js');
    }
  }
}

testConnection();
